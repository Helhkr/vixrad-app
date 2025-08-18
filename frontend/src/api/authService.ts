


import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    role: 'USER' | 'ADMIN';
  };
}

export interface RegisterUserData {
  email: string;
  password: string;
  name: string;
  cpf: string;
  crm: string;
  crmUf: string;
}

export const loginUser = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Erro ao fazer login. Por favor, tente novamente.');
  }
};

export const registerUser = async (userData: RegisterUserData): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>('/auth/register', userData);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Erro ao registar. Por favor, tente novamente.');
  }
};

export const getProfile = async (accessToken: string): Promise<AuthResponse['user']> => {
  try {
    console.log('authService: Fetching profile with token:', accessToken);
    const response = await api.get<AuthResponse['user']>('/auth/profile', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    console.log('authService: Profile fetched successfully:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('authService: Error fetching profile:', error.response?.data?.message || error.message);
    throw new Error(error.response?.data?.message || 'Erro ao obter perfil do utilizador.');
  }
};
