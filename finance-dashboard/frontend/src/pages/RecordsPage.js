import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import RecordFormModal from '../components/records/RecordFormModal';
import DeleteConfirmModal from '../components/records/DeleteConfirmModal';
import ToastContainer from '../components/layout/ToastContainer';
import { recordsService } from '../services/recordsService';
import { formatCurrency, formatDate, getErrorMessage } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';

const INIT_FILTERS = {
  type: '', category: '', search: '',
  fromDate: '', toDate: '',
  page: 0, size: 10,
};

export default function RecordsPage() {
  const { isAdmin } = useAuth();
  const { toasts, toast, removeToast } = useToast();

  const [records, setRecords]   = useState([]);
  const [paging, setPaging]     = useState({});
  const [filters, setFilters]   = useState(INIT_FILTERS);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editRec, setEditRec]   = useState(null);
  const [deleteRec, setDeleteRec] = useState(null);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      Object.entries(filters).forEach(([k, v]) => { if (v !== '') params[k] = v; });
      const data = await recordsService.getAll(params);
      setRecords(data.content);
      setPaging(data);
    } catch (err) {
      toast(getErrorMessage(err), 'danger');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  const setFilter = (key) => (e) =>
    setFilters(f => ({ ...f, [key]: e.target.value, page: 0 }));

  const handleSaved = (msg) => {
    setShowForm(false);
    setEditRec(null);
    toast(msg, 'success');
    fetchRecords();
  };

  const handleDeleted = async () => {
    await recordsService.delete(deleteRec.id);
    setDeleteRec(null);
    toast('Record deleted', 'success');
    fetchRecords();
  };

  const goToPage = (p) => setFilters(f => ({ ...f, page: p }));

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Header title="Financial Records" subtitle="View, filter, and manage all transactions" />
        <ToastContainer toasts={toasts} onRemove={removeToast} />

        <div className="page-wrapper">
          {/* Page Header */}
          <div className="page-header">
            <div>
              <div className="page-title">📋 Records</div>
              <div className="page-subtitle">{paging.totalElements ?? 0} total entries</div>
            </div>
            {isAdmin && (
              <button className="btn btn-primary" onClick={() => { setEditRec(null); setShowForm(true); }}>
                ➕ Add Record
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="card card-sm" style={{ marginBottom: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Search</label>
                <input
                  className="form-input"
                  placeholder="Category or notes..."
                  value={filters.search}
                  onChange={setFilter('search')}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Type</label>
                <select className="form-select" value={filters.type} onChange={setFilter('type')}>
                  <option value="">All Types</option>
                  <option value="INCOME">Income</option>
                  <option value="EXPENSE">Expense</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <input
                  className="form-input"
                  placeholder="e.g. Salary"
                  value={filters.category}
                  onChange={setFilter('category')}
                />
              </div>
              <div className="form-group">
                <label className="form-label">From Date</label>
                <input className="form-input" type="date" value={filters.fromDate} onChange={setFilter('fromDate')} />
              </div>
              <div className="form-group">
                <label className="form-label">To Date</label>
                <input className="form-input" type="date" value={filters.toDate} onChange={setFilter('toDate')} />
              </div>
              <div className="form-group" style={{ justifyContent: 'flex-end' }}>
                <label className="form-label" style={{ opacity: 0 }}>.</label>
                <button
                  className="btn btn-secondary"
                  onClick={() => setFilters(INIT_FILTERS)}
                >
                  ✕ Clear
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="card" style={{ padding: 0 }}>
            {loading ? (
              <div className="loading-screen"><div className="spinner spinner-lg" /></div>
            ) : records.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📭</div>
                <h4>No records found</h4>
                <p>Try adjusting your filters or add a new record.</p>
              </div>
            ) : (
              <>
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Date</th>
                        <th>Category</th>
                        <th>Notes</th>
                        <th>Type</th>
                        <th style={{ textAlign: 'right' }}>Amount</th>
                        <th>Created By</th>
                        {isAdmin && <th style={{ textAlign: 'center' }}>Actions</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {records.map((r, i) => (
                        <tr key={r.id}>
                          <td style={{ color: 'var(--text-muted)', fontSize: '0.78rem', fontFamily: 'var(--font-mono)' }}>
                            {filters.page * filters.size + i + 1}
                          </td>
                          <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>
                            {formatDate(r.transactionDate)}
                          </td>
                          <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{r.category}</td>
                          <td style={{
                            maxWidth: 200, overflow: 'hidden',
                            textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            fontSize: '0.82rem',
                          }}>
                            {r.notes || <span style={{ color: 'var(--text-muted)' }}>—</span>}
                          </td>
                          <td>
                            <span className={`badge badge-${r.type === 'INCOME' ? 'success' : 'danger'}`}>
                              {r.type === 'INCOME' ? '▲' : '▼'} {r.type}
                            </span>
                          </td>
                          <td style={{
                            textAlign: 'right',
                            fontWeight: 700,
                            fontFamily: 'var(--font-mono)',
                            color: r.type === 'INCOME' ? 'var(--success)' : 'var(--danger)',
                          }}>
                            {r.type === 'INCOME' ? '+' : '−'}{formatCurrency(r.amount)}
                          </td>
                          <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            {r.createdByName || '—'}
                          </td>
                          {isAdmin && (
                            <td style={{ textAlign: 'center' }}>
                              <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                                <button
                                  className="btn btn-ghost btn-sm"
                                  title="Edit"
                                  onClick={() => { setEditRec(r); setShowForm(true); }}
                                >✏️</button>
                                <button
                                  className="btn btn-danger btn-sm"
                                  title="Delete"
                                  onClick={() => setDeleteRec(r)}
                                >🗑️</button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="pagination" style={{ padding: '16px 20px' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                    Showing {filters.page * filters.size + 1}–{Math.min((filters.page + 1) * filters.size, paging.totalElements)} of {paging.totalElements}
                  </span>
                  <div className="pagination-controls">
                    <button className="page-btn" onClick={() => goToPage(0)} disabled={paging.first}>«</button>
                    <button className="page-btn" onClick={() => goToPage(filters.page - 1)} disabled={paging.first}>‹</button>
                    {[...Array(Math.min(paging.totalPages, 5))].map((_, i) => {
                      const p = Math.max(0, filters.page - 2) + i;
                      if (p >= paging.totalPages) return null;
                      return (
                        <button
                          key={p}
                          className={`page-btn ${p === filters.page ? 'active' : ''}`}
                          onClick={() => goToPage(p)}
                        >{p + 1}</button>
                      );
                    })}
                    <button className="page-btn" onClick={() => goToPage(filters.page + 1)} disabled={paging.last}>›</button>
                    <button className="page-btn" onClick={() => goToPage(paging.totalPages - 1)} disabled={paging.last}>»</button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {showForm && (
        <RecordFormModal
          record={editRec}
          onClose={() => { setShowForm(false); setEditRec(null); }}
          onSaved={handleSaved}
        />
      )}

      {deleteRec && (
        <DeleteConfirmModal
          title="Delete Record"
          message={`Delete the ${deleteRec.type.toLowerCase()} record "${deleteRec.category}" of ${formatCurrency(deleteRec.amount)}? It will be soft-deleted and removed from reports.`}
          onConfirm={handleDeleted}
          onClose={() => setDeleteRec(null)}
        />
      )}
    </div>
  );
}
