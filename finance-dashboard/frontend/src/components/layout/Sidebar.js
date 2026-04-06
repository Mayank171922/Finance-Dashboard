import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROLE_LABELS, ROLE_COLORS } from '../../utils/helpers';

const NAV_ITEMS = [
  { to: '/dashboard', icon: '📊', label: 'Dashboard',        minRole: 'VIEWER'  },
  { to: '/records',   icon: '📋', label: 'Records',          minRole: 'ANALYST' },
  { to: '/users',     icon: '👥', label: 'User Management',  minRole: 'ADMIN'   },
];

export default function Sidebar() {
  const { user, logout, isAdmin, isAnalyst } = useAuth();
  const navigate = useNavigate();

  const canAccess = (minRole) => {
    if (minRole === 'VIEWER')  return true;
    if (minRole === 'ANALYST') return isAnalyst;
    if (minRole === 'ADMIN')   return isAdmin;
    return false;
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside style={{
      position: 'fixed', top: 0, left: 0,
      width: 'var(--sidebar-w)', height: '100vh',
      background: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
      zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{
        padding: '20px 24px',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 8,
          background: 'var(--accent)', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          fontSize: '1.1rem', flexShrink: 0,
        }}>💹</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
            FinanceHub
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            Dashboard v1.0
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 12px', marginBottom: 8 }}>
          Navigation
        </div>

        {NAV_ITEMS.map(item => (
          canAccess(item.minRole) && (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 14px', borderRadius: 8,
                fontSize: '0.875rem', fontWeight: 500,
                color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                background: isActive ? 'var(--accent-bg)' : 'transparent',
                border: `1px solid ${isActive ? 'rgba(16,185,129,0.2)' : 'transparent'}`,
                transition: 'var(--transition)',
                textDecoration: 'none',
              })}
            >
              <span style={{ fontSize: '1rem' }}>{item.icon}</span>
              {item.label}
            </NavLink>
          )
        ))}
      </nav>

      {/* User Profile */}
      <div style={{
        padding: '16px 16px',
        borderTop: '1px solid var(--border)',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 12px', borderRadius: 8,
          background: 'var(--bg-hover)',
          marginBottom: 8,
        }}>
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            background: 'var(--accent-bg)',
            border: '2px solid var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent)',
            flexShrink: 0,
          }}>
            {user?.fullName?.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', truncate: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
              {user?.fullName}
            </div>
            <span className={`badge badge-${ROLE_COLORS[user?.role]}`} style={{ fontSize: '0.65rem', padding: '1px 6px' }}>
              {ROLE_LABELS[user?.role]}
            </span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="btn btn-secondary"
          style={{ width: '100%', justifyContent: 'center', fontSize: '0.8rem' }}
        >
          🚪 Sign Out
        </button>
      </div>
    </aside>
  );
}
