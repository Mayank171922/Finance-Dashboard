import React from 'react';

export default function ToastContainer({ toasts, onRemove }) {
  if (!toasts.length) return null;

  const icons = { success: '✅', danger: '❌', warning: '⚠️', info: 'ℹ️' };

  return (
    <div style={{
      position: 'fixed', top: 20, right: 20, zIndex: 9999,
      display: 'flex', flexDirection: 'column', gap: 10,
    }}>
      {toasts.map(t => (
        <div
          key={t.id}
          className={`alert alert-${t.type}`}
          style={{
            minWidth: 280, maxWidth: 400,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: 12, boxShadow: 'var(--shadow-lg)',
            animation: 'slideUp 0.25s ease',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {icons[t.type] || '📌'} {t.message}
          </span>
          <button
            onClick={() => onRemove(t.id)}
            style={{
              background: 'none', border: 'none',
              color: 'inherit', cursor: 'pointer',
              fontSize: '1rem', opacity: 0.7, padding: '0 4px',
            }}
          >×</button>
        </div>
      ))}
    </div>
  );
}
