import api from './api';
import { Emprestimo } from '../types';

const ENDPOINT = '/emprestimos';

export const emprestimoService = {
  getAll: async (): Promise<Emprestimo[]> => {
    const response = await api.get(ENDPOINT);
    return response.data;
  },

  getById: async (id: string): Promise<Emprestimo> => {
    const response = await api.get(`${ENDPOINT}/${id}`);
    return response.data;
  },

  create: async (emprestimo: Emprestimo): Promise<Emprestimo> => {
    const response = await api.post(ENDPOINT, emprestimo);
    return response.data;
  },

  update: async (id: string, emprestimo: Emprestimo): Promise<Emprestimo> => {
    const response = await api.put(`${ENDPOINT}/${id}`, emprestimo);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`${ENDPOINT}/${id}`);
  },
  
  // Métodos específicos para empréstimos
  getByUsuarioId: async (usuarioId: string): Promise<Emprestimo[]> => {
    const response = await api.get(`${ENDPOINT}/usuario/${usuarioId}`);
    return response.data;
  },

  getByLivroId: async (livroId: string): Promise<Emprestimo[]> => {
    const response = await api.get(`${ENDPOINT}/livro/${livroId}`);
    return response.data;
  },

  finalizarEmprestimo: async (id: string): Promise<Emprestimo> => {
    const response = await api.patch(`${ENDPOINT}/${id}/devolver`);
    return response.data;
  },

  renovarEmprestimo: async (id: string): Promise<Emprestimo> => {
    const response = await api.patch(`${ENDPOINT}/${id}/renovar`);
    return response.data;
  }
};
