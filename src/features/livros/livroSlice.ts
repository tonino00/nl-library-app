import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { livroService } from '../../services/livroService';
import { Livro, LivroState } from '../../types';

// Estado inicial
const initialState: LivroState = {
  livros: [],
  livro: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchLivros = createAsyncThunk(
  'livros/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await livroService.getAll();
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
  },
  extraReducers: (builder) => {
    builder
      // Fetch all
      .addCase(fetchLivros.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLivros.fulfilled, (state, action: PayloadAction<Livro[]>) => {
        state.isLoading = false;
        state.livros = action.payload;
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
      .addCase(fetchLivrosByCategoria.fulfilled, (state, action: PayloadAction<Livro[]>) => {
        state.isLoading = false;
        state.livros = action.payload;
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
      .addCase(pesquisarLivros.fulfilled, (state, action: PayloadAction<Livro[]>) => {
        state.isLoading = false;
        state.livros = action.payload;
      })
      .addCase(pesquisarLivros.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearLivroError, setSelectedLivro } = livroSlice.actions;
export default livroSlice.reducer;
