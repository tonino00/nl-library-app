import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { FiPlus, FiEye, FiCheck, FiRepeat, FiFilter, FiTrash2, FiEdit } from 'react-icons/fi';
import { fetchEmprestimos, finalizarEmprestimo, renovarEmprestimo, deleteEmprestimo } from '../../features/emprestimos/emprestimoSlice';
import { AppDispatch, RootState } from '../../store';
import Button from '../../components/ui/Button';
import Table, { Column } from '../../components/ui/Table';
import SearchBar from '../../components/ui/SearchBar';
import Select from '../../components/ui/Select';
import Card from '../../components/ui/Card';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { Emprestimo } from '../../types';
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

const StatusBadge = styled.span<{ $status: string }>`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  
  ${({ $status }) => {
    switch ($status) {
      case 'pendente':
        return `
          background-color: rgba(255, 193, 7, 0.2);
          color: #856404;
        `;
      case 'devolvido':
        return `
          background-color: rgba(40, 167, 69, 0.2);
          color: #155724;
        `;
      case 'atrasado':
        return `
          background-color: rgba(220, 53, 69, 0.2);
          color: #721c24;
        `;
      case 'renovado':
        return `
          background-color: rgba(23, 162, 184, 0.2);
          color: #117a8b;
        `;
      default:
        return `
          background-color: rgba(108, 117, 125, 0.2);
          color: #6c757d;
        `;
    }
  }}
`;

const EmprestimosListPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { emprestimos, isLoading } = useSelector((state: RootState) => state.emprestimos);
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [filteredEmprestimos, setFilteredEmprestimos] = useState<Emprestimo[]>([]);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [emprestimoToDelete, setEmprestimoToDelete] = useState<string>('');
  const [confirmFinalizarOpen, setConfirmFinalizarOpen] = useState(false);
  const [emprestimoToFinalizar, setEmprestimoToFinalizar] = useState<string>('');
  const [confirmRenovarOpen, setConfirmRenovarOpen] = useState(false);
  const [emprestimoToRenovar, setEmprestimoToRenovar] = useState<string>('');
  
  // Ref para controlar se já carregamos os dados
  const dataFetchedRef = React.useRef(false);
  
  useEffect(() => {
    // Verificar se precisamos forçar uma atualização dos dados
    const forceRefresh = location.state && (location.state as any).forceRefresh;
    
    // Buscar empréstimos apenas se ainda não buscamos ou se forceRefresh for true
    if (forceRefresh || !dataFetchedRef.current) {
      dispatch(fetchEmprestimos());
      dataFetchedRef.current = true;
    }
    
    // Limpar o state de navegação para evitar atualizações desnecessárias
    if (forceRefresh && window.history) {
      window.history.replaceState({}, '', location.pathname);
    }
  }, [dispatch, location]);
  
  useEffect(() => {
    // Verifica se emprestimos é um array válido
    if (emprestimos && Array.isArray(emprestimos)) {
      let filtered = [...emprestimos];
      
      // Aplicar filtro de status se selecionado
      if (statusFilter && statusFilter !== 'todos') {
        filtered = filtered.filter(emp => emp.status === statusFilter);
      }
      
      // Aplicar filtro de busca se houver termo
      if (searchTerm) {
        filtered = filtered.filter(emp => {
          const livroTitulo = typeof emp.livro === 'object' && emp.livro?.titulo 
            ? emp.livro.titulo.toLowerCase()
            : '';
          
          const usuarioNome = typeof emp.usuario === 'object' && emp.usuario?.nome
            ? emp.usuario.nome.toLowerCase()
            : '';
          
          return livroTitulo.includes(searchTerm.toLowerCase()) || 
                 usuarioNome.includes(searchTerm.toLowerCase());
        });
      }
      
      setFilteredEmprestimos(filtered);
    } else {
      // Se não for um array válido, inicializa com array vazio
      setFilteredEmprestimos([]);
    }
  }, [emprestimos, searchTerm, statusFilter]);
  
  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };
  
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
  };
  
  const handleFinalizarClick = (id: string) => {
    setEmprestimoToFinalizar(id);
    setConfirmFinalizarOpen(true);
  };

  const handleConfirmFinalizar = async () => {
    try {
      await dispatch(finalizarEmprestimo(emprestimoToFinalizar)).unwrap();
      toast.success('Empréstimo finalizado com sucesso!');
    } catch (error: any) {
      toast.error(error || 'Erro ao finalizar empréstimo');
    }
  };
  
  const handleRenovarClick = (id: string) => {
    setEmprestimoToRenovar(id);
    setConfirmRenovarOpen(true);
  };

  const handleConfirmRenovar = async () => {
    try {
      await dispatch(renovarEmprestimo(emprestimoToRenovar)).unwrap();
      toast.success('Empréstimo renovado com sucesso!');
    } catch (error: any) {
      toast.error(error || 'Erro ao renovar empréstimo');
    }
  };

  const handleRemoveClick = (id: string) => {
    setEmprestimoToDelete(id);
    setConfirmDeleteOpen(true);
  };

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
  
  const columns: Column<Emprestimo>[] = [
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
          {item.status || 'pendente'}
        </StatusBadge>
      ),
    },
    {
      header: 'Ações',
      render: (item) => (
        <ActionButtons>
          <Button
            as={Link}
            to={`/emprestimos/${item._id}`}
            variant="info"
            size="small"
            leftIcon={<FiEye size={16} />}
          >
            Ver
          </Button>
          
          {(item.status === 'pendente' || item.status === 'renovado' || item.status === 'atrasado') && (
            <>
              <Button
                variant="success"
                size="small"
                leftIcon={<FiCheck size={16} />}
                onClick={() => item._id && handleFinalizarClick(item._id)}
              >
                Devolver
              </Button>
              
              {item.renovacoes === undefined || item.renovacoes < 2 ? (
                <Button
                  variant="primary"
                  size="small"
                  leftIcon={<FiRepeat size={16} />}
                  onClick={() => item._id && handleRenovarClick(item._id)}
                >
                  Renovar
                </Button>
              ) : null}
            </>
          )}
          
          <Button
            as={Link}
            to={`/emprestimos/editar/${item._id}`}
            variant="secondary"
            size="small"
            leftIcon={<FiEdit size={16} />}
          >
            Editar
          </Button>
          
          <Button
            variant="danger"
            size="small"
            leftIcon={<FiTrash2 size={16} />}
            onClick={() => item._id && handleRemoveClick(item._id)}
          >
            Excluir
          </Button>
        </ActionButtons>
      ),
      align: 'right',
      width: '360px',
    },
  ];
  
  return (
    <div>
      <PageHeader>
        <PageTitle>Empréstimos</PageTitle>
        <Button
          as={Link}
          to="/emprestimos/novo"
          variant="primary"
          leftIcon={<FiPlus size={16} />}
        >
          Novo Empréstimo
        </Button>
      </PageHeader>
      
      <Card>
        <SearchContainer>
          <div style={{ flexGrow: 1 }}>
            <SearchBar
              onSearch={handleSearch}
              placeholder="Pesquisar por livro ou usuário..."
            />
          </div>
          <FilterContainer>
            <Select
              label="Filtrar por status"
              value={statusFilter}
              onChange={handleStatusChange}
              options={[
                { value: 'todos', label: 'Todos os status' },
                { value: 'pendente', label: 'Pendentes' },
                { value: 'renovado', label: 'Renovados' },
                { value: 'reservado', label: 'Reservado' },
                { value: 'devolvido', label: 'Devolvidos' },
                { value: 'atrasado', label: 'Atrasados' },
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
