import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider, useDispatch } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { store, AppDispatch } from './store';
import AppRoutes from './routes';
import GlobalStyles from './styles/globalStyles';
import { checkAuth } from './features/auth/authSlice';

// Componente interno para verificar autenticação
const AuthChecker: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    // Verifica se o usuário está autenticado ao carregar a aplicação
    if (localStorage.getItem('token')) {
      dispatch(checkAuth());
    }
  }, [dispatch]);

  return <>{children}</>;
};

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AuthChecker>
          <GlobalStyles />
          <AppRoutes />
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </AuthChecker>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
