import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../utils/helpers';

export default function LoginPage() {
  const [mode, setMode]       = useState('login'); // 'login' | 'register'
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const [form, setForm] = useState({
    fullName: '', email: '', password: '', role: 'VIEWER',
  });

  const { login, register } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
      } else {
        await register({ fullName: form.fullName, email: form.email, password: form.password, role: form.role });
      }
      navigate(from, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg-primary)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
    }}>
      {/* Background decorations */}
      <div style={{
        position: 'fixed', top: '-20%', right: '-10%',
        width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'fixed', bottom: '-20%', left: '-10%',
        width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 60, height: 60, borderRadius: 16,
            background: 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.8rem', margin: '0 auto 16px',
            boxShadow: '0 8px 24px rgba(16,185,129,0.3)',
          }}>💹</div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: 4 }}>FinanceHub</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {mode === 'login' ? 'Sign in to your account' : 'Create a new account'}
          </p>
        </div>

        {/* Credentials hint */}
        {mode === 'login' && (
          <div style={{
            background: 'var(--accent-bg)', border: '1px solid rgba(16,185,129,0.2)',
            borderRadius: 8, padding: '12px 16px', marginBottom: 20, fontSize: '0.78rem',
            color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', lineHeight: 1.8,
          }}>
            <div style={{ fontWeight: 600, color: 'var(--accent)', marginBottom: 4 }}>Demo accounts:</div>
            <div>admin@finance.com / admin123 <span style={{ color: 'var(--danger)' }}>ADMIN</span></div>
            <div>analyst@finance.com / analyst123 <span style={{ color: 'var(--warning)' }}>ANALYST</span></div>
            <div>viewer@finance.com / viewer123 <span style={{ color: 'var(--info)' }}>VIEWER</span></div>
          </div>
        )}

        {/* Card */}
        <div className="card" style={{ padding: 32 }}>
          {/* Mode toggle */}
          <div style={{
            display: 'flex', background: 'var(--bg-secondary)',
            borderRadius: 8, padding: 4, marginBottom: 24,
          }}>
            {['login', 'register'].map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); }}
                style={{
                  flex: 1, padding: '8px 0',
                  borderRadius: 6, border: 'none',
                  background: mode === m ? 'var(--bg-card)' : 'transparent',
                  color: mode === m ? 'var(--text-primary)' : 'var(--text-muted)',
                  fontWeight: mode === m ? 600 : 400,
                  fontSize: '0.875rem', cursor: 'pointer',
                  transition: 'var(--transition)',
                  boxShadow: mode === m ? 'var(--shadow-sm)' : 'none',
                }}
              >
                {m === 'login' ? '🔑 Sign In' : '✨ Register'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {mode === 'register' && (
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  className="form-input"
                  placeholder="John Doe"
                  value={form.fullName}
                  onChange={set('fullName')}
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                className="form-input"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={set('email')}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                className="form-input"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={set('password')}
                required
                minLength={6}
              />
            </div>

            {mode === 'register' && (
              <div className="form-group">
                <label className="form-label">Role</label>
                <select className="form-select" value={form.role} onChange={set('role')}>
                  <option value="VIEWER">Viewer — Dashboard access only</option>
                  <option value="ANALYST">Analyst — Records + Analytics</option>
                  <option value="ADMIN">Admin — Full Access</option>
                </select>
              </div>
            )}

            {error && <div className="alert alert-danger">{error}</div>}

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}
            >
              {loading ? <><span className="spinner" /> Processing...</> : (
                mode === 'login' ? '🔑 Sign In' : '✨ Create Account'
              )}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          Finance Dashboard — Role-Based Access Control System
        </p>
      </div>
    </div>
  );
}
