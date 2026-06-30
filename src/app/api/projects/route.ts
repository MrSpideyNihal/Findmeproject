import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import dbConnect from '@/lib/mongoose/mongoose';
import Project from '@/models/Project';
import { projectSchema, searchSchema } from '@/lib/validations/validations';

// Simple in-memory rate limiting for search (60 req/min per IP)
const searchRateMap = new Map<string, { count: number; resetAt: number }>();
const SEARCH_LIMIT = 60;
const SEARCH_WINDOW_MS = 60 * 1000; // 1 minute

function checkSearchRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = searchRateMap.get(ip);
  if (!record || now > record.resetAt) {
    searchRateMap.set(ip, { count: 1, resetAt: now + SEARCH_WINDOW_MS });
    return true;
  }
  if (record.count >= SEARCH_LIMIT) return false;
  record.count += 1;
  return true;
}

/**
 * GET /api/projects - Public: search/list projects
 *
 * Search strategy:
 *   1. If query matches via MongoDB $text index (title, abstract, groupName)
 *      → return those results sorted by relevance score
 *   2. If no $text results OR query looks like a name/email
 *      → fall back to regex search on all fields
 *   3. No query → return all, sorted by chosen sort order
 */
export async function GET(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  if (!checkSearchRateLimit(ip)) {
    return NextResponse.json({ error: 'Too many requests. Please slow down.' }, { status: 429 });
  }

  try {
    const { searchParams } = request.nextUrl;
    const parsed = searchSchema.safeParse({
      q: searchParams.get('q') || '',
      batch: searchParams.get('batch') || '',
      tags: searchParams.get('tags') || '',
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '12',
      sortBy: searchParams.get('sortBy') || 'newest',
    });

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid query parameters' }, { status: 400 });
    }

    const { q, batch, tags, page, limit, sortBy } = parsed.data;

    await dbConnect();

    // ── Build base filters (batch + tags, always applied) ──────────────────
    const baseFilter: Record<string, unknown> = {};

    if (batch) {
      baseFilter.batchName = { $regex: batch, $options: 'i' };
    }

    if (tags) {
      const tagList = tags.split(',').map((t) => t.trim()).filter(Boolean);
      if (tagList.length > 0) {
        baseFilter.tags = { $in: tagList };
      }
    }

    // ── Determine sort order ───────────────────────────────────────────────
    type SortSpec = Record<string, 1 | -1 | { $meta: 'textScore' }>;
    const getSortOrder = (key: string, hasTextScore: boolean): SortSpec => {
      if (hasTextScore && (key === 'relevance' || key === 'newest')) {
        return { score: { $meta: 'textScore' }, createdAt: -1 };
      }
      switch (key) {
        case 'oldest': return { createdAt: 1 };
        case 'title-asc': return { title: 1 };
        case 'title-desc': return { title: -1 };
        case 'members': return { 'members': -1, createdAt: -1 };
        case 'newest':
        default: return { createdAt: -1 };
      }
    };

    const skip = (page - 1) * limit;
    let projects;
    let total: number;

    if (q) {
      // Escape special regex characters in user input
      const escapedQ = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      // Strategy: Use regex search across ALL searchable fields.
      // This guarantees partial name matching always works.
      const regexFilter = {
        ...baseFilter,
        $or: [
          { title: { $regex: escapedQ, $options: 'i' } },
          { abstract: { $regex: escapedQ, $options: 'i' } },
          { groupName: { $regex: escapedQ, $options: 'i' } },
          { batchName: { $regex: escapedQ, $options: 'i' } },
          { 'members.name': { $regex: escapedQ, $options: 'i' } },
          { 'members.email': { $regex: escapedQ, $options: 'i' } },
          { tags: { $regex: escapedQ, $options: 'i' } },
          { mentorName: { $regex: escapedQ, $options: 'i' } },
        ],
      };

      // Also run a $text search to get relevance scores for ranking
      const textFilter = { ...baseFilter, $text: { $search: q } };
      let textIds: string[] = [];
      try {
        const textResults = await Project.find(textFilter)
          .select({ _id: 1, score: { $meta: 'textScore' } })
          .sort({ score: { $meta: 'textScore' } })
          .limit(100)
          .lean();
        textIds = textResults.map((r) => r._id.toString());
      } catch {
        // $text search may fail on certain queries; that's fine, skip it
      }

      // Get all regex matches
      const regexResults = await Project.find(regexFilter)
        .sort(getSortOrder(sortBy, false))
        .skip(skip)
        .limit(limit)
        .populate('createdBy', 'name email')
        .lean();

      total = await Project.countDocuments(regexFilter);

      // Re-sort: put text-matched (high relevance) results first,
      // then the rest in their original order
      if (textIds.length > 0 && (sortBy === 'newest' || sortBy === 'relevance')) {
        const textIdSet = new Set(textIds);
        const textRank = new Map(textIds.map((id, i) => [id, i]));

        regexResults.sort((a, b) => {
          const aId = a._id.toString();
          const bId = b._id.toString();
          const aIsText = textIdSet.has(aId);
          const bIsText = textIdSet.has(bId);

          // Both have text scores → sort by text relevance rank
          if (aIsText && bIsText) {
            return (textRank.get(aId) ?? 999) - (textRank.get(bId) ?? 999);
          }
          // Only one has text score → it goes first
          if (aIsText) return -1;
          if (bIsText) return 1;
          // Neither → keep original sort
          return 0;
        });
      }

      projects = regexResults;
    } else {
      // No search query — just list with filters + sort
      const filter = { ...baseFilter };
      const sort = getSortOrder(sortBy, false);

      [projects, total] = await Promise.all([
        Project.find(filter)
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .populate('createdBy', 'name email')
          .lean(),
        Project.countDocuments(filter),
      ]);
    }

    return NextResponse.json({
      projects,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error('GET /api/projects error:', error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

/**
 * POST /api/projects - Protected: create a project
 */
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = projectSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', issues: parsed.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    await dbConnect();

    const project = await Project.create({
      ...parsed.data,
      createdBy: session.user.id,
    });

    return NextResponse.json(
      { message: 'Project created successfully', project },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/projects error:', error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}
