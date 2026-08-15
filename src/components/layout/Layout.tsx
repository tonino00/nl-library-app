import React, { Suspense, useState } from 'react';
import styled from 'styled-components';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import LoadingSpinner from '../ui/LoadingSpinner';

const LayoutContainer = styled.div`
  display: flex;
  min-height: 100vh;
`;

// Define a interface para o styled component para evitar o warning de prop
interface ContentProps {
  $isSidebarOpen: boolean;
}

const Content = styled.main<ContentProps>`
  flex: 1;
  margin-left: ${({ $isSidebarOpen }) => ($isSidebarOpen ? '250px' : '70px')};
  transition: margin-left 0.3s ease;
  padding: 20px;
  background-color: var(--background-color);
  min-height: calc(100vh - 64px);
  margin-top: 64px;

  @media (max-width: 768px) {
    margin-left: 0;
    padding: 16px;
    transition: none;
  }
`;

// Ocupa a área de conteúdo enquanto uma página troca de rota, sem empurrar o
// layout (altura mínima igual à de uma tela cheia de conteúdo).
const ContentLoading = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
`;

// Fundo escurecido atrás da sidebar no mobile, onde ela vira um drawer sobre
// o conteúdo: só existe abaixo de 768px, e fecha a sidebar ao ser tocado.
const Backdrop = styled.div<{ $visible: boolean }>`
  display: none;

  @media (max-width: 768px) {
    display: block;
    position: fixed;
    inset: 0;
    top: 64px;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 85;
    opacity: ${({ $visible }) => ($visible ? 1 : 0)};
    visibility: ${({ $visible }) => ($visible ? 'visible' : 'hidden')};
    transition: opacity 0.3s ease, visibility 0.3s ease;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const Layout: React.FC = () => {
  // No mobile a sidebar é um drawer sobre o conteúdo: começa fechada. No
  // desktop começa aberta, como sempre foi.
  const [isSidebarOpen, setIsSidebarOpen] = useState(
    () => typeof window === 'undefined' || window.innerWidth > 768
  );

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <LayoutContainer>
      <Header toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
      <Sidebar isOpen={isSidebarOpen} onNavigate={closeSidebar} />
      <Backdrop $visible={isSidebarOpen} onClick={closeSidebar} aria-hidden="true" />
      <Content $isSidebarOpen={isSidebarOpen}>
        <div className="container">
          <Suspense
            fallback={
              <ContentLoading>
                <LoadingSpinner size="large" showLogo={false} message="Carregando..." />
              </ContentLoading>
            }
          >
            <Outlet />
          </Suspense>
        </div>
      </Content>
    </LayoutContainer>
  );
};

export default Layout;
