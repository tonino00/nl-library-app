import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { emprestimoService } from '../../services/emprestimoService';
import { Emprestimo, EmprestimoState } from '../../types';
import { logout } from '../auth/authSlice';
import { loadCachedData, saveCachedData, clearCachedData } from '../../utils/persistedCache';

const CACHE_KEY = 'emprestimos';
// TTL curto: status muda com frequência (devoluções, atrasos, e um job expira
// reservas não confirmadas a cada 15min no backend), então mantemos a janela pequena.
const CACHE_TTL_MS = 30_000;

const cachedEmprestimos = loadCachedData<Emprestimo[]>(CACHE_KEY, CACHE_TTL_MS);
// Array vazio é "truthy" em JS: sem essa checagem de length, uma lista cacheada
// vazia (ex.: sessão anterior sem empréstimos no momento) é tratada como "já
// carregada" e o fetch seguinte é pulado silenciosamente, mesmo com dados novos no servidor.
const temCacheValido = !!cachedEmprestimos && cachedEmprestimos.length > 0;

// Estado inicial: reidrata de um reload recente antes de assumir estado vazio
const initialState: EmprestimoState = {
  emprestimos: cachedEmprestimos ?? [],
  emprestimo: null,
  isLoading: false,
  error: null,
  lastFetched: temCacheValido ? new Date().toISOString() : null,
  isDataLoaded: temCacheValido,
};

// Async thunks
export const fetchEmprestimos = createAsyncThunk(
  'emprestimos/fetchAll',
  async (forceRefresh: boolean = false, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { emprestimos: EmprestimoState };

      // Se os dados já foram carregados e não é um refresh forçado, não faz nova requisição
      if (state.emprestimos.isDataLoaded && !forceRefresh) {
        return state.emprestimos.emprestimos;
      }

      return await emprestimoService.getAll();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar empréstimos');
    }
  },
  {
    // Evita buscar a coleção inteira duas vezes em paralelo (ex.: o duplo
    // mount do React.StrictMode em dev, ou dois componentes montando juntos).
    condition: (forceRefresh = false, { getState }) => {
      const state = getState() as { emprestimos: EmprestimoState };
      if (state.emprestimos.isLoading && !forceRefresh) {
        return false;
      }
      return true;
    },
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
    invalidateCache: (state) => {
      state.isDataLoaded = false;
      state.lastFetched = null;
      clearCachedData(CACHE_KEY);
    },
    resetEmprestimosState: (state) => {
      state.emprestimos = [];
      state.emprestimo = null;
      state.isDataLoaded = false;
      state.lastFetched = null;
      state.error = null;
      clearCachedData(CACHE_KEY);
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
        state.lastFetched = new Date().toISOString();
        state.isDataLoaded = true;
        saveCachedData<Emprestimo[]>(CACHE_KEY, state.emprestimos);
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
        // Esta é uma visão filtrada (só de um usuário), não a listagem completa.
        // Invalida isDataLoaded para forçar um fetch real na próxima vez que a
        // tela de Empréstimos for aberta, em vez de reaproveitar essa lista parcial.
        state.isDataLoaded = false;
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
        // Esta é uma visão filtrada (só de um livro), não a listagem completa.
        // Invalida isDataLoaded para forçar um fetch real na próxima vez que a
        // tela de Empréstimos for aberta, em vez de reaproveitar essa lista parcial.
        state.isDataLoaded = false;
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
        saveCachedData<Emprestimo[]>(CACHE_KEY, state.emprestimos);
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
        saveCachedData<Emprestimo[]>(CACHE_KEY, state.emprestimos);
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
        saveCachedData<Emprestimo[]>(CACHE_KEY, state.emprestimos);
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
        saveCachedData<Emprestimo[]>(CACHE_KEY, state.emprestimos);
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
        saveCachedData<Emprestimo[]>(CACHE_KEY, state.emprestimos);
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
        // Esta é uma visão filtrada (só atrasados), não a listagem completa.
        // Invalida isDataLoaded para forçar um fetch real na próxima vez que a
        // tela de Empréstimos for aberta, em vez de reaproveitar essa lista parcial.
        state.isDataLoaded = false;
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
        saveCachedData<Emprestimo[]>(CACHE_KEY, state.emprestimos);
      })
      .addCase(pagarMultaEmprestimo.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Invalidar cache quando usuário fizer logout
      .addCase(logout.fulfilled, (state) => {
        state.emprestimos = [];
        state.emprestimo = null;
        state.isDataLoaded = false;
        state.lastFetched = null;
        state.error = null;
        clearCachedData(CACHE_KEY);
      });
  },
});

export const { clearEmprestimoError, setSelectedEmprestimo } = emprestimoSlice.actions;
export default emprestimoSlice.reducer;
