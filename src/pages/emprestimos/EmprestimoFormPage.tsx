import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import styled from 'styled-components';
import { FiSave, FiArrowLeft } from 'react-icons/fi';
import { 
  fetchEmprestimoById, 
  createEmprestimo, 
  updateEmprestimo 
} from '../../features/emprestimos/emprestimoSlice';
import { fetchUsuarios } from '../../features/usuarios/usuarioSlice';
import { fetchLivros, pesquisarLivros } from '../../features/livros/livroSlice';
import { AppDispatch, RootState } from '../../store';
import { Emprestimo } from '../../types';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Card from '../../components/ui/Card';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { toast } from 'react-toastify';

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
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
  flex-wrap: wrap;
  margin-top: 20px;
`;

const AlertBox = styled.div<{ $variant: 'warning' | 'danger' | 'success' | 'info' }>`
  padding: 15px;
  border-radius: var(--border-radius);
  margin-bottom: 20px;
  border: 1px solid var(--border-color);

  ${({ $variant }) => {
    switch ($variant) {
      case 'warning':
        return `
          background-color: var(--status-pending-bg);
          color: var(--status-pending-text);
        `;
      case 'danger':
        return `
          background-color: var(--status-danger-bg);
          color: var(--status-danger-text);
        `;
      case 'success':
        return `
          background-color: var(--status-success-bg);
          color: var(--status-success-text);
        `;
      case 'info':
        return `
          background-color: var(--status-active-bg);
          color: var(--status-active-text);
        `;
      default:
        return '';
    }
  }}
`;

const FieldWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
  width: 100%;
`;

const LivroResultsList = styled.div`
  margin-top: 8px;
  max-height: 220px;
  overflow-y: auto;
  border-radius: var(--border-radius);
  border: 1px solid var(--border-color);
  background-color: var(--surface-color);
`;

const LivroResultItem = styled.button`
  width: 100%;
  text-align: left;
  padding: 8px 12px;
  border: none;
  background: none;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 0.9rem;

  &:hover {
    background-color: var(--hover-bg);
  }
`;

const LivroResultTitle = styled.span`
  font-weight: 500;
`;

const LivroResultMeta = styled.span`
  font-size: 0.8rem;
  color: var(--light-text-color);
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  min-height: 250px;
`;

interface FormData {
  livro: string;
  usuario: string;
  dataPrevistaDevolucao: string;
  observacoes?: string;
}

const EmprestimoFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const usuarioId = queryParams.get('usuario');
  const livroId = queryParams.get('livro');
  
  const isEditMode = !!id;
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  const { emprestimo, isLoading: emprestimoLoading } = useSelector((state: RootState) => state.emprestimos);
  const { usuarios, isLoading: usuariosLoading } = useSelector((state: RootState) => state.usuarios);
  const { livros, isLoading: livrosLoading } = useSelector((state: RootState) => state.livros);
  
  const { register, handleSubmit, reset, setValue, clearErrors, formState: { errors } } = useForm<FormData>();
  const [submitting, setSubmitting] = useState(false);
  const [selectedLivroId, setSelectedLivroId] = useState<string | null>(null);
  const [livroSearchTerm, setLivroSearchTerm] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  
  // Buscar dados necessários
  useEffect(() => {
    dispatch(fetchUsuarios(false));
    dispatch(fetchLivros(false));
    
    if (isEditMode && id) {
      dispatch(fetchEmprestimoById(id));
    }
  }, [dispatch, isEditMode, id]);
  
  // Preencher formulário se estiver em modo de edição ou se tiver parâmetros na URL
  useEffect(() => {
    if (isEditMode && emprestimo) {
      const livroId = typeof emprestimo.livro === 'string' 
        ? emprestimo.livro 
        : emprestimo.livro?._id;
        
      const usuarioId = typeof emprestimo.usuario === 'string'
        ? emprestimo.usuario
        : emprestimo.usuario?._id;
        
      const dataPrevista = emprestimo.dataPrevistaDevolucao instanceof Date
        ? emprestimo.dataPrevistaDevolucao.toISOString().split('T')[0]
        : emprestimo.dataPrevistaDevolucao 
          ? new Date(emprestimo.dataPrevistaDevolucao).toISOString().split('T')[0] 
          : '';
          
      reset({
        livro: livroId,
        usuario: usuarioId,
        dataPrevistaDevolucao: dataPrevista,
        observacoes: emprestimo.observacoes,
      });
      
      if (livroId) {
        setSelectedLivroId(livroId);
      }
    } else if (!isEditMode) {
      // Preencher com valores dos parâmetros da URL
      if (usuarioId) {
        setValue('usuario', usuarioId);
      }
      
      if (livroId) {
        setValue('livro', livroId);
        setSelectedLivroId(livroId);
      }
      
      // Definir data prevista de devolução padrão (7 dias após hoje)
      const dataAtual = new Date();
      dataAtual.setDate(dataAtual.getDate() + 7);
      setValue('dataPrevistaDevolucao', dataAtual.toISOString().split('T')[0]);
    }
  }, [emprestimo, isEditMode, reset, setValue, usuarioId, livroId]);
  
  const getLivroSelecionado = () => {
    if (!selectedLivroId || !Array.isArray(livros)) return null;
    return livros.find(livro => livro._id === selectedLivroId);
  };

  const handleLivroSelectFromSearch = (livroIdSelecionado: string) => {
    setSelectedLivroId(livroIdSelecionado);
    setValue('livro', livroIdSelecionado, { shouldValidate: true });
    const livro = Array.isArray(livros)
      ? livros.find(l => l._id === livroIdSelecionado)
      : undefined;

    if (livro) {
      const label = `${livro.titulo} - ${livro.autor}${livro.autorEspiritual ? ` / ${livro.autorEspiritual}` : ''}`;
      setLivroSearchTerm(label);
    }

    clearErrors('livro');
    setHasSearched(false);
  };

  const handleLivroSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setLivroSearchTerm(term);
    if (!term.trim()) {
      setHasSearched(false);
    }
  };

  const handleLivroSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const term = livroSearchTerm.trim();
      if (term) {
        dispatch(pesquisarLivros(term));
        setHasSearched(true);
      } else {
        dispatch(fetchLivros(false));
        setHasSearched(false);
      }
    }
  };
  
  const livroSelecionado = getLivroSelecionado();
  const livroDisponivelParaEmprestimo = livroSelecionado && 
    (isEditMode || (livroSelecionado.disponiveis !== undefined && livroSelecionado.disponiveis > 0));
  
  const handleLivroChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedLivroId(e.target.value);
  };
  
  const onSubmit = async (data: FormData) => {
    if (!livroDisponivelParaEmprestimo && !isEditMode) {
      toast.error('Este livro não está disponível para empréstimo!');
      return;
    }
    
    setSubmitting(true);
    try {
      // Garantir que campos obrigatórios estão definidos
      const emprestimoData = {
        livro: data.livro,
        usuario: data.usuario,
        dataPrevistaDevolucao: new Date(data.dataPrevistaDevolucao),
        observacoes: data.observacoes || ''
      } as Emprestimo;
      
      if (isEditMode && id) {
        await dispatch(updateEmprestimo({ id, emprestimo: emprestimoData })).unwrap();
        toast.success('Empréstimo atualizado com sucesso!');
      } else {
        await dispatch(createEmprestimo(emprestimoData)).unwrap();
        toast.success('Empréstimo criado com sucesso!');
      }
      // Passar o parâmetro forceRefresh para a página de listagem
      navigate('/emprestimos', { state: { forceRefresh: true } });
    } catch (error: any) {
      toast.error(error || 'Ocorreu um erro ao salvar o empréstimo');
    } finally {
      setSubmitting(false);
    }
  };
  
  const isLoading = emprestimoLoading || usuariosLoading || livrosLoading;
  
  return (
    <div>
      <PageHeader>
        <PageTitle>
          {isEditMode ? 'Editar Empréstimo' : 'Novo Empréstimo'}
        </PageTitle>
        <Button
          as={Link}
          to="/emprestimos"
          variant="outline"
          leftIcon={<FiArrowLeft />}
        >
          Voltar
        </Button>
      </PageHeader>
      
      <Card>
        {isLoading ? (
          <LoadingContainer>
            <LoadingSpinner 
              size="medium" 
              showLogo={true}
              message="Carregando dados do empréstimo..."
            />
          </LoadingContainer>
        ) : (
          <Form onSubmit={handleSubmit(onSubmit)}>
            {selectedLivroId && !livroDisponivelParaEmprestimo && !isEditMode && (
              <AlertBox $variant="danger" role="alert">
                <strong>Atenção!</strong> Este livro não está disponível para empréstimo.
              </AlertBox>
            )}
            
            <FormRow>
              <Select
                label="Usuário"
                {...register('usuario', { required: 'O usuário é obrigatório' })}
                error={errors.usuario?.message}
                options={Array.isArray(usuarios) ? 
                  usuarios
                    .filter(u => u.ativo !== false)
                    .map(user => ({ value: user._id || '', label: `${user.nome} (${user.email})` }))
                  : []
                }
                fullWidth
                disabled={isEditMode}
              />
              {isEditMode ? (
                <Select
                  label="Livro"
                  {...register('livro', { required: 'O livro é obrigatório' })}
                  error={errors.livro?.message}
                  options={Array.isArray(livros) ? 
                    livros.map(livro => ({
                      value: livro._id || '',
                      label: `${livro.titulo} - ${(livro.disponiveis !== undefined && livro.disponiveis > 0) || isEditMode ? 'Disponível' : 'Indisponível'}`
                    }))
                  : []}
                  fullWidth
                  onChange={handleLivroChange}
                  disabled={isEditMode}
                />
              ) : (
                <FieldWrapper>
                  <Input
                    label="Buscar livro"
                    placeholder="Digite título, autor ou autor espiritual"
                    value={livroSearchTerm}
                    onChange={handleLivroSearchChange}
                    onKeyDown={handleLivroSearchKeyDown}
                    error={errors.livro?.message}
                    fullWidth
                  />
                  <Input
                    type="hidden"
                    {...register('livro', { required: 'O livro é obrigatório' })}
                  />
                  {Array.isArray(livros) && livros.length > 0 && hasSearched && livroSearchTerm.trim() && (
                    <LivroResultsList>
                      {livros
                        .filter(livro => {
                          const termo = livroSearchTerm.trim().toLowerCase();
                          return (
                            livro.titulo.toLowerCase().includes(termo) ||
                            livro.autor.toLowerCase().includes(termo) ||
                            (livro.autorEspiritual && livro.autorEspiritual.toLowerCase().includes(termo))
                          );
                        })
                        .map(livro => (
                          <LivroResultItem
                            key={livro._id}
                            type="button"
                            onClick={() => handleLivroSelectFromSearch(livro._id || '')}
                          >
                            <LivroResultTitle>{livro.titulo}</LivroResultTitle>
                            <LivroResultMeta>
                              {livro.autor}
                              {livro.autorEspiritual && ` • Autor Espiritual: ${livro.autorEspiritual}`}
                              {typeof livro.disponiveis === 'number' &&
                                ` • ${livro.disponiveis > 0 ? 'Disponível' : 'Indisponível'}`}
                            </LivroResultMeta>
                          </LivroResultItem>
                        ))}
                    </LivroResultsList>
                  )}
                </FieldWrapper>
              )}
            </FormRow>
            
            <FormRow>
              <Input
                label="Data Prevista de Devolução"
                type="date"
                {...register('dataPrevistaDevolucao', { required: 'A data prevista é obrigatória' })}
                error={errors.dataPrevistaDevolucao?.message}
                fullWidth
              />
            </FormRow>
            
            <Input
              label="Observações"
              {...register('observacoes')}
              error={errors.observacoes?.message}
              placeholder="Observações sobre o empréstimo (opcional)"
              fullWidth
              as="textarea"
            />
            
            <ButtonContainer>
              <Button
                as={Link}
                to="/emprestimos"
                variant="outline"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                leftIcon={<FiSave />}
                isLoading={submitting}
                disabled={!isEditMode && !!selectedLivroId && !livroDisponivelParaEmprestimo}
              >
                {isEditMode ? 'Atualizar' : 'Salvar'}
              </Button>
            </ButtonContainer>
          </Form>
        )}
      </Card>
    </div>
  );
};

export default EmprestimoFormPage;
