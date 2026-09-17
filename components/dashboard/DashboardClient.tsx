'use client';

import { useState, lazy, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Github, Calendar, Trash2, Edit3, FolderGit2, Users, Eye, FileSpreadsheet, Search, AlertTriangle, Check, X } from 'lucide-react';
import { useToast } from '@/components/ToastProvider';

const ExcelImport = lazy(() => import('@/components/dashboard/ExcelImport'));

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
  const [showImport, setShowImport] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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
      showToast('Something went wrong. Please try again.', 'error');
    } finally {
      setDeleting(null);
      setConfirmDelete(null);
    }
  };

  const filteredProjects = projects.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      p.groupName.toLowerCase().includes(q) ||
      p.batchName.toLowerCase().includes(q) ||
      p.members.some((m) => m.name.toLowerCase().includes(q))
    );
  });

  return (
    <div style={{ padding: '2.5rem 0 5rem', minHeight: '85vh' }}>
      <div className="container">
        {/* Top Header Row (BizLink style) */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '2rem',
            flexWrap: 'wrap',
            gap: '1.25rem',
          }}
        >
          <div>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-brand)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Faculty Management Console
            </span>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.2rem', marginBottom: '0.25rem' }}>
              Welcome back, {user.name || 'Faculty Member'}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{user.email}</p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setShowImport(true)}
              className="btn btn-secondary"
              id="import-excel-btn"
            >
              <FileSpreadsheet size={16} /> Import from Excel
            </button>
            <Link href="/add-project" className="btn btn-primary" id="add-project-btn">
              <Plus size={16} /> Add New Project
            </Link>
          </div>
        </div>

        {/* Metrics Overview (Nixtio style) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem',
          }}
        >
          <div className="stat-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
              <span className="stat-label">Your Projects</span>
              <FolderGit2 size={16} color="var(--text-muted)" />
            </div>
            <div className="stat-number">{projects.length}</div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Published under your account</span>
          </div>

          <div className="stat-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
              <span className="stat-label">Total Students</span>
              <Users size={16} color="var(--text-muted)" />
            </div>
            <div className="stat-number">{projects.reduce((s, p) => s + (p.members?.length || 0), 0)}</div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Team members mentored</span>
          </div>

          <div className="stat-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
              <span className="stat-label">Batches Managed</span>
              <Calendar size={16} color="var(--text-muted)" />
            </div>
            <div className="stat-number">{[...new Set(projects.map((p) => p.batchName))].length}</div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Distinct academic cohorts</span>
          </div>
        </div>

        {/* Projects Section Header with Live Search Filter */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid var(--border-secondary)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem 1.25rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Managed Projects
            </h2>
            <span className="counter-badge">{filteredProjects.length}</span>
          </div>

          <div style={{ position: 'relative', width: '280px', maxWidth: '100%' }}>
            <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
            <input
              type="text"
              placeholder="Filter your projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '2.2rem', paddingRight: '0.75rem', height: '36px', fontSize: '0.8125rem' }}
            />
          </div>
        </div>

        {/* Projects List */}
        {projects.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '4.5rem 1.5rem',
              background: '#ffffff',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-secondary)',
            }}
          >
            <FolderGit2 size={44} color="var(--text-muted)" style={{ margin: '0 auto 0.75rem' }} />
            <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
              No projects added yet
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Publish your first student project manually or upload multiple via Excel sheet.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <Link href="/add-project" className="btn btn-primary">
                <Plus size={16} /> Add First Project
              </Link>
              <button onClick={() => setShowImport(true)} className="btn btn-secondary">
                <FileSpreadsheet size={16} /> Import Excel
              </button>
            </div>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '3rem 1.5rem',
              background: '#ffffff',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-secondary)',
            }}
          >
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              No projects matched your filter: &quot;{searchQuery}&quot;
            </p>
            <button onClick={() => setSearchQuery('')} className="btn btn-secondary btn-sm" style={{ marginTop: '0.75rem' }}>
              Clear Filter
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {filteredProjects.map((project) => (
              <div
                key={project._id}
                style={{
                  background: '#ffffff',
                  border: '1px solid var(--border-secondary)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem',
                  display: 'flex',
                  gap: '1.25rem',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  boxShadow: 'var(--shadow-xs)',
                  transition: 'border-color 0.15s ease',
                }}
              >
                <div style={{ flex: '1 1 300px', minWidth: 0 }}>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                    <span className="tag tag-group">{project.groupName}</span>
                    <span className="tag tag-batch">{project.batchName}</span>
                  </div>

                  <h3 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                    {project.title}
                  </h3>

                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', lineHeight: 1.5 }}>
                    {project.abstract?.length > 130 ? `${project.abstract.slice(0, 130)}...` : project.abstract}
                  </p>

                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Users size={13} /> {project.members?.length || 0} members
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Calendar size={13} /> {new Date(project.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Actions Toolbar */}
                <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0, alignItems: 'center', flexWrap: 'wrap' }}>
                  <Link href={`/projects/${project._id}`} className="btn btn-secondary btn-sm" title="View Public Page">
                    <Eye size={14} /> View
                  </Link>

                  {project.githubUrl && (
                    <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm" title="View GitHub Code">
                      <Github size={14} />
                    </a>
                  )}

                  <Link href={`/edit-project/${project._id}`} className="btn btn-secondary btn-sm" title="Edit Project">
                    <Edit3 size={14} /> Edit
                  </Link>

                  {confirmDelete === project._id ? (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: '#fef2f2', padding: '0.2rem 0.4rem', borderRadius: 'var(--radius-sm)', border: '1px solid #fecaca' }}>
                      <span style={{ fontSize: '0.75rem', color: '#dc2626', fontWeight: 600 }}>Confirm?</span>
                      <button
                        onClick={() => handleDelete(project._id)}
                        className="btn btn-danger btn-sm"
                        disabled={deleting === project._id}
                        style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                      >
                        {deleting === project._id ? '...' : <Check size={13} />}
                      </button>
                      <button
                        onClick={() => setConfirmDelete(null)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDelete(project._id)}
                      className="btn btn-secondary btn-sm"
                      title="Delete Project"
                      style={{ color: 'var(--color-danger)' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Excel Import Modal */}
        {showImport && (
          <Suspense fallback={null}>
            <ExcelImport
              onClose={() => setShowImport(false)}
              onImportComplete={() => {
                router.refresh();
              }}
            />
          </Suspense>
        )}
      </div>
    </div>
  );
}
