import React, { createContext, useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('authToken')
    if (token) {
      api.defaults.headers.Authorization = `Bearer ${token}`
      // Ao carregar, buscamos os dados mais recentes do usuário
      refreshUserStatus().finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    try {
      const response = await api.post('/api/auth/login', { email, password })
      const { token, user: userData } = response.data

      localStorage.setItem('authToken', token)
      api.defaults.headers.Authorization = `Bearer ${token}`
      
      // --- A CORREÇÃO PRINCIPAL ESTÁ AQUI ---
      // Armazena os dados completos do usuário no estado do React
      setUser(userData) 

      // Se o usuário logado ainda não for verificado, manda para a página de verificação
      if (!userData.is_email_verified) {
        navigate('/please-verify')
      } else {
        navigate('/')
      }
      return true
    } catch (error) {
      console.error('Falha na autenticação', error)
      return false
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('authToken')
    delete api.defaults.headers.Authorization
    navigate('/login')
  }

  const refreshUserStatus = async () => {
    try {
      const response = await api.get('/api/auth/status')
      setUser(response.data)
      return response.data
    } catch (error) {
      console.error('Falha ao atualizar o status do usuário', error)
      if (error.response?.status === 401) {
        logout()
      }
      return null
    }
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, loading, refreshUserStatus }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  return useContext(AuthContext)
}