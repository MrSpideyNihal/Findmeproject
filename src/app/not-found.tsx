import Link from 'next/link';
import { Search, Frown } from 'lucide-react';

export default function NotFound() {
  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ textAlign: 'center', maxWidth: 480 }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1.5rem'
        }}>
          <Frown size={36} color="var(--accent-primary-light)" />
        </div>
        <h1 style={{ fontSize: '5rem', fontWeight: 900, lineHeight: 1, marginBottom: '0.5rem' }}>
          <span className="gradient-text">404</span>
        </h1>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>Page Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: 1.7 }}>
          Oops! The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/" className="btn btn-primary">
            Go Home
          </Link>
          <Link href="/projects" className="btn btn-secondary">
            <Search size={16} /> Browse Projects
          </Link>
        </div>
      </div>
    </div>
  );
}
