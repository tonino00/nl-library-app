import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { usuarioService } from '../../services/usuarioService';
import { Usuario, UsuarioState } from '../../types';
import { logout } from '../auth/authSlice';
import { loadCachedData, saveCachedData, clearCachedData } from '../../utils/persistedCache';

const CACHE_KEY = 'usuarios';
// Sem cache Redis dedicado no backend para esta rota; TTL curto no cliente
// evita apenas o refetch redundante de um reload feito segundos após o anterior.
const CACHE_TTL_MS = 60_000;

const cachedUsuarios = loadCachedData<Usuario[]>(CACHE_KEY, CACHE_TTL_MS);

// Estado inicial: reidrata de um reload recente antes de assumir estado vazio
const initialState: UsuarioState = {
  usuarios: cachedUsuarios ?? [],
  usuario: null,
  isLoading: false,
  error: null,
  lastFetched: cachedUsuarios ? new Date().toISOString() : null,
  isDataLoaded: !!cachedUsuarios,
};

// Async thunks
export const fetchUsuarios = createAsyncThunk(
  'usuarios/fetchAll',
  async (forceRefresh: boolean = false, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { usuarios: UsuarioState };

      // Se os dados já foram carregados e não é um refresh forçado, não faz nova requisição
      if (state.usuarios.isDataLoaded && !forceRefresh) {
        return state.usuarios.usuarios;
      }

      return await usuarioService.getAll();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar usuários');
    }
  }
);

export const fetchUsuarioById = createAsyncThunk(
  'usuarios/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      return await usuarioService.getById(id);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar usuário');
    }
  }
);

export const createUsuario = createAsyncThunk(
  'usuarios/create',
  async (usuario: Usuario, { rejectWithValue }) => {
    try {
      return await usuarioService.create(usuario);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao criar usuário');
    }
  }
);

export const updateUsuario = createAsyncThunk(
  'usuarios/update',
  async ({ id, usuario }: { id: string; usuario: Usuario }, { rejectWithValue }) => {
    try {
      return await usuarioService.update(id, usuario);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao atualizar usuário');
    }
  }
);

export const deleteUsuario = createAsyncThunk(
  'usuarios/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await usuarioService.delete(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao excluir usuário');
    }
  }
);

export const toggleAtivoUsuario = createAsyncThunk(
  'usuarios/toggleAtivo',
  async (id: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { usuarios: UsuarioState };
      const usuario = state.usuarios.usuarios.find(u => u._id === id);
      const novoStatus = usuario ? !usuario.ativo : true;
      return await usuarioService.alterarStatus(id, novoStatus);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao alterar status do usuário');
    }
  }
);

// Slice
const usuarioSlice = createSlice({
  name: 'usuarios',
  initialState,
  reducers: {
    clearUsuarioError: (state) => {
      state.error = null;
    },
    setSelectedUsuario: (state, action: PayloadAction<Usuario | null>) => {
      state.usuario = action.payload;
    },
    invalidateCache: (state) => {
      state.isDataLoaded = false;
      state.lastFetched = null;
      clearCachedData(CACHE_KEY);
    },
    resetUsuariosState: (state) => {
      state.usuarios = [];
      state.usuario = null;
      state.isDataLoaded = false;
      state.lastFetched = null;
      state.error = null;
      clearCachedData(CACHE_KEY);
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all
      .addCase(fetchUsuarios.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUsuarios.fulfilled, (state, action: PayloadAction<Usuario[]>) => {
        state.isLoading = false;
        state.usuarios = action.payload;
        state.lastFetched = new Date().toISOString();
        state.isDataLoaded = true;
        saveCachedData<Usuario[]>(CACHE_KEY, state.usuarios);
      })
      .addCase(fetchUsuarios.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch by id
      .addCase(fetchUsuarioById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUsuarioById.fulfilled, (state, action: PayloadAction<Usuario>) => {
        state.isLoading = false;
        state.usuario = action.payload;
      })
      .addCase(fetchUsuarioById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Create
      .addCase(createUsuario.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createUsuario.fulfilled, (state, action: PayloadAction<Usuario>) => {
        state.isLoading = false;
        state.usuarios.push(action.payload);
        saveCachedData<Usuario[]>(CACHE_KEY, state.usuarios);
      })
      .addCase(createUsuario.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Update
      .addCase(updateUsuario.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUsuario.fulfilled, (state, action: PayloadAction<Usuario>) => {
        state.isLoading = false;
        state.usuarios = state.usuarios.map(usuario =>
          usuario._id === action.payload._id ? action.payload : usuario
        );
        state.usuario = action.payload;
        saveCachedData<Usuario[]>(CACHE_KEY, state.usuarios);
      })
      .addCase(updateUsuario.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Delete
      .addCase(deleteUsuario.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteUsuario.fulfilled, (state, action: PayloadAction<string>) => {
        state.isLoading = false;
        state.usuarios = state.usuarios.filter(usuario => usuario._id !== action.payload);
        if (state.usuario && state.usuario._id === action.payload) {
          state.usuario = null;
        }
        saveCachedData<Usuario[]>(CACHE_KEY, state.usuarios);
      })
      .addCase(deleteUsuario.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Toggle Ativo
      .addCase(toggleAtivoUsuario.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(toggleAtivoUsuario.fulfilled, (state, action: PayloadAction<Usuario>) => {
        state.isLoading = false;
        state.usuarios = state.usuarios.map(usuario =>
          usuario._id === action.payload._id ? action.payload : usuario
        );
        if (state.usuario && state.usuario._id === action.payload._id) {
          state.usuario = action.payload;
        }
        saveCachedData<Usuario[]>(CACHE_KEY, state.usuarios);
      })
      .addCase(toggleAtivoUsuario.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Invalidar cache quando usuário fizer logout
      .addCase(logout.fulfilled, (state) => {
        state.usuarios = [];
        state.usuario = null;
        state.isDataLoaded = false;
        state.lastFetched = null;
        state.error = null;
        clearCachedData(CACHE_KEY);
      });
  },
});

export const { clearUsuarioError, setSelectedUsuario } = usuarioSlice.actions;
export default usuarioSlice.reducer;
