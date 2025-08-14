import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ProtectedRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <div>Carregando...</div> // Ou um CSpinner
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Se o usuário está autenticado, mas não verificado, redireciona.
  if (!user.is_email_verified) {
    return <Navigate to="/please-verify" replace />
  }

  // Se passou por todas as verificações, permite o acesso.
  return children
}

export default ProtectedRoute