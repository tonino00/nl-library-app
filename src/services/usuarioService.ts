import api from './api';
import { Usuario } from '../types';

const ENDPOINT = '/api/usuarios';

export const usuarioService = {
  getAll: async (): Promise<Usuario[]> => {
    const response = await api.get(ENDPOINT);
    // Verificar se a resposta está no formato { sucesso, data } ou apenas os dados diretos
    const usuarios = response.data.data || response.data;
    
    return usuarios;
  },

  getById: async (id: string): Promise<Usuario> => {
    const response = await api.get(`${ENDPOINT}/${id}`);
    return response.data.data || response.data;
  },

  create: async (usuario: Usuario): Promise<Usuario> => {
    const response = await api.post(ENDPOINT, usuario);
    return response.data.data || response.data;
  },

  update: async (id: string, usuario: Usuario): Promise<Usuario> => {
    const response = await api.put(`${ENDPOINT}/${id}`, usuario);
    return response.data.data || response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`${ENDPOINT}/${id}`);
  },
  
  // Métodos específicos para usuários
  login: async (email: string, senha: string): Promise<{ token: string, usuario: Usuario }> => {
    const response = await api.post(`${ENDPOINT}/login`, { email, senha });
    // Processar resposta do login
    return response.data;
  },
  
  alterarSenha: async (id: string, senhaAtual: string, novaSenha: string): Promise<void> => {
    await api.patch(`${ENDPOINT}/${id}/senha`, { senhaAtual, novaSenha });
  },
  
  alterarTipo: async (id: string, tipo: string): Promise<Usuario> => {
    const response = await api.patch(`${ENDPOINT}/${id}/tipo`, { tipo });
    return response.data.data || response.data;
  },
  
  alterarStatus: async (id: string, ativo: boolean): Promise<Usuario> => {
    const response = await api.patch(`${ENDPOINT}/${id}/status`, { ativo });
    return response.data.data || response.data;
  }
};
