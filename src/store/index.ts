import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import categoriaReducer from '../features/categorias/categoriaSlice';
import livroReducer from '../features/livros/livroSlice';
import usuarioReducer from '../features/usuarios/usuarioSlice';
import emprestimoReducer from '../features/emprestimos/emprestimoSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    categorias: categoriaReducer,
    livros: livroReducer,
    usuarios: usuarioReducer,
    emprestimos: emprestimoReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
