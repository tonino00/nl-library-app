import api from './api';
import { Livro } from '../types';


const ENDPOINT = '/api/livros';

export const livroService = {
  getAll: async (): Promise<{ livros: Livro[]; total?: number }> => {
    const PAGE_LIMIT = 100;

    try {
      // Buscar primeira página para obter o total e o primeiro lote
      const firstResponse = await api.get(`${ENDPOINT}?page=1&limit=${PAGE_LIMIT}`);
      const firstLivros = firstResponse.data.data || firstResponse.data;
      const total = firstResponse.data.total as number | undefined;

      if (!Array.isArray(firstLivros)) {
        return { livros: [], total };
      }

      // Se a primeira página já trouxe todos os registros, retorna imediatamente
      if (firstLivros.length < PAGE_LIMIT || (total && firstLivros.length >= total)) {
        return { livros: firstLivros, total: total ?? firstLivros.length };
      }

      // Se o backend retornou total, busca as páginas restantes em paralelo
      if (total && total > PAGE_LIMIT) {
        const totalPages = Math.ceil(total / PAGE_LIMIT);
        const pageRequests: Promise<any>[] = [];

        for (let page = 2; page <= totalPages; page++) {
          pageRequests.push(api.get(`${ENDPOINT}?page=${page}&limit=${PAGE_LIMIT}`));
        }

        const responses = await Promise.all(pageRequests);
        const remainingLivros = responses.flatMap(
          (res) => res.data.data || res.data || []
        );

        return {
          livros: [...firstLivros, ...remainingLivros],
          total,
        };
      }

      // Fallback: buscar páginas restantes sequencialmente quando não há total
      const allLivros: Livro[] = [...firstLivros];
      let page = 2;
      let hasMore = true;

      while (hasMore) {
        const response = await api.get(`${ENDPOINT}?page=${page}&limit=${PAGE_LIMIT}`);
        const livros = response.data.data || response.data;

        if (Array.isArray(livros) && livros.length > 0) {
          allLivros.push(...livros);
          hasMore = livros.length === PAGE_LIMIT;
          page++;
        } else {
          hasMore = false;
        }
      }

      return { livros: allLivros, total: allLivros.length };
    } catch (error) {
      // Se a paginação falhar, tenta buscar sem parâmetros (fallback)
      const response = await api.get(ENDPOINT);
      const livros = response.data.data || response.data;
      const total = response.data.total;
      return { livros: Array.isArray(livros) ? livros : [], total };
    }
  },

  getById: async (id: string): Promise<Livro> => {
    const response = await api.get(`${ENDPOINT}/${id}`);
    return response.data.data || response.data;
  },

  create: async (livro: Livro): Promise<Livro> => {
    const response = await api.post(ENDPOINT, livro);
    return response.data.data || response.data;
  },

  update: async (id: string, livro: Livro): Promise<Livro> => {
    const response = await api.put(`${ENDPOINT}/${id}`, livro);
    return response.data.data || response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`${ENDPOINT}/${id}`);
  },
  
  // Métodos específicos para livros
  getByCategoriaId: async (categoriaId: string): Promise<{ livros: Livro[]; total?: number }> => {
    const response = await api.get(`/api/categorias/${categoriaId}/livros`);
    const livros = response.data.data || response.data;
    const total = response.data.total;
    return { livros, total };
  },
  
  pesquisar: async (termo: string): Promise<{ livros: Livro[]; total?: number }> => {
    const response = await api.get(`${ENDPOINT}/busca`, { params: { q: termo } });
    const livros = response.data.data || response.data;
    const total = response.data.total;
    return { livros, total };
  }
};
