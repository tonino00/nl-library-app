import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { FiUser, FiLock, FiMail, FiPhone, FiFileText, FiUserPlus, FiShield, FiAlertTriangle } from 'react-icons/fi';
import { register as registerUser } from '../features/auth/authSlice';
import { AppDispatch } from '../store';
import { Usuario } from '../types';
import api from '../services/api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { toast } from 'react-toastify';
import { useForm, SubmitHandler } from 'react-hook-form';
import { validatePassword, getPasswordStrength, getPasswordStrengthLabel } from '../utils/passwordValidator';
import { sanitizeHtml } from '../utils/sanitize';

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

// Interface para os dados do formulário
interface RegisterFormData {
  nome: string;
  email: string;
  senha: string;
  confirmarSenha: string;
  documento: string;
  telefone: string;
  dataNascimento: string;
}

const RegisterPage: React.FC = () => {
  // Usar react-hook-form para validação robusta
  const { 
    register, 
    handleSubmit, 
    watch, 
    formState: { errors },
    setError,
    setValue
  } = useForm<RegisterFormData>({
    mode: 'onBlur', // Validar campos quando perderem o foco
    defaultValues: {
      nome: '',
      email: '',
      senha: '',
      confirmarSenha: '',
      documento: '',
      telefone: '',
      dataNascimento: ''
    }
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [noAdminExists, setNoAdminExists] = useState(false);
  const [userType, setUserType] = useState<'leitor' | 'admin' | 'comunidade'>('leitor');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  
  // Observar o campo de senha para calcular sua força
  const senha = watch('senha');
  
  useEffect(() => {
    if (senha) {
      setPasswordStrength(getPasswordStrength(senha));
    } else {
      setPasswordStrength(0);
    }
  }, [senha]);
  
  // Função para obter cor baseada na força da senha
  const getStrengthColor = (strength: number): string => {
    if (strength < 30) return 'var(--danger-color)';
    if (strength < 50) return '#ff9800'; // Laranja
    if (strength < 70) return '#ffd600'; // Amarelo
    if (strength < 90) return '#4caf50'; // Verde
    return 'var(--success-color)';
  };
  
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

  // Manipulador de submissão do formulário usando react-hook-form
  const onSubmit: SubmitHandler<RegisterFormData> = async (data) => {
    // Validação personalizada de senha
    const { isValid, message } = validatePassword(data.senha);
    if (!isValid) {
      setError('senha', { type: 'manual', message });
      return;
    }
    
    // Verificar se as senhas coincidem
    if (data.senha !== data.confirmarSenha) {
      setError('confirmarSenha', { 
        type: 'manual', 
        message: 'As senhas não coincidem' 
      });
      return;
    }
    
    setSubmitting(true);
    try {
      // Remover o campo confirmarSenha e sanitizar dados
      const { confirmarSenha, ...userData } = data;
      
      // Adicionar campos necessários para o cadastro
      const newUser: Usuario = {
        ...userData,
        tipo: userType, // Permite criar admin se não existir nenhum
        ativo: true,
        dataNascimento: new Date(data.dataNascimento || Date.now())
      };
      
      // Dispatch da ação de registro
      await dispatch(registerUser(newUser)).unwrap();
      toast.success('Cadastro realizado com sucesso! Você já pode fazer login.');
      navigate('/login');
    } catch (error: any) {
      toast.error(typeof error === 'string' ? error : 'Erro ao fazer cadastro. Tente novamente.');
      
      // Capturar erros específicos da API e mapear para os campos do formulário
      if (error?.response?.data?.errors) {
        const apiErrors = error.response.data.errors;
        
        // Mapear erros da API para os campos do formulário
        Object.keys(apiErrors).forEach(fieldName => {
          if (fieldName in data) {
            setError(fieldName as keyof RegisterFormData, {
              type: 'manual',
              message: sanitizeHtml(apiErrors[fieldName])
            });
          }
        });
      }
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
          
          <Form onSubmit={handleSubmit(onSubmit)}>
            {noAdminExists && (
              <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: 'rgba(0,123,255,0.1)', borderRadius: '8px' }}>
                <h3 style={{ marginTop: 0 }}>Primeiro Acesso Detectado</h3>
                <p>Você será o primeiro usuário do sistema. Escolha o tipo de conta:</p>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                  <label style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <input 
                      type="radio" 
                      name="userType" 
                      checked={userType === 'admin'}
                      onChange={() => setUserType('admin')} 
                    />
                    <span style={{ marginLeft: '0.5rem' }}>Administrador</span>
                  </label>
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
                {...register('nome', { 
                  required: 'O nome completo é obrigatório',
                  minLength: {
                    value: 3,
                    message: 'O nome deve ter pelo menos 3 caracteres'
                  },
                  maxLength: {
                    value: 100,
                    message: 'O nome não pode ultrapassar 100 caracteres'
                  }
                })}
                error={errors.nome?.message}
                fullWidth
                leftIcon={<FiUser />}
              />
            </FormRow>
            
            <FormRow>
              <Input
                label="Email"
                type="email"
                {...register('email', { 
                  required: 'O email é obrigatório',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Email inválido'
                  }
                })}
                error={errors.email?.message}
                fullWidth
                leftIcon={<FiMail />}
              />
            </FormRow>
            
            <FormRow>
              <Input
                label="Documento (CPF/RG)"
                {...register('documento', { 
                  required: 'O documento é obrigatório',
                  minLength: {
                    value: 5,
                    message: 'Documento inválido'
                  }
                })}
                error={errors.documento?.message}
                fullWidth
                leftIcon={<FiFileText />}
              />
              
              <Input
                label="Telefone"
                {...register('telefone', {
                  pattern: {
                    value: /^\(?\d{2}\)?[\s-]?\d{4,5}-?\d{4}$/,
                    message: 'Formato de telefone inválido'
                  }
                })}
                error={errors.telefone?.message}
                fullWidth
                leftIcon={<FiPhone />}
              />
            </FormRow>
            
            <FormRow>
              <Input
                label="Data de Nascimento"
                type="date"
                {...register('dataNascimento')}
                error={errors.dataNascimento?.message}
                fullWidth
              />
            </FormRow>
            
            <FormRow>
              <div style={{ width: '100%' }}>
                <Input
                  label="Senha"
                  type="password"
                  {...register('senha', { 
                    required: 'A senha é obrigatória',
                    minLength: {
                      value: 8,
                      message: 'A senha deve ter pelo menos 8 caracteres'
                    }
                  })}
                  error={errors.senha?.message}
                  fullWidth
                  leftIcon={<FiLock />}
                />
                
                {/* Indicador de força da senha */}
                {senha && (
                  <div style={{ marginTop: '5px' }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      fontSize: '0.8rem', 
                      justifyContent: 'space-between',
                      marginBottom: '3px'
                    }}>
                      <span>Força da senha:</span>
                      <span style={{ color: getStrengthColor(passwordStrength) }}>
                        {getPasswordStrengthLabel(passwordStrength)}
                      </span>
                    </div>
                    <div style={{ 
                      height: '5px', 
                      width: '100%', 
                      backgroundColor: '#e0e0e0', 
                      borderRadius: '3px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        height: '100%', 
                        width: `${passwordStrength}%`,
                        backgroundColor: getStrengthColor(passwordStrength),
                        transition: 'width 0.3s, background-color 0.3s'
                      }}></div>
                    </div>
                  </div>
                )}
              </div>
              
              <Input
                label="Confirmar Senha"
                type="password"
                {...register('confirmarSenha', {
                  required: 'Por favor confirme sua senha',
                  validate: value => value === watch('senha') || 'As senhas não coincidem'
                })}
                error={errors.confirmarSenha?.message}
                fullWidth
                leftIcon={<FiLock />}
              />
            </FormRow>
            
            {/* Requisitos de senha */}
            <div style={{ 
              backgroundColor: 'rgba(0,0,0,0.03)', 
              padding: '10px', 
              borderRadius: '8px',
              marginBottom: '15px',
              fontSize: '0.85rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                <FiAlertTriangle style={{ marginRight: '5px', color: 'var(--warning-color)' }} />
                <strong>Requisitos de senha:</strong>
              </div>
              <ul style={{ margin: '5px 0 0 20px', padding: 0 }}>
                <li>Mínimo de 8 caracteres</li>
                <li>Pelo menos uma letra maiúscula</li>
                <li>Pelo menos uma letra minúscula</li>
                <li>Pelo menos um número</li>
                <li>Pelo menos um caractere especial (@#$%^&+=!)</li>
              </ul>
            </div>
            
            <Button 
              type="submit" 
              variant="primary" 
              fullWidth
              isLoading={submitting}
              disabled={submitting || Object.keys(errors).length > 0}
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
