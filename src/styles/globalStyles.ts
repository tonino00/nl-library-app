import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  :root {
    --primary-color: #2E5A88;
    --secondary-color: #5F8CAF;
    --accent-color: #F39C12;
    --background-color: #F8F9FA;
    --text-color: #333333;
    --light-text-color: #6C757D;
    --danger-color: #DC3545;
    --success-color: #28A745;
    --warning-color: #FFC107;
    --info-color: #17A2B8;
    --border-color: #DEE2E6;
    --box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    --border-radius: 8px;
    --transition: all 0.3s ease;
    --font-family: 'Roboto', sans-serif;
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
    background: white;
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
`;

export default GlobalStyles;
