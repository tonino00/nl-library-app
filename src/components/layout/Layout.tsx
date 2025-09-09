import React, { useState } from 'react';
import styled from 'styled-components';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

const LayoutContainer = styled.div`
  display: flex;
  min-height: 100vh;
`;

const Content = styled.main<{ isSidebarOpen: boolean }>`
  flex: 1;
  margin-left: ${({ isSidebarOpen }) => (isSidebarOpen ? '250px' : '70px')};
  transition: margin-left 0.3s ease;
  padding: 20px;
  background-color: var(--background-color);
  min-height: calc(100vh - 64px);
  margin-top: 64px;
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
      <Content isSidebarOpen={isSidebarOpen}>
        <div className="container">
          <Outlet />
        </div>
      </Content>
    </LayoutContainer>
  );
};

export default Layout;
