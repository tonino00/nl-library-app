import React, { useState } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { FiLock, FiKey } from 'react-icons/fi';
import { authService } from '../services/authService';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { toast } from 'react-toastify';

const ResetContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: var(--background-color);
`;

const ResetCard = styled.div`
  width: 100%;
  max-width: 450px;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  background-color: white;
  overflow: hidden;
`;

const Logo = styled.div`
  text-align: center;
  margin-bottom: 2rem;

  h1 {
    font-size: 2rem;
    font-weight: 700;
    color: var(--primary-color);
    margin-bottom: 0.5rem;
  }

  p {
    color: var(--text-secondary-color);
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FormFooter = styled.div`
  margin-top: 1rem;
  text-align: center;
  font-size: 0.9rem;
`;

const Icon = styled.div`
  font-size: 3rem;
  color: var(--primary-color);
  margin-bottom: 1rem;
`;

// Componente para solicitar redefinição de senha (primeira etapa)
const RequestResetForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      // Esta função ainda precisa ser implementada na API
      // await authService.requestPasswordReset(email);
      
      // Simulação de envio bem-sucedido
      setTimeout(() => {
        setRequestSent(true);
        toast.success('Instruções de redefinição de senha foram enviadas para seu email.');
      }, 1500);
    } catch (error: any) {
      toast.error(error?.message || 'Erro ao solicitar redefinição de senha.');
    } finally {
      setSubmitting(false);
    }
  };

  if (requestSent) {
    return (
      <div style={{ textAlign: 'center', padding: '1rem' }}>
        <h2>Verifique seu email</h2>
        <p>Enviamos instruções para redefinir sua senha para {email}.</p>
        <p>Caso não receba em alguns minutos, verifique sua pasta de spam.</p>
        <Button variant="outline" onClick={() => navigate('/login')}>
          Voltar para o login
        </Button>
      </div>
    );
  }

  return (
    <Form onSubmit={handleSubmit}>
      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        fullWidth
      />
      
      <Button 
        type="submit" 
        variant="primary" 
        fullWidth
        isLoading={submitting}
      >
        Solicitar Redefinição
      </Button>
      
      <FormFooter>
        <Link to="/login">Voltar para o login</Link>
      </FormFooter>
    </Form>
  );
};

// Componente para definir nova senha (segunda etapa)
const NewPasswordForm: React.FC<{token: string}> = ({ token }) => {
  const [passwords, setPasswords] = useState({
    senha: '',
    confirmarSenha: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswords(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwords.senha !== passwords.confirmarSenha) {
      toast.error('As senhas não coincidem');
      return;
    }

    setSubmitting(true);
    try {
      // Esta função ainda precisa ser implementada na API
      // await authService.resetPassword(token, passwords.senha);
      
      // Simulação de redefinição bem-sucedida
      setTimeout(() => {
        setResetComplete(true);
        toast.success('Senha redefinida com sucesso!');
      }, 1500);
    } catch (error: any) {
      toast.error(error?.message || 'Erro ao redefinir senha. O link pode ter expirado.');
    } finally {
      setSubmitting(false);
    }
  };

  if (resetComplete) {
    return (
      <div style={{ textAlign: 'center', padding: '1rem' }}>
        <h2>Senha Redefinida!</h2>
        <p>Sua senha foi alterada com sucesso.</p>
        <Button 
          variant="primary" 
          onClick={() => navigate('/login')}
          style={{ marginTop: '1rem' }}
        >
          Ir para o Login
        </Button>
      </div>
    );
  }

  return (
    <Form onSubmit={handleSubmit}>
      <Input
        label="Nova Senha"
        type="password"
        name="senha"
        value={passwords.senha}
        onChange={handleChange}
        required
        fullWidth
        leftIcon={<FiLock />}
      />
      
      <Input
        label="Confirmar Nova Senha"
        type="password"
        name="confirmarSenha"
        value={passwords.confirmarSenha}
        onChange={handleChange}
        required
        fullWidth
        leftIcon={<FiLock />}
      />
      
      <Button 
        type="submit" 
        variant="primary" 
        fullWidth
        isLoading={submitting}
      >
        Redefinir Senha
      </Button>
      
      <FormFooter>
        <Link to="/login">Cancelar e voltar para o login</Link>
      </FormFooter>
    </Form>
  );
};

const ResetPasswordPage: React.FC = () => {
  const { token } = useParams<{token?: string}>();

  return (
    <ResetContainer>
      <ResetCard>
        <div style={{ padding: '2rem' }}>
          <Logo>
            <Icon>
              <FiKey />
            </Icon>
            <p>{token ? 'Defina uma nova senha' : 'Recupere sua senha'}</p>
          </Logo>
          
          {token ? <NewPasswordForm token={token} /> : <RequestResetForm />}
        </div>
      </ResetCard>
    </ResetContainer>
  );
};

export default ResetPasswordPage;
