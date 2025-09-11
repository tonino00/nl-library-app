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

const ENDPOINT = '/api/usuarios';

export const authService = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await api.post(`${ENDPOINT}/login`, credentials);
    
    // Salvar token e usuário no localStorage
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      // A API retorna o usuário em diferentes formatos, verificar todas as possíveis estruturas
      const userData = response.data.user || response.data.usuario || response.data.data;
      localStorage.setItem('user', JSON.stringify(userData));
    }
    
    return response.data;
  },

  logout: (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  register: async (usuario: Usuario): Promise<Usuario> => {
    const response = await api.post(ENDPOINT, usuario);
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
    try {
      // Primeiro tentamos recuperar o objeto de usuário do localStorage
      const userStr = localStorage.getItem('user');
      let usuario = null;

      if (userStr && userStr !== 'undefined') {
        try {
          usuario = JSON.parse(userStr);
        } catch (e) {
          console.error('Erro ao fazer parse do usuário do localStorage:', e);
        }
      }

      // Se não temos o usuário ou o ID, tentamos uma requisição básica para verificar se o token é válido
      if (!usuario || !usuario._id) {
        // Usar uma requisição simples apenas para verificar se o token está válido
        await api.get(`${ENDPOINT}?limit=1`);
        
        // Se chegamos até aqui sem um erro, o token é válido, mas não temos o usuário
        // Retornar um objeto vazio para manter a sessão ativa
        return usuario || {} as Usuario;
      } else {
        // Se temos o ID do usuário, tentamos atualizar suas informações
        const response = await api.get(`${ENDPOINT}/${usuario._id}`);
        const updatedUser = response.data.data || response.data;
        
        // Atualizamos o cache do usuário
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        return updatedUser;
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      throw error;
    }
  },

  updateSenha: async (id: string, senhaAtual: string, novaSenha: string): Promise<void> => {
    await api.patch(`${ENDPOINT}/${id}/senha`, { senhaAtual, novaSenha });
  }
};
