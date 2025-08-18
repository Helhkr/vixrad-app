import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated but not an admin, redirect to home or access denied page
  if (user?.role !== 'ADMIN') {
    return <Navigate to="/app" replace />; // Redirect to main app page
  }

  // If authenticated and is an admin, render the children routes
  return <Outlet />;
};

export default AdminRoute;