import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import useAuth from '../../hooks/useAuth';

interface PrivateRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'bibliotecario' | 'leitor';
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const location = useLocation();
  const { isAuthenticated, user, isLoading, verifyAuth } = useAuth();

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      verifyAuth();
    }
  }, [isAuthenticated, isLoading, verifyAuth]);

  if (isLoading) {
    // Exibir um componente de carregamento enquanto verifica a autenticação
    return (
      <div className="flex-center" style={{ height: '100vh' }}>
        <p>Carregando...</p>
      </div>
    );
  }

  // Se não estiver autenticado, redirecionar para a página de login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Se houver requisito de função específica
  if (requiredRole && user) {
    // Bibliotecários também podem acessar recursos de leitor
    if (requiredRole === 'leitor' && 
        (user.tipo === 'leitor' || user.tipo === 'bibliotecario' || user.tipo === 'admin')) {
      return <>{children}</>;
    }
    
    // Admins podem acessar recursos de bibliotecários
    if (requiredRole === 'bibliotecario' && 
        (user.tipo === 'bibliotecario' || user.tipo === 'admin')) {
      return <>{children}</>;
    }
    
    // Somente admins podem acessar recursos de admin
    if (requiredRole === 'admin' && user.tipo === 'admin') {
      return <>{children}</>;
    }
    
    // Sem permissão adequada, redirecionar para a página não autorizada
    return <Navigate to="/nao-autorizado" replace />;
  }

  // Usuário está autenticado e tem as permissões necessárias
  return <>{children}</>;
};

export default PrivateRoute;
