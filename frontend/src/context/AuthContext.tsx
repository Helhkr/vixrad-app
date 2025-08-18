
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { loginUser, registerUser, getProfile } from '../api/authService';
import type { LoginCredentials, RegisterUserData } from '../api/authService';

interface User {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN';
}

export interface AuthContextType {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean; // Add isLoading state
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: RegisterUserData) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('accessToken'));
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!token);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Initialize isLoading to true

  console.log('AuthContext: Initial render', { token, user, isAuthenticated, isLoading });

  const saveAuthData = useCallback((accessToken: string, userData: User) => {
    localStorage.setItem('accessToken', accessToken);
    setToken(accessToken);
    setUser(userData);
    setIsAuthenticated(true);
    console.log('AuthContext: saveAuthData called', { accessToken, userData });
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true); // Set loading true on login attempt
    try {
      const response = await loginUser(credentials);
      saveAuthData(response.accessToken, response.user);
      console.log('AuthContext: Login successful', response.user);
    } catch (error: any) {
      console.error('AuthContext: Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false); // Set loading false after login attempt
    }
  }, [saveAuthData]);

  const register = useCallback(async (userData: RegisterUserData) => {
    setIsLoading(true); // Set loading true on register attempt
    try {
      const response = await registerUser(userData);
      saveAuthData(response.accessToken, response.user);
      console.log('AuthContext: Registration successful', response.user);
    } catch (error: any) {
      console.error('AuthContext: Registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false); // Set loading false after register attempt
    }
  }, [saveAuthData]);

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setIsLoading(false); // Set loading false on logout
    console.log('AuthContext: Logout successful');
  }, []);

  useEffect(() => {
    console.log('AuthContext: useEffect running', { token, user, isAuthenticated, isLoading });
    const storedToken = localStorage.getItem('accessToken');

    if (storedToken && !user) {
      console.log('AuthContext: Stored token found, fetching profile...', storedToken);
      setIsLoading(true); // Set loading true before fetching profile
      const fetchProfile = async () => {
        try {
          const profile = await getProfile(storedToken);
          setUser(profile);
          setIsAuthenticated(true);
          setToken(storedToken);
          console.log('AuthContext: Profile fetched successfully', profile);
        } catch (error) {
          console.error('AuthContext: Failed to fetch user profile from stored token:', error);
          logout(); // Logout if token is invalid or expired
        } finally {
          setIsLoading(false); // Set loading false after fetching profile
        }
      };
      fetchProfile();
    } else if (!storedToken && isAuthenticated) {
      console.log('AuthContext: No stored token but isAuthenticated is true, logging out.');
      logout();
    } else if (storedToken && user) {
      console.log('AuthContext: Already authenticated with stored token and user data.');
      setIsLoading(false); // Set loading false if already authenticated
    } else if (!storedToken && !isAuthenticated) {
      console.log('AuthContext: No token, not authenticated.');
      setIsLoading(false); // Set loading false if no token and not authenticated
    }
  }, [token, user, isAuthenticated, logout]);

  const contextValue: AuthContextType = {
    token,
    user,
    isAuthenticated,
    isLoading, // Include isLoading in context value
    login,
    register,
    logout,
  };

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
