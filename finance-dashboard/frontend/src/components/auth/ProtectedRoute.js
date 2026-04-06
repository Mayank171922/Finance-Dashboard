import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ children, requiredRole }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner spinner-lg" />
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role hierarchy: ADMIN > ANALYST > VIEWER
  if (requiredRole) {
    const hierarchy = { VIEWER: 1, ANALYST: 2, ADMIN: 3 };
    const userLevel = hierarchy[user.role] || 0;
    const requiredLevel = hierarchy[requiredRole] || 0;
    if (userLevel < requiredLevel) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
}
