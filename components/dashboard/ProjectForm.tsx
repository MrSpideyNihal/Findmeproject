'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Minus, Loader2, Github, Youtube, User, Mail, Tag, ArrowLeft, Save } from 'lucide-react';
import { useToast } from '@/components/ToastProvider';

interface Member {
  name: string;
  email: string;
  role: string;
  isLead: boolean;
}

interface ProjectFormProps {
  mode: 'create' | 'edit';
  projectId?: string;
  initialData?: {
    title: string;
    groupName: string;
    batchName: string;
    abstract: string;
    githubUrl: string;
    youtubeUrl: string;
    members: Member[];
    mentorName: string;
    tags: string[];
  };
}

const defaultMember: Member = { name: '', email: '', role: '', isLead: false };

export default function ProjectForm({ mode, projectId, initialData }: ProjectFormProps) {
  const router = useRouter();
  const { showToast } = useToast();

  const [title, setTitle] = useState(initialData?.title || '');
  const [groupName, setGroupName] = useState(initialData?.groupName || '');
  const [batchName, setBatchName] = useState(initialData?.batchName || '');
  const [abstract, setAbstract] = useState(initialData?.abstract || '');
  const [githubUrl, setGithubUrl] = useState(initialData?.githubUrl || '');
  const [youtubeUrl, setYoutubeUrl] = useState(initialData?.youtubeUrl || '');
  const [members, setMembers] = useState<Member[]>(initialData?.members || [{ ...defaultMember }]);
  const [mentorName, setMentorName] = useState(initialData?.mentorName || '');
  const [tagsInput, setTagsInput] = useState(initialData?.tags?.join(', ') || '');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const addMember = () => setMembers((prev) => [...prev, { ...defaultMember }]);

  const removeMember = (i: number) => {
    if (members.length === 1) return;
    setMembers((prev) => prev.filter((_, idx) => idx !== i));
  };

  const updateMember = (i: number, field: keyof Member, value: string | boolean) => {
    setMembers((prev) => {
      const updated = [...prev];
      if (field === 'isLead' && value === true) {
        updated.forEach((m, idx) => { updated[idx] = { ...m, isLead: idx === i }; });
      } else {
        updated[i] = { ...updated[i], [field]: value };
      }
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);
    const payload = { title, groupName, batchName, abstract, githubUrl, youtubeUrl, members, mentorName, tags };

    try {
      const url = mode === 'create' ? '/api/projects' : `/api/projects/${projectId}`;
      const method = mode === 'create' ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.issues) {
          setErrors(data.issues);
          showToast('Please fix the form errors', 'error');
        } else {
          showToast(data.error || 'Failed to save project', 'error');
        }
        return;
      }

      showToast(mode === 'create' ? 'Project created successfully! 🎉' : 'Project updated!', 'success');
      router.push('/dashboard');
      router.refresh();
    } catch {
      showToast('Something went wrong. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fieldError = (key: string) => errors[key]?.[0];

  return (
    <div style={{ padding: '2.5rem 0 5rem' }}>
      <div className="container" style={{ maxWidth: 760 }}>
        {/* Back */}
        <Link href="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2rem' }}>
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>

        <h1 style={{ fontSize: '1.875rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          {mode === 'create' ? 'Add New Project' : 'Edit Project'}
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem' }}>
          {mode === 'create' ? 'Fill in the details to publish a student project.' : 'Update the project information below.'}
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Basic Info */}
          <section style={{ background: 'var(--bg-card)', border: '1px solid var(--border-secondary)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h2 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.25rem' }}>Basic Information</h2>

            <div className="form-group">
              <label className="form-label required" htmlFor="title">Project Title</label>
              <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., AI-Powered Student Attendance System" className={`form-input ${fieldError('title') ? 'error' : ''}`} />
              {fieldError('title') && <span className="form-error">{fieldError('title')}</span>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label required" htmlFor="groupName">Group Name</label>
                <input id="groupName" type="text" value={groupName} onChange={(e) => setGroupName(e.target.value)} placeholder="e.g., Team Alpha" className={`form-input ${fieldError('groupName') ? 'error' : ''}`} />
                {fieldError('groupName') && <span className="form-error">{fieldError('groupName')}</span>}
              </div>
              <div className="form-group">
                <label className="form-label required" htmlFor="batchName">Batch Name</label>
                <input id="batchName" type="text" value={batchName} onChange={(e) => setBatchName(e.target.value)} placeholder="e.g., CS-2024" className={`form-input ${fieldError('batchName') ? 'error' : ''}`} />
                {fieldError('batchName') && <span className="form-error">{fieldError('batchName')}</span>}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label required" htmlFor="abstract">Abstract / Description</label>
              <textarea id="abstract" value={abstract} onChange={(e) => setAbstract(e.target.value)} placeholder="Describe the project, its goals, methodology, and outcomes (min 50 characters)..." className={`form-input form-textarea ${fieldError('abstract') ? 'error' : ''}`} style={{ minHeight: 160 }} />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{abstract.length} / 5000</span>
              {fieldError('abstract') && <span className="form-error">{fieldError('abstract')}</span>}
            </div>

            <div className="form-group">
              <label className="form-label required" htmlFor="githubUrl">
                <Github size={14} style={{ display: 'inline', marginRight: 4 }} /> GitHub Repository URL
              </label>
              <input id="githubUrl" type="url" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} placeholder="https://github.com/username/repo" className={`form-input ${fieldError('githubUrl') ? 'error' : ''}`} />
              {fieldError('githubUrl') && <span className="form-error">{fieldError('githubUrl')}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="youtubeUrl">
                <Youtube size={14} style={{ display: 'inline', marginRight: 4 }} /> YouTube Demo URL (optional)
              </label>
              <input id="youtubeUrl" type="url" value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." className="form-input" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="mentorName">Mentor Name (optional)</label>
                <input id="mentorName" type="text" value={mentorName} onChange={(e) => setMentorName(e.target.value)} placeholder="Prof. Jane Doe" className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="tagsInput">
                  <Tag size={14} style={{ display: 'inline', marginRight: 4 }} /> Technologies / Tags
                </label>
                <input id="tagsInput" type="text" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder="React, Node.js, MongoDB (comma separated)" className="form-input" />
              </div>
            </div>
          </section>

          {/* Team Members */}
          <section style={{ background: 'var(--bg-card)', border: '1px solid var(--border-secondary)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontWeight: 700, fontSize: '1rem' }}>Team Members</h2>
              <button type="button" onClick={addMember} className="btn btn-secondary btn-sm">
                <Plus size={14} /> Add Member
              </button>
            </div>

            {fieldError('members') && <div className="form-error" style={{ marginBottom: '1rem' }}>{fieldError('members')}</div>}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {members.map((member, i) => (
                <div key={i} style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: '1.25rem', border: '1px solid var(--border-secondary)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Member {i + 1}</span>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8rem', cursor: 'pointer', color: member.isLead ? 'var(--accent-tertiary)' : 'var(--text-muted)' }}>
                        <input type="checkbox" checked={member.isLead} onChange={(e) => updateMember(i, 'isLead', e.target.checked)} style={{ accentColor: 'var(--accent-tertiary)' }} />
                        Project Lead
                      </label>
                      {members.length > 1 && (
                        <button type="button" onClick={() => removeMember(i)} className="btn btn-danger btn-sm" style={{ padding: '0.2rem 0.4rem' }}>
                          <Minus size={12} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                    <div className="form-group">
                      <label className="form-label required" htmlFor={`member-name-${i}`}>Name</label>
                      <input id={`member-name-${i}`} type="text" value={member.name} onChange={(e) => updateMember(i, 'name', e.target.value)} placeholder="Full name" className="form-input" />
                    </div>
                    <div className="form-group">
                      <label className="form-label required" htmlFor={`member-email-${i}`}>Email</label>
                      <input id={`member-email-${i}`} type="email" value={member.email} onChange={(e) => updateMember(i, 'email', e.target.value)} placeholder="student@email.com" className="form-input" />
                    </div>
                    <div className="form-group">
                      <label className="form-label required" htmlFor={`member-role-${i}`}>Role</label>
                      <input id={`member-role-${i}`} type="text" value={member.role} onChange={(e) => updateMember(i, 'role', e.target.value)} placeholder="e.g., Frontend Dev" className="form-input" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Submit */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            <Link href="/dashboard" className="btn btn-secondary">Cancel</Link>
            <button type="submit" className="btn btn-primary" disabled={loading} id="submit-project" style={{ minWidth: 160, justifyContent: 'center' }}>
              {loading ? <><Loader2 size={16} className="animate-spin" /> Saving…</> : <><Save size={16} /> {mode === 'create' ? 'Publish Project' : 'Save Changes'}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
