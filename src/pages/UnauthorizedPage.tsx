import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FiAlertTriangle, FiArrowLeft } from 'react-icons/fi';
import Button from '../components/ui/Button';

const UnauthorizedContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 60vh;
  text-align: center;
  padding: 2rem;
`;

const Icon = styled.div`
  font-size: 6rem;
  color: var(--warning-color);
  margin-bottom: 1rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: var(--text-color);
  margin: 0 0 1rem;
`;

const Message = styled.p`
  font-size: 1.2rem;
  color: var(--light-text-color);
  max-width: 500px;
  margin-bottom: 2rem;
`;

const UnauthorizedPage: React.FC = () => {
  return (
    <UnauthorizedContainer>
      <Icon>
        <FiAlertTriangle />
      </Icon>
      <Title>Acesso Negado</Title>
      <Message>
        Você não tem permissão para acessar esta página. 
        Se você acredita que deveria ter acesso, entre em contato com o administrador.
      </Message>
      <Button 
        variant="primary" 
        size="large" 
        as={Link as any} 
        to="/" 
        leftIcon={<FiArrowLeft />}
      >
        Voltar para a página inicial
      </Button>
    </UnauthorizedContainer>
  );
};

export default UnauthorizedPage;
