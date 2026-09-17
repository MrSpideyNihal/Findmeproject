import Link from 'next/link';
import { Github, Users, Calendar, ArrowRight, Video } from 'lucide-react';

interface Member {
  name: string;
  email: string;
  role: string;
  isLead: boolean;
}

interface ProjectCardProps {
  project: {
    _id: string;
    title: string;
    groupName: string;
    batchName: string;
    abstract: string;
    githubUrl: string;
    youtubeUrl?: string;
    members: Member[];
    mentorName?: string;
    tags: string[];
    createdAt: string;
  };
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const lead = project.members?.find((m) => m.isLead) || project.members?.[0];
  const shortAbstract = project.abstract?.length > 150
    ? project.abstract.slice(0, 150) + '...'
    : project.abstract;

  return (
    <div className="project-card">
      {/* Top Header: Group, Batch, and External Link */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
          <span className="tag tag-group">{project.groupName}</span>
          <span className="tag tag-batch">{project.batchName}</span>
          {project.youtubeUrl && (
            <span className="tag" style={{ background: '#fef2f2', color: '#dc2626', borderColor: '#fecaca' }}>
              <Video size={11} /> Demo Video
            </span>
          )}
        </div>

        {project.githubUrl && (
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="View GitHub Repository"
            style={{
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              padding: '0.2rem',
              borderRadius: '4px',
              transition: 'color 0.15s',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Github size={16} />
          </a>
        )}
      </div>

      {/* Project Title */}
      <h3 style={{ marginBottom: '0.5rem', lineHeight: 1.35 }}>
        <Link
          href={`/projects/${project._id}`}
          style={{
            fontWeight: 700,
            fontSize: '1.05rem',
            color: 'var(--text-primary)',
            textDecoration: 'none',
          }}
        >
          {project.title}
        </Link>
      </h3>

      {/* Abstract */}
      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: '1rem', flex: 1 }}>
        {shortAbstract}
      </p>

      {/* Tags */}
      {project.tags && project.tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1.15rem' }}>
          {project.tags.slice(0, 4).map((tag) => (
            <span key={tag} className="tag">
              {tag}
            </span>
          ))}
          {project.tags.length > 4 && (
            <span className="tag" style={{ color: 'var(--text-muted)' }}>
              +{project.tags.length - 4}
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
          fontSize: '0.8125rem',
          color: 'var(--text-muted)',
          gap: '0.5rem',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
            <Users size={13} color="var(--text-muted)" />
            {lead?.name || `${project.members?.length || 0} members`}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Calendar size={13} color="var(--text-muted)" />
            {new Date(project.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
          </span>
        </div>

        <Link
          href={`/projects/${project._id}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
            color: 'var(--text-primary)',
            fontWeight: 600,
            fontSize: '0.8125rem',
            textDecoration: 'none',
          }}
        >
          Details <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  );
}
