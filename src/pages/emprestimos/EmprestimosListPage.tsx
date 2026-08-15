import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FiPlus, FiEye, FiCheck, FiRepeat, FiTrash2, FiEdit } from 'react-icons/fi';
import { fetchEmprestimos, finalizarEmprestimo, renovarEmprestimo, deleteEmprestimo } from '../../features/emprestimos/emprestimoSlice';
import { AppDispatch, RootState } from '../../store';
import Button from '../../components/ui/Button';
import Table, { Column } from '../../components/ui/Table';
import SearchBar from '../../components/ui/SearchBar';
import Select from '../../components/ui/Select';
import Card from '../../components/ui/Card';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import DropdownMenu, { DropdownMenuItem } from '../../components/ui/DropdownMenu';
import { Emprestimo } from '../../types';
import { toast } from 'react-toastify';
import { getStatusColorVars, getStatusLabel } from '../../utils/statusEmprestimo';

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

const SearchContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  align-items: flex-end;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const FilterContainer = styled.div`
  min-width: 200px;
`;

const SearchInputWrapper = styled.div`
  flex-grow: 1;
`;

const StatusBadge = styled.span<{ $status: string }>`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;

  ${({ $status }) => {
    const { bg, text } = getStatusColorVars($status);
    return `
      background-color: ${bg};
      color: ${text};
    `;
  }}
`;

const EmprestimosListPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { emprestimos, isLoading, isDataLoaded } = useSelector((state: RootState) => state.emprestimos);
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [emprestimoToDelete, setEmprestimoToDelete] = useState<string>('');
  const [confirmFinalizarOpen, setConfirmFinalizarOpen] = useState(false);
  const [emprestimoToFinalizar, setEmprestimoToFinalizar] = useState<string>('');
  const [confirmRenovarOpen, setConfirmRenovarOpen] = useState(false);
  const [emprestimoToRenovar, setEmprestimoToRenovar] = useState<string>('');
  
  useEffect(() => {
    // Verificar se precisamos forçar uma atualização dos dados
    const forceRefresh = location.state && (location.state as any).forceRefresh;
    
    // Buscar empréstimos apenas se ainda não buscamos ou se forceRefresh for true
    if (forceRefresh || !isDataLoaded) {
      dispatch(fetchEmprestimos(forceRefresh || false));
    }
    
    // Limpar o state de navegação para evitar atualizações desnecessárias
    if (forceRefresh && window.history) {
      window.history.replaceState({}, '', location.pathname);
    }
  }, [dispatch, location, isDataLoaded]);
  
  // Deriva a lista filtrada durante o render, sem estado extra nem re-render duplicado
  const filteredEmprestimos = useMemo(() => {
    if (!Array.isArray(emprestimos)) return [];

    let filtered = emprestimos;

    if (statusFilter && statusFilter !== 'todos') {
      filtered = filtered.filter(emp => emp.status === statusFilter);
    }

    if (searchTerm) {
      const termo = searchTerm.toLowerCase();
      filtered = filtered.filter(emp => {
        const livroTitulo = typeof emp.livro === 'object' && emp.livro?.titulo
          ? emp.livro.titulo.toLowerCase()
          : '';

        const usuarioNome = typeof emp.usuario === 'object' && emp.usuario?.nome
          ? emp.usuario.nome.toLowerCase()
          : '';

        return livroTitulo.includes(termo) || usuarioNome.includes(termo);
      });
    }

    return filtered;
  }, [emprestimos, searchTerm, statusFilter]);

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  const handleStatusChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
  }, []);

  const handleFinalizarClick = useCallback((id: string) => {
    setEmprestimoToFinalizar(id);
    setConfirmFinalizarOpen(true);
  }, []);

  const handleConfirmFinalizar = async () => {
    try {
      await dispatch(finalizarEmprestimo(emprestimoToFinalizar)).unwrap();
      toast.success('Empréstimo finalizado com sucesso!');
    } catch (error: any) {
      toast.error(error || 'Erro ao finalizar empréstimo');
    }
  };
  
  const handleRenovarClick = useCallback((id: string) => {
    setEmprestimoToRenovar(id);
    setConfirmRenovarOpen(true);
  }, []);

  const handleConfirmRenovar = async () => {
    try {
      await dispatch(renovarEmprestimo(emprestimoToRenovar)).unwrap();
      toast.success('Empréstimo renovado com sucesso!');
    } catch (error: any) {
      toast.error(error || 'Erro ao renovar empréstimo');
    }
  };

  const handleRemoveClick = useCallback((id: string) => {
    setEmprestimoToDelete(id);
    setConfirmDeleteOpen(true);
  }, []);

  const handleConfirmRemove = async () => {
    try {
      await dispatch(deleteEmprestimo(emprestimoToDelete)).unwrap();
      toast.success('Empréstimo excluído com sucesso!');
    } catch (error: any) {
      toast.error(error || 'Erro ao excluir empréstimo');
    }
  };
  
  const formatDate = (date?: Date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR');
  };
  
  const getLivroTitulo = (emprestimo: Emprestimo) => {
    if (typeof emprestimo.livro === 'object' && emprestimo.livro) {
      return emprestimo.livro.titulo;
    }
    return 'Carregando...';
  };
  
  const getUsuarioNome = (emprestimo: Emprestimo) => {
    if (typeof emprestimo.usuario === 'object' && emprestimo.usuario) {
      return emprestimo.usuario.nome;
    }
    return 'Carregando...';
  };
  
  const columns: Column<Emprestimo>[] = useMemo(() => [
    {
      header: 'Livro',
      render: (item) => getLivroTitulo(item),
    },
    {
      header: 'Usuário',
      render: (item) => getUsuarioNome(item),
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
        <StatusBadge $status={item.status || 'pendente'}>
          {getStatusLabel(item.status)}
        </StatusBadge>
      ),
    },
    {
      header: 'Ações',
      width: '70px',
      render: (item) => {
        const podeGerenciar = item.status === 'pendente' || item.status === 'renovado' || item.status === 'atrasado';
        const menuItems: DropdownMenuItem[] = [
          {
            label: 'Ver',
            icon: <FiEye size={16} />,
            onClick: () => navigate(`/emprestimos/${item._id}`),
          },
          ...(podeGerenciar
            ? [
                {
                  label: 'Devolver',
                  icon: <FiCheck size={16} />,
                  onClick: () => item._id && handleFinalizarClick(item._id),
                },
              ]
            : []),
          ...(podeGerenciar && (item.renovacoes === undefined || item.renovacoes < 2)
            ? [
                {
                  label: 'Renovar',
                  icon: <FiRepeat size={16} />,
                  onClick: () => item._id && handleRenovarClick(item._id),
                },
              ]
            : []),
          {
            label: 'Editar',
            icon: <FiEdit size={16} />,
            onClick: () => navigate(`/emprestimos/editar/${item._id}`),
          },
          {
            label: 'Excluir',
            icon: <FiTrash2 size={16} />,
            variant: 'danger',
            onClick: () => item._id && handleRemoveClick(item._id),
          },
        ];

        return <DropdownMenu triggerLabel={`Ações para o empréstimo de ${getLivroTitulo(item)}`} items={menuItems} />;
      },
      align: 'right',
    },
  ], [handleFinalizarClick, handleRenovarClick, handleRemoveClick, navigate]);
  
  return (
    <div>
      <PageHeader>
        <PageTitle>Empréstimos</PageTitle>
        <Button
          as={Link}
          to="/emprestimos/novo"
          variant="secondary"
          leftIcon={<FiPlus size={16} />}
        >
          Novo Empréstimo
        </Button>
      </PageHeader>
      
      <Card>
        <SearchContainer>
          <SearchInputWrapper>
            <SearchBar
              onSearch={handleSearch}
              placeholder="Pesquisar por livro ou usuário..."
            />
          </SearchInputWrapper>
          <FilterContainer>
            <Select
              label="Filtrar por status"
              value={statusFilter}
              onChange={handleStatusChange}
              options={[
                { value: 'todos', label: 'Todos os status' },
                { value: 'pendente', label: 'Pendentes' },
                { value: 'renovado', label: 'Renovados' },
                { value: 'reservado', label: 'Reservados' },
                { value: 'emprestado', label: 'Emprestados' },
                { value: 'devolvido', label: 'Devolvidos' },
                { value: 'atrasado', label: 'Atrasados' },
                { value: 'expirado', label: 'Reservas expiradas' },
              ]}
              fullWidth
            />
          </FilterContainer>
        </SearchContainer>
        
        <Table
          columns={columns}
          data={filteredEmprestimos}
          keyExtractor={(item) => item._id || ''}
          isLoading={isLoading}
          emptyMessage="Nenhum empréstimo encontrado"
          hoverable
          striped
          paginated={true}
          itemsPerPage={6}
        />
      </Card>

      <ConfirmDialog
        isOpen={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={handleConfirmRemove}
        title="Confirmação"
        message="Deseja realmente excluir este empréstimo? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
      />

      <ConfirmDialog
        isOpen={confirmFinalizarOpen}
        onClose={() => setConfirmFinalizarOpen(false)}
        onConfirm={handleConfirmFinalizar}
        title="Confirmação"
        message="Deseja finalizar este empréstimo? Isso irá registrar a devolução do livro."
        confirmText="Confirmar"
        cancelText="Cancelar"
        variant="info"
      />

      <ConfirmDialog
        isOpen={confirmRenovarOpen}
        onClose={() => setConfirmRenovarOpen(false)}
        onConfirm={handleConfirmRenovar}
        title="Confirmação"
        message="Deseja renovar este empréstimo?"
        confirmText="Renovar"
        cancelText="Cancelar"
        variant="warning"
      />
    </div>
  );
};

export default EmprestimosListPage;
