import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { checkAuth, logout } from '../features/auth/authSlice';
import { RootState, AppDispatch } from '../store';

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, error } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const verifyAuth = () => {
    if (localStorage.getItem('token')) {
      dispatch(checkAuth());
    }
  };

  useEffect(() => {
    verifyAuth();
  }, []);

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
