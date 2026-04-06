// ── Currency ─────────────────────────────────────────────────────────────────
export const formatCurrency = (value, currency = 'INR') => {
  if (value === null || value === undefined) return '₹0.00';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatCompact = (value) => {
  if (Math.abs(value) >= 10_00_000)
    return '₹' + (value / 10_00_000).toFixed(1) + 'L';
  if (Math.abs(value) >= 1_000)
    return '₹' + (value / 1_000).toFixed(1) + 'K';
  return formatCurrency(value);
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  }).format(new Date(dateStr));
};

export const formatDateTime = (dateStr) => {
  if (!dateStr) return '—';
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(dateStr));
};

export const toInputDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toISOString().split('T')[0];
};

export const todayISO = () => new Date().toISOString().split('T')[0];


export const getErrorMessage = (error) => {
  const data = error?.response?.data;
  if (!data) return error?.message || 'An unexpected error occurred';
  if (data.fieldErrors) {
    return Object.values(data.fieldErrors).join(' • ');
  }
  return data.message || data.error || 'An unexpected error occurred';
};


export const ROLE_LABELS = { ADMIN: 'Admin', ANALYST: 'Analyst', VIEWER: 'Viewer' };
export const ROLE_COLORS = { ADMIN: 'danger', ANALYST: 'warning', VIEWER: 'info' };


export const INCOME_CATEGORIES = [
  'Salary', 'Freelance', 'Business', 'Investment Return',
  'Dividend', 'Rental Income', 'Bonus', 'Consulting', 'Other Income',
];

export const EXPENSE_CATEGORIES = [
  'Rent', 'Groceries', 'Utilities', 'Transport', 'Healthcare',
  'Education', 'Entertainment', 'Insurance', 'Travel', 'Shopping',
  'Food & Dining', 'Subscriptions', 'Maintenance', 'Other Expense',
];

export const getCategories = (type) =>
  type === 'INCOME' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
