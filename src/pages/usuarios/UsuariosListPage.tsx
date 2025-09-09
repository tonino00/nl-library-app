import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import { fetchUsuarios, deleteUsuario, toggleAtivoUsuario } from '../../features/usuarios/usuarioSlice';
import { AppDispatch, RootState } from '../../store';
import Button from '../../components/ui/Button';
import Table, { Column } from '../../components/ui/Table';
import SearchBar from '../../components/ui/SearchBar';
import Card from '../../components/ui/Card';
import { Usuario } from '../../types';
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

const ActionButtons = styled.div`
  display: flex;
  gap: 10px;
`;

const SearchContainer = styled.div`
  margin-bottom: 20px;
`;

const Avatar = styled.div<{ url?: string }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${({ url }) => (url ? 'transparent' : 'var(--primary-color)')};
  background-image: ${({ url }) => (url ? `url(${url})` : 'none')};
  background-size: cover;
  background-position: center;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
`;

const StatusBadge = styled.span<{ ativo: boolean }>`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  background-color: ${({ ativo }) => ativo ? 'rgba(40, 167, 69, 0.2)' : 'rgba(220, 53, 69, 0.2)'};
  color: ${({ ativo }) => ativo ? '#155724' : '#721c24'};
`;

const UsuariosListPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { usuarios, isLoading } = useSelector((state: RootState) => state.usuarios);
  const { user } = useSelector((state: RootState) => state.auth);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsuarios, setFilteredUsuarios] = useState<Usuario[]>([]);
  
  // Verificar se o usuário é admin
  const isAdmin = user?.tipo === 'admin';
  
  useEffect(() => {
    dispatch(fetchUsuarios());
  }, [dispatch]);
  
  useEffect(() => {
    if (usuarios) {
      setFilteredUsuarios(
        usuarios.filter(usuario => 
          usuario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          usuario.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          usuario.documento.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
  }, [usuarios, searchTerm]);
  
  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };
  
  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
      try {
        await dispatch(deleteUsuario(id)).unwrap();
        toast.success('Usuário excluído com sucesso!');
      } catch (error: any) {
        toast.error(error || 'Erro ao excluir usuário');
      }
    }
  };
  
  const handleToggleAtivo = async (id: string) => {
    try {
      const result = await dispatch(toggleAtivoUsuario(id)).unwrap();
      const statusMessage = result.ativo ? 'ativado' : 'desativado';
      toast.success(`Usuário ${statusMessage} com sucesso!`);
    } catch (error: any) {
      toast.error(error || 'Erro ao alterar status do usuário');
    }
  };
  
  const formatDate = (date?: Date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR');
  };
  
  const columns: Column<Usuario>[] = [
    {
      header: '',
      width: '50px',
      render: (item) => (
        <Avatar url={item.foto}>
          {!item.foto && item.nome.charAt(0).toUpperCase()}
        </Avatar>
      ),
    },
    {
      header: 'Nome',
      key: 'nome',
    },
    {
      header: 'Email',
      key: 'email',
    },
    {
      header: 'Documento',
      key: 'documento',
    },
    {
      header: 'Tipo',
      render: (item) => (
        <span style={{ textTransform: 'capitalize' }}>
          {item.tipo || 'leitor'}
        </span>
      ),
    },
    {
      header: 'Status',
      render: (item) => (
        <StatusBadge ativo={item.ativo !== false}>
          {item.ativo !== false ? 'Ativo' : 'Inativo'}
        </StatusBadge>
      ),
    },
    {
      header: 'Ações',
      render: (item) => (
        <ActionButtons>
          <Button
            as={Link}
            to={`/usuarios/${item._id}`}
            variant="info"
            size="small"
            leftIcon={<FiEye size={16} />}
          >
            Ver
          </Button>
          <Button
            as={Link}
            to={`/usuarios/editar/${item._id}`}
            variant="secondary"
            size="small"
            leftIcon={<FiEdit2 size={16} />}
          >
            Editar
          </Button>
          <Button
            variant="primary"
            size="small"
            leftIcon={item.ativo !== false ? <FiToggleRight size={16} /> : <FiToggleLeft size={16} />}
            onClick={() => item._id && handleToggleAtivo(item._id)}
          >
            {item.ativo !== false ? 'Desativar' : 'Ativar'}
          </Button>
          {isAdmin && (
            <Button
              variant="danger"
              size="small"
              leftIcon={<FiTrash2 size={16} />}
              onClick={() => item._id && handleDelete(item._id)}
            >
              Excluir
            </Button>
          )}
        </ActionButtons>
      ),
      align: 'right',
      width: '320px',
    },
  ];
  
  return (
    <div>
      <PageHeader>
        <PageTitle>Usuários</PageTitle>
        <Button
          as={Link}
          to="/usuarios/novo"
          variant="primary"
          leftIcon={<FiPlus size={16} />}
        >
          Novo Usuário
        </Button>
      </PageHeader>
      
      <Card>
        <SearchContainer>
          <SearchBar
            onSearch={handleSearch}
            placeholder="Pesquisar usuários..."
          />
        </SearchContainer>
        
        <Table
          columns={columns}
          data={filteredUsuarios}
          keyExtractor={(item) => item._id || ''}
          isLoading={isLoading}
          emptyMessage="Nenhum usuário encontrado"
          hoverable
          striped
        />
      </Card>
    </div>
  );
};

export default UsuariosListPage;
