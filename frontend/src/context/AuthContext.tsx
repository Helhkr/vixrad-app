
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, registerUser } from '../api/authService';

interface User {
  id: string;
  email: string;
  fullName: string;
  // Adicione outros campos do usuário conforme necessário
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: any) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!token);
  const navigate = useNavigate();

  const saveAuthData = useCallback((token: string, user: User) => {
    localStorage.setItem('token', token);
    setToken(token);
    setUser(user);
    setIsAuthenticated(true);
  }, []);

  const login = useCallback(async (credentials: any) => {
    try {
      const response = await loginUser(credentials);
      // Assumindo que a resposta contém { accessToken: '...', user: { ... } }
      saveAuthData(response.accessToken, response.user);
      navigate('/app');
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }, [saveAuthData, navigate]);

  const register = useCallback(async (userData: any) => {
    try {
      const response = await registerUser(userData);
      // Assumindo que a resposta contém { accessToken: '...', user: { ... } }
      saveAuthData(response.accessToken, response.user);
      navigate('/app');
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  }, [saveAuthData, navigate]);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    navigate('/login');
  }, [navigate]);

  useEffect(() => {
    // Opcional: Validar o token no backend ao carregar a aplicação
    // ou decodificar o token para obter informações do usuário se for um JWT
    if (token && !user) {
      // Aqui você pode adicionar lógica para buscar os dados do usuário
      // usando o token, se necessário, ou decodificá-lo.
      // Por simplicidade, vamos assumir que o token é suficiente para isAuthenticated
      // e que os dados do usuário virão no login/registro.
      setIsAuthenticated(true);
    }
  }, [token, user]);

  const contextValue = React.useMemo(() => ({
    token,
    user,
    isAuthenticated,
    login,
    register,
    logout,
  }), [token, user, isAuthenticated, login, register, logout]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
