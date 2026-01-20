import api from './api';
import { Usuario } from '../types';

const ENDPOINT = '/api/usuarios';

export const usuarioService = {
  getAll: async (): Promise<Usuario[]> => {
    let allUsuarios: Usuario[] = [];
    let page = 1;
    let hasMore = true;
    
    while (hasMore) {
      try {
        // Fazer requisição com parâmetros de paginação
        const response = await api.get(`${ENDPOINT}?page=${page}&limit=100`);
        
        // Verificar se a resposta está no formato { sucesso, data } ou apenas os dados diretos
        const usuarios = response.data.data || response.data;
        
        if (Array.isArray(usuarios) && usuarios.length > 0) {
          allUsuarios = [...allUsuarios, ...usuarios];
          
          // Se retornou menos que 100, provavelmente é a última página
          if (usuarios.length < 100) {
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
          const usuarios = response.data.data || response.data;
          return Array.isArray(usuarios) ? usuarios : [];
        }
        hasMore = false;
      }
    }
    
    return allUsuarios;
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
