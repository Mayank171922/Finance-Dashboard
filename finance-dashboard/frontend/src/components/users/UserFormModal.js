import React, { useState, useEffect } from 'react';
import { usersService } from '../../services/usersService';
import { getErrorMessage, ROLE_LABELS } from '../../utils/helpers';

const EMPTY = { fullName: '', email: '', password: '', role: 'VIEWER', active: true };

export default function UserFormModal({ user, onClose, onSaved }) {
  const [form, setForm]     = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');

  const isEdit = !!user;

  useEffect(() => {
    if (user) {
      setForm({ fullName: user.fullName, email: user.email, password: '', role: user.role, active: user.active });
    } else {
      setForm(EMPTY);
    }
  }, [user]);

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));
  const setCheck = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.checked }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = { ...form };
      if (isEdit && !payload.password) delete payload.password; // don't send blank password on update
      if (isEdit) {
        await usersService.update(user.id, payload);
      } else {
        await usersService.create(payload);
      }
      onSaved(isEdit ? 'User updated successfully' : 'User created successfully');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3>{isEdit ? '✏️ Edit User' : '👤 New User'}</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                className="form-input" placeholder="John Doe"
                value={form.fullName} onChange={set('fullName')} required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                className="form-input" type="email" placeholder="john@example.com"
                value={form.email} onChange={set('email')} required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Password {isEdit && <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(leave blank to keep current)</span>}
              </label>
              <input
                className="form-input" type="password"
                placeholder={isEdit ? '••••••••' : 'Min 6 characters'}
                value={form.password} onChange={set('password')}
                required={!isEdit}
                minLength={!isEdit ? 6 : undefined}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Role</label>
              <select className="form-select" value={form.role} onChange={set('role')}>
                {Object.entries(ROLE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                {form.role === 'VIEWER'  && '📖 Can only view dashboard summary'}
                {form.role === 'ANALYST' && '📊 Can view records and access full analytics'}
                {form.role === 'ADMIN'   && '⚡ Full access including user management and record CRUD'}
              </div>
            </div>

            {isEdit && (
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={setCheck('active')}
                  style={{ width: 16, height: 16, accentColor: 'var(--accent)' }}
                />
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                  Account Active
                </span>
              </label>
            )}

            {error && <div className="alert alert-danger">{error}</div>}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><span className="spinner" /> Saving...</> : (isEdit ? '💾 Save Changes' : '👤 Create User')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
