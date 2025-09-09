import api from './api';
import { Livro } from '../types';

const ENDPOINT = '/livros';

export const livroService = {
  getAll: async (): Promise<Livro[]> => {
    const response = await api.get(ENDPOINT);
    return response.data;
  },

  getById: async (id: string): Promise<Livro> => {
    const response = await api.get(`${ENDPOINT}/${id}`);
    return response.data;
  },

  create: async (livro: Livro): Promise<Livro> => {
    const response = await api.post(ENDPOINT, livro);
    return response.data;
  },

  update: async (id: string, livro: Livro): Promise<Livro> => {
    const response = await api.put(`${ENDPOINT}/${id}`, livro);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`${ENDPOINT}/${id}`);
  },
  
  // Métodos específicos para livros
  getByCategoriaId: async (categoriaId: string): Promise<Livro[]> => {
    const response = await api.get(`${ENDPOINT}/categoria/${categoriaId}`);
    return response.data;
  },
  
  pesquisar: async (termo: string): Promise<Livro[]> => {
    const response = await api.get(`${ENDPOINT}/pesquisa`, { params: { termo } });
    return response.data;
  }
};
