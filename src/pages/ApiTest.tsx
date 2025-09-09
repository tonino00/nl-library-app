import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { fetchLivros, pesquisarLivros } from '../features/livros/livroSlice';
import { fetchCategorias } from '../features/categorias/categoriaSlice';
import { AppDispatch, RootState } from '../store';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { toast } from 'react-toastify';

const Container = styled.div`
  padding: 20px;
`;

const Title = styled.h1`
  font-size: 1.75rem;
  margin-bottom: 20px;
`;

const Section = styled.div`
  margin-bottom: 30px;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 10px;
`;

const ResultsContainer = styled.div`
  background-color: #f5f5f5;
  border-radius: 4px;
  padding: 15px;
  margin-top: 15px;
  max-height: 300px;
  overflow-y: auto;
  font-family: monospace;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 15px;
`;

const FormRow = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
`;

const ApiTest: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { livros, isLoading: livrosLoading, error: livrosError } = useSelector((state: RootState) => state.livros);
  const { categorias, isLoading: categoriasLoading, error: categoriasError } = useSelector((state: RootState) => state.categorias);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<any>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const testGetLivros = async () => {
    try {
      setApiError(null);
      await dispatch(fetchLivros()).unwrap();
      setResults(livros);
      toast.success('API de Livros testada com sucesso!');
    } catch (error: any) {
      setApiError(error?.message || 'Erro ao testar a API de livros');
      toast.error('Erro ao testar a API de livros');
    }
  };

  const testGetCategorias = async () => {
    try {
      setApiError(null);
      await dispatch(fetchCategorias()).unwrap();
      setResults(categorias);
      toast.success('API de Categorias testada com sucesso!');
    } catch (error: any) {
      setApiError(error?.message || 'Erro ao testar a API de categorias');
      toast.error('Erro ao testar a API de categorias');
    }
  };

  const testSearchLivros = async () => {
    if (!searchTerm.trim()) {
      toast.warning('Digite um termo para pesquisar');
      return;
    }
    
    try {
      setApiError(null);
      await dispatch(pesquisarLivros(searchTerm)).unwrap();
      setResults(livros);
      toast.success('Pesquisa de livros realizada com sucesso!');
    } catch (error: any) {
      setApiError(error?.message || 'Erro ao pesquisar livros');
      toast.error('Erro ao pesquisar livros');
    }
  };

  return (
    <Container>
      <Title>Teste de Conexão com a API</Title>
      
      <Section>
        <SectionTitle>Livros</SectionTitle>
        <ButtonContainer>
          <Button onClick={testGetLivros} isLoading={livrosLoading}>
            Testar GET /api/livros
          </Button>
        </ButtonContainer>
      </Section>
      
      <Section>
        <SectionTitle>Categorias</SectionTitle>
        <ButtonContainer>
          <Button onClick={testGetCategorias} isLoading={categoriasLoading}>
            Testar GET /api/categorias
          </Button>
        </ButtonContainer>
      </Section>
      
      <Section>
        <SectionTitle>Pesquisar Livros</SectionTitle>
        <FormRow>
          <Input
            placeholder="Digite o termo de pesquisa"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            fullWidth
          />
          <Button onClick={testSearchLivros} isLoading={livrosLoading}>
            Testar GET /api/livros/busca
          </Button>
        </FormRow>
      </Section>
      
      {apiError && (
        <div style={{ backgroundColor: '#ffebee', marginBottom: '20px', borderRadius: '8px', padding: '15px' }}>
          <h3>Erro na API</h3>
          <p>{apiError}</p>
        </div>
      )}
      
      {results && (
        <Section>
          <SectionTitle>Resultados</SectionTitle>
          <ResultsContainer>
            <pre>{JSON.stringify(results, null, 2)}</pre>
          </ResultsContainer>
        </Section>
      )}
    </Container>
  );
};

export default ApiTest;
