'use client';

export default function Slider({ value, max, onChange, label, step = 'any', className = '' }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <input
      type="range"
      className={`slider ${className}`}
      min={0}
      max={max > 0 ? max : 1}
      step={step}
      value={Math.min(value, max > 0 ? max : 1)}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      aria-label={label}
      style={{ '--p': `${pct}%` }}
    />
  );
}
