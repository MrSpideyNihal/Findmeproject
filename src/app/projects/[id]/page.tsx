import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Github, Video, Users, Calendar, User, Tag, ArrowLeft, ShieldCheck, Mail } from 'lucide-react';
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
      title: `${project.title} | Raisoni-Projects`,
      description: project.abstract.slice(0, 160),
      openGraph: {
        title: project.title,
        description: project.abstract.slice(0, 160),
      },
    };
  } catch {
    return { title: 'Project Details' };
  }
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) notFound();

  await dbConnect();
  const project = await Project.findById(id).populate('createdBy', 'name email').lean();
  if (!project) notFound();

  const lead = project.members?.find((m) => m.isLead) || project.members?.[0];

  const getYouTubeEmbedId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    if (!match) return null;
    const ytid = match[1];
    return /^[a-zA-Z0-9_-]+$/.test(ytid) ? ytid : null;
  };

  const embedId = project.youtubeUrl ? getYouTubeEmbedId(project.youtubeUrl) : null;

  return (
    <div style={{ padding: '2.5rem 0 5rem', minHeight: '85vh' }}>
      <div className="container" style={{ maxWidth: 1040 }}>
        {/* Navigation Breadcrumb */}
        <Link
          href="/projects"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: 'var(--text-secondary)',
            fontSize: '0.875rem',
            fontWeight: 500,
            marginBottom: '1.75rem',
            textDecoration: 'none',
          }}
        >
          <ArrowLeft size={16} /> Back to Projects Directory
        </Link>

        {/* Project Header Card */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid var(--border-secondary)',
            borderRadius: 'var(--radius-lg)',
            padding: '2rem',
            marginBottom: '2rem',
            boxShadow: 'var(--shadow-xs)',
          }}
        >
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.85rem' }}>
            <span className="tag tag-group">{project.groupName}</span>
            <span className="tag tag-batch">{project.batchName}</span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(1.75rem, 3.5vw, 2.25rem)',
              fontWeight: 800,
              color: 'var(--text-primary)',
              lineHeight: 1.25,
              marginBottom: '1rem',
            }}
          >
            {project.title}
          </h1>

          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            {lead && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <ShieldCheck size={16} color="var(--accent-brand)" />
                Project Lead: <strong style={{ color: 'var(--text-primary)' }}>{lead.name}</strong>
              </span>
            )}
            {project.mentorName && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <User size={16} color="var(--text-muted)" />
                Mentor: <strong style={{ color: 'var(--text-primary)' }}>{project.mentorName}</strong>
              </span>
            )}
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Calendar size={16} color="var(--text-muted)" />
              Published: {new Date(project.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
          </div>

          {/* Action Row */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', paddingTop: '1.25rem', borderTop: '1px solid var(--border-subtle)' }}>
            {project.githubUrl && (
              <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                <Github size={16} /> View Code on GitHub
              </a>
            )}
            {project.githubUrl && (
              <CopyButton text={project.githubUrl} label="Copy GitHub Link" />
            )}
            {project.youtubeUrl && (
              <a href={project.youtubeUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
                <Video size={16} color="#dc2626" /> Watch Video Demo
              </a>
            )}
          </div>
        </div>

        {/* Embedded Video (if present) */}
        {embedId && (
          <div
            style={{
              marginBottom: '2rem',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              border: '1px solid var(--border-secondary)',
              background: '#000000',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
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

        {/* Main Content Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr min(320px, 100%)', gap: '2rem', alignItems: 'start' }}>
          {/* Left Column: Abstract & Tech Stack */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Abstract */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid var(--border-secondary)',
                borderRadius: 'var(--radius-md)',
                padding: '1.75rem',
                boxShadow: 'var(--shadow-xs)',
              }}
            >
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>
                Project Abstract
              </h2>
              <div style={{ color: 'var(--text-secondary)', lineHeight: 1.75, fontSize: '0.925rem', whiteSpace: 'pre-wrap' }}>
                {project.abstract}
              </div>
            </div>

            {/* Technologies */}
            {project.tags && project.tags.length > 0 && (
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid var(--border-secondary)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.75rem',
                  boxShadow: 'var(--shadow-xs)',
                }}
              >
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.85rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Tag size={16} color="var(--text-muted)" /> Technologies & Tools
                </h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {project.tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/projects?tags=${encodeURIComponent(tag)}`}
                      className="tag"
                      style={{ fontSize: '0.8rem', padding: '0.3rem 0.75rem' }}
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Team Roster & Metadata */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Team Members */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid var(--border-secondary)',
                borderRadius: 'var(--radius-md)',
                padding: '1.5rem',
                boxShadow: 'var(--shadow-xs)',
              }}
            >
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
                <Users size={16} color="var(--text-muted)" /> Team Members ({project.members?.length || 0})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {project.members?.map((member, i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', paddingBottom: i < (project.members.length - 1) ? '0.85rem' : '0', borderBottom: i < (project.members.length - 1) ? '1px solid var(--border-subtle)' : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                      <div
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: '50%',
                          background: member.isLead ? '#eff6ff' : 'var(--bg-subtle)',
                          border: `1px solid ${member.isLead ? '#bfdbfe' : 'var(--border-secondary)'}`,
                          color: member.isLead ? '#1d4ed8' : 'var(--text-secondary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                            {member.name}
                          </span>
                          {member.isLead && <span className="badge badge-lead">Lead</span>}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {member.role}
                        </div>
                      </div>
                    </div>
                    {member.email && (
                      <a
                        href={`mailto:${member.email}`}
                        style={{
                          fontSize: '0.75rem',
                          color: 'var(--accent-brand)',
                          paddingLeft: 38,
                          wordBreak: 'break-all',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                        }}
                      >
                        <Mail size={11} /> {member.email}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Metadata */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid var(--border-secondary)',
                borderRadius: 'var(--radius-md)',
                padding: '1.5rem',
                boxShadow: 'var(--shadow-xs)',
              }}
            >
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>
                Project Overview
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Batch Cohort</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{project.batchName}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Group Name</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{project.groupName}</span>
                </div>
                {project.mentorName && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Faculty Mentor</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{project.mentorName}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Team Size</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{project.members?.length || 0} students</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
