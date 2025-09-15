import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import styled from 'styled-components';
import { FiBook, FiUsers, FiRepeat, FiAlertTriangle, FiFolder } from 'react-icons/fi';
import { fetchLivros } from '../features/livros/livroSlice';
import { fetchCategorias } from '../features/categorias/categoriaSlice';
import { fetchEmprestimos, fetchEmprestimosByUsuario } from '../features/emprestimos/emprestimoSlice';
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

const StatIcon = styled.div<{ $bgColor: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: ${({ $bgColor }) => $bgColor};
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
  text-align: center;
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const RecentItemsCard = styled(Card)`
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  height: auto;
`;

const ItemsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const ItemListItem = styled.li`
  padding: 16px 12px;
  border-bottom: 1px solid var(--border-color);
  
  &:last-child {
    border-bottom: none;
  }
`;

const ItemTitle = styled.h3`
  font-size: 1.1rem;
  margin: 0 0 8px 0;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
`;

const ItemMeta = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  color: var(--light-text-color);
  margin-bottom: 4px;
  flex-wrap: wrap;
  gap: 6px;
  
  & > div {
    min-width: 40%;
    overflow-wrap: break-word;
    word-break: break-word;
  }
`;

const ItemDate = styled.span``;

const StatusBadge = styled.span<{ $status: string }>`
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

const ActionButtonContainer = styled.div`
  padding: 15px;
  text-align: center;
  margin-top: auto;
  border-top: 1px solid var(--border-color);
`;

const DashboardPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { livros, isLoading: livrosLoading } = useSelector((state: RootState) => state.livros);
  const { categorias, isLoading: categoriasLoading } = useSelector((state: RootState) => state.categorias);
  const { usuarios, isLoading: usuariosLoading } = useSelector((state: RootState) => state.usuarios);
  const { emprestimos, isLoading: emprestimosLoading } = useSelector((state: RootState) => state.emprestimos);
  const { user } = useAuth();
  
  const [stats, setStats] = useState({
    livrosTotal: 0,
    livrosDisponiveis: 0,
    emprestimosAtivos: 0,
    emprestimosAtrasados: 0,
    usuariosAtivos: 0,
    categoriasTotal: 0,
    // Reader-specific stats
    readerBorrowedBooksCount: 0,
    readerActiveLoansCount: 0
  });
  
  // Ref para controlar se já carregamos os dados
  const dataFetchedRef = React.useRef(false);

  useEffect(() => {
    // Apenas busque os dados se eles ainda não foram carregados
    if (!dataFetchedRef.current) {
      // Always fetch books and categories for all users
      dispatch(fetchLivros());
      dispatch(fetchCategorias());
      
      if (user?.tipo === 'leitor' && user?._id) {
        // For readers, only fetch their own emprestimos
        dispatch(fetchEmprestimosByUsuario(user._id));
      } else if (user?.tipo !== 'leitor') {
        // For admins, fetch all users and emprestimos
        dispatch(fetchUsuarios());
        dispatch(fetchEmprestimos());
      }
      
      // Marcar que os dados foram carregados
      dataFetchedRef.current = true;
    }
  }, [dispatch, user?.tipo, user?._id]);
  
  useEffect(() => {
    // Check if all necessary data is loaded based on user type
    const isDataLoaded = user?.tipo === 'leitor'
      ? !livrosLoading && !categoriasLoading && !emprestimosLoading
      : !livrosLoading && !categoriasLoading && !usuariosLoading && !emprestimosLoading;
    
    if (isDataLoaded) {
      // Calcular empréstimos do leitor atual
      const emprestimosDoLeitorCalc = Array.isArray(emprestimos) && user
        ? emprestimos.filter(emp => {
            if (typeof emp.usuario === 'string') {
              return emp.usuario === user._id;
            } else if (emp.usuario && typeof emp.usuario === 'object') {
              return emp.usuario._id === user._id;
            }
            return false;
          })
        : [];

      // Contar livros únicos emprestados pelo leitor (evitar duplicatas)
      const livrosUnicos = new Set();
      emprestimosDoLeitorCalc.forEach(emp => {
        if (typeof emp.livro === 'string') {
          livrosUnicos.add(emp.livro);
        } else if (emp.livro && typeof emp.livro === 'object') {
          livrosUnicos.add(emp.livro._id);
        }
      });

      // Contar empréstimos ativos do leitor
      const emprestimosAtivosDoLeitor = emprestimosDoLeitorCalc.filter(
        e => e.status === 'pendente' || e.status === 'renovado'
      ).length;
      
      // Base stats that are always available regardless of user type
      const baseStats = {
        livrosTotal: Array.isArray(livros) ? livros.length : 0,
        livrosDisponiveis: Array.isArray(livros) ? livros.reduce((total, livro) => total + (livro.disponiveis || 0), 0) : 0,
        categoriasTotal: Array.isArray(categorias) ? categorias.length : 0,
        readerBorrowedBooksCount: livrosUnicos.size,
        readerActiveLoansCount: emprestimosAtivosDoLeitor
      };
      
      // For admin users, add admin-specific stats
      if (user?.tipo !== 'leitor') {
        setStats({
          ...baseStats,
          emprestimosAtivos: Array.isArray(emprestimos) ? emprestimos.filter(e => e.status === 'pendente' || e.status === 'renovado').length : 0,
          emprestimosAtrasados: Array.isArray(emprestimos) ? emprestimos.filter(e => e.status === 'atrasado').length : 0,
          usuariosAtivos: Array.isArray(usuarios) ? usuarios.filter(u => u.ativo).length : 0,
        });
      } else {
        // For reader users, set default values for admin-specific stats
        setStats({
          ...baseStats,
          emprestimosAtivos: 0,
          emprestimosAtrasados: 0,
          usuariosAtivos: 0,
        });
      }
    }
  }, [livros, categorias, usuarios, emprestimos, livrosLoading, categoriasLoading, usuariosLoading, emprestimosLoading, user?.tipo]);
  
  // Ordenar empréstimos mais recentes
  const emprestimosRecentes = Array.isArray(emprestimos) 
    ? [...emprestimos]
        .sort((a, b) => new Date(b.dataEmprestimo || '').getTime() - new Date(a.dataEmprestimo || '').getTime())
        .slice(0, 3)
    : [];
    
  // Filtrar todos os empréstimos do leitor atual (incluindo histórico)
  const emprestimosDoLeitor = Array.isArray(emprestimos) && user
    ? emprestimos.filter(emp => {
        // Verificar se o empréstimo pertence ao usuário atual
        if (typeof emp.usuario === 'string') {
          return emp.usuario === user._id;
        } else if (emp.usuario && typeof emp.usuario === 'object') {
          return emp.usuario._id === user._id;
        }
        return false;
      })
    : [];
    
  // Empréstimos recentes do leitor
  const emprestimosRecentesDoLeitor = [...emprestimosDoLeitor]
    .sort((a, b) => new Date(b.dataEmprestimo || '').getTime() - new Date(a.dataEmprestimo || '').getTime())
    .slice(0, 3);
    
  // Devoluções próximas do leitor (ordenadas por data de devolução mais próxima)
  const devolucoesPróximasDoLeitor = [...emprestimosDoLeitor]
    .filter(emp => emp.status === 'pendente' || emp.status === 'renovado')
    .sort((a, b) => new Date(a.dataPrevistaDevolucao || '').getTime() - new Date(b.dataPrevistaDevolucao || '').getTime())
    .slice(0, 3);
    
  // Agrupar todos os empréstimos do leitor por livro
  // Criar um mapa para acompanhar a quantidade de empréstimos por livro
  const livrosEmprestadosMap = new Map();
  
  emprestimosDoLeitor.forEach(emprestimo => {
    const livroId = typeof emprestimo.livro === 'string' ? emprestimo.livro : emprestimo.livro?._id;
    const livroTitulo = typeof emprestimo.livro === 'string' ? 'Carregando...' : emprestimo.livro?.titulo;
    const livroAutor = typeof emprestimo.livro === 'string' ? '' : emprestimo.livro?.autor;
    
    if (livroId && !livrosEmprestadosMap.has(livroId)) {
      livrosEmprestadosMap.set(livroId, {
        id: livroId,
        titulo: livroTitulo,
        autor: livroAutor,
        emprestimos: [emprestimo],
        quantidade: 1,
        ultimoEmprestimo: emprestimo.dataEmprestimo
      });
    } else if (livroId) {
      const livroInfo = livrosEmprestadosMap.get(livroId);
      livroInfo.emprestimos.push(emprestimo);
      livroInfo.quantidade += 1;
      
      // Atualizar data do último empréstimo se for mais recente
      const dataAtual = new Date(livroInfo.ultimoEmprestimo || '');
      const dataNova = new Date(emprestimo.dataEmprestimo || '');
      if (dataNova > dataAtual) {
        livroInfo.ultimoEmprestimo = emprestimo.dataEmprestimo;
      }
    }
  });
  
  // Converter o mapa em array e ordenar por data do último empréstimo (mais recente primeiro)
  const livrosEmprestados = Array.from(livrosEmprestadosMap.values())
    .sort((a, b) => new Date(b.ultimoEmprestimo || '').getTime() - new Date(a.ultimoEmprestimo || '').getTime());

  // Ordenar livros mais recentes
  const livrosRecentes = Array.isArray(livros)
    ? [...livros]
        .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime())
        .slice(0, 3)
    : [];

  // Encontrar empréstimos atrasados
  const emprestimosAtrasados = Array.isArray(emprestimos)
    ? [...emprestimos]
        .filter(e => e.status === 'atrasado')
        .slice(0, 3)
    : [];
  
  const formatDate = (date?: Date) => {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleDateString('pt-BR');
  };
  
  return (
    <DashboardContainer>
      {/* <PageTitle>Painel de Controle</PageTitle> */}
      
      <StatsGrid>
        {user?.tipo === 'leitor' ? (
          /* Mostrar estatísticas específicas para leitores */
          <>
            <StatCard>
              <StatContent>
                <StatIcon $bgColor="var(--primary-color)">
                  <FiBook size={24} />
                </StatIcon>
                <StatInfo>
                  <StatValue>{stats.readerBorrowedBooksCount}</StatValue>
                  <StatLabel>Livros Adquiridos Recentimente</StatLabel>
                </StatInfo>
              </StatContent>
            </StatCard>
            
            <StatCard>
              <StatContent>
                <StatIcon $bgColor="var(--success-color)">
                  <FiRepeat size={24} />
                </StatIcon>
                <StatInfo>
                  <StatValue>{stats.readerActiveLoansCount}</StatValue>
                  <StatLabel>Empréstimos Ronovados/Pendentes</StatLabel>
                </StatInfo>
              </StatContent>
            </StatCard>
            
            {/* <StatCard>
              <StatContent>
                <StatIcon $bgColor="var(--primary-color)">
                  <FiBook size={24} />
                </StatIcon>
                <StatInfo>
                  <StatValue>{stats.livrosTotal}</StatValue>
                  <StatLabel>Livros no Acervo</StatLabel>
                </StatInfo>
              </StatContent>
            </StatCard> */}
          </>
        ) : (
          /* Mostrar estatísticas para administradores */
          <>
            <StatCard>
              <StatContent>
                <StatIcon $bgColor="var(--primary-color)">
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
                <StatIcon $bgColor="var(--success-color)">
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
                <StatIcon $bgColor="var(--danger-color)">
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
                <StatIcon $bgColor="var(--info-color)">
                  <FiUsers size={24} />
                </StatIcon>
                <StatInfo>
                  <StatValue>{stats.usuariosAtivos}</StatValue>
                  <StatLabel>Usuários Ativos</StatLabel>
                </StatInfo>
              </StatContent>
            </StatCard>
          </>
        )}
      </StatsGrid>
      
      <CardGrid>
        {user?.tipo === 'leitor' ? (
          /* Mostrar seções específicas para leitores */
          <>
            <div>
              <SectionTitle>Meus Empréstimos Recentes</SectionTitle>
              <RecentItemsCard>
                {/* Only show loading if the specific data we need is loading */}
                {(user?.tipo === 'leitor' && emprestimosLoading) || (user?.tipo !== 'leitor' && (emprestimosLoading || usuariosLoading)) ? (
                  <NoItems>Carregando...</NoItems>
                ) : emprestimosRecentesDoLeitor.length > 0 ? (
                  <ItemsList>
                    {emprestimosRecentesDoLeitor.map((emprestimo) => {
                      const livroTitulo = typeof emprestimo.livro === 'string' 
                        ? 'Carregando...'
                        : emprestimo.livro?.titulo;
                        
                      return (
                        <ItemListItem key={emprestimo._id}>
                          <ItemTitle>{livroTitulo}</ItemTitle>
                          <ItemMeta>
                            <div>
                              <ItemDate>
                                Emprestado em: {formatDate(emprestimo.dataEmprestimo)}
                              </ItemDate>
                            </div>
                            <StatusBadge $status={emprestimo.status || 'pendente'}>
                              {emprestimo.status || 'pendente'}
                            </StatusBadge>
                          </ItemMeta>
                          <ItemMeta>
                            <div>
                              Devolver até: {formatDate(emprestimo.dataPrevistaDevolucao)}
                            </div>
                          </ItemMeta>
                        </ItemListItem>
                      );
                    })}
                  </ItemsList>
                ) : (
                  <NoItems>Você não tem empréstimos recentes</NoItems>
                )}
                
                {/* Hide the button for users with type 'leitor' */}
                {user?.tipo !== 'leitor' && (
                  <ActionButtonContainer>
                  <Button 
                    as={Link} 
                    to="/emprestimos" 
                    variant="outline"
                  >
                    Ver todos meus empréstimos
                  </Button>
                </ActionButtonContainer>
                )}
              </RecentItemsCard>
            </div>
            
            <div>
              <SectionTitle>Próximas Devoluções</SectionTitle>
              <RecentItemsCard>
                {(user?.tipo === 'leitor' && emprestimosLoading) || (user?.tipo !== 'leitor' && (emprestimosLoading || usuariosLoading)) ? (
                  <NoItems>Carregando...</NoItems>
                ) : devolucoesPróximasDoLeitor.length > 0 ? (
                  <ItemsList>
                    {devolucoesPróximasDoLeitor.map((emprestimo) => {
                      const livroTitulo = typeof emprestimo.livro === 'string' 
                        ? 'Carregando...'
                        : emprestimo.livro?.titulo;
                        
                      // Calcular dias restantes para devolução
                      const dataAtual = new Date();
                      const dataDevolucao = new Date(emprestimo.dataPrevistaDevolucao || '');
                      const diffTempo = dataDevolucao.getTime() - dataAtual.getTime();
                      const diffDias = Math.ceil(diffTempo / (1000 * 3600 * 24));
                      
                      const isUrgent = diffDias <= 3;
                        
                      return (
                        <ItemListItem key={emprestimo._id}>
                          <ItemTitle>{livroTitulo}</ItemTitle>
                          <ItemMeta>
                            <div>
                              <StatusBadge $status={isUrgent ? 'atrasado' : 'pendente'}>
                                {isUrgent ? `Urgente: ${diffDias} dias` : `${diffDias} dias restantes`}
                              </StatusBadge>
                            </div>
                          </ItemMeta>
                          <ItemMeta>
                            <div>
                              Devolver até: {formatDate(emprestimo.dataPrevistaDevolucao)}
                            </div>
                          </ItemMeta>
                        </ItemListItem>
                      );
                    })}
                  </ItemsList>
                ) : (
                  <NoItems>Você não tem devoluções próximas a vencer</NoItems>
                )}
                
                {/* Hide the button for users with type 'leitor' */}
                {user?.tipo !== 'leitor' && (
                  <ActionButtonContainer>
                  <Button 
                    as={Link} 
                    to="/emprestimos" 
                    variant="outline"
                  >
                    Gerenciar devoluções
                  </Button>
                </ActionButtonContainer>
                )}
              </RecentItemsCard>
            </div>
            
            <div>
              <SectionTitle>Livros Devolvidos</SectionTitle>
              <RecentItemsCard>
                {(user?.tipo === 'leitor' && emprestimosLoading) || (user?.tipo !== 'leitor' && (emprestimosLoading || usuariosLoading)) ? (
                  <NoItems>Carregando...</NoItems>
                ) : livrosEmprestados.length > 0 ? (
                  <ItemsList>
                    {livrosEmprestados.map((livro) => (
                      <ItemListItem key={livro.id}>
                        <ItemTitle>{livro.titulo}</ItemTitle>
                        <ItemMeta>
                          <div style={{ flexBasis: '100%' }}>Autor Espiritual: {livro.autor || 'Não informado'}</div>
                          <div>Vezes emprestado: {livro.quantidade}</div>
                        </ItemMeta>
                        <ItemMeta>
                          <div>
                            Último empréstimo: {formatDate(livro.ultimoEmprestimo)}
                          </div>
                          <div>
                            {livro.emprestimos.some((e: any) => e.status === 'pendente' || e.status === 'renovado') ? (
                              <StatusBadge $status={'pendente'}>Em andamento</StatusBadge>
                            ) : (
                              <StatusBadge $status={'devolvido'}>Devolvido</StatusBadge>
                            )}
                          </div>
                        </ItemMeta>
                      </ItemListItem>
                    ))}
                  </ItemsList>
                ) : (
                  <NoItems>Você ainda não pegou nenhum livro emprestado</NoItems>
                )}
              </RecentItemsCard>
            </div>
          </>
        ) : (
          /* Mostrar seções para administradores */
          <>
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
                            <StatusBadge $status={emprestimo.status || 'pendente'}>
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
                
                <ActionButtonContainer>
                  <Button 
                    as={Link} 
                    to="/emprestimos" 
                    variant="outline"
                  >
                    Ver todos os empréstimos
                  </Button>
                </ActionButtonContainer>
              </RecentItemsCard>
            </div>
            
            <div>
              <SectionTitle>Livros Catalogados</SectionTitle>
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
                            <div style={{ flexBasis: '100%' }}>Autor Espiritual: {livro.autor}</div>
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
                
                <ActionButtonContainer>
                  <Button 
                    as={Link} 
                    to="/livros" 
                    variant="outline"
                  >
                    Ver todos os livros
                  </Button>
                </ActionButtonContainer>
              </RecentItemsCard>
            </div>
            
            <div>
              <SectionTitle>Devoluções Atrasados</SectionTitle>
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
                              <StatusBadge $status="atrasado">
                                Atrasado
                              </StatusBadge>
                            </div>
                          </ItemMeta>
                          <ItemMeta>
                            <div>
                              Devolução: {formatDate(emprestimo.dataPrevistaDevolucao)}
                            </div>
                            <div>
                              {emprestimo.multa ? `Multa: R$ ${Number(emprestimo.multa).toFixed(2)}` : ''}
                            </div>
                          </ItemMeta>
                        </ItemListItem>
                      );
                    })}
                  </ItemsList>
                ) : (
                  <NoItems>Não há empréstimos atrasados</NoItems>
                )}
                
                <ActionButtonContainer>
                  <Button 
                    as={Link} 
                    to="/emprestimos" 
                    variant="outline"
                    style={{ color: 'var(--danger-color)' }}
                  >
                    Gerenciar atrasos
                  </Button>
                </ActionButtonContainer>
              </RecentItemsCard>
            </div>
          </>
        )}
      </CardGrid>
    </DashboardContainer>
  );
};

export default DashboardPage;
