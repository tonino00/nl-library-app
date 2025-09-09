import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { FiArrowLeft, FiEdit2, FiCalendar, FiTag, FiMapPin, FiRepeat } from 'react-icons/fi';
import { fetchLivroById } from '../../features/livros/livroSlice';
import { fetchEmprestimosByLivro } from '../../features/emprestimos/emprestimoSlice';
import { AppDispatch, RootState } from '../../store';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Table, { Column } from '../../components/ui/Table';
import { Emprestimo } from '../../types';

const PageHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  gap: 15px;
`;

const BackButton = styled(Button)`
  margin-right: 10px;
`;

const PageTitle = styled.h1`
  font-size: 1.75rem;
  color: var(--text-color);
  margin: 0;
`;

const BookDetailsContainer = styled.div`
  display: grid;
  grid-template-columns: minmax(200px, 250px) 1fr;
  gap: 30px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const BookCover = styled.img`
  width: 100%;
  max-width: 250px;
  box-shadow: var(--box-shadow);
  border-radius: var(--border-radius);
`;

const DefaultCover = styled.div`
  width: 100%;
  max-width: 250px;
  aspect-ratio: 2/3;
  background-color: #eee;
  border-radius: var(--border-radius);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--box-shadow);
  font-size: 4rem;
  color: var(--light-text-color);
`;

const BookInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const BookTitle = styled.h2`
  font-size: 1.5rem;
  color: var(--text-color);
  margin: 0 0 5px 0;
`;

const Author = styled.h3`
  font-size: 1.1rem;
  color: var(--light-text-color);
  margin: 0 0 20px 0;
  font-weight: 500;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  
  svg {
    margin-right: 10px;
    color: var(--primary-color);
  }
`;

const InfoLabel = styled.span`
  font-weight: 500;
  margin-right: 8px;
`;

const BookDescription = styled.p`
  color: var(--text-color);
  line-height: 1.6;
  margin-top: 20px;
`;

const AvailabilityBadge = styled.div<{ available: boolean }>`
  display: inline-block;
  padding: 6px 12px;
  border-radius: 16px;
  font-weight: 500;
  background-color: ${({ available }) => available ? 'rgba(40, 167, 69, 0.2)' : 'rgba(220, 53, 69, 0.2)'};
  color: ${({ available }) => available ? '#155724' : '#721c24'};
  margin-bottom: 20px;
`;

const SectionTitle = styled.h2`
  font-size: 1.3rem;
  margin: 30px 0 15px;
  color: var(--text-color);
`;

const LivroDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { livro, isLoading: livroLoading } = useSelector((state: RootState) => state.livros);
  const { emprestimos, isLoading: emprestimosLoading } = useSelector((state: RootState) => state.emprestimos);
  const { categorias } = useSelector((state: RootState) => state.categorias);
  const { user } = useSelector((state: RootState) => state.auth);

  // Verificar se o usuário é admin ou bibliotecário
  const canEdit = user?.tipo === 'admin' || user?.tipo === 'bibliotecario';
  
  useEffect(() => {
    if (id) {
      dispatch(fetchLivroById(id));
      dispatch(fetchEmprestimosByLivro(id));
    }
  }, [dispatch, id]);
  
  const formatCategoriaName = () => {
    if (!livro || !livro.categoria) return 'Não categorizado';
    
    if (typeof livro.categoria === 'string') {
      const foundCategoria = categorias.find(cat => cat._id === livro.categoria);
      return foundCategoria ? foundCategoria.nome : 'Não categorizado';
    }
    
    return livro.categoria.nome || 'Não categorizado';
  };
  
  const formatDate = (date?: Date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR');
  };
  
  const columns: Column<Emprestimo>[] = [
    {
      header: 'Usuário',
      render: (item) => typeof item.usuario === 'string' ? 'Carregando...' : item.usuario.nome,
    },
    {
      header: 'Data Empréstimo',
      render: (item) => formatDate(item.dataEmprestimo),
    },
    {
      header: 'Data Prevista',
      render: (item) => formatDate(item.dataPrevistaDevolucao),
    },
    {
      header: 'Status',
      render: (item) => (
        <span style={{ 
          textTransform: 'capitalize',
          color: item.status === 'atrasado' ? 'var(--danger-color)' : 
                 item.status === 'devolvido' ? 'var(--success-color)' : 
                 'var(--primary-color)'
        }}>
          {item.status || 'pendente'}
        </span>
      ),
    },
    {
      header: 'Devolução',
      render: (item) => formatDate(item.dataDevolucao),
    },
  ];

  if (livroLoading) {
    return <div>Carregando detalhes do livro...</div>;
  }

  if (!livro) {
    return <div>Livro não encontrado.</div>;
  }

  return (
    <div>
      <PageHeader>
        <BackButton
          variant="outline"
          size="small"
          leftIcon={<FiArrowLeft />}
          onClick={() => navigate('/livros')}
        >
          Voltar
        </BackButton>
        <PageTitle>Detalhes do Livro</PageTitle>
        {canEdit && (
          <Button
            as={Link}
            to={`/livros/editar/${id}`}
            variant="secondary"
            size="small"
            leftIcon={<FiEdit2 />}
          >
            Editar
          </Button>
        )}
      </PageHeader>
      
      <Card>
        <BookDetailsContainer>
          <div>
            {livro.capa ? (
              <BookCover src={livro.capa} alt={livro.titulo} />
            ) : (
              <DefaultCover>📕</DefaultCover>
            )}
          </div>
          
          <BookInfo>
            <BookTitle>{livro.titulo}</BookTitle>
            <Author>{livro.autor}</Author>
            
            <AvailabilityBadge available={(livro.disponiveis || 0) > 0}>
              {(livro.disponiveis || 0) > 0 
                ? `Disponível (${livro.disponiveis}/${livro.quantidade})` 
                : 'Indisponível'}
            </AvailabilityBadge>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <InfoItem>
                <FiTag />
                <InfoLabel>ISBN:</InfoLabel>
                {livro.isbn}
              </InfoItem>
              
              <InfoItem>
                <FiCalendar />
                <InfoLabel>Ano:</InfoLabel>
                {livro.anoPublicacao}
              </InfoItem>
              
              <InfoItem>
                <InfoLabel>Editora:</InfoLabel>
                {livro.editora}
              </InfoItem>
              
              <InfoItem>
                <FiTag />
                <InfoLabel>Categoria:</InfoLabel>
                {formatCategoriaName()}
              </InfoItem>
              
              {livro.localizacao && (
                <InfoItem>
                  <FiMapPin />
                  <InfoLabel>Localização:</InfoLabel>
                  {livro.localizacao}
                </InfoItem>
              )}
            </div>
            
            {livro.descricao && (
              <BookDescription>
                {livro.descricao}
              </BookDescription>
            )}
          </BookInfo>
        </BookDetailsContainer>
      </Card>
      
      {canEdit && (
        <>
          <SectionTitle>Histórico de Empréstimos</SectionTitle>
          
          <Card>
            <Table
              columns={columns}
              data={emprestimos}
              keyExtractor={(item) => item._id || ''}
              isLoading={emprestimosLoading}
              emptyMessage="Nenhum histórico de empréstimo para este livro"
              hoverable
              striped
            />
          </Card>
        </>
      )}
    </div>
  );
};

export default LivroDetailPage;
