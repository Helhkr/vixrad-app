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
    if (userData && !userData.is_email_verified) {
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
      // A resposta do login agora é { accessToken, user }
      handleAuthSuccess(response.data.accessToken, response.data.user);
      return true;
    } catch (error) {
      console.error('Falha na autenticação:', error.response?.data?.message || error.message);
      return false;
    }
  };
  
  // Função para login com token (usada no registro e verificação de email)
  const loginWithToken = (token, userData) => {
    handleAuthSuccess(token, userData);
  };

  // Função para login automático após o registro (mantida por compatibilidade)
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
      // A resposta do status é { user: userData }
      const response = await api.get('/api/auth/status');
      setUser(response.data.user); // Corrigido para pegar o objeto user
      return response.data.user;
    } catch (error) {
      // Não chame o logout() aqui. Apenas registre o erro.
      // O trabalho de redirecionar um usuário não autenticado é do ProtectedRoute.
      console.error(
        'Falha ao verificar o token (isso é esperado se não estiver logado):',
        error.response?.data?.message || error.message,
      )
      // Importante: Limpe o usuário se a atualização falhar
      setUser(null)
      return null
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, loading, login, loginWithToken, loginAfterRegister, logout, refreshUserStatus }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};