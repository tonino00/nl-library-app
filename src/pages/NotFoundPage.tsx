import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FiArrowLeft } from 'react-icons/fi';
import Button from '../components/ui/Button';

const NotFoundContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 60vh;
  text-align: center;
  padding: 2rem;
`;

const Title = styled.h1`
  font-size: 8rem;
  color: var(--primary-color);
  margin: 0;
  opacity: 0.5;
  font-weight: 700;
`;

const Subtitle = styled.h2`
  font-size: 2rem;
  color: var(--text-color);
  margin: 1rem 0 2rem;
`;

const Message = styled.p`
  font-size: 1.2rem;
  color: var(--light-text-color);
  max-width: 500px;
  margin-bottom: 2rem;
`;

const NotFoundPage: React.FC = () => {
  return (
    <NotFoundContainer>
      <Title>404</Title>
      <Subtitle>Página não encontrada</Subtitle>
      <Message>
        A página que você está procurando pode ter sido removida ou não está
        disponível temporariamente.
      </Message>
      <Button 
        variant="primary" 
        size="large" 
        as={Link} 
        to="/" 
        leftIcon={<FiArrowLeft />}
      >
        Voltar para a página inicial
      </Button>
    </NotFoundContainer>
  );
};

export default NotFoundPage;
