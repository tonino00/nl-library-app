import api from './api';
import { Emprestimo } from '../types';

const ENDPOINT = '/api/emprestimos';

export const emprestimoService = {
  getAll: async (): Promise<Emprestimo[]> => {
    let allEmprestimos: Emprestimo[] = [];
    let page = 1;
    let hasMore = true;
    
    while (hasMore) {
      try {
        // Fazer requisição com parâmetros de paginação
        const response = await api.get(`${ENDPOINT}?page=${page}&limit=100`);
        
        // Verificar se a resposta está no formato { sucesso, data } ou apenas os dados diretos
        const emprestimos = response.data.data || response.data;
        
        if (Array.isArray(emprestimos) && emprestimos.length > 0) {
          allEmprestimos = [...allEmprestimos, ...emprestimos];
          
          // Se retornou menos que 100, provavelmente é a última página
          if (emprestimos.length < 100) {
            hasMore = false;
          } else {
            page++;
          }
        } else {
          hasMore = false;
        }
      } catch (error) {
        // Se der erro na paginação, tenta buscar sem parâmetros (fallback)
        if (page === 1) {
          const response = await api.get(ENDPOINT);
          const emprestimos = response.data.data || response.data;
          return Array.isArray(emprestimos) ? emprestimos : [];
        }
        hasMore = false;
      }
    }
    
    return allEmprestimos;
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
