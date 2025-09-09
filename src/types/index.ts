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
  status?: 'pendente' | 'devolvido' | 'atrasado' | 'renovado';
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
  isbn: string;
  editora: string;
  anoPublicacao: number;
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
  tipo?: 'admin' | 'leitor';
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
}

export interface LivroState {
  livros: Livro[];
  livro: Livro | null;
  isLoading: boolean;
  error: string | null;
}

export interface UsuarioState {
  usuarios: Usuario[];
  usuario: Usuario | null;
  isLoading: boolean;
  error: string | null;
}

export interface EmprestimoState {
  emprestimos: Emprestimo[];
  emprestimo: Emprestimo | null;
  isLoading: boolean;
  error: string | null;
}
