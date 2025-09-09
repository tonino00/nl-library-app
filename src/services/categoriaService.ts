import api from './api';
import { Categoria } from '../types';

const ENDPOINT = '/api/categorias';

export const categoriaService = {
  getAll: async (): Promise<Categoria[]> => {
    const response = await api.get(ENDPOINT);
    // Debug da resposta da API
    console.log('Resposta da API categorias:', response.data);
    
    // Verificar se a resposta está no formato { sucesso, data } ou apenas os dados diretos
    const categorias = response.data.data || response.data;
    console.log('Categorias extraídas:', categorias);
    
    return categorias;
  },

  getById: async (id: string): Promise<Categoria> => {
    const response = await api.get(`${ENDPOINT}/${id}`);
    return response.data.data || response.data;
  },

  create: async (categoria: Categoria): Promise<Categoria> => {
    const response = await api.post(ENDPOINT, categoria);
    return response.data.data || response.data;
  },

  update: async (id: string, categoria: Categoria): Promise<Categoria> => {
    const response = await api.put(`${ENDPOINT}/${id}`, categoria);
    return response.data.data || response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`${ENDPOINT}/${id}`);
  }
};
