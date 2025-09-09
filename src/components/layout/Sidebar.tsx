import React from 'react';
import styled from 'styled-components';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { 
  FiHome, 
  FiBook, 
  FiFolder, 
  FiUsers, 
  FiRepeat, 
  FiSettings,
  FiBarChart2
} from 'react-icons/fi';

interface SidebarProps {
  isOpen: boolean;
}

const SidebarContainer = styled.aside<{ isOpen: boolean }>`
  position: fixed;
  top: 64px;
  left: 0;
  width: ${({ isOpen }) => (isOpen ? '250px' : '70px')};
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

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const isAdmin = user && user.tipo === 'admin';
  const isBibliotecario = user && (user.tipo === 'bibliotecario' || user.tipo === 'admin');
  
  return (
    <SidebarContainer isOpen={isOpen}>
      <NavList>
        <NavItem>
          <StyledNavLink to="/" $isopen={isOpen.toString()}>
            <FiHome size={20} />
            <span>Início</span>
          </StyledNavLink>
        </NavItem>

        <SectionTitle $isopen={isOpen.toString()}>Catálogo</SectionTitle>
        
        <NavItem>
          <StyledNavLink to="/livros" $isopen={isOpen.toString()}>
            <FiBook size={20} />
            <span>Livros</span>
          </StyledNavLink>
        </NavItem>
        
        <NavItem>
          <StyledNavLink to="/categorias" $isopen={isOpen.toString()}>
            <FiFolder size={20} />
            <span>Categorias</span>
          </StyledNavLink>
        </NavItem>

        {isBibliotecario && (
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
            
            <NavItem>
              <StyledNavLink to="/dashboard" $isopen={isOpen.toString()}>
                <FiBarChart2 size={20} />
                <span>Dashboard</span>
              </StyledNavLink>
            </NavItem>
            
            <NavItem>
              <StyledNavLink to="/configuracoes" $isopen={isOpen.toString()}>
                <FiSettings size={20} />
                <span>Configurações</span>
              </StyledNavLink>
            </NavItem>
          </>
        )}
      </NavList>
    </SidebarContainer>
  );
};

export default Sidebar;
