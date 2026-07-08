import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import dbConnect from '@/lib/mongoose/mongoose';
import Project from '@/models/Project';
import { bulkImportSchema } from '@/lib/validations/bulkValidations';

const BATCH_SIZE = 10;

/**
 * POST /api/projects/bulk
 *
 * Accepts an array of parsed projects and inserts them in batches.
 * Protected route — requires authenticated session.
 *
 * Request body: { projects: BulkProjectInput[] }
 * Response: { inserted: number, failed: { index, title, errors }[], total: number }
 */
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const parsed = bulkImportSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          issues: parsed.error.flatten().fieldErrors,
        },
        { status: 422 }
      );
    }

    await dbConnect();

    const { projects } = parsed.data;
    const results: {
      inserted: number;
      failed: { index: number; title: string; errors: string[] }[];
      total: number;
    } = {
      inserted: 0,
      failed: [],
      total: projects.length,
    };

    // Process in batches to avoid overwhelming MongoDB
    for (let i = 0; i < projects.length; i += BATCH_SIZE) {
      const batch = projects.slice(i, i + BATCH_SIZE);

      const docsToInsert = batch.map((proj) => ({
        ...proj,
        createdBy: session.user.id,
      }));

      try {
        // Use insertMany with ordered:false so one failure doesn't stop the rest
        const insertResult = await Project.insertMany(docsToInsert, {
          ordered: false,
        });
        results.inserted += insertResult.length;
      } catch (bulkError: unknown) {
        // insertMany with ordered:false throws a BulkWriteError but still inserts valid docs
        const err = bulkError as {
          insertedDocs?: unknown[];
          writeErrors?: { index: number; errmsg?: string }[];
        };

        if (err.insertedDocs) {
          results.inserted += (err.insertedDocs as unknown[]).length;
        }

        if (err.writeErrors) {
          for (const writeErr of err.writeErrors) {
            const globalIdx = i + writeErr.index;
            results.failed.push({
              index: globalIdx,
              title: projects[globalIdx]?.title || 'Unknown',
              errors: [writeErr.errmsg || 'Database insertion failed'],
            });
          }
        } else {
          // If it's not a BulkWriteError, mark the whole batch as failed
          for (let j = 0; j < batch.length; j++) {
            results.failed.push({
              index: i + j,
              title: batch[j]?.title || 'Unknown',
              errors: [
                bulkError instanceof Error
                  ? bulkError.message
                  : 'Batch insertion failed',
              ],
            });
          }
        }
      }
    }

    return NextResponse.json(results, {
      status: results.failed.length > 0 ? 207 : 201,
    });
  } catch (error) {
    console.error('POST /api/projects/bulk error:', error);
    return NextResponse.json(
      { error: 'Failed to bulk import projects' },
      { status: 500 }
    );
  }
}
