import React from 'react';

export default function StatCard({ label, value, subLabel, subValue, icon, trend, color = 'accent' }) {
  const colors = {
    accent:  { bg: 'var(--accent-bg)',  text: 'var(--accent)',  border: 'rgba(16,185,129,0.2)' },
    danger:  { bg: 'var(--danger-bg)',  text: 'var(--danger)',  border: 'rgba(239,68,68,0.2)'  },
    warning: { bg: 'var(--warning-bg)', text: 'var(--warning)', border: 'rgba(245,158,11,0.2)' },
    info:    { bg: 'var(--info-bg)',     text: 'var(--info)',    border: 'rgba(59,130,246,0.2)'  },
  };
  const c = colors[color] || colors.accent;

  return (
    <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Decorative accent line */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: c.text, borderRadius: '12px 12px 0 0',
      }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {label}
        </span>
        <div style={{
          width: 38, height: 38, borderRadius: 10,
          background: c.bg, border: `1px solid ${c.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.1rem',
        }}>
          {icon}
        </div>
      </div>

      <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', lineHeight: 1.2 }}>
        {value}
      </div>

      {(subLabel || trend) && (
        <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
          {trend !== undefined && (
            <span style={{
              fontSize: '0.75rem', fontWeight: 600,
              color: trend >= 0 ? 'var(--success)' : 'var(--danger)',
            }}>
              {trend >= 0 ? '▲' : '▼'} {Math.abs(trend).toFixed(1)}%
            </span>
          )}
          {subLabel && (
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {subLabel} {subValue && <strong style={{ color: 'var(--text-secondary)' }}>{subValue}</strong>}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
