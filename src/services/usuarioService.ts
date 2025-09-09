import api from './api';
import { Usuario } from '../types';

const ENDPOINT = '/usuarios';

export const usuarioService = {
  getAll: async (): Promise<Usuario[]> => {
    const response = await api.get(ENDPOINT);
    return response.data;
  },

  getById: async (id: string): Promise<Usuario> => {
    const response = await api.get(`${ENDPOINT}/${id}`);
    return response.data;
  },

  create: async (usuario: Usuario): Promise<Usuario> => {
    const response = await api.post(ENDPOINT, usuario);
    return response.data;
  },

  update: async (id: string, usuario: Usuario): Promise<Usuario> => {
    const response = await api.put(`${ENDPOINT}/${id}`, usuario);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`${ENDPOINT}/${id}`);
  },
  
  // Método específico para ativar/desativar usuário
  toggleAtivo: async (id: string): Promise<Usuario> => {
    const response = await api.patch(`${ENDPOINT}/${id}/toggle-ativo`);
    return response.data;
  }
};
