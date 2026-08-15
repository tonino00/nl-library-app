// Tipos para o sistema de biblioteca

export interface Categoria {
  _id?: string;
  nome: string;
  descricao?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Emprestimo {
  _id?: string;
  usuario: string | Usuario;
  livro: string | Livro;
  dataEmprestimo?: Date;
  dataPrevistaDevolucao: Date;
  dataDevolucao?: Date;
  status?: 'pendente' | 'reservado' | 'emprestado' | 'devolvido' | 'atrasado' | 'renovado' | 'expirado';
  multa?: number;
  renovacoes?: number;
  observacoes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Livro {
  _id?: string;
  titulo: string;
  autor: string;
  autorEspiritual?: string;
  isbn?: string;
  editora?: string;
  anoPublicacao?: number;
  categoria: string | Categoria;
  quantidade?: number;
  disponiveis?: number;
  descricao?: string;
  localizacao?: string;
  capa?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Usuario {
  _id?: string;
  nome: string;
  email: string;
  senha?: string;
  tipo?: 'admin' | 'leitor' | 'comunidade';
  documento: string;
  telefone: string;
  endereco?: string;
  foto?: string;
  ativo?: boolean;
  dataNascimento: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

// Tipos para autenticação
export interface AuthState {
  user: Usuario | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Tipos para o estado dos reducers
export interface CategoriaState {
  categorias: Categoria[];
  categoria: Categoria | null;
  isLoading: boolean;
  error: string | null;
  lastFetched: string | null;
  isDataLoaded: boolean;
}

export interface LivroState {
  livros: Livro[];
  livro: Livro | null;
  total?: number;
  isLoading: boolean;
  error: string | null;
  lastFetched: string | null;
  isDataLoaded: boolean;
  // Paginação/filtro server-side, usados só pela listagem de livros.
  // Independentes de `livros` acima, que outras telas (dashboard, seletor de
  // livro no empréstimo) esperam conter o catálogo completo.
  paginado: {
    livros: Livro[];
    total: number;
    totalPaginas: number;
    page: number;
    isLoading: boolean;
    pendingKey: string | null;
  };
}

export interface UsuarioState {
  usuarios: Usuario[];
  usuario: Usuario | null;
  isLoading: boolean;
  error: string | null;
  lastFetched: string | null;
  isDataLoaded: boolean;
}

export interface EmprestimoState {
  emprestimos: Emprestimo[];
  emprestimo: Emprestimo | null;
  isLoading: boolean;
  error: string | null;
  lastFetched: string | null;
  isDataLoaded: boolean;
}
