import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Github, Youtube, Users, Calendar, User, Tag, ArrowLeft, Award } from 'lucide-react';
import dbConnect from '@/lib/mongoose/mongoose';
import Project from '@/models/Project';
import mongoose from 'mongoose';
import CopyButton from '@/components/projects/CopyButton';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const { id } = await params;
    await dbConnect();
    if (!mongoose.Types.ObjectId.isValid(id)) return { title: 'Project Not Found' };
    const project = await Project.findById(id).lean();
    if (!project) return { title: 'Project Not Found' };
    return {
      title: project.title,
      description: project.abstract.slice(0, 160),
      openGraph: {
        title: project.title,
        description: project.abstract.slice(0, 160),
      },
    };
  } catch {
    return { title: 'Project' };
  }
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) notFound();

  await dbConnect();
  const project = await Project.findById(id).populate('createdBy', 'name email').lean();
  if (!project) notFound();

  const lead = project.members.find((m) => m.isLead) || project.members[0];

  const getYouTubeEmbedId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    if (!match) return null;
    const id = match[1];
    return /^[a-zA-Z0-9_-]+$/.test(id) ? id : null;
  };

  const embedId = project.youtubeUrl ? getYouTubeEmbedId(project.youtubeUrl) : null;

  return (
    <div style={{ padding: '2.5rem 0 5rem' }}>
      <div className="container" style={{ maxWidth: 960 }}>
        {/* Back */}
        <Link href="/projects" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2rem', transition: 'color 0.2s' }}>
          <ArrowLeft size={16} /> Back to Projects
        </Link>

        {/* Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            <span className="tag tag-cyan">{project.groupName}</span>
            <span className="tag tag-amber">{project.batchName}</span>
          </div>

          <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 900, marginBottom: '1rem', lineHeight: 1.2 }}>
            {project.title}
          </h1>

          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            {lead && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <Award size={14} color="var(--accent-tertiary)" />
                Lead: <strong style={{ color: 'var(--text-primary)' }}>{lead.name}</strong>
              </span>
            )}
            {project.mentorName && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <User size={14} />
                Mentor: <strong style={{ color: 'var(--text-primary)' }}>{project.mentorName}</strong>
              </span>
            )}
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <Calendar size={14} />
              {new Date(project.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
          <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
            <Github size={16} /> View Code on GitHub
          </a>
          <CopyButton text={project.githubUrl} label="Copy GitHub Link" />
          {project.youtubeUrl && (
            <a href={project.youtubeUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
              <Youtube size={16} style={{ color: '#f87171' }} /> Watch Demo
            </a>
          )}
        </div>

        {/* YouTube Embed */}
        {embedId && (
          <div style={{ marginBottom: '2.5rem', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border-secondary)' }}>
            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
              <iframe
                src={`https://www.youtube.com/embed/${embedId}`}
                title={project.title}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                allowFullScreen
              />
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr min(320px, 100%)', gap: '2rem', alignItems: 'start' }}>
          {/* Main Content */}
          <div>
            {/* Abstract */}
            <section style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                Abstract
              </h2>
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-secondary)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{project.abstract}</p>
              </div>
            </section>

            {/* Tags */}
            {project.tags.length > 0 && (
              <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Tag size={16} /> Technologies Used
                </h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {project.tags.map((tag) => (
                    <Link key={tag} href={`/projects?tags=${encodeURIComponent(tag)}`} className="tag" style={{ transition: 'all 0.2s', cursor: 'pointer' }}>
                      {tag}
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Team Members */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-secondary)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Users size={15} /> Team Members
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                {project.members.map((member, i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, flexShrink: 0 }}>
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{member.name}</span>
                          {member.isLead && <span className="badge badge-lead">Lead</span>}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{member.role}</div>
                      </div>
                    </div>
                    <a href={`mailto:${member.email}`} style={{ fontSize: '0.75rem', color: 'var(--accent-primary-light)', paddingLeft: 36, wordBreak: 'break-all' }}>
                      {member.email}
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Info Box */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-secondary)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem' }}>Project Info</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Batch</span>
                  <span style={{ fontWeight: 600 }}>{project.batchName}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Group</span>
                  <span style={{ fontWeight: 600 }}>{project.groupName}</span>
                </div>
                {project.mentorName && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Mentor</span>
                    <span style={{ fontWeight: 600 }}>{project.mentorName}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Members</span>
                  <span style={{ fontWeight: 600 }}>{project.members.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
