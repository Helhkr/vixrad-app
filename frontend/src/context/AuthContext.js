import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api'; // Ajuste o caminho conforme sua estrutura
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      api.defaults.headers.Authorization = `Bearer ${token}`;
      // Idealmente, você teria uma rota /api/auth/me para buscar os dados do usuário
      // Por enquanto, podemos assumir que o token é válido.
      // Futuramente:
      // api.get('/api/auth/me').then(response => {
      //   setUser(response.data);
      // }).catch(() => {
      //   localStorage.removeItem('authToken');
      // }).finally(() => setLoading(false));
      setLoading(false); // Simplificação por agora
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (emailOrToken, passwordOrUser) => {
    try {
      let token, user;

      // Se o primeiro argumento for um email, é um login tradicional
      if (typeof passwordOrUser !== 'object') {
        const response = await api.post('/api/auth/login', { email: emailOrToken, password: passwordOrUser });
        token = response.data.token;
        user = response.data.user;
      } else {
        // Se for um objeto, é o auto-login após o registro
        token = emailOrToken;
        user = passwordOrUser;
      }

      localStorage.setItem('authToken', token);
      api.defaults.headers.Authorization = `Bearer ${token}`;
      setUser(user);
      navigate('/');
      return true;
    } catch (error) {
      console.error("Falha na autenticação", error);
      return false;
    }
  };

  // Função para atualizar o status do usuário
  const refreshUserStatus = async () => {
    try {
      const response = await api.get('/api/auth/status');
      setUser(response.data); // Atualiza o estado com os novos dados do usuário
      return response.data; // Retorna os dados atualizados
    } catch (error) {
      console.error("Falha ao atualizar o status do usuário", error);
      // Se o token for inválido (erro 401), desloga o usuário
      if (error.response?.status === 401) {
        logout();
      }
      return null;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('authToken');
    delete api.defaults.headers.Authorization;
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, loading, refreshUserStatus }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Hook customizado para facilitar o uso do contexto
export const useAuth = () => {
  return useContext(AuthContext);
};