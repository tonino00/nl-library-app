import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import styled from 'styled-components';
import { FiSave, FiArrowLeft, FiImage } from 'react-icons/fi';
import { 
  fetchLivroById, 
  createLivro, 
  updateLivro 
} from '../../features/livros/livroSlice';
import { fetchCategorias } from '../../features/categorias/categoriaSlice';
import { AppDispatch, RootState } from '../../store';
import { Livro } from '../../types';
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
`;

const ImagePreview = styled.img`
  max-width: 200px;
  max-height: 300px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const PlaceholderImage = styled.div`
  width: 200px;
  height: 300px;
  border-radius: 8px;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  font-size: 3rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const LivroFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { livro, isLoading: livroLoading } = useSelector((state: RootState) => state.livros);
  const { categorias, isLoading: categoriasLoading } = useSelector((state: RootState) => state.categorias);
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<Livro>();
  const [submitting, setSubmitting] = useState(false);
  
  const capaUrl = watch('capa');
  
  useEffect(() => {
    dispatch(fetchCategorias());
    
    if (isEditMode && id) {
      dispatch(fetchLivroById(id));
    }
  }, [dispatch, isEditMode, id]);
  
  useEffect(() => {
    if (isEditMode && livro) {
      reset({
        titulo: livro.titulo,
        autor: livro.autor,
        isbn: livro.isbn,
        editora: livro.editora,
        anoPublicacao: livro.anoPublicacao,
        categoria: typeof livro.categoria === 'string' ? livro.categoria : livro.categoria?._id,
        quantidade: livro.quantidade,
        disponiveis: livro.disponiveis,
        descricao: livro.descricao,
        localizacao: livro.localizacao,
        capa: livro.capa,
      });
    }
  }, [livro, isEditMode, reset]);
  
  const onSubmit = async (data: Livro) => {
    setSubmitting(true);
    try {
      // Se é um novo livro e não foi especificado o número de disponíveis,
      // iguala ao número total
      if (!isEditMode && !data.disponiveis) {
        data.disponiveis = data.quantidade;
      }
      
      if (isEditMode && id) {
        await dispatch(updateLivro({ id, livro: data })).unwrap();
        toast.success('Livro atualizado com sucesso!');
      } else {
        await dispatch(createLivro(data)).unwrap();
        toast.success('Livro criado com sucesso!');
      }
      // Passar o parâmetro forceRefresh para a página de listagem
      navigate('/livros', { state: { forceRefresh: true } });
    } catch (error: any) {
      toast.error(error || 'Ocorreu um erro ao salvar o livro');
    } finally {
      setSubmitting(false);
    }
  };
  
  if ((livroLoading && isEditMode) || categoriasLoading) {
    return <div>Carregando...</div>;
  }
  
  return (
    <div>
      <PageHeader>
        <PageTitle>
          {isEditMode ? 'Editar Livro' : 'Novo Livro'}
        </PageTitle>
        <Button
          variant="outline"
          leftIcon={<FiArrowLeft />}
          onClick={() => navigate('/livros')}
        >
          Voltar
        </Button>
      </PageHeader>
      
      <Card>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <FormRow>
            <Input
              label="Título da obra"
              {...register('titulo', { required: 'O título é obrigatório' })}
              error={errors.titulo?.message}
              placeholder="Título do livro"
              fullWidth
            />
            
            <Input
              label="Autor"
              {...register('autor', { required: 'O autor é obrigatório' })}
              error={errors.autor?.message}
              placeholder="Nome do autor"
              fullWidth
            />
          </FormRow>
          
          <FormRow>
            <Input
              label="Número Classificado"
              {...register('isbn', { required: 'O ISBN é obrigatório' })}
              error={errors.isbn?.message}
              placeholder="Número Classificado"
              fullWidth
            />
            
            <Input
              label="Editora"
              {...register('editora', { required: 'A editora é obrigatória' })}
              error={errors.editora?.message}
              placeholder="Nome da editora"
              fullWidth
            />
            
            <Input
              label="Ano de Publicação"
              type="number"
              {...register('anoPublicacao', { 
                required: 'O ano de publicação é obrigatório',
                valueAsNumber: true,
                min: { value: 1000, message: 'Ano inválido' },
                max: { value: new Date().getFullYear(), message: 'Não pode ser maior que o ano atual' }
              })}
              error={errors.anoPublicacao?.message}
              placeholder="Ano de publicação"
              fullWidth
            />
          </FormRow>
          
          <FormRow>
            <Select
              label="Categoria"
              {...register('categoria', { required: 'A categoria é obrigatória' })}
              error={errors.categoria?.message}
              options={Array.isArray(categorias) ? categorias.map(cat => ({ value: cat._id || '', label: cat.nome })) : []}
              fullWidth
            />
            
            <Input
              label="Quantidade "
              type="number"
              {...register('quantidade', { 
                required: 'A quantidade é obrigatória',
                valueAsNumber: true,
                min: { value: 1, message: 'Deve haver pelo menos 1 exemplar' }
              })}
              error={errors.quantidade?.message}
              placeholder="Quantidade total de exemplares"
              fullWidth
            />
            
            <Input
              label="Exemplares Disponíveis"
              type="number"
              {...register('disponiveis', { 
                valueAsNumber: true,
                min: { value: 0, message: 'Não pode ser negativo' },
                validate: value => {
                  const quantidade = watch('quantidade') || 0;
                  return !value || value <= quantidade || 'Não pode exceder a quantidade total';
                }
              })}
              error={errors.disponiveis?.message}
              placeholder={isEditMode ? "Quantidade disponível" : "Deixe em branco para igualar à quantidade total"}
              fullWidth
              disabled={!isEditMode}
            />
          </FormRow>
          
          <Input
            label="Novo Número de Classificação"
            {...register('localizacao')}
            error={errors.localizacao?.message}
            placeholder="Ex: Estante 3, Prateleira B"
            fullWidth
          />
          
          <Input
            label="URL da Capa"
            {...register('capa')}
            error={errors.capa?.message}
            placeholder="URL da imagem da capa"
            fullWidth
          />
          
          {capaUrl && (
            <ImagePreviewContainer>
              <h4>Pré-visualização da capa:</h4>
              <ImagePreview 
                src={capaUrl}
                alt="Pré-visualização da capa"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  toast.error('Erro ao carregar a imagem. Verifique o URL fornecido.');
                }}
              />
            </ImagePreviewContainer>
          )}
          
          <Input
            label="Descrição"
            {...register('descricao')}
            error={errors.descricao?.message}
            placeholder="Descrição do livro"
            fullWidth
            as="textarea"
            style={{ minHeight: '120px' }}
          />
          
          <ButtonContainer>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/livros')}
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

export default LivroFormPage;
