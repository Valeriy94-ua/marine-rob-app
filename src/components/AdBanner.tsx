export default function AdBanner() {
  return (
    <div
      className="flex items-center justify-center w-full"
      style={{
        background: 'var(--bg-nav)',
        borderBottom: '1px solid var(--border)',
        height: 44,
      }}
    >
      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
        Advertisement · [ Google Ad Space ]
      </p>
    </div>
  );
}