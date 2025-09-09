import api from './api';
import { Categoria } from '../types';

const ENDPOINT = '/categorias';

export const categoriaService = {
  getAll: async (): Promise<Categoria[]> => {
    const response = await api.get(ENDPOINT);
    return response.data;
  },

  getById: async (id: string): Promise<Categoria> => {
    const response = await api.get(`${ENDPOINT}/${id}`);
    return response.data;
  },

  create: async (categoria: Categoria): Promise<Categoria> => {
    const response = await api.post(ENDPOINT, categoria);
    return response.data;
  },

  update: async (id: string, categoria: Categoria): Promise<Categoria> => {
    const response = await api.put(`${ENDPOINT}/${id}`, categoria);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`${ENDPOINT}/${id}`);
  }
};
