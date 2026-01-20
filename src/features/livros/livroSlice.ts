import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { livroService } from '../../services/livroService';
import { Livro, LivroState } from '../../types';
import { logout } from '../auth/authSlice';

// Estado inicial
const initialState: LivroState = {
  livros: [],
  livro: null,
  total: 0,
  isLoading: false,
  error: null,
  lastFetched: null,
  isDataLoaded: false,
};

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
    },
    resetLivrosState: (state) => {
      state.livros = [];
      state.total = 0;
      state.isDataLoaded = false;
      state.lastFetched = null;
      state.error = null;
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
      
      // Invalidar cache quando usuário fizer logout
      .addCase(logout.fulfilled, (state) => {
        state.livros = [];
        state.total = 0;
        state.isDataLoaded = false;
        state.lastFetched = null;
        state.error = null;
      });
  },
});

export const { clearLivroError, setSelectedLivro, invalidateCache, resetLivrosState } = livroSlice.actions;
export default livroSlice.reducer;
