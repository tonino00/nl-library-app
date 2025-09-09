import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { categoriaService } from '../../services/categoriaService';
import { Categoria, CategoriaState } from '../../types';

// Estado inicial
const initialState: CategoriaState = {
  categorias: [],
  categoria: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchCategorias = createAsyncThunk(
  'categorias/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
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
      })
      .addCase(deleteCategoria.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCategoriaError, setSelectedCategoria } = categoriaSlice.actions;
export default categoriaSlice.reducer;
