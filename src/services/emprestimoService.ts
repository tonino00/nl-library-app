import api from './api';
import { Emprestimo } from '../types';

const ENDPOINT = '/api/emprestimos';

export const emprestimoService = {
  getAll: async (): Promise<Emprestimo[]> => {
    const response = await api.get(ENDPOINT);
    // Debug da resposta da API
    console.log('Resposta da API emprestimos:', response.data);
    
    // Verificar se a resposta está no formato { sucesso, data } ou apenas os dados diretos
    const emprestimos = response.data.data || response.data;
    console.log('Emprestimos extraídos:', emprestimos);
    
    return emprestimos;
  },

  getById: async (id: string): Promise<Emprestimo> => {
    const response = await api.get(`${ENDPOINT}/${id}`);
    return response.data.data || response.data;
  },

  create: async (emprestimo: Emprestimo): Promise<Emprestimo> => {
    const response = await api.post(ENDPOINT, emprestimo);
    return response.data.data || response.data;
  },

  update: async (id: string, emprestimo: Emprestimo): Promise<Emprestimo> => {
    const response = await api.put(`${ENDPOINT}/${id}`, emprestimo);
    return response.data.data || response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`${ENDPOINT}/${id}`);
  },
  
  // Métodos específicos para empréstimos
  getByUsuarioId: async (usuarioId: string): Promise<Emprestimo[]> => {
    const response = await api.get(`${ENDPOINT}/usuario/${usuarioId}`);
    return response.data.data || response.data;
  },
  
  getAtrasados: async (): Promise<Emprestimo[]> => {
    const response = await api.get(`${ENDPOINT}/atrasados`);
    return response.data.data || response.data;
  },

  getByLivroId: async (livroId: string): Promise<Emprestimo[]> => {
    const response = await api.get(`${ENDPOINT}/livro/${livroId}`);
    return response.data.data || response.data;
  },

  finalizarEmprestimo: async (id: string): Promise<Emprestimo> => {
    const response = await api.patch(`${ENDPOINT}/${id}/devolver`);
    return response.data.data || response.data;
  },

  renovarEmprestimo: async (id: string): Promise<Emprestimo> => {
    const response = await api.patch(`${ENDPOINT}/${id}/renovar`);
    return response.data.data || response.data;
  },
  
  pagarMulta: async (id: string): Promise<Emprestimo> => {
    const response = await api.patch(`${ENDPOINT}/${id}/multa/pagar`);
    return response.data.data || response.data;
  }
};
