import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { FiMenu, FiX, FiUser } from "../../utils/iconFix";

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
  background-color: var(--surface-color);
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
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  cursor: pointer;
  color: var(--text-color);
  margin-right: 10px;
  transition: var(--transition);

  &:hover {
    background-color: var(--hover-bg);
  }

  &:focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
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


const AvatarPlaceholder = styled.div`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 3rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const ImagePreviewContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;



// Usamos React.FC<HeaderProps> para tipar corretamente os props
const Header: React.FC<HeaderProps> = ({ toggleSidebar, isSidebarOpen }) => {
  const { user } = useSelector((state: RootState) => state.auth);


  return (
    <HeaderContainer>
      <IconButton
        onClick={toggleSidebar}
        aria-label={isSidebarOpen ? 'Fechar menu' : 'Abrir menu'}
        aria-expanded={isSidebarOpen}
        aria-controls="main-sidebar"
      >
        {isSidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </IconButton>

      <Logo to="/">
        <span>Biblioteca NL</span>
      </Logo>

      {user && (
        <UserInfo>
          <UserName>{user.nome || "Usuário"}</UserName>
          {user.foto ? (
            <ImagePreviewContainer>
              <AvatarPlaceholder>
                <span style={{marginBottom: '12px'}}>
                   <FiUser size={16}/>
                </span>
              </AvatarPlaceholder>
            </ImagePreviewContainer>
          ) : (
            <Avatar>
              {user.nome && user.nome.charAt(0)
                ? user.nome.charAt(0).toUpperCase()
                : "?"}
            </Avatar>
          )}
        </UserInfo>
      )}
    </HeaderContainer>
  );
};

export default Header;
