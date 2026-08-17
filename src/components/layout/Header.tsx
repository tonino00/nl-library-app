import React, { useState } from "react";
import styled from "styled-components";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../store";
import { FiMenu, FiX, FiUser, FiSettings, FiLogOut, FiChevronDown } from "../../utils/iconFix";
import { logout } from "../../features/auth/authSlice";
import DropdownMenu, { DropdownMenuItem } from "../ui/DropdownMenu";

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
  flex-shrink: 0;

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

const UserMenuTrigger = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: auto;
  padding: 6px 10px 6px 6px;
  border: none;
  background: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  min-height: 44px;
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

const UserName = styled.span`
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--text-color);

  @media (max-width: 576px) {
    display: none;
  }
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
  overflow: hidden;
  flex-shrink: 0;
`;

const AvatarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const ChevronIcon = styled(FiChevronDown)`
  color: var(--light-text-color);

  @media (max-width: 576px) {
    display: none;
  }
`;

// Iniciais/ícone como fallback: se a URL da foto falhar, evita o ícone de
// imagem quebrada do navegador (mesmo padrão usado nas capas de livro).
const AvatarContent: React.FC<{ foto?: string; nome?: string }> = ({ foto, nome }) => {
  const [failed, setFailed] = useState(false);

  if (foto && !failed) {
    return <AvatarImage src={foto} alt="" onError={() => setFailed(true)} />;
  }
  if (nome && nome.charAt(0)) {
    return <>{nome.charAt(0).toUpperCase()}</>;
  }
  return <FiUser size={16} />;
};

// Usamos React.FC<HeaderProps> para tipar corretamente os props
const Header: React.FC<HeaderProps> = ({ toggleSidebar, isSidebarOpen }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();


  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const menuItems: DropdownMenuItem[] = [
    {
      label: "Configurações",
      icon: <FiSettings size={16} />,
      onClick: () => navigate("/configuracoes"),
    },
    {
      label: "Sair",
      icon: <FiLogOut size={16} />,
      variant: "danger",
      onClick: handleLogout,
    },
  ];

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
        <DropdownMenu
          triggerLabel={`Menu de ${user.nome || "usuário"}`}
          items={menuItems}
          renderTrigger={({ triggerRef, onClick, isOpen }) => (
            <UserMenuTrigger
              ref={triggerRef}
              type="button"
              onClick={onClick}
              aria-haspopup="menu"
              aria-expanded={isOpen}
              aria-label={`Menu de ${user.nome || "usuário"}`}
            >
              <Avatar>
                <AvatarContent foto={user.foto} nome={user.nome} />
              </Avatar>
              <UserName>{user.nome || "Usuário"}</UserName>
              <ChevronIcon size={16} />
            </UserMenuTrigger>
          )}
        />
      )}
    </HeaderContainer>
  );
};

export default Header;
