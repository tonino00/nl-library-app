import React from 'react';
import { 
  FiUser as OrigFiUser,
  FiUsers as OrigFiUsers,
  FiBook as OrigFiBook,
  FiFolder as OrigFiFolder,
  FiSettings as OrigFiSettings,
  FiEdit2 as OrigFiEdit2,
  FiTrash2 as OrigFiTrash2,
  FiPlus as OrigFiPlus,
  FiSearch as OrigFiSearch,
  FiX as OrigFiX,
  FiMenu as OrigFiMenu,
  FiArrowLeft as OrigFiArrowLeft,
  FiLogOut as OrigFiLogOut,
  FiRepeat as OrigFiRepeat,
  FiAlertTriangle as OrigFiAlertTriangle,
  FiEye as OrigFiEye,
  FiCheck as OrigFiCheck,
  FiSave as OrigFiSave,
  FiCalendar as OrigFiCalendar,
  FiMapPin as OrigFiMapPin,
  FiTag as OrigFiTag,
  FiLock as OrigFiLock,
  FiMail as OrigFiMail,
  FiPhone as OrigFiPhone,
  FiFileText as OrigFiFileText,
  FiToggleRight as OrigFiToggleRight,
  FiToggleLeft as OrigFiToggleLeft,
  FiBarChart2 as OrigFiBarChart2,
  FiDatabase as OrigFiDatabase,
  FiRefreshCw as OrigFiRefreshCw
} from 'react-icons/fi';

// Tipo de props para ícones
type IconProps = {
  size?: number;
  color?: string;
  className?: string;
};

// Componentes wrapper para resolver o erro de tipagem
export const FiUser: React.FC<IconProps> = (props) => <span>{React.createElement(OrigFiUser, props)}</span>;
export const FiUsers: React.FC<IconProps> = (props) => <span>{React.createElement(OrigFiUsers, props)}</span>;
export const FiBook: React.FC<IconProps> = (props) => <span>{React.createElement(OrigFiBook, props)}</span>;
export const FiFolder: React.FC<IconProps> = (props) => <span>{React.createElement(OrigFiFolder, props)}</span>;
export const FiSettings: React.FC<IconProps> = (props) => <span>{React.createElement(OrigFiSettings, props)}</span>;
export const FiEdit2: React.FC<IconProps> = (props) => <span>{React.createElement(OrigFiEdit2, props)}</span>;
export const FiTrash2: React.FC<IconProps> = (props) => <span>{React.createElement(OrigFiTrash2, props)}</span>;
export const FiPlus: React.FC<IconProps> = (props) => <span>{React.createElement(OrigFiPlus, props)}</span>;
export const FiSearch: React.FC<IconProps> = (props) => <span>{React.createElement(OrigFiSearch, props)}</span>;
export const FiX: React.FC<IconProps> = (props) => <span>{React.createElement(OrigFiX, props)}</span>;
export const FiMenu: React.FC<IconProps> = (props) => <span>{React.createElement(OrigFiMenu, props)}</span>;
export const FiArrowLeft: React.FC<IconProps> = (props) => <span>{React.createElement(OrigFiArrowLeft, props)}</span>;
export const FiLogOut: React.FC<IconProps> = (props) => <span>{React.createElement(OrigFiLogOut, props)}</span>;
export const FiRepeat: React.FC<IconProps> = (props) => <span>{React.createElement(OrigFiRepeat, props)}</span>;
export const FiAlertTriangle: React.FC<IconProps> = (props) => <span>{React.createElement(OrigFiAlertTriangle, props)}</span>;
export const FiEye: React.FC<IconProps> = (props) => <span>{React.createElement(OrigFiEye, props)}</span>;
export const FiCheck: React.FC<IconProps> = (props) => <span>{React.createElement(OrigFiCheck, props)}</span>;
export const FiSave: React.FC<IconProps> = (props) => <span>{React.createElement(OrigFiSave, props)}</span>;
export const FiCalendar: React.FC<IconProps> = (props) => <span>{React.createElement(OrigFiCalendar, props)}</span>;
export const FiMapPin: React.FC<IconProps> = (props) => <span>{React.createElement(OrigFiMapPin, props)}</span>;
export const FiTag: React.FC<IconProps> = (props) => <span>{React.createElement(OrigFiTag, props)}</span>;
export const FiLock: React.FC<IconProps> = (props) => <span>{React.createElement(OrigFiLock, props)}</span>;
export const FiMail: React.FC<IconProps> = (props) => <span>{React.createElement(OrigFiMail, props)}</span>;
export const FiPhone: React.FC<IconProps> = (props) => <span>{React.createElement(OrigFiPhone, props)}</span>;
export const FiFileText: React.FC<IconProps> = (props) => <span>{React.createElement(OrigFiFileText, props)}</span>;
export const FiToggleRight: React.FC<IconProps> = (props) => <span>{React.createElement(OrigFiToggleRight, props)}</span>;
export const FiToggleLeft: React.FC<IconProps> = (props) => <span>{React.createElement(OrigFiToggleLeft, props)}</span>;
export const FiBarChart2: React.FC<IconProps> = (props) => <span>{React.createElement(OrigFiBarChart2, props)}</span>;
export const FiDatabase: React.FC<IconProps> = (props) => <span>{React.createElement(OrigFiDatabase, props)}</span>;
export const FiRefreshCw: React.FC<IconProps> = (props) => <span>{React.createElement(OrigFiRefreshCw, props)}</span>;
