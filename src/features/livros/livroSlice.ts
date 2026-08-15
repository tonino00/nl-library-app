import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { livroService } from '../../services/livroService';
import { Livro, LivroState } from '../../types';
import { logout } from '../auth/authSlice';
import { loadCachedData, saveCachedData, clearCachedData, clearCachedDataByPrefix } from '../../utils/persistedCache';

const CACHE_KEY = 'livros';
// Alinhado ao TTL do cache Redis de GET /api/livros no backend (até 60s)
const CACHE_TTL_MS = 60_000;

// Cache da listagem paginada: uma entrada por combinação de página+filtros,
// já que cada combinação é uma "visão" diferente dos dados (não dá pra usar
// uma única flag isDataLoaded como no restante do slice).
const PAGINADO_CACHE_PREFIX = 'livros-paginado:';
const PAGINADO_CACHE_TTL_MS = 60_000;

interface CachedLivros {
  livros: Livro[];
  total: number;
}

// Estado inicial: tenta reidratar de um reload recente antes de aceitar o estado vazio,
// evitando bater na API de novo se os dados ainda estariam quentes no servidor.
const cached = loadCachedData<CachedLivros>(CACHE_KEY, CACHE_TTL_MS);
// Lista vazia dentro do objeto cacheado ainda conta como "sem dados": sem essa
// checagem, um cache com livros: [] é tratado como "já carregado" e o fetch
// seguinte é pulado silenciosamente, mesmo com dados novos no servidor.
const temCacheValido = !!cached && cached.livros.length > 0;

const initialState: LivroState = {
  livros: cached?.livros ?? [],
  livro: null,
  total: cached?.total ?? 0,
  isLoading: false,
  error: null,
  lastFetched: temCacheValido ? new Date().toISOString() : null,
  isDataLoaded: temCacheValido,
  paginado: {
    livros: [],
    total: 0,
    totalPaginas: 1,
    page: 1,
    isLoading: false,
    pendingKey: null as string | null,
  },
};

export interface LivrosPaginadosParams {
  page: number;
  limit: number;
  titulo?: string;
  categoria?: string;
  disponivel?: boolean;
}

const buildLivrosPaginadosKey = (params: LivrosPaginadosParams) => JSON.stringify(params);

interface LivrosPaginadosResult {
  livros: Livro[];
  total: number;
  totalPaginas: number;
  page: number;
}

export const fetchLivrosPaginados = createAsyncThunk(
  'livros/fetchPaginados',
  async (params: LivrosPaginadosParams, { rejectWithValue }) => {
    const cacheKey = PAGINADO_CACHE_PREFIX + buildLivrosPaginadosKey(params);
    const cached = loadCachedData<LivrosPaginadosResult>(cacheKey, PAGINADO_CACHE_TTL_MS);
    if (cached) {
      return cached;
    }

    try {
      const result = await livroService.getPaginado(params);
      saveCachedData<LivrosPaginadosResult>(cacheKey, result);
      return result;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar livros');
    }
  },
  {
    // Evita disparar a mesma requisição duas vezes em sequência (ex.: o duplo
    // mount do React.StrictMode em dev, ou dois filtros idênticos em rajada).
    condition: (params, { getState }) => {
      const state = getState() as { livros: LivroState };
      const key = buildLivrosPaginadosKey(params);
      if (state.livros.paginado.pendingKey === key) {
        return false;
      }
      return true;
    },
  }
);

// Async thunks
export const fetchLivros = createAsyncThunk(
  'livros/fetchAll',
  async (forceRefresh: boolean = false, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { livros: LivroState };
      
      // Se os dados já foram carregados e não é um refresh forçado, não faz nova requisição
      if (state.livros.isDataLoaded && !forceRefresh) {
        return { livros: state.livros.livros, total: state.livros.total, fromCache: true };
      }
      
      const result = await livroService.getAll();
      return { ...result, fromCache: false };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar livros');
    }
  }
);

export const fetchLivroById = createAsyncThunk(
  'livros/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      return await livroService.getById(id);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar livro');
    }
  }
);

export const createLivro = createAsyncThunk(
  'livros/create',
  async (livro: Livro, { rejectWithValue }) => {
    try {
      return await livroService.create(livro);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao criar livro');
    }
  }
);

export const updateLivro = createAsyncThunk(
  'livros/update',
  async ({ id, livro }: { id: string; livro: Livro }, { rejectWithValue }) => {
    try {
      return await livroService.update(id, livro);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao atualizar livro');
    }
  }
);

export const deleteLivro = createAsyncThunk(
  'livros/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await livroService.delete(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao excluir livro');
    }
  }
);

export const fetchLivrosByCategoria = createAsyncThunk(
  'livros/fetchByCategoria',
  async (categoriaId: string, { rejectWithValue }) => {
    try {
      return await livroService.getByCategoriaId(categoriaId);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar livros por categoria');
    }
  }
);

export const pesquisarLivros = createAsyncThunk(
  'livros/pesquisar',
  async (termo: string, { rejectWithValue }) => {
    try {
      return await livroService.pesquisar(termo);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar livros');
    }
  }
);

// Slice
const livroSlice = createSlice({
  name: 'livros',
  initialState,
  reducers: {
    clearLivroError: (state) => {
      state.error = null;
    },
    setSelectedLivro: (state, action: PayloadAction<Livro | null>) => {
      state.livro = action.payload;
    },
    invalidateCache: (state) => {
      state.isDataLoaded = false;
      state.lastFetched = null;
      clearCachedData(CACHE_KEY);
      clearCachedDataByPrefix(PAGINADO_CACHE_PREFIX);
    },
    resetLivrosState: (state) => {
      state.livros = [];
      state.total = 0;
      state.isDataLoaded = false;
      state.lastFetched = null;
      state.error = null;
      clearCachedData(CACHE_KEY);
      clearCachedDataByPrefix(PAGINADO_CACHE_PREFIX);
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all
      .addCase(fetchLivros.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLivros.fulfilled, (state, action: PayloadAction<{ livros: Livro[]; total?: number; fromCache?: boolean }>) => {
        state.isLoading = false;
        if (!action.payload.fromCache) {
          state.livros = action.payload.livros;
          state.total = action.payload.total || action.payload.livros.length;
          state.lastFetched = new Date().toISOString();
          state.isDataLoaded = true;
          saveCachedData<CachedLivros>(CACHE_KEY, { livros: state.livros, total: state.total ?? state.livros.length });
        }
      })
      .addCase(fetchLivros.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch by id
      .addCase(fetchLivroById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLivroById.fulfilled, (state, action: PayloadAction<Livro>) => {
        state.isLoading = false;
        state.livro = action.payload;
      })
      .addCase(fetchLivroById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Create
      .addCase(createLivro.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createLivro.fulfilled, (state, action: PayloadAction<Livro>) => {
        state.isLoading = false;
        state.livros.push(action.payload);
        state.total = state.livros.length;
        saveCachedData<CachedLivros>(CACHE_KEY, { livros: state.livros, total: state.total ?? state.livros.length });
        clearCachedDataByPrefix(PAGINADO_CACHE_PREFIX);
      })
      .addCase(createLivro.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Update
      .addCase(updateLivro.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateLivro.fulfilled, (state, action: PayloadAction<Livro>) => {
        state.isLoading = false;
        state.livros = state.livros.map(livro =>
          livro._id === action.payload._id ? action.payload : livro
        );
        state.livro = action.payload;
        saveCachedData<CachedLivros>(CACHE_KEY, { livros: state.livros, total: state.total ?? state.livros.length });
        clearCachedDataByPrefix(PAGINADO_CACHE_PREFIX);
      })
      .addCase(updateLivro.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Delete
      .addCase(deleteLivro.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteLivro.fulfilled, (state, action: PayloadAction<string>) => {
        state.isLoading = false;
        state.livros = state.livros.filter(livro => livro._id !== action.payload);
        state.total = state.livros.length;
        if (state.livro && state.livro._id === action.payload) {
          state.livro = null;
        }
        saveCachedData<CachedLivros>(CACHE_KEY, { livros: state.livros, total: state.total ?? state.livros.length });
        clearCachedDataByPrefix(PAGINADO_CACHE_PREFIX);
      })
      .addCase(deleteLivro.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch by categoria
      .addCase(fetchLivrosByCategoria.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLivrosByCategoria.fulfilled, (state, action: PayloadAction<{ livros: Livro[]; total?: number }>) => {
        state.isLoading = false;
        state.livros = action.payload.livros;
        state.total = action.payload.total || action.payload.livros.length;
      })
      .addCase(fetchLivrosByCategoria.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Pesquisar
      .addCase(pesquisarLivros.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(pesquisarLivros.fulfilled, (state, action: PayloadAction<{ livros: Livro[]; total?: number }>) => {
        state.isLoading = false;
        state.livros = action.payload.livros;
        state.total = action.payload.total || action.payload.livros.length;
      })
      .addCase(pesquisarLivros.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch paginado (server-side, usado pela listagem de livros)
      .addCase(fetchLivrosPaginados.pending, (state, action) => {
        state.paginado.isLoading = true;
        state.paginado.pendingKey = buildLivrosPaginadosKey(action.meta.arg);
        state.error = null;
      })
      .addCase(fetchLivrosPaginados.fulfilled, (state, action) => {
        state.paginado.isLoading = false;
        state.paginado.livros = action.payload.livros;
        state.paginado.total = action.payload.total;
        state.paginado.totalPaginas = action.payload.totalPaginas;
        state.paginado.page = action.payload.page;
        // Só limpa se ninguém disparou uma requisição mais nova enquanto esta estava em voo
        if (state.paginado.pendingKey === buildLivrosPaginadosKey(action.meta.arg)) {
          state.paginado.pendingKey = null;
        }
      })
      .addCase(fetchLivrosPaginados.rejected, (state, action) => {
        state.paginado.isLoading = false;
        state.error = action.payload as string;
        if (state.paginado.pendingKey === buildLivrosPaginadosKey(action.meta.arg)) {
          state.paginado.pendingKey = null;
        }
      })

      // Invalidar cache quando usuário fizer logout
      .addCase(logout.fulfilled, (state) => {
        state.livros = [];
        state.total = 0;
        state.isDataLoaded = false;
        state.lastFetched = null;
        state.error = null;
        state.paginado = { livros: [], total: 0, totalPaginas: 1, page: 1, isLoading: false, pendingKey: null as string | null };
        clearCachedData(CACHE_KEY);
        clearCachedDataByPrefix(PAGINADO_CACHE_PREFIX);
      });
  },
});

export const { clearLivroError, setSelectedLivro, invalidateCache, resetLivrosState } = livroSlice.actions;
export default livroSlice.reducer;
