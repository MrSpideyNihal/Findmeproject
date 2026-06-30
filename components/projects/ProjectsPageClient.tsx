'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, X, ArrowUpDown } from 'lucide-react';
import ProjectCard from '@/components/projects/ProjectCard';

interface Project {
  _id: string;
  title: string;
  groupName: string;
  batchName: string;
  abstract: string;
  githubUrl: string;
  youtubeUrl?: string;
  members: { name: string; email: string; role: string; isLead: boolean }[];
  mentorName?: string;
  tags: string[];
  createdAt: string;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

const SORT_OPTIONS = [
  { value: 'newest', label: '🕐 Newest First' },
  { value: 'oldest', label: '📅 Oldest First' },
  { value: 'title-asc', label: '🔤 Title A → Z' },
  { value: 'title-desc', label: '🔤 Title Z → A' },
  { value: 'members', label: '👥 Most Members' },
  { value: 'relevance', label: '⭐ Best Match' },
];

export default function ProjectsPageClient() {
  const searchParams = useSearchParams();

  const [projects, setProjects] = useState<Project[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [batches, setBatches] = useState<string[]>([]);

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [batch, setBatch] = useState(searchParams.get('batch') || '');
  const [tags, setTags] = useState(searchParams.get('tags') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'newest');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.set('q', query);
      if (batch) params.set('batch', batch);
      if (tags) params.set('tags', tags);
      if (sortBy && sortBy !== 'newest') params.set('sortBy', sortBy);
      params.set('page', String(page));

      const res = await fetch(`/api/projects?${params.toString()}`);
      const data = await res.json();

      if (res.ok) {
        setProjects(data.projects);
        setPagination(data.pagination);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [query, batch, tags, sortBy, page]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Fetch unique batches for filter dropdown
  useEffect(() => {
    fetch('/api/batches').then(r => r.json()).then(d => {
      if (d.batches) setBatches(d.batches);
    }).catch(() => {});
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    // Auto-switch to relevance sorting when searching
    if (query && sortBy === 'newest') {
      setSortBy('relevance');
    }
    fetchProjects();
  };

  const clearFilters = () => {
    setQuery('');
    setBatch('');
    setTags('');
    setSortBy('newest');
    setPage(1);
  };

  const hasFilters = query || batch || tags || sortBy !== 'newest';

  return (
    <div style={{ minHeight: '80vh', padding: '2.5rem 0 4rem' }}>
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            Explore <span className="gradient-text">Projects</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            {pagination ? `${pagination.total.toLocaleString()} projects found` : 'Browse all projects'}
          </p>
        </div>

        {/* Search + Filters */}
        <form onSubmit={handleSearch} style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {/* Main Search */}
            <div style={{ position: 'relative', flex: '1 1 300px' }}>
              <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
              <input
                id="search-input"
                type="text"
                placeholder="Search by title, group, member, email, mentor, tag..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>

            <button type="submit" className="btn btn-primary" id="search-btn">
              <Search size={16} /> Search
            </button>

            {hasFilters && (
              <button type="button" onClick={clearFilters} className="btn btn-secondary" id="clear-btn">
                <X size={16} /> Clear All
              </button>
            )}
          </div>
        </form>

        {/* Filter Row: Batch, Tags, Sort */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '2rem', alignItems: 'center' }}>
          {/* Batch Filter */}
          <select
            id="batch-filter"
            value={batch}
            onChange={(e) => { setBatch(e.target.value); setPage(1); }}
            className="form-input"
            style={{ flex: '0 1 170px' }}
          >
            <option value="">All Batches</option>
            {batches.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>

          {/* Tag Filter */}
          <input
            id="tag-filter"
            type="text"
            placeholder="Filter by tags (comma-separated)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="form-input"
            style={{ flex: '0 1 240px' }}
          />

          {/* Sort By */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginLeft: 'auto' }}>
            <ArrowUpDown size={14} color="var(--text-muted)" />
            <select
              id="sort-filter"
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
              className="form-input"
              style={{ width: 170, fontSize: '0.85rem' }}
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filter Chips */}
        {hasFilters && (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            {query && (
              <span className="tag" style={{ gap: '0.375rem', cursor: 'pointer' }} onClick={() => { setQuery(''); setPage(1); }}>
                Search: &quot;{query}&quot; <X size={12} />
              </span>
            )}
            {batch && (
              <span className="tag tag-amber" style={{ gap: '0.375rem', cursor: 'pointer' }} onClick={() => { setBatch(''); setPage(1); }}>
                Batch: {batch} <X size={12} />
              </span>
            )}
            {tags && (
              <span className="tag tag-cyan" style={{ gap: '0.375rem', cursor: 'pointer' }} onClick={() => { setTags(''); setPage(1); }}>
                Tags: {tags} <X size={12} />
              </span>
            )}
            {sortBy !== 'newest' && (
              <span className="tag" style={{ gap: '0.375rem', cursor: 'pointer', background: 'rgba(16,185,129,0.15)', color: '#34d399', borderColor: 'rgba(16,185,129,0.25)' }} onClick={() => { setSortBy('newest'); setPage(1); }}>
                Sort: {SORT_OPTIONS.find(o => o.value === sortBy)?.label} <X size={12} />
              </span>
            )}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ height: 280 }} className="skeleton" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 1rem' }}>
            <Search size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>No projects found</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Try adjusting your search or filters</p>
            {hasFilters && (
              <button onClick={clearFilters} className="btn btn-secondary" style={{ marginTop: '1rem' }}>
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {projects.map((project) => (
                <ProjectCard key={project._id} project={project} />
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '3rem', flexWrap: 'wrap' }}>
                <button
                  id="prev-page"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={!pagination.hasPrev}
                  className="btn btn-secondary btn-sm"
                >
                  ← Previous
                </button>
                {Array.from({ length: Math.min(pagination.totalPages, 7) }, (_, i) => {
                  const pg = i + 1;
                  return (
                    <button
                      key={pg}
                      onClick={() => setPage(pg)}
                      className={`btn btn-sm ${pg === page ? 'btn-primary' : 'btn-secondary'}`}
                    >
                      {pg}
                    </button>
                  );
                })}
                <button
                  id="next-page"
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={!pagination.hasNext}
                  className="btn btn-secondary btn-sm"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
