import type { Metadata } from 'next';
import Link from 'next/link';
import { Search, Github, Users, BookOpen, Zap, ArrowRight, Star } from 'lucide-react';
import dbConnect from '@/lib/mongoose/mongoose';
import Project from '@/models/Project';

export const metadata: Metadata = {
  title: 'Raisoni-Projects – Discover Student Projects',
  description: 'Explore an ever-growing collection of student projects across all batches and technologies.',
};

// Stats helper
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
    return await Project.find().sort({ createdAt: -1 }).limit(3).lean();
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [stats, featuredProjects] = await Promise.all([getStats(), getFeaturedProjects()]);

  return (
    <div>
      {/* ── Hero ── */}
      <section className="hero-gradient" style={{ padding: '6rem 0 4rem', textAlign: 'center', position: 'relative' }}>
        <div className="container">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.375rem 1rem', background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 999, fontSize: '0.8rem', color: 'var(--accent-primary-light)', fontWeight: 600, marginBottom: '1.5rem' }}>
            <Star size={14} /> The #1 Student Project Showcase Platform
          </div>

          <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 900, lineHeight: 1.1, marginBottom: '1.5rem', letterSpacing: '-0.03em' }}>
            Discover Incredible<br />
            <span className="gradient-text">Student Projects</span>
          </h1>

          <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', maxWidth: 600, margin: '0 auto 2.5rem', lineHeight: 1.7 }}>
            Raisoni-Projects is where teachers publish student work and the world discovers tomorrow&apos;s innovators. Search by name, batch, tech stack, or team member.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/projects" className="btn btn-primary btn-lg">
              <Search size={18} /> Explore Projects
            </Link>
            <Link href="/auth/register" className="btn btn-secondary btn-lg">
              I&apos;m a Teacher <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section style={{ padding: '3rem 0', borderTop: '1px solid var(--border-secondary)', borderBottom: '1px solid var(--border-secondary)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem' }}>
            {[
              { label: 'Projects Published', value: stats.totalProjects, icon: BookOpen, color: 'var(--accent-primary-light)' },
              { label: 'Unique Batches', value: stats.totalBatches, icon: Users, color: 'var(--accent-secondary)' },
              { label: 'Student Members', value: stats.totalMembers, icon: Zap, color: 'var(--accent-tertiary)' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="stat-card">
                <Icon size={28} color={color} style={{ marginBottom: '0.75rem' }} />
                <div style={{ fontSize: '2.25rem', fontWeight: 800, color, marginBottom: '0.25rem' }}>{value.toLocaleString()}</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Projects ── */}
      {featuredProjects.length > 0 && (
        <section style={{ padding: '4rem 0' }}>
          <div className="container">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.375rem' }}>Latest Projects</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Fresh additions from our teacher community</p>
              </div>
              <Link href="/projects" className="btn btn-secondary">
                View All <ArrowRight size={16} />
              </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {featuredProjects.map((project) => {
                return (
                  <Link href={`/projects/${project._id}`} key={project._id.toString()} style={{ textDecoration: 'none' }}>
                    <div className="project-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        <h3 style={{ fontWeight: 700, fontSize: '1rem', lineHeight: 1.3 }}>{project.title}</h3>
                        <Github size={16} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                        <span className="tag tag-cyan">{project.groupName}</span>
                        <span className="tag tag-amber">{project.batchName}</span>
                      </div>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.6 }}>
                        {project.abstract.slice(0, 120)}…
                      </p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                        {project.tags.slice(0, 3).map((t) => <span key={t} className="tag">{t}</span>)}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ── */}
      <section style={{ padding: '4rem 0', textAlign: 'center' }}>
        <div className="container">
          <div className="glass-card glow-border" style={{ padding: '3rem 2rem', maxWidth: 640, margin: '0 auto' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '1rem' }}>
              Are you a Teacher?
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: 1.7 }}>
              Create a free account and start publishing your students&apos; projects. Share their GitHub work, demo videos, and team information with the world.
            </p>
            <Link href="/auth/register" className="btn btn-primary btn-lg">
              Create Teacher Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
