import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { FiUser, FiLock, FiBookOpen } from 'react-icons/fi';
import { login } from '../features/auth/authSlice';
import { RootState } from '../store';
import { AppDispatch } from '../store';
import Input from '../components/ui/Input';
import PasswordInput from '../components/ui/PasswordInput';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: var(--background-color);
`;

const LoginContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 20px;
  background-color: var(--background-color);
`;

const LoginCard = styled(Card)`
  width: 100%;
  max-width: 400px;
`;

const Logo = styled.div`
  text-align: center;
  margin-bottom: 2rem;
  
  h1 {
    color: var(--primary-color);
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
  }
  
  p {
    color: var(--light-text-color);
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const SubmitButtonWrapper = styled.div`
  margin-top: 1rem;
`;

const ErrorMessage = styled.div`
  color: var(--status-danger-text);
  background-color: var(--status-danger-bg);
  padding: 10px;
  border-radius: var(--border-radius);
  margin-bottom: 20px;
  font-size: 0.9rem;
`;

const LoginLinks = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1.5rem;
  text-align: center;
  font-size: 0.9rem;
`;

const LoginLink = styled(Link)`
  display: inline-block;
  min-height: 44px;
  line-height: 44px;
  padding: 0 8px;
  color: var(--primary-color);
  text-decoration: none;
  border-radius: var(--border-radius);
  transition: var(--transition);

  &:hover {
    text-decoration: underline;
    background-color: var(--hover-bg);
  }

  &:focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const Copyright = styled.div`
  text-align: center;
  color: var(--light-text-color);
  font-size: 0.8rem;
  margin-bottom: 2rem;
  line-height: 1.5;
`;

const Icon = styled.div`
  font-size: 3rem;
  color: var(--primary-color);
  margin-bottom: 1rem;
`;

const LoginPage: React.FC = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    senha: '',
  });
  
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
  };
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await dispatch(login(credentials)).unwrap();
      navigate('/');
    } catch (error) {
      // Erro já será capturado pelo reducer
    }
  };
  
  return (
    <PageWrapper>
      <LoginContainer>
      <LoginCard padding="2rem">
        <Logo>
              <Icon>
                <FiBookOpen />
              </Icon>
            <p>Sistema de Gerenciamento de Biblioteca</p>
        </Logo>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <Form onSubmit={handleSubmit}>
          <Input
            type="email"
            name="email"
            label="Email"
            placeholder="Digite seu email"
            value={credentials.email}
            onChange={handleChange}
            required
            fullWidth
            leftIcon={<FiUser />}
          />

          <PasswordInput
            name="senha"
            label="Senha"
            placeholder="Digite sua senha"
            value={credentials.senha}
            onChange={handleChange}
            required
            fullWidth
            leftIcon={<FiLock />}
          />

          <SubmitButtonWrapper>
            <Button
              type="submit"
              fullWidth
              size="large"
              isLoading={isLoading}
            >
              Entrar
            </Button>
          </SubmitButtonWrapper>

          <LoginLinks>
            <LoginLink to="/registro">Criar uma nova conta</LoginLink>
          </LoginLinks>
        </Form>
      </LoginCard>
    </LoginContainer>
    
    <Copyright>
      © Copyright toninosdev.com 2025.<br />
      Todos os direitos reservados
    </Copyright>
    </PageWrapper>
  );
};

export default LoginPage;
