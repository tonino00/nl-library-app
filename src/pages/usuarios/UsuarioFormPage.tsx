import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import styled from 'styled-components';
import { FiSave, FiArrowLeft, FiUser } from 'react-icons/fi';
import { 
  fetchUsuarioById, 
  createUsuario, 
  updateUsuario 
} from '../../features/usuarios/usuarioSlice';
import { AppDispatch, RootState } from '../../store';
import { Usuario } from '../../types';

// Interface estendida para incluir o campo confirmarSenha
interface UsuarioFormData extends Omit<Usuario, 'dataNascimento'> {
  dataNascimento: string; // Formato de data para formulário
  confirmarSenha?: string;
}
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Card from '../../components/ui/Card';
import { toast } from 'react-toastify';

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const PageTitle = styled.h1`
  font-size: 1.75rem;
  color: var(--text-color);
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
`;

const ImagePreviewContainer = styled.div`
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ImagePreview = styled.img`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const AvatarPlaceholder = styled.div`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background-color: var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 3rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const UsuarioFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { usuario, isLoading: usuarioLoading } = useSelector((state: RootState) => state.usuarios);
  const { user } = useSelector((state: RootState) => state.auth);
  const isAdmin = user?.tipo === 'admin';
  
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<UsuarioFormData>();
  const [submitting, setSubmitting] = useState(false);
  
  const fotoUrl = watch('foto');
  
  useEffect(() => {
    if (isEditMode && id) {
      dispatch(fetchUsuarioById(id));
    }
  }, [dispatch, isEditMode, id]);
  
  useEffect(() => {
    if (isEditMode && usuario) {
      // Tratando data de nascimento para formato de formulário
      let formattedDate = "";
      if (usuario.dataNascimento) {
        // Convertendo para objeto Date
        const nascDate = new Date(usuario.dataNascimento);
        // Formato YYYY-MM-DD para input type="date"
        formattedDate = nascDate.toISOString().split('T')[0];
      }

      reset({
        nome: usuario.nome,
        email: usuario.email,
        tipo: usuario.tipo,
        documento: usuario.documento,
        telefone: usuario.telefone,
        endereco: usuario.endereco,
        foto: usuario.foto,
        ativo: usuario.ativo,
        dataNascimento: formattedDate
      });
    }
  }, [usuario, isEditMode, reset]);
  
  const onSubmit = async (formData: UsuarioFormData) => {
    // Separar o campo confirmarSenha do restante dos dados
    const { confirmarSenha, ...restData } = formData;

    // Converter dataNascimento de string para Date
    const usuarioData: Usuario = {
      ...restData,
      dataNascimento: new Date(formData.dataNascimento)
    };
    
    setSubmitting(true);
    try {
      if (isEditMode && id) {
        // Não enviar senha se estiver vazia em modo de edição
        if (!usuarioData.senha) {
          const { senha, ...usuarioSemSenha } = usuarioData;
          await dispatch(updateUsuario({ id, usuario: usuarioSemSenha })).unwrap();
        } else {
          await dispatch(updateUsuario({ id, usuario: usuarioData })).unwrap();
        }
        toast.success('Usuário atualizado com sucesso!');
      } else {
        await dispatch(createUsuario(usuarioData)).unwrap();
        toast.success('Usuário criado com sucesso!');
      }
      navigate('/usuarios');
    } catch (error: any) {
      toast.error(error || 'Ocorreu um erro ao salvar o usuário');
    } finally {
      setSubmitting(false);
    }
  };
  
  const tipoUsuarioOptions = [
    { value: 'leitor', label: 'Leitor' },
    { value: 'bibliotecario', label: 'Bibliotecário' },
    { value: 'admin', label: 'Administrador' }
  ];
  
  if (usuarioLoading && isEditMode) {
    return <div>Carregando...</div>;
  }
  
  return (
    <div>
      <PageHeader>
        <PageTitle>
          {isEditMode ? 'Editar Usuário' : 'Novo Usuário'}
        </PageTitle>
        <Button
          variant="outline"
          leftIcon={<FiArrowLeft />}
          onClick={() => navigate('/usuarios')}
        >
          Voltar
        </Button>
      </PageHeader>
      
      <Card>
        <Form onSubmit={handleSubmit(onSubmit)}>
          {fotoUrl && (
            <ImagePreviewContainer>
              <h4>Foto de Perfil:</h4>
              <ImagePreview 
                src={fotoUrl}
                alt="Foto de perfil"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  toast.error('Erro ao carregar a imagem. Verifique o URL fornecido.');
                }}
              />
            </ImagePreviewContainer>
          )}
          
          {!fotoUrl && (
            <ImagePreviewContainer>
              <AvatarPlaceholder>
                <FiUser size={80} />
              </AvatarPlaceholder>
              <p>Sem foto de perfil</p>
            </ImagePreviewContainer>
          )}
          
          <FormRow>
            <Input
              label="Nome"
              {...register('nome', { required: 'O nome é obrigatório' })}
              error={errors.nome?.message}
              placeholder="Nome completo"
              fullWidth
            />
            
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
              placeholder="Email"
              fullWidth
            />
          </FormRow>
          
          <FormRow>
            <Input
              label="Documento"
              {...register('documento', { required: 'O documento é obrigatório' })}
              error={errors.documento?.message}
              placeholder="CPF/RG"
              fullWidth
            />
            
            <Input
              label="Telefone"
              {...register('telefone', { required: 'O telefone é obrigatório' })}
              error={errors.telefone?.message}
              placeholder="Telefone"
              fullWidth
            />
            
            <Input
              label="Data de Nascimento"
              type="date"
              {...register('dataNascimento', { required: 'A data de nascimento é obrigatória' })}
              error={errors.dataNascimento?.message}
              fullWidth
            />
          </FormRow>
          
          <Input
            label="Endereço"
            {...register('endereco')}
            error={errors.endereco?.message}
            placeholder="Endereço completo"
            fullWidth
          />
          
          <Input
            label="URL da Foto"
            {...register('foto')}
            error={errors.foto?.message}
            placeholder="URL da foto de perfil"
            fullWidth
          />
          
          <FormRow>
            {isAdmin && (
              <Select
                label="Tipo de Usuário"
                {...register('tipo')}
                error={errors.tipo?.message}
                options={tipoUsuarioOptions}
                fullWidth
              />
            )}
            
            {isEditMode && (
              <Select
                label="Status"
                {...register('ativo')}
                error={errors.ativo?.message}
                options={[
                  { value: 'true', label: 'Ativo' },
                  { value: 'false', label: 'Inativo' }
                ]}
                fullWidth
              />
            )}
          </FormRow>
          
          <FormRow>
            <Input
              label={isEditMode ? "Nova Senha (deixe em branco para não alterar)" : "Senha"}
              type="password"
              {...register('senha', { 
                required: !isEditMode ? 'A senha é obrigatória' : false,
                minLength: {
                  value: 6,
                  message: 'A senha deve ter pelo menos 6 caracteres'
                }
              })}
              error={errors.senha?.message}
              placeholder={isEditMode ? "Digite apenas se deseja alterar" : "Senha"}
              fullWidth
            />
            
            {!isEditMode && (
              <Input
                label="Confirmar Senha"
                type="password"
                {...register('confirmarSenha', { 
                  validate: value => {
                    const senha = watch('senha');
                    return !value || value === senha || 'As senhas não coincidem';
                  }
                })}
                error={errors.confirmarSenha?.message as string}
                placeholder="Confirme a senha"
                fullWidth
              />
            )}
          </FormRow>
          
          <ButtonContainer>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/usuarios')}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              leftIcon={<FiSave />}
              isLoading={submitting}
            >
              {isEditMode ? 'Atualizar' : 'Salvar'}
            </Button>
          </ButtonContainer>
        </Form>
      </Card>
    </div>
  );
};

export default UsuarioFormPage;
