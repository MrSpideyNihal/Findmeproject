import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import dbConnect from '@/lib/mongoose/mongoose';
import Project from '@/models/Project';
import { projectSchema, searchSchema } from '@/lib/validations/validations';

/**
 * GET /api/projects - Public: search/list projects
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const parsed = searchSchema.safeParse({
      q: searchParams.get('q') || '',
      batch: searchParams.get('batch') || '',
      tags: searchParams.get('tags') || '',
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '12',
    });

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid query parameters' }, { status: 400 });
    }

    const { q, batch, tags, page, limit } = parsed.data;

    await dbConnect();

    // Build filter
    const filter: Record<string, unknown> = {};

    if (q) {
      filter.$or = [
        { $text: { $search: q } },
        { groupName: { $regex: q, $options: 'i' } },
        { 'members.name': { $regex: q, $options: 'i' } },
        { 'members.email': { $regex: q, $options: 'i' } },
      ];
    }

    if (batch) {
      filter.batchName = { $regex: batch, $options: 'i' };
    }

    if (tags) {
      const tagList = tags.split(',').map((t) => t.trim()).filter(Boolean);
      if (tagList.length > 0) {
        filter.tags = { $in: tagList };
      }
    }

    const skip = (page - 1) * limit;
    const [projects, total] = await Promise.all([
      Project.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('createdBy', 'name email')
        .lean(),
      Project.countDocuments(filter),
    ]);

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
