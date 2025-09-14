import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { fetchCategorias, deleteCategoria } from '../../features/categorias/categoriaSlice';
import { AppDispatch, RootState } from '../../store';
import Button from '../../components/ui/Button';
import Table, { Column } from '../../components/ui/Table';
import SearchBar from '../../components/ui/SearchBar';
import Card from '../../components/ui/Card';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
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
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCategorias, setFilteredCategorias] = useState<Categoria[]>([]);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [categoriaToDelete, setCategoriaToDelete] = useState<string>('');
  
  // Verificar se o usuário é admin
  const canEdit = user?.tipo === 'admin';
  
  // Ref para controlar se já carregamos os dados
  const dataFetchedRef = React.useRef(false);

  useEffect(() => {
    // Verificar se precisamos forçar uma atualização dos dados
    const forceRefresh = location.state && (location.state as any).forceRefresh;
    
    // Buscar categorias apenas se ainda não buscamos ou se forceRefresh for true
    if (forceRefresh || !dataFetchedRef.current) {
      dispatch(fetchCategorias());
      dataFetchedRef.current = true;
    }
    
    // Limpar o state de navegação para evitar atualizações desnecessárias
    if (forceRefresh && window.history) {
      window.history.replaceState({}, '', location.pathname);
    }
  }, [dispatch, location]);
  
  useEffect(() => {
    // Verifica se categorias é um array antes de chamar filter
    if (categorias && Array.isArray(categorias)) {
      setFilteredCategorias(
        categorias.filter(cat => 
          cat.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (cat.descricao && cat.descricao.toLowerCase().includes(searchTerm.toLowerCase()))
        )
      );
    } else {
      // Inicializa com array vazio se não for um array válido
      setFilteredCategorias([]);
    }
  }, [categorias, searchTerm]);
  
  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };
  
  const handleDeleteClick = (id: string) => {
    setCategoriaToDelete(id);
    setConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await dispatch(deleteCategoria(categoriaToDelete)).unwrap();
      toast.success('Categoria excluída com sucesso!');
    } catch (error: any) {
      toast.error(error || 'Erro ao excluir categoria');
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
                onClick={() => item._id && handleDeleteClick(item._id)}
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

      <ConfirmDialog
        isOpen={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirmação"
        message="Tem certeza que deseja excluir esta categoria?"
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  );
};

export default CategoriasListPage;
