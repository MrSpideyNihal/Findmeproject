'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, X, ArrowUpDown, Filter, RotateCcw, Layers } from 'lucide-react';
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
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'title-asc', label: 'Title (A to Z)' },
  { value: 'title-desc', label: 'Title (Z to A)' },
  { value: 'members', label: 'Most Members' },
  { value: 'relevance', label: 'Most Relevant' },
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
    const timer = setTimeout(() => {
      fetchProjects();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchProjects]);

  useEffect(() => {
    fetch('/api/batches')
      .then((r) => r.json())
      .then((d) => {
        if (d.batches) setBatches(d.batches);
      })
      .catch(() => {});
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
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

  const hasFilters = Boolean(query || batch || tags || sortBy !== 'newest');

  return (
    <div style={{ minHeight: '85vh', padding: '2.5rem 0 5rem' }}>
      <div className="container">
        {/* Page Header (BizLink style) */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              Project Directory
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              {pagination ? `${pagination.total.toLocaleString()} projects cataloged` : 'Browse student projects'}
            </p>
          </div>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="btn btn-secondary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <RotateCcw size={13} /> Reset Filters
            </button>
          )}
        </div>

        {/* Toolbar & Filter Bar (BizLink style unified controls) */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid var(--border-secondary)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            marginBottom: '1.5rem',
            boxShadow: 'var(--shadow-xs)',
          }}
        >
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {/* Search Input */}
            <div style={{ position: 'relative', flex: '1 1 280px' }}>
              <Search
                size={16}
                style={{
                  position: 'absolute',
                  left: '0.85rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                  pointerEvents: 'none',
                }}
              />
              <input
                id="search-input"
                type="text"
                placeholder="Search by title, group, student, mentor, or tag..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '2.4rem' }}
              />
            </div>

            {/* Batch Filter */}
            <div style={{ flex: '0 1 180px' }}>
              <select
                id="batch-filter"
                value={batch}
                onChange={(e) => {
                  setBatch(e.target.value);
                  setPage(1);
                }}
                className="form-input"
              >
                <option value="">All Batches</option>
                {batches.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            {/* Tech Tags */}
            <div style={{ flex: '0 1 200px' }}>
              <input
                id="tag-filter"
                type="text"
                placeholder="Filter by tech stack"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="form-input"
              />
            </div>

            {/* Sort Selector */}
            <div style={{ flex: '0 1 170px' }}>
              <select
                id="sort-filter"
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setPage(1);
                }}
                className="form-input"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" className="btn btn-primary" id="search-btn">
              <Search size={15} /> Search
            </button>
          </form>

          {/* Active Filter Badges */}
          {hasFilters && (
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.85rem', paddingTop: '0.85rem', borderTop: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', alignSelf: 'center' }}>
                Active Filters:
              </span>
              {query && (
                <span className="tag" style={{ cursor: 'pointer' }} onClick={() => { setQuery(''); setPage(1); }}>
                  Search: &quot;{query}&quot; <X size={12} />
                </span>
              )}
              {batch && (
                <span className="tag tag-batch" style={{ cursor: 'pointer' }} onClick={() => { setBatch(''); setPage(1); }}>
                  Batch: {batch} <X size={12} />
                </span>
              )}
              {tags && (
                <span className="tag tag-group" style={{ cursor: 'pointer' }} onClick={() => { setTags(''); setPage(1); }}>
                  Tags: {tags} <X size={12} />
                </span>
              )}
              {sortBy !== 'newest' && (
                <span className="tag tag-accent" style={{ cursor: 'pointer' }} onClick={() => { setSortBy('newest'); setPage(1); }}>
                  Sort: {SORT_OPTIONS.find((o) => o.value === sortBy)?.label} <X size={12} />
                </span>
              )}
            </div>
          )}
        </div>

        {/* Results Grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ height: 260 }} className="skeleton" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '4.5rem 1.5rem',
              background: '#ffffff',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-secondary)',
            }}
          >
            <Layers size={42} color="var(--text-muted)" style={{ margin: '0 auto 0.75rem' }} />
            <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
              No projects found
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
              Try adjusting your query, clearing filters, or searching for other keywords.
            </p>
            {hasFilters && (
              <button onClick={clearFilters} className="btn btn-secondary btn-sm">
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
              {projects.map((project) => (
                <ProjectCard key={project._id} project={project} />
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginTop: '2.5rem', flexWrap: 'wrap' }}>
                <button
                  id="prev-page"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={!pagination.hasPrev}
                  className="btn btn-secondary btn-sm"
                >
                  Previous
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
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
