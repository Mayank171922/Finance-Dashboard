import React from 'react';
import { useAuth } from '../../context/AuthContext';

export default function Header({ title, subtitle }) {
  const { user } = useAuth();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <header style={{
      height: 'var(--header-h)',
      background: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 24px',
      position: 'sticky', top: 0, zIndex: 50,
    }}>
      <div>
        {title ? (
          <>
            <h2 style={{ margin: 0, fontSize: '1.1rem' }}>{title}</h2>
            {subtitle && <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>{subtitle}</p>}
          </>
        ) : (
          <>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{greeting},</div>
            <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-primary)' }}>
              {user?.fullName} 👋
            </div>
          </>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          fontSize: '0.78rem', color: 'var(--text-muted)',
          fontFamily: 'var(--font-mono)',
        }}>
          {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
        </div>
        <div style={{
          width: 8, height: 8, borderRadius: '50%',
          background: 'var(--success)',
          boxShadow: '0 0 6px var(--success)',
        }} title="Connected" />
      </div>
    </header>
  );
}
