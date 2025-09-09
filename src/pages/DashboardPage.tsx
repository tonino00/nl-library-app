import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FiBook, FiUsers, FiRepeat, FiAlertTriangle, FiFolder } from 'react-icons/fi';
import { fetchLivros } from '../features/livros/livroSlice';
import { fetchCategorias } from '../features/categorias/categoriaSlice';
import { fetchEmprestimos } from '../features/emprestimos/emprestimoSlice';
import { fetchUsuarios } from '../features/usuarios/usuarioSlice';
import { AppDispatch, RootState } from '../store';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const DashboardContainer = styled.div`
  padding: 20px 0;
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  color: var(--text-color);
  margin-bottom: 20px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const StatCard = styled(Card)`
  padding: 0;
`;

const StatContent = styled.div`
  display: flex;
  align-items: center;
  padding: 20px;
`;

const StatIcon = styled.div<{ bgColor: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: ${({ bgColor }) => bgColor};
  color: white;
  margin-right: 20px;
`;

const StatInfo = styled.div`
  flex: 1;
`;

const StatValue = styled.h2`
  font-size: 2rem;
  color: var(--text-color);
  margin: 0;
`;

const StatLabel = styled.p`
  font-size: 1rem;
  color: var(--light-text-color);
  margin: 0;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  color: var(--text-color);
  margin: 30px 0 20px;
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
`;

const RecentItemsCard = styled(Card)`
  margin-bottom: 20px;
`;

const ItemsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const ItemListItem = styled.li`
  padding: 12px 0;
  border-bottom: 1px solid var(--border-color);
  
  &:last-child {
    border-bottom: none;
  }
`;

const ItemTitle = styled.h3`
  font-size: 1rem;
  margin: 0 0 5px 0;
`;

const ItemMeta = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  color: var(--light-text-color);
`;

const ItemDate = styled.span``;

const StatusBadge = styled.span<{ status: string }>`
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
      default:
        return `
          background-color: rgba(23, 162, 184, 0.2);
          color: #117a8b;
        `;
    }
  }}
`;

const NoItems = styled.div`
  text-align: center;
  padding: 20px;
  color: var(--light-text-color);
`;

const DashboardPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { livros, isLoading: livrosLoading } = useSelector((state: RootState) => state.livros);
  const { categorias, isLoading: categoriasLoading } = useSelector((state: RootState) => state.categorias);
  const { usuarios, isLoading: usuariosLoading } = useSelector((state: RootState) => state.usuarios);
  const { emprestimos, isLoading: emprestimosLoading } = useSelector((state: RootState) => state.emprestimos);
  
  const [stats, setStats] = useState({
    livrosTotal: 0,
    livrosDisponiveis: 0,
    emprestimosAtivos: 0,
    emprestimosAtrasados: 0,
    usuariosAtivos: 0,
    categoriasTotal: 0
  });
  
  useEffect(() => {
    dispatch(fetchLivros());
    dispatch(fetchCategorias());
    dispatch(fetchUsuarios());
    dispatch(fetchEmprestimos());
  }, [dispatch]);
  
  useEffect(() => {
    if (!livrosLoading && !categoriasLoading && !usuariosLoading && !emprestimosLoading) {
      setStats({
        livrosTotal: livros.length,
        livrosDisponiveis: livros.reduce((total, livro) => total + (livro.disponiveis || 0), 0),
        emprestimosAtivos: emprestimos.filter(e => e.status === 'pendente' || e.status === 'renovado').length,
        emprestimosAtrasados: emprestimos.filter(e => e.status === 'atrasado').length,
        usuariosAtivos: usuarios.filter(u => u.ativo).length,
        categoriasTotal: categorias.length
      });
    }
  }, [livros, categorias, usuarios, emprestimos, livrosLoading, categoriasLoading, usuariosLoading, emprestimosLoading]);
  
  // Ordenar empréstimos mais recentes
  const emprestimosRecentes = [...emprestimos]
    .sort((a, b) => new Date(b.dataEmprestimo || '').getTime() - new Date(a.dataEmprestimo || '').getTime())
    .slice(0, 5);

  // Ordenar livros mais recentes
  const livrosRecentes = [...livros]
    .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime())
    .slice(0, 5);

  // Encontrar empréstimos atrasados
  const emprestimosAtrasados = [...emprestimos]
    .filter(e => e.status === 'atrasado')
    .slice(0, 5);
  
  const formatDate = (date?: Date) => {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleDateString('pt-BR');
  };
  
  return (
    <DashboardContainer>
      <PageTitle>Painel de Controle</PageTitle>
      
      <StatsGrid>
        <StatCard>
          <StatContent>
            <StatIcon bgColor="var(--primary-color)">
              <FiBook size={24} />
            </StatIcon>
            <StatInfo>
              <StatValue>{stats.livrosTotal}</StatValue>
              <StatLabel>Livros no Acervo</StatLabel>
            </StatInfo>
          </StatContent>
        </StatCard>
        
        <StatCard>
          <StatContent>
            <StatIcon bgColor="var(--success-color)">
              <FiRepeat size={24} />
            </StatIcon>
            <StatInfo>
              <StatValue>{stats.emprestimosAtivos}</StatValue>
              <StatLabel>Empréstimos Ativos</StatLabel>
            </StatInfo>
          </StatContent>
        </StatCard>
        
        <StatCard>
          <StatContent>
            <StatIcon bgColor="var(--danger-color)">
              <FiAlertTriangle size={24} />
            </StatIcon>
            <StatInfo>
              <StatValue>{stats.emprestimosAtrasados}</StatValue>
              <StatLabel>Devoluções Atrasadas</StatLabel>
            </StatInfo>
          </StatContent>
        </StatCard>
        
        <StatCard>
          <StatContent>
            <StatIcon bgColor="var(--info-color)">
              <FiUsers size={24} />
            </StatIcon>
            <StatInfo>
              <StatValue>{stats.usuariosAtivos}</StatValue>
              <StatLabel>Usuários Ativos</StatLabel>
            </StatInfo>
          </StatContent>
        </StatCard>
      </StatsGrid>
      
      <CardGrid>
        <div>
          <SectionTitle>Empréstimos Recentes</SectionTitle>
          <RecentItemsCard>
            {emprestimosLoading ? (
              <NoItems>Carregando...</NoItems>
            ) : emprestimosRecentes.length > 0 ? (
              <ItemsList>
                {emprestimosRecentes.map((emprestimo) => {
                  const livroTitulo = typeof emprestimo.livro === 'string' 
                    ? 'Carregando...'
                    : emprestimo.livro?.titulo;
                    
                  const usuarioNome = typeof emprestimo.usuario === 'string'
                    ? 'Carregando...'
                    : emprestimo.usuario?.nome;
                    
                  return (
                    <ItemListItem key={emprestimo._id}>
                      <ItemTitle>{livroTitulo}</ItemTitle>
                      <ItemMeta>
                        <div>Usuário: {usuarioNome}</div>
                        <ItemDate>
                          Empréstimo: {formatDate(emprestimo.dataEmprestimo)}
                        </ItemDate>
                      </ItemMeta>
                      <ItemMeta>
                        <div>
                          Devolução: {formatDate(emprestimo.dataPrevistaDevolucao)}
                        </div>
                        <StatusBadge status={emprestimo.status || 'pendente'}>
                          {emprestimo.status || 'pendente'}
                        </StatusBadge>
                      </ItemMeta>
                    </ItemListItem>
                  );
                })}
              </ItemsList>
            ) : (
              <NoItems>Nenhum empréstimo recente</NoItems>
            )}
            
            <div style={{ padding: '15px', textAlign: 'center' }}>
              <Button 
                as={Link} 
                to="/emprestimos" 
                variant="outline"
              >
                Ver todos os empréstimos
              </Button>
            </div>
          </RecentItemsCard>
        </div>
        
        <div>
          <SectionTitle>Livros Adicionados Recentemente</SectionTitle>
          <RecentItemsCard>
            {livrosLoading ? (
              <NoItems>Carregando...</NoItems>
            ) : livrosRecentes.length > 0 ? (
              <ItemsList>
                {livrosRecentes.map((livro) => {
                  const categoriaName = typeof livro.categoria === 'string'
                    ? 'Carregando...'
                    : livro.categoria?.nome;
                    
                  return (
                    <ItemListItem key={livro._id}>
                      <ItemTitle>{livro.titulo}</ItemTitle>
                      <ItemMeta>
                        <div>Autor: {livro.autor}</div>
                        <div>Ano: {livro.anoPublicacao}</div>
                      </ItemMeta>
                      <ItemMeta>
                        <div>
                          Categoria: {categoriaName}
                        </div>
                        <div>
                          Disponíveis: {livro.disponiveis}/{livro.quantidade}
                        </div>
                      </ItemMeta>
                    </ItemListItem>
                  );
                })}
              </ItemsList>
            ) : (
              <NoItems>Nenhum livro cadastrado recentemente</NoItems>
            )}
            
            <div style={{ padding: '15px', textAlign: 'center' }}>
              <Button 
                as={Link} 
                to="/livros" 
                variant="outline"
              >
                Ver todos os livros
              </Button>
            </div>
          </RecentItemsCard>
        </div>
        
        <div>
          <SectionTitle>Empréstimos Atrasados</SectionTitle>
          <RecentItemsCard>
            {emprestimosLoading ? (
              <NoItems>Carregando...</NoItems>
            ) : emprestimosAtrasados.length > 0 ? (
              <ItemsList>
                {emprestimosAtrasados.map((emprestimo) => {
                  const livroTitulo = typeof emprestimo.livro === 'string' 
                    ? 'Carregando...'
                    : emprestimo.livro?.titulo;
                    
                  const usuarioNome = typeof emprestimo.usuario === 'string'
                    ? 'Carregando...'
                    : emprestimo.usuario?.nome;
                    
                  return (
                    <ItemListItem key={emprestimo._id}>
                      <ItemTitle>{livroTitulo}</ItemTitle>
                      <ItemMeta>
                        <div>Usuário: {usuarioNome}</div>
                        <div>
                          <StatusBadge status="atrasado">
                            Atrasado
                          </StatusBadge>
                        </div>
                      </ItemMeta>
                      <ItemMeta>
                        <div>
                          Devolução: {formatDate(emprestimo.dataPrevistaDevolucao)}
                        </div>
                        <div>
                          {emprestimo.multa ? `Multa: R$ ${emprestimo.multa.toFixed(2)}` : ''}
                        </div>
                      </ItemMeta>
                    </ItemListItem>
                  );
                })}
              </ItemsList>
            ) : (
              <NoItems>Não há empréstimos atrasados</NoItems>
            )}
            
            <div style={{ padding: '15px', textAlign: 'center' }}>
              <Button 
                as={Link} 
                to="/emprestimos" 
                variant="outline"
                style={{ color: 'var(--danger-color)' }}
              >
                Gerenciar atrasos
              </Button>
            </div>
          </RecentItemsCard>
        </div>
      </CardGrid>
    </DashboardContainer>
  );
};

export default DashboardPage;
