import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { FiPlus, FiEye, FiCheck, FiRepeat, FiFilter } from 'react-icons/fi';
import { fetchEmprestimos, finalizarEmprestimo, renovarEmprestimo } from '../../features/emprestimos/emprestimoSlice';
import { AppDispatch, RootState } from '../../store';
import Button from '../../components/ui/Button';
import Table, { Column } from '../../components/ui/Table';
import SearchBar from '../../components/ui/SearchBar';
import Select from '../../components/ui/Select';
import Card from '../../components/ui/Card';
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

const StatusBadge = styled.span<{ status: string }>`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  
  ${({ status }) => {
    switch (status) {
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
  
  useEffect(() => {
    // Verificar se precisamos forçar uma atualização dos dados
    const forceRefresh = location.state && (location.state as any).forceRefresh;
    
    // Buscar empréstimos ao carregar o componente ou quando forceRefresh for true
    dispatch(fetchEmprestimos());
    
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
  
  const handleFinalizar = async (id: string) => {
    if (window.confirm('Deseja finalizar este empréstimo? Isso irá registrar a devolução do livro.')) {
      try {
        await dispatch(finalizarEmprestimo(id)).unwrap();
        toast.success('Empréstimo finalizado com sucesso!');
      } catch (error: any) {
        toast.error(error || 'Erro ao finalizar empréstimo');
      }
    }
  };
  
  const handleRenovar = async (id: string) => {
    if (window.confirm('Deseja renovar este empréstimo?')) {
      try {
        await dispatch(renovarEmprestimo(id)).unwrap();
        toast.success('Empréstimo renovado com sucesso!');
      } catch (error: any) {
        toast.error(error || 'Erro ao renovar empréstimo');
      }
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
      header: 'Data Prevista',
      render: (item) => formatDate(item.dataPrevistaDevolucao),
    },
    {
      header: 'Status',
      render: (item) => (
        <StatusBadge status={item.status || 'pendente'}>
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
                onClick={() => item._id && handleFinalizar(item._id)}
              >
                Devolver
              </Button>
              
              {item.renovacoes === undefined || item.renovacoes < 2 ? (
                <Button
                  variant="primary"
                  size="small"
                  leftIcon={<FiRepeat size={16} />}
                  onClick={() => item._id && handleRenovar(item._id)}
                >
                  Renovar
                </Button>
              ) : null}
            </>
          )}
        </ActionButtons>
      ),
      align: 'right',
      width: '280px',
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
    </div>
  );
};

export default EmprestimosListPage;
