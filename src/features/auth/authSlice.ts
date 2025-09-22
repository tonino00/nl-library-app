import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authService } from '../../services/authService';
import { AuthState, Usuario } from '../../types';
import { sanitizeObject } from '../../utils/sanitize';
import { validatePassword } from '../../utils/passwordValidator';

interface LoginCredentials {
  email: string;
  senha: string;
}

interface LoginResponse {
  user: Usuario;
  token: string;
}

// Estender o tipo AuthState para incluir propriedades de segurança
interface SecurityEnhancedAuthState extends AuthState {
  loginAttempts: number;
  loginLockedUntil: number | null;
  lastLoginAttempt: number | null;
}

// Estado inicial
const initialState: SecurityEnhancedAuthState = {
  user: authService.getCurrentUser(),
  token: sessionStorage.getItem('token'),
  isAuthenticated: authService.isAuthenticated(),
  isLoading: false,
  error: null,
  loginAttempts: 0,
  loginLockedUntil: null,
  lastLoginAttempt: null
};

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue, getState }) => {
    // Obter o estado atual para verificar o bloqueio de login
    const state = getState() as { auth: SecurityEnhancedAuthState };
    const { loginAttempts, loginLockedUntil, lastLoginAttempt } = state.auth;
    
    // Verificar se o login está bloqueado
    if (loginLockedUntil && Date.now() < loginLockedUntil) {
      const minutesRemaining = Math.ceil((loginLockedUntil - Date.now()) / 60000);
      return rejectWithValue(`Muitas tentativas de login. Conta temporariamente bloqueada. Tente novamente em ${minutesRemaining} minuto(s).`);
    }
    
    // Verificar se há um delay entre tentativas (anti-brute force)
    if (lastLoginAttempt && Date.now() - lastLoginAttempt < 1000) { // 1 segundo entre tentativas
      return rejectWithValue('Por favor, aguarde um momento antes de tentar novamente.');
    }
    
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
      const token = sessionStorage.getItem('token');
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
      // Validar a força da senha
      if (userData.senha) {
        const passwordValidation = validatePassword(userData.senha);
        if (!passwordValidation.isValid) {
          return rejectWithValue(passwordValidation.message);
        }
      }
      
      // Sanitizar dados do usuário para evitar XSS
      const sanitizedUserData = sanitizeObject(userData);
      
      const response = await authService.register(sanitizedUserData);
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
        
        // Resetar contadores de segurança quando o login é bem-sucedido
        state.loginAttempts = 0;
        state.loginLockedUntil = null;
        state.lastLoginAttempt = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.lastLoginAttempt = Date.now();
        state.loginAttempts += 1;
        
        // Bloquear login após 5 tentativas falhas
        if (state.loginAttempts >= 5) {
          state.loginLockedUntil = Date.now() + 15 * 60 * 1000; // 15 minutos de bloqueio
          state.loginAttempts = 0;
        }
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
