import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose/mongoose';
import Project from '@/models/Project';

/**
 * GET /api/batches - Returns distinct batch names for filter dropdowns
 */
export async function GET() {
  try {
    await dbConnect();
    const batches = await Project.distinct('batchName');
    return NextResponse.json({ batches: batches.sort() });
  } catch (error) {
    console.error('GET /api/batches error:', error);
    return NextResponse.json({ batches: [] }, { status: 500 });
  }
}
