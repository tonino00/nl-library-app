import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { usuarioService } from '../../services/usuarioService';
import { Usuario, UsuarioState } from '../../types';

// Estado inicial
const initialState: UsuarioState = {
  usuarios: [],
  usuario: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchUsuarios = createAsyncThunk(
  'usuarios/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
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
      })
      .addCase(toggleAtivoUsuario.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearUsuarioError, setSelectedUsuario } = usuarioSlice.actions;
export default usuarioSlice.reducer;
