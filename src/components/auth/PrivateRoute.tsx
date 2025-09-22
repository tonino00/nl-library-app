import React, { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import LoadingSpinner from '../ui/LoadingSpinner';
import styled from 'styled-components';
import { checkPermission, hasAnyPermission } from '../../services/permissionService';

type UserRole = 'admin' | 'leitor' | 'comunidade';

interface PrivateRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'leitor' | 'comunidade';
  requiredPermission?: string;
  requiredPermissions?: string[];
}

// Component to prevent navigation throttling by avoiding useEffect for auth checks
const PrivateRoute: React.FC<PrivateRouteProps> = ({ 
  children, 
  requiredRole,
  requiredPermission,
  requiredPermissions
}) => {
  const location = useLocation();
  
  // Get auth state directly from Redux store to avoid hooks that might cause navigation throttling
  const { user, isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth);
  
  // Direct check for token without relying on hooks
  const hasToken = sessionStorage.getItem('token') !== null;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: var(--background-color);
`;

  // Show loading only when auth is truly in progress
  if (isLoading) {
    return (
      <LoadingContainer>
        <LoadingSpinner 
          size="large" 
          showLogo={true}
          message="Carregando a biblioteca..."
        />
      </LoadingContainer>
    );
  }

  // Simple redirect if not authenticated
  if (!hasToken || !isAuthenticated) {
    // Use 'replace' to avoid browser history stacking
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Verificar permissão específica, se fornecida
  if (requiredPermission && user) {
    if (!checkPermission(user, requiredPermission)) {
      return <Navigate to="/nao-autorizado" replace />;
    }
  }
  
  // Verificar lista de permissões, se fornecida
  if (requiredPermissions && requiredPermissions.length > 0 && user) {
    if (!hasAnyPermission(user, requiredPermissions)) {
      return <Navigate to="/nao-autorizado" replace />;
    }
  }
  
  // Verificação de role para compatibilidade com código existente
  if (requiredRole && user) {
    const userRole = user.tipo;
    
    // Define role hierarchy com verificação mais flexível
    let hasAccess = false;
    
    if (requiredRole === 'leitor' || requiredRole === 'comunidade') {
      // Qualquer usuário autenticado pode acessar rotas de leitor ou comunidade
      hasAccess = true;
    } else if (requiredRole === 'admin') {
      // Para rotas de admin, verifica múltiplos formatos possíveis
      hasAccess = (
        userRole === 'admin' || 
        (typeof userRole === 'string' && userRole.toLowerCase() === 'admin')
      );
    }
    
    if (!hasAccess) {
      return <Navigate to="/nao-autorizado" replace />;
    }
  }

  // User is authenticated and has required permissions
  return <>{children}</>;
};

export default PrivateRoute;
