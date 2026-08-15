import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { categoriaService } from '../../services/categoriaService';
import { Categoria, CategoriaState } from '../../types';
import { logout } from '../auth/authSlice';
import { loadCachedData, saveCachedData, clearCachedData } from '../../utils/persistedCache';

const CACHE_KEY = 'categorias';
// Alinhado ao TTL do cache Redis de GET /api/categorias no backend (até 5min)
const CACHE_TTL_MS = 300_000;

const cachedCategorias = loadCachedData<Categoria[]>(CACHE_KEY, CACHE_TTL_MS);
// Array vazio é "truthy" em JS: sem essa checagem de length, uma lista cacheada
// vazia é tratada como "já carregada" e o fetch seguinte é pulado silenciosamente.
const temCacheValido = !!cachedCategorias && cachedCategorias.length > 0;

// Estado inicial: reidrata de um reload recente antes de assumir estado vazio
const initialState: CategoriaState = {
  categorias: cachedCategorias ?? [],
  categoria: null,
  isLoading: false,
  error: null,
  lastFetched: temCacheValido ? new Date().toISOString() : null,
  isDataLoaded: temCacheValido,
};

// Async thunks
export const fetchCategorias = createAsyncThunk(
  'categorias/fetchAll',
  async (forceRefresh: boolean = false, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { categorias: CategoriaState };

      // Se os dados já foram carregados e não é um refresh forçado, não faz nova requisição.
      // Categorias mudam com pouca frequência e o backend já cacheia essa rota por até 5min.
      if (state.categorias.isDataLoaded && !forceRefresh) {
        return state.categorias.categorias;
      }

      return await categoriaService.getAll();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar categorias');
    }
  }
);

export const fetchCategoriaById = createAsyncThunk(
  'categorias/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      return await categoriaService.getById(id);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar categoria');
    }
  }
);

export const createCategoria = createAsyncThunk(
  'categorias/create',
  async (categoria: Categoria, { rejectWithValue }) => {
    try {
      return await categoriaService.create(categoria);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao criar categoria');
    }
  }
);

export const updateCategoria = createAsyncThunk(
  'categorias/update',
  async ({ id, categoria }: { id: string; categoria: Categoria }, { rejectWithValue }) => {
    try {
      return await categoriaService.update(id, categoria);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao atualizar categoria');
    }
  }
);

export const deleteCategoria = createAsyncThunk(
  'categorias/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await categoriaService.delete(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao excluir categoria');
    }
  }
);

// Slice
const categoriaSlice = createSlice({
  name: 'categorias',
  initialState,
  reducers: {
    clearCategoriaError: (state) => {
      state.error = null;
    },
    setSelectedCategoria: (state, action: PayloadAction<Categoria | null>) => {
      state.categoria = action.payload;
    },
    invalidateCategoriasCache: (state) => {
      state.isDataLoaded = false;
      state.lastFetched = null;
      clearCachedData(CACHE_KEY);
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all
      .addCase(fetchCategorias.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCategorias.fulfilled, (state, action: PayloadAction<Categoria[]>) => {
        state.isLoading = false;
        state.categorias = action.payload;
        state.lastFetched = new Date().toISOString();
        state.isDataLoaded = true;
        saveCachedData<Categoria[]>(CACHE_KEY, state.categorias);
      })
      .addCase(fetchCategorias.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch by id
      .addCase(fetchCategoriaById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCategoriaById.fulfilled, (state, action: PayloadAction<Categoria>) => {
        state.isLoading = false;
        state.categoria = action.payload;
      })
      .addCase(fetchCategoriaById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Create
      .addCase(createCategoria.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createCategoria.fulfilled, (state, action: PayloadAction<Categoria>) => {
        state.isLoading = false;
        state.categorias.push(action.payload);
        saveCachedData<Categoria[]>(CACHE_KEY, state.categorias);
      })
      .addCase(createCategoria.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Update
      .addCase(updateCategoria.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCategoria.fulfilled, (state, action: PayloadAction<Categoria>) => {
        state.isLoading = false;
        state.categorias = state.categorias.map(cat =>
          cat._id === action.payload._id ? action.payload : cat
        );
        state.categoria = action.payload;
        saveCachedData<Categoria[]>(CACHE_KEY, state.categorias);
      })
      .addCase(updateCategoria.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Delete
      .addCase(deleteCategoria.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteCategoria.fulfilled, (state, action: PayloadAction<string>) => {
        state.isLoading = false;
        state.categorias = state.categorias.filter(cat => cat._id !== action.payload);
        if (state.categoria && state.categoria._id === action.payload) {
          state.categoria = null;
        }
        saveCachedData<Categoria[]>(CACHE_KEY, state.categorias);
      })
      .addCase(deleteCategoria.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Invalidar cache quando usuário fizer logout
      .addCase(logout.fulfilled, (state) => {
        state.categorias = [];
        state.categoria = null;
        state.isDataLoaded = false;
        state.lastFetched = null;
        state.error = null;
        clearCachedData(CACHE_KEY);
      });
  },
});

export const { clearCategoriaError, setSelectedCategoria, invalidateCategoriasCache } = categoriaSlice.actions;
export default categoriaSlice.reducer;
