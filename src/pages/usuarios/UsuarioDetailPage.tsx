import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { FiArrowLeft, FiEdit2, FiMail, FiPhone, FiCalendar, FiMapPin, FiFileText } from 'react-icons/fi';
import { fetchUsuarioById } from '../../features/usuarios/usuarioSlice';
import { fetchEmprestimosByUsuario } from '../../features/emprestimos/emprestimoSlice';
import { AppDispatch, RootState } from '../../store';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Table, { Column } from '../../components/ui/Table';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Emprestimo } from '../../types';
import { getStatusColorVars, getStatusLabel } from '../../utils/statusEmprestimo';

const PageHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  gap: 15px;
  flex-wrap: wrap;
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
`;

const BackButton = styled(Button)`
  margin-right: 10px;
`;

const PageTitle = styled.h1`
  font-size: 1.75rem;
  color: var(--text-color);
  margin: 0;
`;

const UserDetailsContainer = styled.div`
  display: grid;
  grid-template-columns: minmax(200px, 250px) 1fr;
  gap: 30px;

  /* Item de grid não encolhe abaixo do conteúdo por padrão — sem isso, um
     valor longo dentro empurra a página inteira pro lado no mobile. */
  & > * {
    min-width: 0;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Avatar = styled.div<{ $url?: string }>`
  width: 160px;
  max-width: 100%;
  height: 160px;
  margin: 0 auto;
  border-radius: 50%;
  background-color: ${({ $url }) => ($url ? 'transparent' : 'var(--primary-color)')};
  background-image: ${({ $url }) => ($url ? `url(${$url})` : 'none')};
  background-size: cover;
  background-position: center;
  box-shadow: var(--box-shadow);
  color: var(--surface-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  font-weight: 600;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const UserName = styled.h2`
  font-size: 1.5rem;
  color: var(--text-color);
  margin: 0 0 5px 0;
`;

const UserType = styled.h3<{ $isAdmin?: boolean }>`
  font-size: 1rem;
  color: ${({ $isAdmin }) => $isAdmin ? 'var(--primary-color)' : 'var(--light-text-color)'};
  margin: 0 0 20px 0;
  font-weight: 500;
  text-transform: capitalize;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  row-gap: 4px;
  margin-bottom: 12px;
  /* Sem isso, um valor longo (e-mail, endereço) não quebra linha e empurra
     a célula (e a página inteira) pra fora da tela no mobile. */
  min-width: 0;
  overflow-wrap: break-word;
  word-break: break-word;

  svg {
    margin-right: 10px;
    color: var(--primary-color);
    flex-shrink: 0;
  }
`;

const InfoLabel = styled.span`
  font-weight: 500;
  margin-right: 8px;
`;

const StatusBadge = styled.span<{ $ativo: string }>`
  display: inline-block;
  padding: 6px 12px;
  border-radius: 16px;
  font-weight: 500;
  background-color: ${({ $ativo }) =>
    $ativo === 'true' ? 'var(--status-success-bg)' : 'var(--status-danger-bg)'};
  color: ${({ $ativo }) =>
    $ativo === 'true' ? 'var(--status-success-text)' : 'var(--status-danger-text)'};
  margin-bottom: 20px;
`;

const EmprestimoStatus = styled.span<{ $status: string }>`
  display: inline-block;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;

  ${({ $status }) => {
    const { bg, text } = getStatusColorVars($status);
    return `
      background-color: ${bg};
      color: ${text};
    `;
  }}
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;

  & > * {
    min-width: 0;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ActionContainer = styled.div`
  padding: 15px;
  text-align: center;
`;

const SectionTitle = styled.h2`
  font-size: 1.3rem;
  margin: 30px 0 15px;
  color: var(--text-color);
`;

const UsuarioDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { usuario, isLoading: usuarioLoading } = useSelector((state: RootState) => state.usuarios);
  const { emprestimos, isLoading: emprestimosLoading } = useSelector((state: RootState) => state.emprestimos);
  
  useEffect(() => {
    if (id) {
      dispatch(fetchUsuarioById(id));
      dispatch(fetchEmprestimosByUsuario(id));
    }
  }, [dispatch, id]);
  
  const formatDate = (date?: Date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR');
  };
  
  const columns: Column<Emprestimo>[] = [
    {
      header: 'Livro',
      render: (item) =>
        typeof item.livro === 'string' ? 'Carregando...' : item.livro?.titulo || 'Livro removido',
    },
    {
      header: 'Data Empréstimo',
      render: (item) => formatDate(item.dataEmprestimo),
    },
    {
      header: 'Data de Entrega',
      render: (item) => formatDate(item.dataPrevistaDevolucao),
    },
    {
      header: 'Status',
      render: (item) => (
        <EmprestimoStatus $status={item.status || 'pendente'}>
          {getStatusLabel(item.status)}
        </EmprestimoStatus>
      ),
    },
    {
      header: 'Ações',
      render: (item) => (
        <Button
          as={Link}
          to={`/emprestimos/${item._id}`}
          variant="info"
          size="medium"
        >
          Detalhes
        </Button>
      ),
      align: 'right',
    }
  ];

  if (usuarioLoading) {
    return (
      <LoadingContainer>
        <LoadingSpinner size="medium" message="Carregando detalhes do usuário..." />
      </LoadingContainer>
    );
  }

  if (!usuario) {
    return <div role="alert">Usuário não encontrado.</div>;
  }

  return (
    <div>
      <PageHeader>
        <BackButton
          as={Link}
          to="/usuarios"
          variant="outline"
          size="medium"
          leftIcon={<FiArrowLeft />}
        >
          Voltar
        </BackButton>
        <PageTitle>Detalhes do Usuário</PageTitle>
        <Button
          as={Link}
          to={`/usuarios/editar/${id}`}
          variant="secondary"
          size="medium"
          leftIcon={<FiEdit2 />}
        >
          Editar
        </Button>
      </PageHeader>
      
      <Card>
        <UserDetailsContainer>
          <div>
            <Avatar $url={usuario.foto && usuario.foto.startsWith('http') ? usuario.foto : undefined}>
              {usuario.nome ? usuario.nome.charAt(0).toUpperCase() : 'U'}
            </Avatar>
          </div>
          
          <UserInfo>
            <UserName>{usuario.nome}</UserName>
            <UserType $isAdmin={usuario.tipo === 'admin'}>
              {usuario.tipo || 'Leitor'}
            </UserType>
            
            <StatusBadge $ativo={String(usuario.ativo !== false)}>
              {usuario.ativo !== false ? 'Usuário Ativo' : 'Usuário Inativo'}
            </StatusBadge>
            
            <InfoGrid>
              <InfoItem>
                <FiMail />
                <InfoLabel>Email:</InfoLabel>
                {usuario.email}
              </InfoItem>
              
              <InfoItem>
                <FiPhone />
                <InfoLabel>Telefone:</InfoLabel>
                {usuario.telefone}
              </InfoItem>
              
              <InfoItem>
                <FiFileText />
                <InfoLabel>Documento:</InfoLabel>
                {usuario.documento}
              </InfoItem>
              
              <InfoItem>
                <FiCalendar />
                <InfoLabel>Data de Nascimento:</InfoLabel>
                {formatDate(usuario.dataNascimento)}
              </InfoItem>
              
              {usuario.endereco && (
                <InfoItem>
                  <FiMapPin />
                  <InfoLabel>Endereço:</InfoLabel>
                  {usuario.endereco}
                </InfoItem>
              )}
              
              <InfoItem>
                <FiCalendar />
                <InfoLabel>Cadastrado em:</InfoLabel>
                {formatDate(usuario.createdAt)}
              </InfoItem>
            </InfoGrid>
          </UserInfo>
        </UserDetailsContainer>
      </Card>
      
      <SectionTitle>Histórico de Empréstimos</SectionTitle>
      
      <Card>
        <Table
          columns={columns}
          data={emprestimos}
          keyExtractor={(item) => item._id || ''}
          isLoading={emprestimosLoading}
          emptyMessage="Nenhum histórico de empréstimo para este usuário"
          hoverable
          striped
        />
        
        <ActionContainer>
          <Button 
            as={Link} 
            to={`/emprestimos/novo?usuario=${id}`} 
            variant="primary"
          >
            Realizar Novo Empréstimo
          </Button>
        </ActionContainer>
      </Card>
    </div>
  );
};

export default UsuarioDetailPage;
