import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth/auth';
import type { Metadata } from 'next';
import ProjectForm from '@/components/dashboard/ProjectForm';

export const metadata: Metadata = {
  title: 'Add New Project',
  description: 'Publish a new student project to ProjectVault.',
};

export default async function AddProjectPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/auth/login');

  return <ProjectForm mode="create" />;
}
