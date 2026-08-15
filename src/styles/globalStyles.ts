import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  :root {
    --primary-color: #2E5A88;
    --secondary-color: #5F8CAF;
    --accent-color: #F39C12;
    --background-color: #F8F9FA;
    --surface-color: #FFFFFF;
    --text-color: #333333;
    --light-text-color: #6C757D;
    --danger-color: #DC3545;
    --success-color: #28A745;
    --warning-color: #FFC107;
    --info-color: #17A2B8;
    --primary-hover-color: #244a6e;
    --secondary-hover-color: #4a7ca9;
    --success-hover-color: #218838;
    --danger-hover-color: #c82333;
    --warning-hover-color: #e0a800;
    --info-hover-color: #138496;
    --border-color: #DEE2E6;
    --hover-bg: #f1f3f5;
    --active-bg: #e8eef5;
    --disabled-bg: #f5f5f5;
    --table-header-bg: #f8f9fa;
    --table-striped-bg: rgba(0, 0, 0, 0.02);
    --table-hover-bg: rgba(46, 90, 136, 0.05);
    --pagination-bg: #f8f9fa;
    --pagination-button-bg: #ffffff;
    --pagination-button-hover-bg: #f0f0f0;

    /* Status tokens - text colors chosen for WCAG AA contrast on tinted backgrounds */
    --status-pending-bg: rgba(255, 193, 7, 0.18);
    --status-pending-text: #5C4300;
    --status-active-bg: rgba(23, 162, 184, 0.15);
    --status-active-text: #0A3A42;
    --status-success-bg: rgba(40, 167, 69, 0.15);
    --status-success-text: #0F401A;
    --status-danger-bg: rgba(220, 53, 69, 0.15);
    --status-danger-text: #5C161C;
    --status-urgent-bg: rgba(220, 53, 69, 0.15);
    --status-urgent-text: #5C161C;
    --status-neutral-bg: rgba(108, 117, 125, 0.15);
    --status-neutral-text: #3E4348;
    --box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    --border-radius: 8px;
    --transition: all 0.3s ease;
    --font-family: 'Nunito', sans-serif;

    /* Sidebar: gradiente escuro sobre a cor primária da marca */
    --sidebar-gradient-start: var(--primary-color);
    --sidebar-gradient-end: #142338;
    --sidebar-text: rgba(255, 255, 255, 0.85);
    --sidebar-text-muted: rgba(255, 255, 255, 0.5);
    --sidebar-hover-bg: rgba(255, 255, 255, 0.08);
    --sidebar-active-bg: rgba(255, 255, 255, 0.15);
    --sidebar-active-text: #ffffff;
    --sidebar-border: rgba(255, 255, 255, 0.12);
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: var(--font-family);
    background-color: var(--background-color);
    color: var(--text-color);
    line-height: 1.6;
  }

  a {
    color: var(--primary-color);
    text-decoration: none;
    transition: var(--transition);
    &:hover {
      color: var(--secondary-color);
    }
  }

  button {
    cursor: pointer;
  }

  .container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 15px;
  }

  .page-container {
    padding: 20px;
    min-height: calc(100vh - 64px); /* Altura da tela - altura do header */
  }

  .card {
    background-color: var(--surface-color);
    border-radius: var(--border-radius);
    box-shadow: var(--box-shadow);
    padding: 20px;
    margin-bottom: 20px;
  }

  .flex {
    display: flex;
  }

  .flex-center {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .flex-between {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .grid {
    display: grid;
    gap: 20px;
  }

  .text-center {
    text-align: center;
  }

  .mt-1 { margin-top: 0.5rem; }
  .mt-2 { margin-top: 1rem; }
  .mt-3 { margin-top: 1.5rem; }
  .mt-4 { margin-top: 2rem; }
  .mb-1 { margin-bottom: 0.5rem; }
  .mb-2 { margin-bottom: 1rem; }
  .mb-3 { margin-bottom: 1.5rem; }
  .mb-4 { margin-bottom: 2rem; }

  @media (prefers-color-scheme: dark) {
    :root {
      --primary-color: #5F8CAF;
      --secondary-color: #7da8c7;
      --accent-color: #f5b041;
      --background-color: #121212;
      --surface-color: #1e1e1e;
      --text-color: #e0e0e0;
      --light-text-color: #a0a0a0;
      --border-color: #333333;
      --box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
      --hover-bg: #2a2a2a;
      --active-bg: #2e3a4a;
      --disabled-bg: #2a2a2a;
      --table-header-bg: #2a2a2a;
      --table-striped-bg: rgba(255, 255, 255, 0.03);
      --table-hover-bg: rgba(95, 140, 175, 0.15);
      --pagination-bg: #2a2a2a;
      --pagination-button-bg: #1e1e1e;
      --pagination-button-hover-bg: #333333;

      --status-pending-bg: #3d2e05;
      --status-pending-text: #ffe066;
      --status-active-bg: #0a2e33;
      --status-active-text: #a5f3fc;
      --status-success-bg: #0d2e14;
      --status-success-text: #d1fae5;
      --status-danger-bg: #3d0a0f;
      --status-danger-text: #fda4af;
      --status-urgent-bg: #3d0a0f;
      --status-urgent-text: #fda4af;
      --status-neutral-bg: #2a2d30;
      --status-neutral-text: #cfd4d8;

      --sidebar-gradient-start: #1c2e42;
      --sidebar-gradient-end: #06090d;
      --sidebar-border: rgba(255, 255, 255, 0.08);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    * {
      transition: none !important;
    }
  }
`;

export default GlobalStyles;
