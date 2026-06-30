export default function Loading() {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
        <div style={{
          width: 48, height: 48,
          border: '3px solid var(--border-secondary)',
          borderTop: '3px solid var(--accent-primary)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading…</p>
      </div>
    </div>
  );
}
