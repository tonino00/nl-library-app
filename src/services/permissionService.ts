import { Usuario } from '../types';

// Definir um conjunto de permissões para cada tipo de usuário
const rolePermissions = {
  admin: [
    'livros:read', 'livros:write', 'livros:delete',
    'categorias:read', 'categorias:write', 'categorias:delete',
    'usuarios:read', 'usuarios:write', 'usuarios:delete',
    'emprestimos:read', 'emprestimos:write', 'emprestimos:delete',
    'configuracoes:read', 'configuracoes:write'
  ],
  leitor: [
    'livros:read',
    'categorias:read',
    'perfil:read', 'perfil:write'
  ],
  comunidade: [
    'livros:read',
    'categorias:read',
    'perfil:read', 'perfil:write'
  ]
};

/**
 * Verifica se o usuário possui uma permissão específica
 * @param user O objeto de usuário atual
 * @param requiredPermission A permissão necessária no formato 'recurso:ação'
 * @returns true se o usuário tiver permissão, false caso contrário
 */
export const checkPermission = (user: Usuario | null, requiredPermission: string): boolean => {
  if (!user || !user.tipo) return false;
  
  const userType = user.tipo.toLowerCase();
  const permissions = rolePermissions[userType as keyof typeof rolePermissions] || [];
  
  return permissions.includes(requiredPermission);
};

/**
 * Verifica se o usuário possui qualquer uma das permissões especificadas
 * @param user O objeto de usuário atual
 * @param requiredPermissions Array de permissões
 * @returns true se o usuário tiver pelo menos uma das permissões, false caso contrário
 */
export const hasAnyPermission = (user: Usuario | null, requiredPermissions: string[]): boolean => {
  if (!user || !user.tipo) return false;
  
  const userType = user.tipo.toLowerCase();
  const permissions = rolePermissions[userType as keyof typeof rolePermissions] || [];
  
  return requiredPermissions.some(permission => permissions.includes(permission));
};

/**
 * Obtém todas as permissões do usuário
 * @param user O objeto de usuário atual
 * @returns Array com todas as permissões do usuário
 */
export const getUserPermissions = (user: Usuario | null): string[] => {
  if (!user || !user.tipo) return [];
  
  const userType = user.tipo.toLowerCase();
  return rolePermissions[userType as keyof typeof rolePermissions] || [];
};
