import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import RecordsPage from './pages/RecordsPage';
import UsersPage from './pages/UsersPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected — VIEWER and above */}
          <Route path="/dashboard" element={
            <ProtectedRoute requiredRole="VIEWER">
              <DashboardPage />
            </ProtectedRoute>
          } />

          {/* Protected — ANALYST and above */}
          <Route path="/records" element={
            <ProtectedRoute requiredRole="ANALYST">
              <RecordsPage />
            </ProtectedRoute>
          } />

          {/* Protected — ADMIN only */}
          <Route path="/users" element={
            <ProtectedRoute requiredRole="ADMIN">
              <UsersPage />
            </ProtectedRoute>
          } />

          {/* Default redirect */}
          <Route path="/"  element={<Navigate to="/dashboard" replace />} />
          <Route path="*"  element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
