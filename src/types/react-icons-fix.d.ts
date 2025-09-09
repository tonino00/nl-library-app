import { IconType } from 'react-icons';
import * as React from 'react';

// Esta declaração permite que os ícones sejam usados diretamente em JSX
declare module 'react-icons/fi' {
  // Redefinir o tipo de exportação para componentes React
  export const FiHome: React.FC<{ size?: number | string; color?: string; className?: string }>;
  export const FiUsers: React.FC<{ size?: number | string; color?: string; className?: string }>;
  export const FiBook: React.FC<{ size?: number | string; color?: string; className?: string }>;
  export const FiFolder: React.FC<{ size?: number | string; color?: string; className?: string }>;
  export const FiSettings: React.FC<{ size?: number | string; color?: string; className?: string }>;
  export const FiEdit2: React.FC<{ size?: number | string; color?: string; className?: string }>;
  export const FiTrash2: React.FC<{ size?: number | string; color?: string; className?: string }>;
  export const FiPlus: React.FC<{ size?: number | string; color?: string; className?: string }>;
  export const FiSearch: React.FC<{ size?: number | string; color?: string; className?: string }>;
  export const FiX: React.FC<{ size?: number | string; color?: string; className?: string }>;
  export const FiMenu: React.FC<{ size?: number | string; color?: string; className?: string }>;
  export const FiArrowLeft: React.FC<{ size?: number | string; color?: string; className?: string }>;
  export const FiLogOut: React.FC<{ size?: number | string; color?: string; className?: string }>;
  export const FiRepeat: React.FC<{ size?: number | string; color?: string; className?: string }>;
  export const FiAlertTriangle: React.FC<{ size?: number | string; color?: string; className?: string }>;
  export const FiEye: React.FC<{ size?: number | string; color?: string; className?: string }>;
  export const FiCheck: React.FC<{ size?: number | string; color?: string; className?: string }>;
  export const FiSave: React.FC<{ size?: number | string; color?: string; className?: string }>;
  export const FiCalendar: React.FC<{ size?: number | string; color?: string; className?: string }>;
  export const FiMapPin: React.FC<{ size?: number | string; color?: string; className?: string }>;
  export const FiTag: React.FC<{ size?: number | string; color?: string; className?: string }>;
  export const FiLock: React.FC<{ size?: number | string; color?: string; className?: string }>;
  export const FiMail: React.FC<{ size?: number | string; color?: string; className?: string }>;
  export const FiPhone: React.FC<{ size?: number | string; color?: string; className?: string }>;
  export const FiFileText: React.FC<{ size?: number | string; color?: string; className?: string }>;
  export const FiToggleRight: React.FC<{ size?: number | string; color?: string; className?: string }>;
  export const FiToggleLeft: React.FC<{ size?: number | string; color?: string; className?: string }>;
  export const FiBarChart2: React.FC<{ size?: number | string; color?: string; className?: string }>;
  export const FiDatabase: React.FC<{ size?: number | string; color?: string; className?: string }>;
  export const FiRefreshCw: React.FC<{ size?: number | string; color?: string; className?: string }>;
}
