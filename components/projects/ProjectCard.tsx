import Link from 'next/link';
import { Github, Youtube, Users, Calendar, Tag, ExternalLink, ArrowRight } from 'lucide-react';

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
  const lead = project.members.find((m) => m.isLead) || project.members[0];
  const shortAbstract = project.abstract.length > 160
    ? project.abstract.slice(0, 160) + '...'
    : project.abstract;

  return (
    <div className="project-card">
      {/* Header */}
      <div style={{ marginBottom: '0.875rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.375rem' }}>
          <Link
            href={`/projects/${project._id}`}
            style={{ fontWeight: 700, fontSize: '1.05rem', lineHeight: 1.3, color: 'var(--text-primary)', flex: 1, transition: 'color 0.2s' }}
          >
            {project.title}
          </Link>
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="View on GitHub"
            style={{ color: 'var(--text-muted)', transition: 'color 0.2s', flexShrink: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <Github size={18} />
          </a>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span className="tag tag-cyan">{project.groupName}</span>
          <span className="tag tag-amber">{project.batchName}</span>
          {project.youtubeUrl && <span className="tag" style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', borderColor: 'rgba(239,68,68,0.2)' }}>▶ Demo</span>}
        </div>
      </div>

      {/* Abstract */}
      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1rem' }}>
        {shortAbstract}
      </p>

      {/* Tags */}
      {project.tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginBottom: '1rem' }}>
          {project.tags.slice(0, 4).map((tag) => (
            <span key={tag} className="tag">{tag}</span>
          ))}
          {project.tags.length > 4 && (
            <span className="tag" style={{ color: 'var(--text-muted)', borderColor: 'var(--border-secondary)' }}>
              +{project.tags.length - 4}
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.875rem', borderTop: '1px solid var(--border-secondary)', gap: '0.5rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Users size={13} />
            {lead?.name || 'Unknown'}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Calendar size={13} />
            {new Date(project.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
          </span>
        </div>
        <Link
          href={`/projects/${project._id}`}
          style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', color: 'var(--accent-primary-light)', fontWeight: 600, transition: 'gap 0.2s' }}
        >
          View Details <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  );
}
