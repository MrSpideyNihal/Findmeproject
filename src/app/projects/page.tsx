import type { Metadata } from 'next';
import { Suspense } from 'react';
import ProjectsPageClient from '@/components/projects/ProjectsPageClient';

export const metadata: Metadata = {
  title: 'Explore Projects',
  description: 'Search and filter student projects by name, batch, technology, or team member.',
};

export default function ProjectsPage() {
  return (
    <Suspense fallback={<div className="container" style={{ paddingTop: '3rem', color: 'var(--text-secondary)' }}>Loading projects…</div>}>
      <ProjectsPageClient />
    </Suspense>
  );
}
