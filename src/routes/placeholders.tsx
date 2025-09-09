import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const PlaceholderContainer = styled.div`
  padding: 20px;
`;

const Title = styled.h1`
  font-size: 1.75rem;
  margin-bottom: 20px;
`;

const Description = styled.p`
  margin-bottom: 20px;
  color: var(--light-text-color);
`;

const ActionContainer = styled.div`
  margin-top: 20px;
`;

interface PlaceholderPageProps {
  title: string;
  description: string;
  backLink?: string;
  backText?: string;
}

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({
  title,
  description,
  backLink = '/',
  backText = 'Voltar para a página inicial',
}) => {
  return (
    <PlaceholderContainer>
      <Card>
        <Title>{title}</Title>
        <Description>{description}</Description>
        <ActionContainer>
          <Button as={Link} to={backLink} variant="primary">
            {backText}
          </Button>
        </ActionContainer>
      </Card>
    </PlaceholderContainer>
  );
};

// Páginas placeholder para resolver erros de importação
export const DashboardPage: React.FC = () => (
  <PlaceholderPage 
    title="Dashboard" 
    description="Esta é a página de dashboard do sistema de biblioteca." 
  />
);

// Placeholder para páginas de livros
export const LivroDetailPage: React.FC = () => (
  <PlaceholderPage 
    title="Detalhes do Livro" 
    description="Aqui serão exibidos os detalhes do livro selecionado."
    backLink="/livros"
    backText="Voltar para a lista de livros"
  />
);

export const LivroFormPage: React.FC = () => (
  <PlaceholderPage 
    title="Formulário de Livro" 
    description="Formulário para adicionar ou editar um livro."
    backLink="/livros"
    backText="Voltar para a lista de livros"
  />
);

// Placeholder para páginas de categorias
export const CategoriaFormPage: React.FC = () => (
  <PlaceholderPage 
    title="Formulário de Categoria" 
    description="Formulário para adicionar ou editar uma categoria."
    backLink="/categorias"
    backText="Voltar para a lista de categorias"
  />
);

// Placeholder para páginas de usuários
export const UsuarioDetailPage: React.FC = () => (
  <PlaceholderPage 
    title="Detalhes do Usuário" 
    description="Aqui serão exibidos os detalhes do usuário selecionado."
    backLink="/usuarios"
    backText="Voltar para a lista de usuários"
  />
);

export const UsuarioFormPage: React.FC = () => (
  <PlaceholderPage 
    title="Formulário de Usuário" 
    description="Formulário para adicionar ou editar um usuário."
    backLink="/usuarios"
    backText="Voltar para a lista de usuários"
  />
);

// Placeholder para páginas de empréstimos
export const EmprestimoDetailPage: React.FC = () => (
  <PlaceholderPage 
    title="Detalhes do Empréstimo" 
    description="Aqui serão exibidos os detalhes do empréstimo selecionado."
    backLink="/emprestimos"
    backText="Voltar para a lista de empréstimos"
  />
);

export const EmprestimoFormPage: React.FC = () => (
  <PlaceholderPage 
    title="Formulário de Empréstimo" 
    description="Formulário para adicionar ou editar um empréstimo."
    backLink="/emprestimos"
    backText="Voltar para a lista de empréstimos"
  />
);

// Outras páginas
export const ConfiguracoesPage: React.FC = () => (
  <PlaceholderPage 
    title="Configurações" 
    description="Página de configurações do sistema."
  />
);

export const NotFoundPage: React.FC = () => (
  <PlaceholderPage 
    title="Página não encontrada" 
    description="A página que você está procurando não existe ou foi removida."
    backText="Voltar para a página inicial"
  />
);
