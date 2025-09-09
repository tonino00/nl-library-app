import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { emprestimoService } from '../../services/emprestimoService';
import { Emprestimo, EmprestimoState } from '../../types';

// Estado inicial
const initialState: EmprestimoState = {
  emprestimos: [],
  emprestimo: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchEmprestimos = createAsyncThunk(
  'emprestimos/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await emprestimoService.getAll();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar empréstimos');
    }
  }
);

export const fetchEmprestimoById = createAsyncThunk(
  'emprestimos/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      return await emprestimoService.getById(id);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar empréstimo');
    }
  }
);

export const fetchEmprestimosByUsuario = createAsyncThunk(
  'emprestimos/fetchByUsuario',
  async (usuarioId: string, { rejectWithValue }) => {
    try {
      return await emprestimoService.getByUsuarioId(usuarioId);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar empréstimos do usuário');
    }
  }
);

export const fetchEmprestimosByLivro = createAsyncThunk(
  'emprestimos/fetchByLivro',
  async (livroId: string, { rejectWithValue }) => {
    try {
      return await emprestimoService.getByLivroId(livroId);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar empréstimos do livro');
    }
  }
);

export const createEmprestimo = createAsyncThunk(
  'emprestimos/create',
  async (emprestimo: Emprestimo, { rejectWithValue }) => {
    try {
      return await emprestimoService.create(emprestimo);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao criar empréstimo');
    }
  }
);

export const updateEmprestimo = createAsyncThunk(
  'emprestimos/update',
  async ({ id, emprestimo }: { id: string; emprestimo: Emprestimo }, { rejectWithValue }) => {
    try {
      return await emprestimoService.update(id, emprestimo);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao atualizar empréstimo');
    }
  }
);

export const deleteEmprestimo = createAsyncThunk(
  'emprestimos/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await emprestimoService.delete(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao excluir empréstimo');
    }
  }
);

export const finalizarEmprestimo = createAsyncThunk(
  'emprestimos/finalizar',
  async (id: string, { rejectWithValue }) => {
    try {
      return await emprestimoService.finalizarEmprestimo(id);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao finalizar empréstimo');
    }
  }
);

export const renovarEmprestimo = createAsyncThunk(
  'emprestimos/renovar',
  async (id: string, { rejectWithValue }) => {
    try {
      return await emprestimoService.renovarEmprestimo(id);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao renovar empréstimo');
    }
  }
);

export const getAtrasadosEmprestimos = createAsyncThunk(
  'emprestimos/getAtrasados',
  async (_, { rejectWithValue }) => {
    try {
      return await emprestimoService.getAtrasados();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar empréstimos atrasados');
    }
  }
);

export const pagarMultaEmprestimo = createAsyncThunk(
  'emprestimos/pagarMulta',
  async (id: string, { rejectWithValue }) => {
    try {
      return await emprestimoService.pagarMulta(id);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao pagar multa do empréstimo');
    }
  }
);

// Slice
const emprestimoSlice = createSlice({
  name: 'emprestimos',
  initialState,
  reducers: {
    clearEmprestimoError: (state) => {
      state.error = null;
    },
    setSelectedEmprestimo: (state, action: PayloadAction<Emprestimo | null>) => {
      state.emprestimo = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all
      .addCase(fetchEmprestimos.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEmprestimos.fulfilled, (state, action: PayloadAction<Emprestimo[]>) => {
        state.isLoading = false;
        state.emprestimos = action.payload;
      })
      .addCase(fetchEmprestimos.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch by id
      .addCase(fetchEmprestimoById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEmprestimoById.fulfilled, (state, action: PayloadAction<Emprestimo>) => {
        state.isLoading = false;
        state.emprestimo = action.payload;
      })
      .addCase(fetchEmprestimoById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch by usuario
      .addCase(fetchEmprestimosByUsuario.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEmprestimosByUsuario.fulfilled, (state, action: PayloadAction<Emprestimo[]>) => {
        state.isLoading = false;
        state.emprestimos = action.payload;
      })
      .addCase(fetchEmprestimosByUsuario.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch by livro
      .addCase(fetchEmprestimosByLivro.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEmprestimosByLivro.fulfilled, (state, action: PayloadAction<Emprestimo[]>) => {
        state.isLoading = false;
        state.emprestimos = action.payload;
      })
      .addCase(fetchEmprestimosByLivro.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Create
      .addCase(createEmprestimo.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createEmprestimo.fulfilled, (state, action: PayloadAction<Emprestimo>) => {
        state.isLoading = false;
        state.emprestimos.push(action.payload);
      })
      .addCase(createEmprestimo.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Update
      .addCase(updateEmprestimo.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateEmprestimo.fulfilled, (state, action: PayloadAction<Emprestimo>) => {
        state.isLoading = false;
        state.emprestimos = state.emprestimos.map(emp =>
          emp._id === action.payload._id ? action.payload : emp
        );
        state.emprestimo = action.payload;
      })
      .addCase(updateEmprestimo.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Delete
      .addCase(deleteEmprestimo.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteEmprestimo.fulfilled, (state, action: PayloadAction<string>) => {
        state.isLoading = false;
        state.emprestimos = state.emprestimos.filter(emp => emp._id !== action.payload);
        if (state.emprestimo && state.emprestimo._id === action.payload) {
          state.emprestimo = null;
        }
      })
      .addCase(deleteEmprestimo.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Finalizar
      .addCase(finalizarEmprestimo.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(finalizarEmprestimo.fulfilled, (state, action: PayloadAction<Emprestimo>) => {
        state.isLoading = false;
        state.emprestimos = state.emprestimos.map(emp =>
          emp._id === action.payload._id ? action.payload : emp
        );
        state.emprestimo = action.payload;
      })
      .addCase(finalizarEmprestimo.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Renovar
      .addCase(renovarEmprestimo.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(renovarEmprestimo.fulfilled, (state, action: PayloadAction<Emprestimo>) => {
        state.isLoading = false;
        state.emprestimos = state.emprestimos.map(emp =>
          emp._id === action.payload._id ? action.payload : emp
        );
        state.emprestimo = action.payload;
      })
      .addCase(renovarEmprestimo.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Empréstimos Atrasados
      .addCase(getAtrasadosEmprestimos.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAtrasadosEmprestimos.fulfilled, (state, action: PayloadAction<Emprestimo[]>) => {
        state.isLoading = false;
        state.emprestimos = action.payload;
      })
      .addCase(getAtrasadosEmprestimos.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Pagar Multa
      .addCase(pagarMultaEmprestimo.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(pagarMultaEmprestimo.fulfilled, (state, action: PayloadAction<Emprestimo>) => {
        state.isLoading = false;
        state.emprestimos = state.emprestimos.map(emp =>
          emp._id === action.payload._id ? action.payload : emp
        );
        state.emprestimo = action.payload;
      })
      .addCase(pagarMultaEmprestimo.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearEmprestimoError, setSelectedEmprestimo } = emprestimoSlice.actions;
export default emprestimoSlice.reducer;
