'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Github, Calendar, Trash2, Edit3, ExternalLink, BookOpen, Users, Eye } from 'lucide-react';
import { useToast } from '@/components/ToastProvider';

interface Project {
  _id: string;
  title: string;
  groupName: string;
  batchName: string;
  abstract: string;
  githubUrl: string;
  youtubeUrl: string;
  members: { name: string; email: string; role: string; isLead: boolean }[];
  mentorName: string;
  tags: string[];
  createdAt: string;
}

interface DashboardClientProps {
  user: { name?: string | null; email?: string | null; id: string };
  initialProjects: Project[];
}

export default function DashboardClient({ user, initialProjects }: DashboardClientProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProjects((prev) => prev.filter((p) => p._id !== id));
        showToast('Project deleted successfully', 'success');
      } else {
        const data = await res.json();
        showToast(data.error || 'Failed to delete project', 'error');
      }
    } catch {
      showToast('Something went wrong', 'error');
    } finally {
      setDeleting(null);
      setConfirmDelete(null);
    }
  };

  return (
    <div style={{ padding: '2.5rem 0 5rem' }}>
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 800, marginBottom: '0.375rem' }}>
              Good to see you, <span className="gradient-text">{user.name?.split(' ')[0]}</span>!
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>{user.email}</p>
          </div>
          <Link href="/add-project" className="btn btn-primary" id="add-project-btn">
            <Plus size={18} /> Add New Project
          </Link>
        </div>

        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
          {[
            { label: 'Total Projects', value: projects.length, icon: BookOpen, color: 'var(--accent-primary-light)' },
            { label: 'Total Members', value: projects.reduce((s, p) => s + p.members.length, 0), icon: Users, color: 'var(--accent-secondary)' },
            { label: 'Batches', value: [...new Set(projects.map((p) => p.batchName))].length, icon: Eye, color: 'var(--accent-tertiary)' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="stat-card">
              <Icon size={22} color={color} style={{ marginBottom: '0.5rem' }} />
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color }}>{value}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Projects List */}
        {projects.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 1rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-secondary)' }}>
            <BookOpen size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.5rem' }}>No projects yet</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Start by adding your first student project.</p>
            <Link href="/add-project" className="btn btn-primary">
              <Plus size={16} /> Add Your First Project
            </Link>
          </div>
        ) : (
          <div>
            <h2 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '1.25rem', color: 'var(--text-secondary)' }}>
              Your Projects ({projects.length})
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {projects.map((project) => (
                <div
                  key={project._id}
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border-secondary)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap', transition: 'border-color 0.2s' }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                      <span className="tag tag-cyan">{project.groupName}</span>
                      <span className="tag tag-amber">{project.batchName}</span>
                    </div>
                    <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.375rem' }}>{project.title}</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                      {project.abstract.slice(0, 120)}…
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Users size={12} /> {project.members.length} members
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Calendar size={12} /> {new Date(project.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0, flexWrap: 'wrap' }}>
                    <Link href={`/projects/${project._id}`} className="btn btn-secondary btn-sm" title="View public page">
                      <Eye size={14} />
                    </Link>
                    <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm" title="Open GitHub">
                      <Github size={14} />
                    </a>
                    <Link href={`/edit-project/${project._id}`} className="btn btn-secondary btn-sm" title="Edit project">
                      <Edit3 size={14} />
                    </Link>
                    {confirmDelete === project._id ? (
                      <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.8rem', color: '#f87171' }}>Sure?</span>
                        <button
                          onClick={() => handleDelete(project._id)}
                          className="btn btn-danger btn-sm"
                          disabled={deleting === project._id}
                        >
                          {deleting === project._id ? '…' : 'Yes'}
                        </button>
                        <button onClick={() => setConfirmDelete(null)} className="btn btn-secondary btn-sm">No</button>
                      </div>
                    ) : (
                      <button onClick={() => setConfirmDelete(project._id)} className="btn btn-danger btn-sm" title="Delete">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
