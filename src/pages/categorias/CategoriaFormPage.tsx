import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import styled from 'styled-components';
import { FiSave, FiArrowLeft } from 'react-icons/fi';
import { 
  fetchCategoriaById, 
  createCategoria, 
  updateCategoria 
} from '../../features/categorias/categoriaSlice';
import { AppDispatch, RootState } from '../../store';
import { Categoria } from '../../types';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
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

const ButtonContainer = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
`;

const CategoriaFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { categoria, isLoading } = useSelector((state: RootState) => state.categorias);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Categoria>();
  const [submitting, setSubmitting] = useState(false);
  
  useEffect(() => {
    if (isEditMode && id) {
      dispatch(fetchCategoriaById(id));
    }
  }, [dispatch, isEditMode, id]);
  
  useEffect(() => {
    if (isEditMode && categoria) {
      reset({
        nome: categoria.nome,
        descricao: categoria.descricao
      });
    }
  }, [categoria, isEditMode, reset]);
  
  const onSubmit = async (data: Categoria) => {
    setSubmitting(true);
    try {
      if (isEditMode && id) {
        await dispatch(updateCategoria({ id, categoria: data })).unwrap();
        toast.success('Categoria atualizada com sucesso!');
      } else {
        await dispatch(createCategoria(data)).unwrap();
        toast.success('Categoria criada com sucesso!');
      }
      // Passar o parâmetro forceRefresh para a página de listagem
      navigate('/categorias', { state: { forceRefresh: true } });
    } catch (error: any) {
      toast.error(error || 'Ocorreu um erro ao salvar a categoria');
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <div>
      <PageHeader>
        <PageTitle>
          {isEditMode ? 'Editar Categoria' : 'Nova Categoria'}
        </PageTitle>
        <Button
          variant="outline"
          leftIcon={<FiArrowLeft />}
          onClick={() => navigate('/categorias')}
        >
          Voltar
        </Button>
      </PageHeader>
      
      <Card>
        {isLoading && isEditMode ? (
          <p>Carregando...</p>
        ) : (
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Input
              label="Nome"
              {...register('nome', { required: 'O nome é obrigatório' })}
              error={errors.nome?.message}
              placeholder="Nome da categoria"
              fullWidth
            />
            
            <Input
              label="Descrição"
              {...register('descricao')}
              error={errors.descricao?.message}
              placeholder="Descrição da categoria (opcional)"
              fullWidth
              as="textarea"
              style={{ minHeight: '120px' }}
            />
            
            <ButtonContainer>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/categorias')}
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
        )}
      </Card>
    </div>
  );
};

export default CategoriaFormPage;
