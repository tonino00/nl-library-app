import api from './api';
import { Emprestimo } from '../types';

const ENDPOINT = '/api/emprestimos';

export const emprestimoService = {
  getAll: async (): Promise<Emprestimo[]> => {
    const PAGE_LIMIT = 100;

    try {
      // Buscar primeira página para obter o total e o primeiro lote
      const firstResponse = await api.get(`${ENDPOINT}?page=1&limit=${PAGE_LIMIT}`);
      const firstEmprestimos = firstResponse.data.data || firstResponse.data;
      const total = firstResponse.data.total as number | undefined;

      if (!Array.isArray(firstEmprestimos)) {
        return [];
      }

      // Se a primeira página já trouxe todos os registros, retorna imediatamente
      if (firstEmprestimos.length < PAGE_LIMIT || (total && firstEmprestimos.length >= total)) {
        return firstEmprestimos;
      }

      // Se o backend retornou total, busca as páginas restantes em paralelo
      if (total && total > PAGE_LIMIT) {
        const totalPages = Math.ceil(total / PAGE_LIMIT);
        const pageRequests: Promise<any>[] = [];

        for (let page = 2; page <= totalPages; page++) {
          pageRequests.push(api.get(`${ENDPOINT}?page=${page}&limit=${PAGE_LIMIT}`));
        }

        const responses = await Promise.all(pageRequests);
        const remainingEmprestimos = responses.flatMap(
          (res) => res.data.data || res.data || []
        );

        return [...firstEmprestimos, ...remainingEmprestimos];
      }

      // Fallback: buscar páginas restantes sequencialmente quando não há total
      const allEmprestimos: Emprestimo[] = [...firstEmprestimos];
      let page = 2;
      let hasMore = true;

      while (hasMore) {
        const response = await api.get(`${ENDPOINT}?page=${page}&limit=${PAGE_LIMIT}`);
        const emprestimos = response.data.data || response.data;

        if (Array.isArray(emprestimos) && emprestimos.length > 0) {
          allEmprestimos.push(...emprestimos);
          hasMore = emprestimos.length === PAGE_LIMIT;
          page++;
        } else {
          hasMore = false;
        }
      }

      return allEmprestimos;
    } catch (error) {
      // Se a paginação falhar, tenta buscar sem parâmetros (fallback)
      const response = await api.get(ENDPOINT);
      const emprestimos = response.data.data || response.data;
      return Array.isArray(emprestimos) ? emprestimos : [];
    }
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
