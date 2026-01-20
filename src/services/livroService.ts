import api from './api';
import { Livro } from '../types';

interface ApiResponse {
  data: Livro[] | Livro;
  total?: number;
  sucesso?: boolean;
  mensagem?: string;
}

const ENDPOINT = '/api/livros';

export const livroService = {
  getAll: async (): Promise<{ livros: Livro[]; total?: number }> => {
    let allLivros: Livro[] = [];
    let page = 1;
    let hasMore = true;
    
    while (hasMore) {
      try {
        // Fazer requisição com parâmetros de paginação
        const response = await api.get(`${ENDPOINT}?page=${page}&limit=100`);
        
        // Verificar se a resposta está no formato { sucesso, data } ou apenas os dados diretos
        const livros = response.data.data || response.data;
        
        if (Array.isArray(livros) && livros.length > 0) {
          allLivros = [...allLivros, ...livros];
          
          // Se retornou menos que 100, provavelmente é a última página
          if (livros.length < 100) {
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
          const livros = response.data.data || response.data;
          const total = response.data.total;
          return { livros: Array.isArray(livros) ? livros : [], total };
        }
        hasMore = false;
      }
    }
    
    return { livros: allLivros, total: allLivros.length };
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
