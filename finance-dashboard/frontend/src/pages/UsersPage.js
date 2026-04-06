import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import UserFormModal from '../components/users/UserFormModal';
import DeleteConfirmModal from '../components/records/DeleteConfirmModal';
import ToastContainer from '../components/layout/ToastContainer';
import { usersService } from '../services/usersService';
import { formatDateTime, getErrorMessage, ROLE_LABELS, ROLE_COLORS } from '../utils/helpers';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../context/AuthContext';

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const { toasts, toast, removeToast } = useToast();

  const [users, setUsers]     = useState([]);
  const [paging, setPaging]   = useState({});
  const [search, setSearch]   = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage]       = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, size: 10 };
      if (search)     params.search = search;
      if (roleFilter) params.role   = roleFilter;
      const data = await usersService.getAll(params);
      setUsers(data.content);
      setPaging(data);
    } catch (err) {
      toast(getErrorMessage(err), 'danger');
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleSaved = (msg) => {
    setShowForm(false); setEditUser(null);
    toast(msg, 'success');
    fetchUsers();
  };

  const handleDeleted = async () => {
    await usersService.delete(deleteUser.id);
    setDeleteUser(null);
    toast('User deleted', 'success');
    fetchUsers();
  };

  const handleToggleStatus = async (u) => {
    try {
      await usersService.toggleStatus(u.id);
      toast(`${u.fullName} is now ${u.active ? 'inactive' : 'active'}`, 'success');
      fetchUsers();
    } catch (err) {
      toast(getErrorMessage(err), 'danger');
    }
  };

  const roleCount = (role) => users.filter(u => u.role === role).length;

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Header title="User Management" subtitle="Manage users, roles, and account status" />
        <ToastContainer toasts={toasts} onRemove={removeToast} />

        <div className="page-wrapper">
          {/* Stats row */}
          <div className="grid-4" style={{ marginBottom: 24 }}>
            {[
              { label: 'Total Users',   value: paging.totalElements ?? 0,              icon: '👥', color: 'info'    },
              { label: 'Admins',        value: roleCount('ADMIN'),                      icon: '⚡', color: 'danger'  },
              { label: 'Analysts',      value: roleCount('ANALYST'),                    icon: '📊', color: 'warning' },
              { label: 'Viewers',       value: roleCount('VIEWER'),                     icon: '📖', color: 'accent'  },
            ].map(s => (
              <div key={s.label} className="card card-sm" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 10,
                  background: `var(--${s.color}-bg)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0,
                }}>{s.icon}</div>
                <div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>{s.value}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Page header */}
          <div className="page-header">
            <div>
              <div className="page-title">👥 All Users</div>
            </div>
            <button className="btn btn-primary" onClick={() => { setEditUser(null); setShowForm(true); }}>
              ➕ Add User
            </button>
          </div>

          {/* Filters */}
          <div className="card card-sm" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <input
                  className="form-input"
                  placeholder="🔍 Search by name or email..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                />
              </div>
              <select
                className="form-select"
                style={{ width: 160 }}
                value={roleFilter}
                onChange={(e) => { setRoleFilter(e.target.value); setPage(0); }}
              >
                <option value="">All Roles</option>
                <option value="ADMIN">Admin</option>
                <option value="ANALYST">Analyst</option>
                <option value="VIEWER">Viewer</option>
              </select>
              <button className="btn btn-secondary" onClick={() => { setSearch(''); setRoleFilter(''); setPage(0); }}>
                ✕ Clear
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="card" style={{ padding: 0 }}>
            {loading ? (
              <div className="loading-screen"><div className="spinner spinner-lg" /></div>
            ) : users.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">👤</div>
                <h4>No users found</h4>
                <p>Try clearing your filters or create a new user.</p>
              </div>
            ) : (
              <>
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>User</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Joined</th>
                        <th style={{ textAlign: 'center' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u, i) => (
                        <tr key={u.id}>
                          <td style={{ color: 'var(--text-muted)', fontSize: '0.78rem', fontFamily: 'var(--font-mono)' }}>
                            {page * 10 + i + 1}
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div style={{
                                width: 32, height: 32, borderRadius: '50%',
                                background: 'var(--accent-bg)', border: '1.5px solid var(--accent)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontWeight: 700, fontSize: '0.8rem', color: 'var(--accent)', flexShrink: 0,
                              }}>
                                {u.fullName.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                                  {u.fullName}
                                  {u.id === currentUser?.id && (
                                    <span style={{ marginLeft: 6, fontSize: '0.65rem', color: 'var(--accent)', fontWeight: 400 }}>(you)</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{u.email}</td>
                          <td>
                            <span className={`badge badge-${ROLE_COLORS[u.role]}`}>
                              {ROLE_LABELS[u.role]}
                            </span>
                          </td>
                          <td>
                            <span className={`badge badge-${u.active ? 'success' : 'muted'}`}>
                              {u.active ? '● Active' : '○ Inactive'}
                            </span>
                          </td>
                          <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            {formatDateTime(u.createdAt)}
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                              <button
                                className="btn btn-ghost btn-sm"
                                title="Edit"
                                onClick={() => { setEditUser(u); setShowForm(true); }}
                              >✏️</button>
                              <button
                                className={`btn btn-sm ${u.active ? 'btn-secondary' : 'btn-ghost'}`}
                                title={u.active ? 'Deactivate' : 'Activate'}
                                onClick={() => handleToggleStatus(u)}
                                disabled={u.id === currentUser?.id}
                              >
                                {u.active ? '🔒' : '🔓'}
                              </button>
                              <button
                                className="btn btn-danger btn-sm"
                                title="Delete"
                                onClick={() => setDeleteUser(u)}
                                disabled={u.id === currentUser?.id}
                              >🗑️</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {paging.totalPages > 1 && (
                  <div className="pagination" style={{ padding: '16px 20px' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                      Page {page + 1} of {paging.totalPages}
                    </span>
                    <div className="pagination-controls">
                      <button className="page-btn" onClick={() => setPage(0)} disabled={paging.first}>«</button>
                      <button className="page-btn" onClick={() => setPage(p => p - 1)} disabled={paging.first}>‹</button>
                      <button className="page-btn" onClick={() => setPage(p => p + 1)} disabled={paging.last}>›</button>
                      <button className="page-btn" onClick={() => setPage(paging.totalPages - 1)} disabled={paging.last}>»</button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {showForm && (
        <UserFormModal
          user={editUser}
          onClose={() => { setShowForm(false); setEditUser(null); }}
          onSaved={handleSaved}
        />
      )}

      {deleteUser && (
        <DeleteConfirmModal
          title="Delete User"
          message={`Permanently delete "${deleteUser.fullName}" (${deleteUser.email})? All their records will remain but the user account will be removed.`}
          onConfirm={handleDeleted}
          onClose={() => setDeleteUser(null)}
        />
      )}
    </div>
  );
}
