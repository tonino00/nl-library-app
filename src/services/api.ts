import axios from 'axios';

// Configuração base do axios
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://nl-library-api.onrender.com',
  headers: {
    'Content-Type': 'application/json',
  },
  // Timeout de requisição para evitar requisições pendentes
  timeout: 10000, // 10 segundos
});

/**
 * Verifica se um token JWT está expirado
 * @param token O token JWT para verificar
 * @returns true se o token estiver expirado, false caso contrário
 */
const isTokenExpired = (token: string): boolean => {
  try {
    // Decodificar o payload do token (segunda parte do JWT)
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(window.atob(base64));
    
    // Verificar se o token possui um campo de expiração (exp)
    if (!payload.exp) return false;
    
    // Converter timestamp de segundos para milissegundos e comparar com o tempo atual
    const expirationTime = payload.exp * 1000;
    return Date.now() >= expirationTime;
  } catch (error) {
    // Se houver algum erro na decodificação, considerar o token como expirado
    console.error('Erro ao verificar expiração do token:', error);
    return true;
  }
};

// Interceptor para incluir token de autenticação e verificar expiração
api.interceptors.request.use(
  async (config) => {
    // Obter token do sessionStorage
    const token = sessionStorage.getItem('token');
    
    if (token) {
      // Verificar se o token está expirado
      if (isTokenExpired(token)) {
        // Se o token estiver expirado, tentar renovar ou remover
        console.warn('Token expirado, redirecionando para login');
        
        // Remover dados de autenticação
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        
        // Redirecionar para página de login
        window.location.href = '/login?expired=true';
        
        // Rejeitando a requisição atual
        return Promise.reject(new Error('Token expirado'));
      }
      
      // Adicionar token ao cabeçalho Authorization
      config.headers.Authorization = `Bearer ${token}`;
      
      // Adicionar proteção CSRF para métodos não seguros
      if (['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase() || '')) {
        // Verificar se temos um token CSRF armazenado
        const csrfToken = sessionStorage.getItem('csrfToken');
        if (csrfToken) {
          config.headers['X-CSRF-Token'] = csrfToken;
        }
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => {
    // Verificar se a resposta contém um token CSRF e armazená-lo
    if (response.headers && response.headers['x-csrf-token']) {
      sessionStorage.setItem('csrfToken', response.headers['x-csrf-token']);
    }
    
    return response;
  },
  (error) => {
    // Criar uma versão sanitizada do erro para logging
    const sanitizedError = {
      status: error.response?.status || 'Sem resposta',
      message: error.response?.data?.message || error.message || 'Erro desconhecido',
      // Sanitizar URLs para remover IDs sensíveis
      path: error.config?.url?.replace(/\/api\/usuarios\/[^\/]+/, '/api/usuarios/[ID]'),
      method: error.config?.method?.toUpperCase() || 'UNKNOWN'
    };
    
    // Tratamento de erros específicos
    if (error.response) {
      // Se tivermos uma resposta do servidor
      switch (error.response.status) {
        case 401:
          // Limpa dados de autenticação e redireciona para login
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('user');
          sessionStorage.removeItem('csrfToken');
          window.location.href = '/login?session=expired';
          break;
        case 403:
          console.error('Acesso proibido');
          // Log detalhado apenas em desenvolvimento
          if (process.env.NODE_ENV === 'development') {
            console.debug('Detalhes do erro 403:', sanitizedError);
          }
          break;
        case 404:
          console.error('Recurso não encontrado');
          // Log detalhado apenas em desenvolvimento
          if (process.env.NODE_ENV === 'development') {
            console.debug('Detalhes do erro 404:', sanitizedError);
          }
          break;
        case 422:
          console.error('Dados de entrada inválidos');
          // Log detalhado apenas em desenvolvimento
          if (process.env.NODE_ENV === 'development') {
            console.debug('Detalhes do erro 422:', error.response.data);
          }
          break;
        case 429:
          console.error('Muitas requisições. Tente novamente mais tarde.');
          break;
        case 500:
          console.error('Erro interno do servidor');
          // Log detalhado apenas em desenvolvimento
          if (process.env.NODE_ENV === 'development') {
            console.debug('Detalhes do erro 500:', sanitizedError);
          }
          break;
        default:
          console.error(`Erro de status ${error.response.status}`);
          // Log detalhado apenas em desenvolvimento
          if (process.env.NODE_ENV === 'development') {
            console.debug(`Detalhes do erro ${error.response.status}:`, sanitizedError);
          }
      }
    } else if (error.request) {
      // Se não houve resposta (problema de rede ou CORS)
      console.error('Não foi possível se conectar ao servidor. Verifique sua conexão.');
      // Log detalhado apenas em desenvolvimento
      if (process.env.NODE_ENV === 'development') {
        console.debug('Detalhes do erro de conexão:', sanitizedError);
      }
    } else {
      // Erro na configuração da requisição
      console.error('Erro ao configurar a requisição');
      // Log detalhado apenas em desenvolvimento
      if (process.env.NODE_ENV === 'development') {
        console.debug('Detalhes do erro de configuração:', sanitizedError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
