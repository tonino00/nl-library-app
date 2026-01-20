import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { FiArrowLeft, FiEdit2, FiMail, FiPhone, FiCalendar, FiMapPin, FiFileText } from 'react-icons/fi';
import { fetchUsuarioById } from '../../features/usuarios/usuarioSlice';
import { fetchEmprestimosByUsuario } from '../../features/emprestimos/emprestimoSlice';
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

const UserDetailsContainer = styled.div`
  display: grid;
  grid-template-columns: minmax(200px, 250px) 1fr;
  gap: 30px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Avatar = styled.div<{ url?: string }>`
  width: 100%;
  max-width: 250px;
  height: 250px;
  border-radius: var(--border-radius);
  background-color: ${({ url }) => (url ? 'transparent' : 'var(--primary-color)')};
  background-image: ${({ url }) => (url ? `url(${url})` : 'none')};
  background-size: cover;
  background-position: center;
  box-shadow: var(--box-shadow);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 5rem;
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

const UserType = styled.h3<{ isAdmin?: boolean }>`
  font-size: 1rem;
  color: ${({ isAdmin }) => isAdmin ? 'var(--primary-color)' : 'var(--light-text-color)'};
  margin: 0 0 20px 0;
  font-weight: 500;
  text-transform: capitalize;
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

const StatusBadge = styled.span<{ ativo: string }>`
  display: inline-block;
  padding: 6px 12px;
  border-radius: 16px;
  font-weight: 500;
  background-color: ${({ ativo }) => ativo === 'true' ? 'rgba(40, 167, 69, 0.2)' : 'rgba(220, 53, 69, 0.2)'};
  color: ${({ ativo }) => ativo === 'true' ? '#155724' : '#721c24'};
  margin-bottom: 20px;
`;

const SectionTitle = styled.h2`
  font-size: 1.3rem;
  margin: 30px 0 15px;
  color: var(--text-color);
`;

const UsuarioDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
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
      render: (item) => typeof item.livro === 'string' ? 'Carregando...' : item.livro.titulo,
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
      header: 'Ações',
      render: (item) => (
        <Button
          as={Link}
          to={`/emprestimos/${item._id}`}
          variant="info"
          size="small"
        >
          Detalhes
        </Button>
      ),
      align: 'right',
      width: '100px',
    }
  ];

  if (usuarioLoading) {
    return <div>Carregando detalhes do usuário...</div>;
  }

  if (!usuario) {
    return <div>Usuário não encontrado.</div>;
  }

  return (
    <div>
      <PageHeader>
        <BackButton
          variant="outline"
          size="small"
          leftIcon={<FiArrowLeft />}
          onClick={() => navigate('/usuarios')}
        >
          Voltar
        </BackButton>
        <PageTitle>Detalhes do Usuário</PageTitle>
        <Button
          as={Link}
          to={`/usuarios/editar/${id}`}
          variant="secondary"
          size="small"
          leftIcon={<FiEdit2 />}
        >
          Editar
        </Button>
      </PageHeader>
      
      <Card>
        <UserDetailsContainer>
          <div>
            <Avatar url={usuario.foto && usuario.foto.startsWith('http') ? usuario.foto : undefined}>
              {usuario.nome ? usuario.nome.charAt(0).toUpperCase() : 'U'}
            </Avatar>
          </div>
          
          <UserInfo>
            <UserName>{usuario.nome}</UserName>
            <UserType isAdmin={usuario.tipo === 'admin'}>
              {usuario.tipo || 'Leitor'}
            </UserType>
            
            <StatusBadge ativo={String(usuario.ativo !== false)}>
              {usuario.ativo !== false ? 'Usuário Ativo' : 'Usuário Inativo'}
            </StatusBadge>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
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
            </div>
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
        
        <div style={{ padding: '15px', textAlign: 'center' }}>
          <Button 
            as={Link} 
            to={`/emprestimos/novo?usuario=${id}`} 
            variant="primary"
          >
            Realizar Novo Empréstimo
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default UsuarioDetailPage;
