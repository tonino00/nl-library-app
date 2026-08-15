import React from 'react';
import styled from 'styled-components';
import { NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { logout } from '../../features/auth/authSlice';
import { 
  FiHome, 
  FiBook, 
  FiFolder, 
  FiUsers, 
  FiRepeat, 
  FiSettings,
  FiLogOut
} from 'react-icons/fi';

interface SidebarProps {
  isOpen: boolean;
  // Chamado ao clicar num link — usado pra fechar o drawer no mobile.
  onNavigate?: () => void;
}

const SidebarContainer = styled.aside<{ $isOpen: boolean }>`
  position: fixed;
  top: 64px;
  left: 0;
  width: ${({ $isOpen }) => ($isOpen ? '250px' : '70px')};
  height: calc(100vh - 64px);
  background: linear-gradient(180deg, var(--sidebar-gradient-start) 0%, var(--sidebar-gradient-end) 100%);
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
  transition: width 0.3s ease;
  overflow-y: auto;
  z-index: 90;

  @media (max-width: 768px) {
    width: 250px;
    transform: translateX(${({ $isOpen }) => ($isOpen ? '0' : '-100%')});
    transition: transform 0.3s ease;
    box-shadow: ${({ $isOpen }) => ($isOpen ? '2px 0 8px rgba(0, 0, 0, 0.25)' : 'none')};
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const NavList = styled.ul`
  list-style: none;
  padding: 20px 0;
  display: flex;
  flex-direction: column;
  min-height: calc(100% - 40px);
`;

const NavItem = styled.li`
  margin-bottom: 5px;
`;

const StyledNavLink = styled(NavLink)<{ $isopen: string }>`
  display: flex;
  align-items: center;
  padding: 12px 15px;
  color: var(--sidebar-text);
  text-decoration: none;
  transition: var(--transition);
  border-radius: 6px;
  margin: 0 10px;

  &:hover {
    background-color: var(--sidebar-hover-bg);
    color: var(--sidebar-active-text);
  }

  &:focus-visible {
    outline: 2px solid #ffffff;
    outline-offset: -2px;
    border-radius: 6px;
  }

  &.active {
    background-color: var(--sidebar-active-bg);
    color: var(--sidebar-active-text);
    font-weight: 600;
  }

  svg {
    min-width: 20px;
    margin-right: ${({ $isopen }) => ($isopen === 'true' ? '12px' : '0')};
  }
  
  span {
    white-space: nowrap;
    opacity: ${({ $isopen }) => ($isopen === 'true' ? 1 : 0)};
    visibility: ${({ $isopen }) => ($isopen === 'true' ? 'visible' : 'hidden')};
    transition: opacity 0.2s ease, visibility 0.2s ease;
  }
`;

const SectionTitle = styled.div<{ $isopen: string }>`
  margin: 8px 15px 4px;
  padding: 12px 10px 4px;
  border-top: 1px solid var(--sidebar-border);
  color: var(--sidebar-text-muted);
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  display: ${({ $isopen }) => ($isopen === 'true' ? 'block' : 'none')};
`;

const LogoutButton = styled.button<{ $isopen: string }>`
  display: flex;
  align-items: center;
  width: calc(100% - 20px);
  margin: 10px;
  padding: 12px 15px;
  border: none;
  background-color: rgba(220, 53, 69, 0.25);
  color: #ffb3ba;
  border-radius: 6px;
  font-family: inherit;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: var(--danger-color);
    color: white;
  }

  &:focus-visible {
    outline: 2px solid #ffffff;
    outline-offset: 2px;
  }

  svg {
    min-width: 20px;
    margin-right: ${({ $isopen }) => ($isopen === 'true' ? '12px' : '0')};
  }
  
  span {
    white-space: nowrap;
    opacity: ${({ $isopen }) => ($isopen === 'true' ? 1 : 0)};
    visibility: ${({ $isopen }) => ($isopen === 'true' ? 'visible' : 'hidden')};
    transition: opacity 0.2s ease, visibility 0.2s ease;
  }
`;

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onNavigate }) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  // Verificar se o usuário é admin ou leitor, com segurança de tipo
  const userType = user?.tipo as string | undefined;
  const isAdmin = !!user && (
    userType === 'admin' ||
    (typeof userType === 'string' && userType.toLowerCase() === 'admin')
  );


  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  // Só fecha o drawer no mobile; no desktop a sidebar permanece aberta ao navegar.
  const handleNavClick = () => {
    if (window.innerWidth <= 768) {
      onNavigate?.();
    }
  };
  
  return (
    <SidebarContainer id="main-sidebar" $isOpen={isOpen}>
      <NavList>
       
          <NavItem>
            <StyledNavLink to="/" $isopen={isOpen.toString()} onClick={handleNavClick}>
              <FiHome size={20} />
              <span>Dashboard</span>
            </StyledNavLink>
          </NavItem>
    

        <SectionTitle $isopen={isOpen.toString()}>Catálogo</SectionTitle>
        
        <NavItem>
          <StyledNavLink to="/livros" $isopen={isOpen.toString()} onClick={handleNavClick}>
            <FiBook size={20} />
            <span>Livros</span>
          </StyledNavLink>
        </NavItem>
        
        {isAdmin && (
          <NavItem>
            <StyledNavLink to="/categorias" $isopen={isOpen.toString()} onClick={handleNavClick}>
              <FiFolder size={20} />
              <span>Categorias</span>
            </StyledNavLink>
          </NavItem>
        )}

        {isAdmin && (
          <>
            <SectionTitle $isopen={isOpen.toString()}>Gerenciamento</SectionTitle>
            
            <NavItem>
              <StyledNavLink to="/emprestimos" $isopen={isOpen.toString()} onClick={handleNavClick}>
                <FiRepeat size={20} />
                <span>Empréstimos</span>
              </StyledNavLink>
            </NavItem>
            
            <NavItem>
              <StyledNavLink to="/usuarios" $isopen={isOpen.toString()} onClick={handleNavClick}>
                <FiUsers size={20} />
                <span>Usuários</span>
              </StyledNavLink>
            </NavItem>
          </>
        )}

        {isAdmin && (
          <>
            <SectionTitle $isopen={isOpen.toString()}>Administração</SectionTitle>

            <NavItem>
              <StyledNavLink to="/configuracoes" $isopen={isOpen.toString()} onClick={handleNavClick}>
                <FiSettings size={20} />
                <span>Configurações</span>
              </StyledNavLink>
            </NavItem>
          </>
        )}
        
        {/* Logout Button - Always visible at the bottom */}
        <div style={{ marginTop: 'auto', padding: '20px 0' }}>
          <SectionTitle $isopen={isOpen.toString()}>Conta</SectionTitle>
          <LogoutButton onClick={handleLogout} $isopen={isOpen.toString()}>
            <FiLogOut size={20} />
            <span>Sair</span>
          </LogoutButton>
        </div>
      </NavList>
    </SidebarContainer>
  );
};

export default Sidebar;
