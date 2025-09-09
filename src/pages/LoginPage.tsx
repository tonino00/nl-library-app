import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { FiUser, FiLock, FiHome } from 'react-icons/fi';
import { login } from '../features/auth/authSlice';
import { RootState } from '../store';
import { AppDispatch } from '../store';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const LoginContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
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

const ErrorMessage = styled.div`
  color: var(--danger-color);
  background-color: rgba(220, 53, 69, 0.1);
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
  
  a {
    color: var(--primary-color);
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
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
    <LoginContainer>
      <LoginCard>
        <div style={{ padding: '2rem' }}>
          <Logo>
                <Icon>
                  <FiHome />
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
            
            <Input
              type="password"
              name="senha"
              label="Senha"
              placeholder="Digite sua senha"
              value={credentials.senha}
              onChange={handleChange}
              required
              fullWidth
              leftIcon={<FiLock />}
            />
            
            <Button
              type="submit"
              fullWidth
              size="large"
              isLoading={isLoading}
              style={{ marginTop: '1rem' }}
            >
              Entrar
            </Button>
            
            <LoginLinks>
              <Link to="/registro">Criar uma nova conta</Link>
              <Link to="/recuperar-senha">Esqueceu sua senha?</Link>
            </LoginLinks>
          </Form>
        </div>
      </LoginCard>
    </LoginContainer>
  );
};

export default LoginPage;
