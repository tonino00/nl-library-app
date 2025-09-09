import { useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { checkAuth, logout } from '../features/auth/authSlice';
import { RootState, AppDispatch } from '../store';

/**
 * Hook otimizado para evitar problemas de throttling de navegação
 * Remove chamadas automáticas ao checkAuth para evitar loop infinito
 */
export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, error } = useSelector((state: RootState) => state.auth);
  
  // Usar ref para evitar multiplas chamadas de verificação
  const authCheckedRef = useRef<boolean>(false);

  /**
   * Realiza logout do usuário
   */
  const handleLogout = useCallback(() => {
    dispatch(logout());
    navigate('/login');
    authCheckedRef.current = false;
  }, [dispatch, navigate]);

  /**
   * Verifica autenticação apenas quando chamado explicitamente
   * e apenas se não tiver sido verificado antes
   */
  const verifyAuth = useCallback(() => {
    const hasToken = localStorage.getItem('token');
    if (hasToken && !authCheckedRef.current && !isLoading) {
      dispatch(checkAuth());
      authCheckedRef.current = true;
    }
  }, [dispatch, isLoading]);

  // Não usamos useEffect aqui para evitar throttling de navegação

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    logout: handleLogout,
    verifyAuth
  };
};

export default useAuth;
