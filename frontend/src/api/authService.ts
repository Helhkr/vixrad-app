
import axios from 'axios';

const API_URL = '/auth'; // Base URL para os endpoints de autenticação

const api = axios.create({
  baseURL: API_URL,
});

export const loginUser = async (credentials: any) => {
  try {
    const response = await api.post('/login', credentials);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

export const registerUser = async (userData: any) => {
  try {
    const response = await api.post('/register', userData);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};
