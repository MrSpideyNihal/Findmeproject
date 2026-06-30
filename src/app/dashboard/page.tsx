import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth/auth';
import dbConnect from '@/lib/mongoose/mongoose';
import Project from '@/models/Project';
import type { Metadata } from 'next';
import DashboardClient from '@/components/dashboard/DashboardClient';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Manage your published student projects.',
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/auth/login');

  await dbConnect();
  const projectsRaw = await Project.find({ createdBy: session.user.id })
    .sort({ createdAt: -1 })
    .lean();

  const projects = projectsRaw.map((p) => ({
    _id: p._id.toString(),
    title: p.title,
    groupName: p.groupName,
    batchName: p.batchName,
    abstract: p.abstract,
    githubUrl: p.githubUrl,
    youtubeUrl: p.youtubeUrl || '',
    members: p.members,
    mentorName: p.mentorName || '',
    tags: p.tags,
    createdAt: p.createdAt.toISOString(),
  }));

  return <DashboardClient user={session.user} initialProjects={projects} />;
}
