import type { Metadata } from 'next';
import Link from 'next/link';
import { Search, Github, Users, Layers, ArrowRight, FolderGit2, CheckCircle2, ChevronRight, Calendar } from 'lucide-react';
import dbConnect from '@/lib/mongoose/mongoose';
import Project from '@/models/Project';

export const metadata: Metadata = {
  title: 'Raisoni-Projects – Student Innovation & Engineering Showcase',
  description: 'Explore engineering and research projects created by students of G.H. Raisoni College of Engineering.',
};

async function getStats() {
  try {
    await dbConnect();
    const [totalProjects, batches, memberCountResult] = await Promise.all([
      Project.countDocuments(),
      Project.distinct('batchName'),
      Project.aggregate([
        { $project: { memberCount: { $size: { $ifNull: ['$members', []] } } } },
        { $group: { _id: null, total: { $sum: '$memberCount' } } }
      ])
    ]);
    const totalMembers = memberCountResult[0]?.total || 0;
    return { totalProjects, totalBatches: batches.length, totalMembers };
  } catch (error) {
    console.error('getStats error:', error);
    return { totalProjects: 0, totalBatches: 0, totalMembers: 0 };
  }
}

async function getFeaturedProjects() {
  try {
    await dbConnect();
    return await Project.find().sort({ createdAt: -1 }).limit(6).lean();
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [stats, featuredProjects] = await Promise.all([getStats(), getFeaturedProjects()]);

  return (
    <div>
      {/* ── Clean Hero Section ───────────────────────────────────────── */}
      <section className="hero-clean" style={{ padding: '4.5rem 0 3.5rem', position: 'relative' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: 860 }}>
          {/* Institutional Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.35rem 0.85rem',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-secondary)',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.8125rem',
              color: 'var(--text-secondary)',
              fontWeight: 500,
              marginBottom: '1.5rem',
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-success)' }} />
            G.H. Raisoni College of Engineering
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.25rem, 5vw, 3.5rem)',
              fontWeight: 800,
              lineHeight: 1.15,
              marginBottom: '1.25rem',
              color: 'var(--text-primary)',
              letterSpacing: '-0.035em',
            }}
          >
            Student Engineering &<br />Innovation Showcase
          </h1>

          <p
            style={{
              fontSize: '1.1rem',
              color: 'var(--text-secondary)',
              maxWidth: 620,
              margin: '0 auto 2.25rem',
              lineHeight: 1.6,
            }}
          >
            Discover, evaluate, and collaborate on production-ready student projects, research models, and technical innovations across all departments.
          </p>

          {/* Quick Actions */}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '3rem' }}>
            <Link href="/projects" className="btn btn-primary btn-lg">
              <Search size={17} /> Explore All Projects
            </Link>
            <Link href="/auth/register" className="btn btn-secondary btn-lg">
              Teacher Portal <ArrowRight size={17} />
            </Link>
          </div>

          {/* Metrics Row (Nixtio style clean cards) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '1rem',
              textAlign: 'left',
            }}
          >
            <div className="stat-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span className="stat-label">Published Projects</span>
                <FolderGit2 size={18} color="var(--text-muted)" />
              </div>
              <div className="stat-number">{stats.totalProjects.toLocaleString()}</div>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-success)', fontWeight: 600 }}>
                Verified academic submissions
              </span>
            </div>

            <div className="stat-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span className="stat-label">Student Innovators</span>
                <Users size={18} color="var(--text-muted)" />
              </div>
              <div className="stat-number">{stats.totalMembers.toLocaleString()}</div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                Across all project groups
              </span>
            </div>

            <div className="stat-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span className="stat-label">Academic Batches</span>
                <Layers size={18} color="var(--text-muted)" />
              </div>
              <div className="stat-number">{stats.totalBatches}</div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                Engineering cohorts
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Featured Projects Section ─────────────────────────────────── */}
      {featuredProjects.length > 0 && (
        <section style={{ padding: '3.5rem 0 4.5rem' }}>
          <div className="container">
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-brand)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Recent Submissions
                </span>
                <h2 style={{ fontSize: '1.65rem', fontWeight: 800, marginTop: '0.25rem', color: 'var(--text-primary)' }}>
                  Latest Student Projects
                </h2>
              </div>
              <Link href="/projects" className="btn btn-secondary btn-sm">
                View All Projects <ChevronRight size={15} />
              </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
              {featuredProjects.map((project) => {
                const lead = project.members?.find((m: { isLead?: boolean }) => m.isLead) || project.members?.[0];
                return (
                  <Link
                    href={`/projects/${project._id}`}
                    key={project._id.toString()}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <div className="project-card" style={{ height: '100%' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                          <span className="tag tag-group">{project.groupName}</span>
                          <span className="tag tag-batch">{project.batchName}</span>
                        </div>
                        {project.githubUrl && (
                          <div style={{ color: 'var(--text-muted)' }}>
                            <Github size={16} />
                          </div>
                        )}
                      </div>

                      <h3
                        style={{
                          fontSize: '1.05rem',
                          fontWeight: 700,
                          lineHeight: 1.35,
                          marginBottom: '0.5rem',
                          color: 'var(--text-primary)',
                        }}
                      >
                        {project.title}
                      </h3>

                      <p
                        style={{
                          fontSize: '0.85rem',
                          color: 'var(--text-secondary)',
                          lineHeight: 1.55,
                          marginBottom: '1rem',
                          flex: 1,
                        }}
                      >
                        {project.abstract?.length > 130 ? `${project.abstract.slice(0, 130)}...` : project.abstract}
                      </p>

                      {/* Tech Tags */}
                      {project.tags?.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1rem' }}>
                          {project.tags.slice(0, 3).map((t: string) => (
                            <span key={t} className="tag">
                              {t}
                            </span>
                          ))}
                          {project.tags.length > 3 && (
                            <span className="tag" style={{ color: 'var(--text-muted)' }}>
                              +{project.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Card Footer */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          paddingTop: '0.85rem',
                          borderTop: '1px solid var(--border-secondary)',
                          fontSize: '0.8rem',
                          color: 'var(--text-muted)',
                        }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 500 }}>
                          <Users size={13} /> {lead?.name || 'Student Team'}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Calendar size={13} /> {new Date(project.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── Faculty / Teacher CTA ────────────────────────────────────── */}
      <section style={{ padding: '2rem 0 5rem' }}>
        <div className="container" style={{ maxWidth: 860 }}>
          <div
            style={{
              background: '#ffffff',
              border: '1px solid var(--border-secondary)',
              borderRadius: 'var(--radius-lg)',
              padding: '2.5rem',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '2rem',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ flex: '1 1 360px' }}>
              <span className="tag tag-accent" style={{ marginBottom: '0.75rem' }}>
                Faculty Portal
              </span>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                Publish and Manage Student Work
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                Faculty advisors can easily import projects via Excel or submit individual submissions with repository links, demos, and verified team rosters.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <Link href="/auth/register" className="btn btn-primary">
                Register as Faculty
              </Link>
              <Link href="/auth/login" className="btn btn-secondary">
                Faculty Login
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
