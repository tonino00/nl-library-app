import axios from 'axios';

// Configuração base do axios
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para incluir token de autenticação
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Tratamento de erros específicos
    if (error.response) {
      // Se tivermos uma resposta do servidor
      switch (error.response.status) {
        case 401:
          // Limpa dados de autenticação e redireciona para login
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          break;
        case 403:
          console.error('Acesso proibido:', error.response.data);
          break;
        case 404:
          console.error('Recurso não encontrado:', error.response.data);
          break;
        case 500:
          console.error('Erro interno do servidor:', error.response.data);
          break;
        default:
          console.error(`Erro de status ${error.response.status}:`, error.response.data);
      }
    } else if (error.request) {
      // Se não houve resposta (problema de rede ou CORS)
      console.error('Não foi possível se conectar ao servidor. Verifique sua conexão ou a disponibilidade do backend:', error.request);
    } else {
      // Erro na configuração da requisição
      console.error('Erro ao configurar a requisição:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
