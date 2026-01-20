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
}

const SidebarContainer = styled.aside<{ $isOpen: boolean }>`
  position: fixed;
  top: 64px;
  left: 0;
  width: ${({ $isOpen }) => ($isOpen ? '250px' : '70px')};
  height: calc(100vh - 64px);
  background-color: white;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.05);
  transition: width 0.3s ease;
  overflow-y: auto;
  z-index: 90;
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
  color: var(--text-color);
  text-decoration: none;
  transition: var(--transition);
  border-radius: 6px;
  margin: 0 10px;
  
  &:hover {
    background-color: rgba(46, 90, 136, 0.05);
  }
  
  &.active {
    background-color: rgba(46, 90, 136, 0.1);
    color: var(--primary-color);
    font-weight: 500;
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
  padding: 12px 25px;
  color: var(--light-text-color);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 500;
  display: ${({ $isopen }) => ($isopen === 'true' ? 'block' : 'none')};
`;

const LogoutButton = styled.button<{ $isopen: string }>`
  display: flex;
  align-items: center;
  width: calc(100% - 20px);
  margin: 10px;
  padding: 12px 15px;
  border: none;
  background-color: #f8d7da;
  color: #dc3545;
  border-radius: 6px;
  font-family: inherit;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #dc3545;
    color: white;
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

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
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
  
  return (
    <SidebarContainer $isOpen={isOpen}>
      <NavList>
       
          <NavItem>
            <StyledNavLink to="/" $isopen={isOpen.toString()}>
              <FiHome size={20} />
              <span>Dashboard</span>
            </StyledNavLink>
          </NavItem>
    

        <SectionTitle $isopen={isOpen.toString()}>Catálogo</SectionTitle>
        
        <NavItem>
          <StyledNavLink to="/livros" $isopen={isOpen.toString()}>
            <FiBook size={20} />
            <span>Livros</span>
          </StyledNavLink>
        </NavItem>
        
        {isAdmin && (
          <NavItem>
            <StyledNavLink to="/categorias" $isopen={isOpen.toString()}>
              <FiFolder size={20} />
              <span>Categorias</span>
            </StyledNavLink>
          </NavItem>
        )}

        {isAdmin && (
          <>
            <SectionTitle $isopen={isOpen.toString()}>Gerenciamento</SectionTitle>
            
            <NavItem>
              <StyledNavLink to="/emprestimos" $isopen={isOpen.toString()}>
                <FiRepeat size={20} />
                <span>Empréstimos</span>
              </StyledNavLink>
            </NavItem>
            
            <NavItem>
              <StyledNavLink to="/usuarios" $isopen={isOpen.toString()}>
                <FiUsers size={20} />
                <span>Usuários</span>
              </StyledNavLink>
            </NavItem>
          </>
        )}

        {isAdmin && (
          <>
            <SectionTitle $isopen={isOpen.toString()}>Administração</SectionTitle>
            
            {/* <NavItem>
              <StyledNavLink to="/dashboard" $isopen={isOpen.toString()}>
                <FiBarChart2 size={20} />
                <span>Dashboard</span>
              </StyledNavLink>
            </NavItem> */}
            
            <NavItem>
              <StyledNavLink to="/configuracoes" $isopen={isOpen.toString()}>
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
