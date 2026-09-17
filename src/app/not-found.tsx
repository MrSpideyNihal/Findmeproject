import Link from 'next/link';
import { Search, FileQuestion, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ textAlign: 'center', maxWidth: 480 }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 'var(--radius-full)',
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            color: 'var(--text-muted)',
          }}
        >
          <FileQuestion size={32} />
        </div>
        <h1 style={{ fontSize: '3.5rem', fontWeight: 900, lineHeight: 1, marginBottom: '0.5rem', color: 'var(--text-primary)', letterSpacing: '-0.04em' }}>
          404
        </h1>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
          Page Not Found
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.75rem', lineHeight: 1.6, fontSize: '0.925rem' }}>
          The requested page could not be located or may have been moved.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/" className="btn btn-secondary">
            <ArrowLeft size={16} /> Return Home
          </Link>
          <Link href="/projects" className="btn btn-primary">
            <Search size={16} /> Explore Projects
          </Link>
        </div>
      </div>
    </div>
  );
}
