import api from './api';
import { Usuario } from '../types';

const ENDPOINT = '/api/usuarios';

export const usuarioService = {
  getAll: async (): Promise<Usuario[]> => {
    const PAGE_LIMIT = 100;

    try {
      // Buscar primeira página para obter o total e o primeiro lote
      const firstResponse = await api.get(`${ENDPOINT}?page=1&limit=${PAGE_LIMIT}`);
      const firstUsuarios = firstResponse.data.data || firstResponse.data;
      const total = firstResponse.data.total as number | undefined;

      if (!Array.isArray(firstUsuarios)) {
        return [];
      }

      // Se a primeira página já trouxe todos os registros, retorna imediatamente
      if (firstUsuarios.length < PAGE_LIMIT || (total && firstUsuarios.length >= total)) {
        return firstUsuarios;
      }

      // Se o backend retornou total, busca as páginas restantes em paralelo
      if (total && total > PAGE_LIMIT) {
        const totalPages = Math.ceil(total / PAGE_LIMIT);
        const pageRequests: Promise<any>[] = [];

        for (let page = 2; page <= totalPages; page++) {
          pageRequests.push(api.get(`${ENDPOINT}?page=${page}&limit=${PAGE_LIMIT}`));
        }

        const responses = await Promise.all(pageRequests);
        const remainingUsuarios = responses.flatMap(
          (res) => res.data.data || res.data || []
        );

        return [...firstUsuarios, ...remainingUsuarios];
      }

      // Fallback: buscar páginas restantes sequencialmente quando não há total
      const allUsuarios: Usuario[] = [...firstUsuarios];
      let page = 2;
      let hasMore = true;

      while (hasMore) {
        const response = await api.get(`${ENDPOINT}?page=${page}&limit=${PAGE_LIMIT}`);
        const usuarios = response.data.data || response.data;

        if (Array.isArray(usuarios) && usuarios.length > 0) {
          allUsuarios.push(...usuarios);
          hasMore = usuarios.length === PAGE_LIMIT;
          page++;
        } else {
          hasMore = false;
        }
      }

      return allUsuarios;
    } catch (error) {
      // Se a paginação falhar, tenta buscar sem parâmetros (fallback)
      const response = await api.get(ENDPOINT);
      const usuarios = response.data.data || response.data;
      return Array.isArray(usuarios) ? usuarios : [];
    }
  },

  getById: async (id: string): Promise<Usuario> => {
    const response = await api.get(`${ENDPOINT}/${id}`);
    return response.data.data || response.data;
  },

  create: async (usuario: Usuario): Promise<Usuario> => {
    const response = await api.post(ENDPOINT, usuario);
    return response.data.data || response.data;
  },

  update: async (id: string, usuario: Usuario): Promise<Usuario> => {
    const response = await api.put(`${ENDPOINT}/${id}`, usuario);
    return response.data.data || response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`${ENDPOINT}/${id}`);
  },
  
  // Métodos específicos para usuários
  login: async (email: string, senha: string): Promise<{ token: string, usuario: Usuario }> => {
    const response = await api.post(`${ENDPOINT}/login`, { email, senha });
    // Processar resposta do login
    return response.data;
  },
  
  alterarSenha: async (id: string, senhaAtual: string, novaSenha: string): Promise<void> => {
    await api.patch(`${ENDPOINT}/${id}/senha`, { senhaAtual, novaSenha });
  },
  
  alterarTipo: async (id: string, tipo: string): Promise<Usuario> => {
    const response = await api.patch(`${ENDPOINT}/${id}/tipo`, { tipo });
    return response.data.data || response.data;
  },
  
  alterarStatus: async (id: string, ativo: boolean): Promise<Usuario> => {
    const response = await api.patch(`${ENDPOINT}/${id}/status`, { ativo });
    return response.data.data || response.data;
  }
};
