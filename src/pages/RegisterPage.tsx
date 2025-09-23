import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { FiUser, FiLock, FiMail, FiPhone, FiFileText, FiUserPlus, FiShield } from 'react-icons/fi';
import { register } from '../features/auth/authSlice';
import { AppDispatch } from '../store';
import { Usuario } from '../types';
import api from '../services/api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { toast } from 'react-toastify';

const RegisterContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: var(--background-color);
`;

const RegisterCard = styled.div`
  width: 100%;
  max-width: 550px;
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

const FormRow = styled.div`
  display: flex;
  gap: 1rem;

  @media (max-width: 600px) {
    flex-direction: column;
  }
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

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    documento: '',
    telefone: '',
    dataNascimento: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [noAdminExists, setNoAdminExists] = useState(false);
  const [userType, setUserType] = useState<'leitor' | 'admin' | 'comunidade'>('leitor');
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  
  // Verificar se já existe pelo menos um administrador no sistema
  useEffect(() => {
    const checkAdminExists = async () => {
      try {
        setLoading(true);
        // Em produção, esta chamada seria para uma API real
        // Simulação para demonstrar a funcionalidade
        // const response = await api.get('/users/check-admin-exists');
        // setNoAdminExists(!response.data.adminExists);
        
        // Simulação: assumindo que não existe admin ainda
        setTimeout(() => {
          setNoAdminExists(true);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Erro ao verificar se existe administrador:', error);
        setLoading(false);
      }
    };
    
    checkAdminExists();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.senha !== formData.confirmarSenha) {
      toast.error('As senhas não coincidem');
      return;
    }

    setSubmitting(true);
    try {
      // Remover o campo confirmarSenha
      const { confirmarSenha, ...userData } = formData;
      
      // Adicionar campos necessários para o cadastro
      const newUser: Usuario = {
        ...userData,
        tipo: userType, // Permite criar admin se não existir nenhum
        ativo: true,
        dataNascimento: new Date() // Usar data atual como padrão, pode ser atualizada depois pelo usuário
      };

      await dispatch(register(newUser)).unwrap();
      toast.success('Cadastro realizado com sucesso! Você já pode fazer login.');
      navigate('/login');
    } catch (error: any) {
      toast.error(error || 'Erro ao fazer cadastro. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <RegisterContainer>
        <div style={{ textAlign: 'center' }}>
          <p>Carregando...</p>
        </div>
      </RegisterContainer>
    );
  }

  return (
    <RegisterContainer>
      <RegisterCard>
        <div style={{ padding: '2rem' }}>
          <Logo>
            <Icon>
              {noAdminExists && userType === 'admin' ? <FiShield /> : <FiUserPlus />}
            </Icon>
            <p>
              {noAdminExists 
                ? 'Nenhum administrador encontrado. Crie a conta do administrador principal.' 
                : 'Crie sua conta na Biblioteca NL'}
            </p>
          </Logo>
          
          <Form onSubmit={handleSubmit}>
            {noAdminExists && (
              <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: 'rgba(0,123,255,0.1)', borderRadius: '8px' }}>
                <h3 style={{ marginTop: 0 }}>Primeiro Acesso Detectado</h3>
                <p>Você será o primeiro usuário do sistema. Escolha o tipo de conta:</p>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                  {/* <label style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <input 
                      type="radio" 
                      name="userType" 
                      checked={userType === 'admin'}
                      onChange={() => setUserType('admin')} 
                    />
                    <span style={{ marginLeft: '0.5rem' }}>Administrador</span>
                  </label> */}
                  <label style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <input 
                      type="radio" 
                      name="userType" 
                      checked={userType === 'leitor'}
                      onChange={() => setUserType('leitor')} 
                    />
                    <span style={{ marginLeft: '0.5rem' }}>Leitor</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <input 
                      type="radio" 
                      name="userType" 
                      checked={userType === 'comunidade'}
                      onChange={() => setUserType('comunidade')} 
                    />
                    <span style={{ marginLeft: '0.5rem' }}>Comunidade</span>
                  </label>
                </div>
              </div>
            )}
            
            {!noAdminExists && (
              <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: 'rgba(0,123,255,0.1)', borderRadius: '8px' }}>
                <h3 style={{ marginTop: 0 }}>Tipo de Usuário</h3>
                <p>Selecione o tipo de conta que deseja criar:</p>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                  <label style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <input 
                      type="radio" 
                      name="userType" 
                      checked={userType === 'leitor'}
                      onChange={() => setUserType('leitor')} 
                    />
                    <span style={{ marginLeft: '0.5rem' }}>Leitor</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <input 
                      type="radio" 
                      name="userType" 
                      checked={userType === 'comunidade'}
                      onChange={() => setUserType('comunidade')} 
                    />
                    <span style={{ marginLeft: '0.5rem' }}>Comunidade</span>
                  </label>
                </div>
              </div>
            )}
            
            <FormRow>
              <Input
                label="Nome Completo"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                required
                fullWidth
                leftIcon={<FiUser />}
              />
            </FormRow>
            
            <FormRow>
              <Input
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                fullWidth
                leftIcon={<FiMail />}
              />
            </FormRow>
            
            <FormRow>
              <Input
                label="Documento (CPF/RG)"
                name="documento"
                value={formData.documento}
                onChange={handleChange}
                required
                fullWidth
                leftIcon={<FiFileText />}
              />
              
              <Input
                label="Telefone"
                name="telefone"
                value={formData.telefone}
                onChange={handleChange}
                fullWidth
                leftIcon={<FiPhone />}
              />
            </FormRow>
            
            <FormRow>
              <Input
                label="Senha"
                type="password"
                name="senha"
                value={formData.senha}
                onChange={handleChange}
                required
                fullWidth
                leftIcon={<FiLock />}
              />
              
              <Input
                label="Confirmar Senha"
                type="password"
                name="confirmarSenha"
                value={formData.confirmarSenha}
                onChange={handleChange}
                required
                fullWidth
                leftIcon={<FiLock />}
              />
            </FormRow>
            
            <Button 
              type="submit" 
              variant="primary" 
              fullWidth
              isLoading={submitting}
            >
              Criar Conta
            </Button>
            
            <FormFooter>
              Já possui uma conta? <Link to="/login">Faça login</Link>
            </FormFooter>
          </Form>
        </div>
      </RegisterCard>
    </RegisterContainer>
  );
};

export default RegisterPage;
