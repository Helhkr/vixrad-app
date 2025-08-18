import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // If still loading, show a loading indicator
  if (isLoading) {
    return <div>Carregando...</div>;
  }

  // If not authenticated after loading, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated and user data is loaded, render the children routes
  return <Outlet />;
};

export default ProtectedRoute;
