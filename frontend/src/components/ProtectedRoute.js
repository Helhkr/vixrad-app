import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Nova verificação: se está autenticado mas o e-mail não foi verificado
  if (!user.is_email_verified) {
    return <Navigate to="/please-verify" replace />;
  }

  return children;
};

export default ProtectedRoute;