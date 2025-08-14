import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Função centralizada para lidar com o sucesso da autenticação
  const handleAuthSuccess = (token, userData) => {
    localStorage.setItem('authToken', token);
    api.defaults.headers.Authorization = `Bearer ${token}`;
    setUser(userData);

    // Redirecionamento único e confiável baseado nos dados recebidos
    if (!userData.is_email_verified) {
      navigate('/please-verify');
    } else {
      navigate('/');
    }
  };

  // Efeito para verificar o token ao carregar a página
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      api.defaults.headers.Authorization = `Bearer ${token}`;
      refreshUserStatus().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // Função para login com credenciais
  const login = async (email, password) => {
    try {
      const response = await api.post('/api/auth/login', { email, password });
      handleAuthSuccess(response.data.token, response.data.user);
      return true;
    } catch (error) {
      console.error('Falha na autenticação', error);
      return false;
    }
  };

  // Função para login automático após o registro
  const loginAfterRegister = (token, userData) => {
    handleAuthSuccess(token, userData);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('authToken');
    delete api.defaults.headers.Authorization;
    navigate('/login');
  };

  const refreshUserStatus = async () => {
    try {
      const response = await api.get('/api/auth/status');
      setUser(response.data);
      return response.data;
    } catch (error) {
      console.error('Falha ao atualizar o status do usuário', error);
      if (error.response?.status === 401) {
        logout();
      }
      return null;
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, loading, login, loginAfterRegister, logout, refreshUserStatus }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};