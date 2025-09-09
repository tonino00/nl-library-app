import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../features/auth/authSlice';
import { RootState, AppDispatch } from '../../store';
import { FiMenu, FiX, FiLogOut, FiUser } from '../../utils/iconFix';

interface HeaderProps {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
}

const HeaderContainer = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 64px;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  padding: 0 20px;
  z-index: 100;
`;

const Logo = styled(Link)`
  display: flex;
  align-items: center;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-color);
  text-decoration: none;
  margin-right: auto;

  span {
    margin-left: 10px;
  }
`;

const IconButton = styled.button`
  background: none;
  border: none;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  cursor: pointer;
  color: var(--text-color);
  margin-right: 10px;
  transition: var(--transition);

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const UserName = styled.span`
  font-weight: 500;
  font-size: 0.875rem;
`;

const Avatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: var(--primary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
`;

const Header: React.FC<HeaderProps> = ({ toggleSidebar, isSidebarOpen }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <HeaderContainer>
      <IconButton onClick={toggleSidebar} aria-label="Menu">
        {isSidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </IconButton>
      
      <Logo to="/">
        <span>Biblioteca NL</span>
      </Logo>
      
      {user && (
        <UserInfo>
          <UserName>{user.nome}</UserName>
          {user.foto ? (
            <img src={user.foto} alt={user.nome} width="36" height="36" style={{ borderRadius: '50%' }} />
          ) : (
            <Avatar>
              {user.nome.charAt(0).toUpperCase()}
            </Avatar>
          )}
          <IconButton onClick={handleLogout} aria-label="Sair">
            <FiLogOut size={20} />
          </IconButton>
        </UserInfo>
      )}
    </HeaderContainer>
  );
};

export default Header;
