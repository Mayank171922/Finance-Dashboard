import React, { useState, useEffect } from 'react';
import { recordsService } from '../../services/recordsService';
import { getErrorMessage, getCategories, todayISO } from '../../utils/helpers';

const EMPTY = {
  amount: '', type: 'INCOME', category: '', transactionDate: todayISO(), notes: '',
};

export default function RecordFormModal({ record, onClose, onSaved }) {
  const [form, setForm]     = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');

  const isEdit = !!record;

  useEffect(() => {
    if (record) {
      setForm({
        amount:          record.amount,
        type:            record.type,
        category:        record.category,
        transactionDate: record.transactionDate,
        notes:           record.notes || '',
      });
    } else {
      setForm(EMPTY);
    }
  }, [record]);

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleTypeChange = (e) => {
    setForm(f => ({ ...f, type: e.target.value, category: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = {
        ...form,
        amount: parseFloat(form.amount),
      };
      if (isEdit) {
        await recordsService.update(record.id, payload);
      } else {
        await recordsService.create(payload);
      }
      onSaved(isEdit ? 'Record updated successfully' : 'Record created successfully');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const categories = getCategories(form.type);

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3>{isEdit ? '✏️ Edit Record' : '➕ New Record'}</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Type */}
            <div className="form-group">
              <label className="form-label">Transaction Type</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {['INCOME', 'EXPENSE'].map(t => (
                  <button
                    key={t} type="button"
                    onClick={() => handleTypeChange({ target: { value: t } })}
                    style={{
                      flex: 1, padding: '10px 0', borderRadius: 8, border: '2px solid',
                      borderColor: form.type === t
                        ? (t === 'INCOME' ? 'var(--success)' : 'var(--danger)')
                        : 'var(--border)',
                      background: form.type === t
                        ? (t === 'INCOME' ? 'var(--success-bg)' : 'var(--danger-bg)')
                        : 'var(--bg-secondary)',
                      color: form.type === t
                        ? (t === 'INCOME' ? 'var(--success)' : 'var(--danger)')
                        : 'var(--text-secondary)',
                      fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer',
                      transition: 'var(--transition)',
                    }}
                  >
                    {t === 'INCOME' ? '💰 Income' : '💸 Expense'}
                  </button>
                ))}
              </div>
            </div>

            {/* Amount */}
            <div className="form-group">
              <label className="form-label">Amount (₹)</label>
              <input
                className="form-input"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={form.amount}
                onChange={set('amount')}
                required
              />
            </div>

            {/* Category */}
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-select" value={form.category} onChange={set('category')} required>
                <option value="">Select category...</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Date */}
            <div className="form-group">
              <label className="form-label">Transaction Date</label>
              <input
                className="form-input"
                type="date"
                value={form.transactionDate}
                onChange={set('transactionDate')}
                max={todayISO()}
                required
              />
            </div>

            {/* Notes */}
            <div className="form-group">
              <label className="form-label">Notes (optional)</label>
              <textarea
                className="form-textarea"
                placeholder="Add a description..."
                value={form.notes}
                onChange={set('notes')}
                maxLength={500}
                rows={3}
              />
            </div>

            {error && <div className="alert alert-danger">{error}</div>}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><span className="spinner" /> Saving...</> : (isEdit ? '💾 Save Changes' : '➕ Create Record')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
