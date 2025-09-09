import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authService } from '../../services/authService';
import { AuthState, Usuario } from '../../types';

interface LoginCredentials {
  email: string;
  senha: string;
}

interface LoginResponse {
  user: Usuario;
  token: string;
}

// Estado inicial
const initialState: AuthState = {
  user: authService.getCurrentUser(),
  token: localStorage.getItem('token'),
  isAuthenticated: authService.isAuthenticated(),
  isLoading: false,
  error: null,
};

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao realizar login');
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async () => {
    authService.logout();
  }
);

export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      // Verifica se há token antes de fazer a chamada
      const token = localStorage.getItem('token');
      if (!token) {
        // Se não houver token, limpa o estado de autenticação e rejeita
        dispatch(logout());
        return rejectWithValue('Usuário não autenticado');
      }
      
      const user = await authService.checkAuth();
      return user;
    } catch (error: any) {
      // Se ocorrer um erro de autenticação, limpa os dados
      dispatch(logout());
      return rejectWithValue(error.response?.data?.message || 'Erro ao verificar autenticação');
    }
  },
  {
    // Adiciona condição para não executar a ação se já estiver em andamento
    condition: (_, { getState }) => {
      const { auth } = getState() as { auth: AuthState };
      return !auth.isLoading;
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData: Usuario, { rejectWithValue }) => {
    try {
      const response = await authService.register(userData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao realizar registro');
    }
  }
);

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        // A API pode retornar o usuário em diferentes propriedades
        const userData = action.payload.user || action.payload.usuario || action.payload.data;
        state.user = userData;
        state.token = action.payload.token;
        
        console.log('Auth Slice - Login Fulfilled:', { userData, token: action.payload.token });
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      })
      
      // Check Auth
      .addCase(checkAuth.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(checkAuth.fulfilled, (state, action: PayloadAction<Usuario>) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = action.payload as string;
      })
      
      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
