import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { fetchCategorias, deleteCategoria } from '../../features/categorias/categoriaSlice';
import { AppDispatch, RootState } from '../../store';
import Button from '../../components/ui/Button';
import Table, { Column } from '../../components/ui/Table';
import SearchBar from '../../components/ui/SearchBar';
import Card from '../../components/ui/Card';
import { Categoria } from '../../types';
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

const CategoriasListPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { categorias, isLoading } = useSelector((state: RootState) => state.categorias);
  const { user } = useSelector((state: RootState) => state.auth);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCategorias, setFilteredCategorias] = useState<Categoria[]>([]);
  
  // Verificar se o usuário é admin ou bibliotecário
  const canEdit = user?.tipo === 'admin' || user?.tipo === 'bibliotecario';
  
  useEffect(() => {
    dispatch(fetchCategorias());
  }, [dispatch]);
  
  useEffect(() => {
    if (categorias) {
      setFilteredCategorias(
        categorias.filter(cat => 
          cat.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (cat.descricao && cat.descricao.toLowerCase().includes(searchTerm.toLowerCase()))
        )
      );
    }
  }, [categorias, searchTerm]);
  
  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };
  
  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta categoria?')) {
      try {
        await dispatch(deleteCategoria(id)).unwrap();
        toast.success('Categoria excluída com sucesso!');
      } catch (error: any) {
        toast.error(error || 'Erro ao excluir categoria');
      }
    }
  };
  
  const columns: Column<Categoria>[] = [
    {
      header: 'Nome',
      key: 'nome',
    },
    {
      header: 'Descrição',
      key: 'descricao',
      render: (item) => item.descricao || '-',
    },
    {
      header: 'Data de Criação',
      render: (item) => {
        return item.createdAt 
          ? new Date(item.createdAt).toLocaleDateString('pt-BR') 
          : '-';
      },
    },
    {
      header: 'Ações',
      render: (item) => (
        <ActionButtons>
          {canEdit && (
            <>
              <Button
                as={Link}
                to={`/categorias/editar/${item._id}`}
                variant="secondary"
                size="small"
                leftIcon={<FiEdit2 size={16} />}
              >
                Editar
              </Button>
              <Button
                variant="danger"
                size="small"
                leftIcon={<FiTrash2 size={16} />}
                onClick={() => item._id && handleDelete(item._id)}
              >
                Excluir
              </Button>
            </>
          )}
        </ActionButtons>
      ),
      align: 'right',
      width: '220px',
    },
  ];
  
  return (
    <div>
      <PageHeader>
        <PageTitle>Categorias</PageTitle>
        {canEdit && (
          <Button
            as={Link}
            to="/categorias/nova"
            variant="primary"
            leftIcon={<FiPlus size={16} />}
          >
            Nova Categoria
          </Button>
        )}
      </PageHeader>
      
      <Card>
        <SearchContainer>
          <SearchBar
            onSearch={handleSearch}
            placeholder="Pesquisar categorias..."
          />
        </SearchContainer>
        
        <Table
          columns={columns}
          data={filteredCategorias}
          keyExtractor={(item) => item._id || ''}
          isLoading={isLoading}
          emptyMessage="Nenhuma categoria encontrada"
          hoverable
          striped
        />
      </Card>
    </div>
  );
};

export default CategoriasListPage;
