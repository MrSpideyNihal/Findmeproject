import { getServerSession } from 'next-auth';
import { redirect, notFound } from 'next/navigation';
import { authOptions } from '@/lib/auth/auth';
import dbConnect from '@/lib/mongoose/mongoose';
import Project from '@/models/Project';
import mongoose from 'mongoose';
import type { Metadata } from 'next';
import ProjectForm from '@/components/dashboard/ProjectForm';

interface PageProps {
  params: { id: string };
}

export const metadata: Metadata = {
  title: 'Edit Project',
};

export default async function EditProjectPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/auth/login');

  if (!mongoose.Types.ObjectId.isValid(params.id)) notFound();

  await dbConnect();
  const project = await Project.findById(params.id).lean();

  if (!project) notFound();

  // Authorization check: only the owner can edit
  if (project.createdBy.toString() !== session.user.id) {
    redirect('/dashboard');
  }

  const initialData = {
    title: project.title,
    groupName: project.groupName,
    batchName: project.batchName,
    abstract: project.abstract,
    githubUrl: project.githubUrl,
    youtubeUrl: project.youtubeUrl || '',
    members: project.members,
    mentorName: project.mentorName || '',
    tags: project.tags,
  };

  return <ProjectForm mode="edit" projectId={params.id} initialData={initialData} />;
}
