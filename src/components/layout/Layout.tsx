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

const Layout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <LayoutContainer>
      <Header toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
      <Sidebar isOpen={isSidebarOpen} />
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
