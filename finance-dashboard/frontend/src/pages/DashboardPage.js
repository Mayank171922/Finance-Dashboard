import React, { useEffect, useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import StatCard from '../components/dashboard/StatCard';
import { dashboardService } from '../services/dashboardService';
import { formatCurrency, formatCompact, formatDate } from '../utils/helpers';

const CHART_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16'];

const tooltipStyle = {
  contentStyle: { background: '#1e2435', border: '1px solid #2a3045', borderRadius: 8, color: '#f1f5f9' },
  labelStyle:   { color: '#94a3b8', fontSize: '0.8rem' },
  itemStyle:    { fontSize: '0.85rem' },
};

export default function DashboardPage() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    dashboardService.getSummary()
      .then(setData)
      .catch(() => setError('Failed to load dashboard data'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Header title="Dashboard" subtitle="Financial overview and analytics" />
        <div className="page-wrapper">

          {loading && (
            <div className="loading-screen">
              <div className="spinner spinner-lg" />
              <p>Loading dashboard...</p>
            </div>
          )}

          {error && <div className="alert alert-danger">{error}</div>}

          {data && (
            <>

              <div className="grid-4" style={{ marginBottom: 24 }}>
                <StatCard
                  label="Total Income"
                  value={formatCompact(data.totalIncome)}
                  subLabel="All time"
                  icon="💰"
                  color="accent"
                />
                <StatCard
                  label="Total Expenses"
                  value={formatCompact(data.totalExpenses)}
                  subLabel="All time"
                  icon="💸"
                  color="danger"
                />
                <StatCard
                  label="Net Balance"
                  value={formatCompact(data.netBalance)}
                  subLabel="Income - Expenses"
                  icon="📈"
                  color={data.netBalance >= 0 ? 'accent' : 'danger'}
                />
                <StatCard
                  label="Total Records"
                  value={data.totalRecords.toLocaleString()}
                  subLabel={`${data.activeUsers} active users`}
                  icon="📋"
                  color="info"
                />
              </div>


              <div style={{ marginBottom: 8 }}>
                <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
                  📅 This Month
                </h3>
              </div>
              <div className="grid-3" style={{ marginBottom: 28 }}>
                <StatCard label="Monthly Income"   value={formatCompact(data.monthlyIncome)}   icon="📥" color="accent" />
                <StatCard label="Monthly Expenses" value={formatCompact(data.monthlyExpenses)} icon="📤" color="danger" />
                <StatCard
                  label="Monthly Net"
                  value={formatCompact(data.monthlyNetBalance)}
                  icon={data.monthlyNetBalance >= 0 ? '✅' : '⚠️'}
                  color={data.monthlyNetBalance >= 0 ? 'accent' : 'warning'}
                />
              </div>


              <div className="grid-2" style={{ marginBottom: 24 }}>
                {/* Area Chart - Monthly Trends */}
                <div className="card">
                  <h3 style={{ marginBottom: 20, fontSize: '1rem' }}>📈 Monthly Income vs Expenses</h3>
                  <ResponsiveContainer width="100%" height={260}>
                    <AreaChart data={data.monthlyTrends} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#10b981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2a3045" />
                      <XAxis dataKey="monthLabel" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} />
                      <YAxis tickFormatter={v => '₹' + (v/1000).toFixed(0) + 'K'} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} />
                      <Tooltip {...tooltipStyle} formatter={(v, n) => [formatCurrency(v), n === 'income' ? 'Income' : 'Expenses']} />
                      <Legend wrapperStyle={{ fontSize: '0.8rem', paddingTop: 8 }} />
                      <Area type="monotone" dataKey="income"   stroke="#10b981" fill="url(#incomeGrad)"  strokeWidth={2} dot={false} name="income" />
                      <Area type="monotone" dataKey="expenses" stroke="#ef4444" fill="url(#expenseGrad)" strokeWidth={2} dot={false} name="expenses" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Pie Chart - Category breakdown */}
                <div className="card">
                  <h3 style={{ marginBottom: 20, fontSize: '1rem' }}>🍩 Expense Categories</h3>
                  {(() => {
                    const expenseCats = data.categoryTotals.filter(c => c.type === 'EXPENSE');
                    return (
                      <ResponsiveContainer width="100%" height={260}>
                        <PieChart>
                          <Pie
                            data={expenseCats}
                            dataKey="total"
                            nameKey="category"
                            cx="50%" cy="50%"
                            outerRadius={90}
                            innerRadius={40}
                            paddingAngle={3}
                            label={({ category, percent }) => percent > 0.05 ? `${category} ${(percent * 100).toFixed(0)}%` : ''}
                            labelLine={false}
                          >
                            {expenseCats.map((_, i) => (
                              <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip {...tooltipStyle} formatter={(v) => [formatCurrency(v), 'Amount']} />
                        </PieChart>
                      </ResponsiveContainer>
                    );
                  })()}
                </div>
              </div>


              <div className="grid-2" style={{ marginBottom: 24 }}>
                {/* Bar Chart - Net by month */}
                <div className="card">
                  <h3 style={{ marginBottom: 20, fontSize: '1rem' }}>📊 Monthly Net Balance</h3>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={data.monthlyTrends} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2a3045" />
                      <XAxis dataKey="monthLabel" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} />
                      <YAxis tickFormatter={v => '₹' + (v/1000).toFixed(0) + 'K'} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} />
                      <Tooltip {...tooltipStyle} formatter={(v) => [formatCurrency(v), 'Net Balance']} />
                      <Bar dataKey="net" name="net" radius={[4, 4, 0, 0]}>
                        {data.monthlyTrends.map((entry, i) => (
                          <Cell key={i} fill={entry.net >= 0 ? '#10b981' : '#ef4444'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Category Totals Table */}
                <div className="card">
                  <h3 style={{ marginBottom: 16, fontSize: '1rem' }}>🏷️ Category Totals</h3>
                  <div style={{ maxHeight: 260, overflowY: 'auto' }}>
                    <table style={{ fontSize: '0.82rem' }}>
                      <thead>
                        <tr>
                          <th>Category</th>
                          <th>Type</th>
                          <th style={{ textAlign: 'right' }}>Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.categoryTotals.slice(0, 12).map((cat, i) => (
                          <tr key={i}>
                            <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{cat.category}</td>
                            <td>
                              <span className={`badge badge-${cat.type === 'INCOME' ? 'success' : 'danger'}`}>
                                {cat.type}
                              </span>
                            </td>
                            <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: cat.type === 'INCOME' ? 'var(--success)' : 'var(--danger)' }}>
                              {formatCompact(cat.total)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>


              <div className="card">
                <h3 style={{ marginBottom: 16, fontSize: '1rem' }}>🕐 Recent Activity</h3>
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Category</th>
                        <th>Notes</th>
                        <th>Type</th>
                        <th style={{ textAlign: 'right' }}>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recentActivity.map(r => (
                        <tr key={r.id}>
                          <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                            {formatDate(r.transactionDate)}
                          </td>
                          <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{r.category}</td>
                          <td style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {r.notes || '—'}
                          </td>
                          <td>
                            <span className={`badge badge-${r.type === 'INCOME' ? 'success' : 'danger'}`}>
                              {r.type}
                            </span>
                          </td>
                          <td style={{
                            textAlign: 'right', fontWeight: 700,
                            fontFamily: 'var(--font-mono)', fontSize: '0.85rem',
                            color: r.type === 'INCOME' ? 'var(--success)' : 'var(--danger)',
                          }}>
                            {r.type === 'INCOME' ? '+' : '-'}{formatCompact(r.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
