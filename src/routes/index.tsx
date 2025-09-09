import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import PrivateRoute from '../components/auth/PrivateRoute';

// Importar páginas que não têm implementação real ainda
import {
  NotFoundPage
} from './placeholders';

// Importação dos componentes reais
const DashboardPage = lazy(() => import('../pages/DashboardPage'));
const LivroFormPage = lazy(() => import('../pages/livros/LivroFormPage'));
const LivroDetailPage = lazy(() => import('../pages/livros/LivroDetailPage'));
const CategoriaFormPage = lazy(() => import('../pages/categorias/CategoriaFormPage'));
const UsuarioFormPage = lazy(() => import('../pages/usuarios/UsuarioFormPage'));
const UsuarioDetailPage = lazy(() => import('../pages/usuarios/UsuarioDetailPage'));
const EmprestimoFormPage = lazy(() => import('../pages/emprestimos/EmprestimoFormPage'));
const EmprestimoDetailPage = lazy(() => import('../pages/emprestimos/EmprestimoDetailPage'));
const ConfiguracoesPage = lazy(() => import('../pages/ConfiguracoesPage'));

// Componente de carregamento
const LoadingFallback = () => (
  <div className="flex-center" style={{ height: '100vh' }}>
    <p>Carregando...</p>
  </div>
);

// Lazy loading das páginas já implementadas
const LoginPage = lazy(() => import('../pages/LoginPage'));
const RegisterPage = lazy(() => import('../pages/RegisterPage'));
const ResetPasswordPage = lazy(() => import('../pages/ResetPasswordPage'));
const LivrosListPage = lazy(() => import('../pages/livros/LivrosListPage'));
const CategoriasListPage = lazy(() => import('../pages/categorias/CategoriasListPage'));
const UsuariosListPage = lazy(() => import('../pages/usuarios/UsuariosListPage'));
const EmprestimosListPage = lazy(() => import('../pages/emprestimos/EmprestimosListPage'));
const UnauthorizedPage = lazy(() => import('../pages/UnauthorizedPage'));
const ApiTestPage = lazy(() => import('../pages/ApiTest'));

const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Rotas públicas */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registro" element={<RegisterPage />} />
        <Route path="/recuperar-senha" element={<ResetPasswordPage />} />
        <Route path="/redefinir-senha/:token" element={<ResetPasswordPage />} />
        <Route path="/nao-autorizado" element={<UnauthorizedPage />} />
        
        {/* Rotas protegidas dentro do Layout */}
        <Route element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }>
          {/* Dashboard - acessível a todos os usuários autenticados */}
          <Route path="/" element={<DashboardPage />} />
          
          {/* Livros - visualização acessível a todos os usuários autenticados */}
          <Route path="/livros" element={<LivrosListPage />} />
          <Route path="/livros/:id" element={<LivroDetailPage />} />
          
          {/* Formulários de livros - apenas bibliotecários e admins */}
          <Route path="/livros/novo" element={
            <PrivateRoute requiredRole="admin">
              <LivroFormPage />
            </PrivateRoute>
          } />
          <Route path="/livros/editar/:id" element={
            <PrivateRoute requiredRole="admin">
              <LivroFormPage />
            </PrivateRoute>
          } />
          
          {/* Categorias - visualização acessível a todos os usuários autenticados */}
          <Route path="/categorias" element={<CategoriasListPage />} />
          
          {/* Formulários de categorias - apenas bibliotecários e admins */}
          <Route path="/categorias/nova" element={
            <PrivateRoute requiredRole="admin">
              <CategoriaFormPage />
            </PrivateRoute>
          } />
          <Route path="/categorias/editar/:id" element={
            <PrivateRoute requiredRole="admin">
              <CategoriaFormPage />
            </PrivateRoute>
          } />
          
          {/* Usuários - apenas bibliotecários e admins */}
          <Route path="/usuarios" element={
            <PrivateRoute requiredRole="admin">
              <UsuariosListPage />
            </PrivateRoute>
          } />
          <Route path="/usuarios/:id" element={
            <PrivateRoute requiredRole="admin">
              <UsuarioDetailPage />
            </PrivateRoute>
          } />
          <Route path="/usuarios/novo" element={
            <PrivateRoute requiredRole="admin">
              <UsuarioFormPage />
            </PrivateRoute>
          } />
          <Route path="/usuarios/editar/:id" element={
            <PrivateRoute requiredRole="admin">
              <UsuarioFormPage />
            </PrivateRoute>
          } />
          
          {/* Empréstimos - apenas bibliotecários e admins */}
          <Route path="/emprestimos" element={
            <PrivateRoute requiredRole="admin">
              <EmprestimosListPage />
            </PrivateRoute>
          } />
          <Route path="/emprestimos/:id" element={
            <PrivateRoute requiredRole="admin">
              <EmprestimoDetailPage />
            </PrivateRoute>
          } />
          <Route path="/emprestimos/novo" element={
            <PrivateRoute requiredRole="admin">
              <EmprestimoFormPage />
            </PrivateRoute>
          } />
          <Route path="/emprestimos/editar/:id" element={
            <PrivateRoute requiredRole="admin">
              <EmprestimoFormPage />
            </PrivateRoute>
          } />
          
          {/* Configurações - apenas admin */}
          <Route path="/configuracoes" element={
            <PrivateRoute requiredRole="admin">
              <ConfiguracoesPage />
            </PrivateRoute>
          } />
          
          {/* Página de teste da API */}
          <Route path="/api-test" element={
            <PrivateRoute requiredRole="admin">
              <ApiTestPage />
            </PrivateRoute>
          } />
          
          {/* Página 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
