interface Props {
  pct: number;
  size?: number;
  strokeWidth?: number;
  label: string;
  sublabel: string;
  caption?: string;
  message?: string;
}

export default function CircularProgress({
  pct, size = 180, strokeWidth = 14, label, sublabel, caption, message
}: Props) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const filled = Math.min(Math.max(pct, 0), 1) * circ;
  const cx = size / 2;
  const cy = size / 2;
  const color = pct < 0.5 ? '#22c55e' : pct < 0.8 ? '#f59e0b' : '#ef4444';

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--border)" strokeWidth={strokeWidth} />
          <circle
            cx={cx} cy={cy} r={r} fill="none"
            stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"
            strokeDasharray={`${filled} ${circ}`}
            style={{ transition: 'stroke-dasharray 1s ease, stroke 0.5s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold" style={{ color }}>{label}</span>
          <span className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{sublabel}</span>
          {caption && <span className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{caption}</span>}
        </div>
      </div>
      {message && (
        <p className="text-sm font-medium text-center" style={{ color }}>{message}</p>
      )}
    </div>
  );
}
