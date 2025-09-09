import api from './api';
import { Usuario } from '../types';

interface LoginResponse {
  user: Usuario;
  token: string;
}

interface LoginCredentials {
  email: string;
  senha: string;
}

const ENDPOINT = '/auth';

export const authService = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await api.post(`${ENDPOINT}/login`, credentials);
    
    // Salvar token e usuário no localStorage
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  },

  logout: (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  register: async (usuario: Usuario): Promise<Usuario> => {
    const response = await api.post(`${ENDPOINT}/register`, usuario);
    return response.data;
  },

  getCurrentUser: (): Usuario | null => {
    const userStr = localStorage.getItem('user');
    // Verificar se userStr existe e não é a string 'undefined'
    if (userStr && userStr !== 'undefined') {
      try {
        return JSON.parse(userStr);
      } catch (error) {
        console.error('Erro ao analisar dados do usuário:', error);
        // Se houver erro ao fazer parse, remover o item inválido
        localStorage.removeItem('user');
      }
    }
    return null;
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token');
  },

  checkAuth: async (): Promise<Usuario> => {
    const response = await api.get(`${ENDPOINT}/me`);
    return response.data;
  },

  updateSenha: async (id: string, senhaAntiga: string, senhaNova: string): Promise<void> => {
    await api.post(`${ENDPOINT}/update-senha`, { id, senhaAntiga, senhaNova });
  }
};
