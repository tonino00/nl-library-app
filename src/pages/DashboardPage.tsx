import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import styled from 'styled-components';
import { FiBook, FiUsers, FiRepeat, FiAlertTriangle } from 'react-icons/fi';
import { fetchLivros } from '../features/livros/livroSlice';
import { fetchCategorias } from '../features/categorias/categoriaSlice';
import { fetchEmprestimos, fetchEmprestimosByUsuario } from '../features/emprestimos/emprestimoSlice';
import { fetchUsuarios } from '../features/usuarios/usuarioSlice';
import { AppDispatch, RootState } from '../store';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const DashboardContainer = styled.div`
  padding: 20px 16px;
`;


const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const StatCard = styled(Card)<{ $accentColor: string }>`
  padding: 20px;
  border-bottom: 4px solid ${({ $accentColor }) => $accentColor};
`;

const StatHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
`;

const StatIcon = styled.div<{ $bgColor: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background-color: ${({ $bgColor }) => $bgColor};
  color: white;
  flex-shrink: 0;
`;

const StatValue = styled.div`
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-color);
  line-height: 1;
`;

const StatLabel = styled.p`
  font-size: 0.95rem;
  color: var(--light-text-color);
  margin: 0;
  line-height: 1.3;
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
      case 'renovado':
      case 'emprestado':
        return `
          background-color: var(--status-pending-bg);
          color: var(--status-pending-text);
        `;
      case 'devolvido':
        return `
          background-color: var(--status-success-bg);
          color: var(--status-success-text);
        `;
      case 'atrasado':
        return `
          background-color: var(--status-danger-bg);
          color: var(--status-danger-text);
        `;
      case 'urgente':
        return `
          background-color: var(--status-urgent-bg);
          color: var(--status-urgent-text);
        `;
      default:
        return `
          background-color: var(--status-active-bg);
          color: var(--status-active-text);
        `;
    }
  }}
`;

const NoItems = styled.div`
  text-align: center;
  padding: 20px;
  color: var(--light-text-color);
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 20px;
  color: var(--light-text-color);
`;

const EmptyAction = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  margin-top: 12px;
  padding: 8px 16px;
  border-radius: var(--border-radius);
  border: 1px solid var(--primary-color);
  color: var(--primary-color);
  font-size: 0.875rem;
  font-weight: 500;
  text-decoration: none;
  transition: var(--transition);

  &:hover {
    background-color: var(--primary-color);
    color: white;
  }

  &:focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const ActionButtonContainer = styled.div`
  padding: 15px;
  text-align: center;
  margin-top: auto;
  border-top: 1px solid var(--border-color);
`;

const DashboardPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { livros, total: livrosTotal, isLoading: livrosLoading } = useSelector((state: RootState) => state.livros);
  const { categorias } = useSelector((state: RootState) => state.categorias);
  const { usuarios } = useSelector((state: RootState) => state.usuarios);
  const { emprestimos, isLoading: emprestimosLoading } = useSelector((state: RootState) => state.emprestimos);
  const { user } = useAuth();

  useEffect(() => {
    dispatch(fetchLivros(false));
    dispatch(fetchCategorias());

    if (user?.tipo === 'leitor' && user?._id) {
      dispatch(fetchEmprestimosByUsuario(user._id));
    } else if (user?.tipo !== 'leitor') {
      dispatch(fetchUsuarios(false));
      dispatch(fetchEmprestimos(false));
    }
  }, [dispatch, user?.tipo, user?._id]);

  const stats = useMemo(() => {
    const base = {
      livrosTotal: livrosTotal || 0,
      livrosDisponiveis: Array.isArray(livros)
        ? livros.reduce((total, livro) => total + (livro.disponiveis || 0), 0)
        : 0,
      emprestimosAtivos: 0,
      emprestimosAtrasados: 0,
      usuariosAtivos: 0,
      categoriasTotal: Array.isArray(categorias) ? categorias.length : 0,
      readerBorrowedBooksCount: 0,
      readerActiveLoansCount: 0,
    };

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

    const livrosUnicos = new Set<string>();
    emprestimosDoLeitorCalc.forEach(emp => {
      const livroId = typeof emp.livro === 'string' ? emp.livro : emp.livro?._id;
      if (livroId) {
        livrosUnicos.add(livroId);
      }
    });

    const emprestimosAtivosDoLeitor = emprestimosDoLeitorCalc.filter(e =>
      ['pendente', 'renovado', 'emprestado'].includes((e.status || '') as string)
    ).length;

    if (user?.tipo === 'leitor') {
      return {
        ...base,
        readerBorrowedBooksCount: livrosUnicos.size,
        readerActiveLoansCount: emprestimosAtivosDoLeitor,
      };
    }

    return {
      ...base,
      emprestimosAtivos: Array.isArray(emprestimos)
        ? emprestimos.filter(e =>
            ['pendente', 'renovado', 'emprestado'].includes((e.status || '') as string)
          ).length
        : 0,
      emprestimosAtrasados: Array.isArray(emprestimos)
        ? emprestimos.filter(e => e.status === 'atrasado').length
        : 0,
      usuariosAtivos: Array.isArray(usuarios)
        ? usuarios.filter(u => u.ativo).length
        : 0,
      readerBorrowedBooksCount: livrosUnicos.size,
      readerActiveLoansCount: emprestimosAtivosDoLeitor,
    };
  }, [livros, livrosTotal, categorias, emprestimos, usuarios, user]);
  
  const emprestimosRecentes = useMemo(() =>
    Array.isArray(emprestimos)
      ? [...emprestimos]
          .sort((a, b) => new Date(b.dataEmprestimo || '').getTime() - new Date(a.dataEmprestimo || '').getTime())
          .slice(0, 3)
      : []
  , [emprestimos]);

  const emprestimosDoLeitor = useMemo(() => {
    if (!Array.isArray(emprestimos) || !user) return [];
    return emprestimos.filter(emp => {
      if (typeof emp.usuario === 'string') {
        return emp.usuario === user._id;
      } else if (emp.usuario && typeof emp.usuario === 'object') {
        return emp.usuario._id === user._id;
      }
      return false;
    });
  }, [emprestimos, user]);

  const emprestimosRecentesDoLeitor = useMemo(() =>
    [...emprestimosDoLeitor]
      .sort((a, b) => new Date(b.dataEmprestimo || '').getTime() - new Date(a.dataEmprestimo || '').getTime())
      .slice(0, 3)
  , [emprestimosDoLeitor]);

  const devolucoesPróximasDoLeitor = useMemo(() =>
    [...emprestimosDoLeitor]
      .filter(emp => emp.status === 'pendente' || emp.status === 'renovado')
      .sort((a, b) => new Date(a.dataPrevistaDevolucao || '').getTime() - new Date(b.dataPrevistaDevolucao || '').getTime())
      .slice(0, 3)
  , [emprestimosDoLeitor]);

  const livrosEmprestados = useMemo(() => {
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

        const dataAtual = new Date(livroInfo.ultimoEmprestimo || '');
        const dataNova = new Date(emprestimo.dataEmprestimo || '');
        if (dataNova > dataAtual) {
          livroInfo.ultimoEmprestimo = emprestimo.dataEmprestimo;
        }
      }
    });

    return Array.from(livrosEmprestadosMap.values())
      .sort((a, b) => new Date(b.ultimoEmprestimo || '').getTime() - new Date(a.ultimoEmprestimo || '').getTime());
  }, [emprestimosDoLeitor]);

  const livrosRecentes = useMemo(() =>
    Array.isArray(livros)
      ? [...livros]
          .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime())
          .slice(0, 3)
      : []
  , [livros]);

  const emprestimosAtrasados = useMemo(() =>
    Array.isArray(emprestimos)
      ? [...emprestimos]
          .filter(e => e.status === 'atrasado')
          .slice(0, 3)
      : []
  , [emprestimos]);
  
  const formatDate = (date?: Date) => {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleDateString('pt-BR');
  };
  
  return (
    <DashboardContainer>
      <StatsGrid>
        {user?.tipo === 'leitor' ? (
          /* Mostrar estatísticas específicas para leitores */
          <>
            <StatCard $accentColor="var(--primary-color)">
              <StatHeader>
                <StatIcon $bgColor="var(--primary-color)">
                  <FiBook size={18} />
                </StatIcon>
                <StatLabel>Livros Adquiridos Recentemente</StatLabel>
              </StatHeader>
              <StatValue>{stats.readerBorrowedBooksCount}</StatValue>
            </StatCard>

            <StatCard $accentColor="var(--success-color)">
              <StatHeader>
                <StatIcon $bgColor="var(--success-color)">
                  <FiRepeat size={18} />
                </StatIcon>
                <StatLabel>Empréstimos Renovados/Pendentes</StatLabel>
              </StatHeader>
              <StatValue>{stats.readerActiveLoansCount}</StatValue>
            </StatCard>
          </>
        ) : (
          /* Mostrar estatísticas para administradores */
          <>
            <StatCard $accentColor="var(--primary-color)">
              <StatHeader>
                <StatIcon $bgColor="var(--primary-color)">
                  <FiBook size={18} />
                </StatIcon>
                <StatLabel>Livros no Acervo</StatLabel>
              </StatHeader>
              <StatValue>{stats.livrosTotal}</StatValue>
            </StatCard>

            <StatCard $accentColor="var(--success-color)">
              <StatHeader>
                <StatIcon $bgColor="var(--success-color)">
                  <FiRepeat size={18} />
                </StatIcon>
                <StatLabel>Empréstimos Ativos</StatLabel>
              </StatHeader>
              <StatValue>{stats.emprestimosAtivos}</StatValue>
            </StatCard>

            <StatCard $accentColor="var(--danger-color)">
              <StatHeader>
                <StatIcon $bgColor="var(--danger-color)">
                  <FiAlertTriangle size={18} />
                </StatIcon>
                <StatLabel>Devoluções Atrasadas</StatLabel>
              </StatHeader>
              <StatValue>{stats.emprestimosAtrasados}</StatValue>
            </StatCard>

            <StatCard $accentColor="var(--info-color)">
              <StatHeader>
                <StatIcon $bgColor="var(--info-color)">
                  <FiUsers size={18} />
                </StatIcon>
                <StatLabel>Usuários Ativos</StatLabel>
              </StatHeader>
              <StatValue>{stats.usuariosAtivos}</StatValue>
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
                {emprestimosLoading ? (
                  <LoadingMessage aria-live="polite" aria-busy="true">Carregando empréstimos...</LoadingMessage>
                ) : emprestimosRecentesDoLeitor.length > 0 ? (
                  <ItemsList>
                    {emprestimosRecentesDoLeitor.map((emprestimo) => {
                      const livroTitulo = typeof emprestimo.livro === 'string'
                        ? 'Carregando...'
                        : emprestimo.livro?.titulo;

                      return (
                        <ItemListItem key={emprestimo._id}>
                          <ItemTitle title={livroTitulo}>{livroTitulo}</ItemTitle>
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
                  <NoItems>
                    Você não tem empréstimos recentes
                    <br />
                    <EmptyAction to="/livros">Explorar catálogo</EmptyAction>
                  </NoItems>
                )}
              </RecentItemsCard>
            </div>

            <div>
              <SectionTitle>Próximas Devoluções</SectionTitle>
              <RecentItemsCard>
                {emprestimosLoading ? (
                  <LoadingMessage aria-live="polite" aria-busy="true">Carregando devoluções...</LoadingMessage>
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
                          <ItemTitle title={livroTitulo}>{livroTitulo}</ItemTitle>
                          <ItemMeta>
                            <div>
                              <StatusBadge $status={isUrgent ? 'urgente' : 'pendente'}>
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
                  <NoItems>
                    Você não tem devoluções próximas a vencer
                    <br />
                    <EmptyAction to="/livros">Explorar catálogo</EmptyAction>
                  </NoItems>
                )}
              </RecentItemsCard>
            </div>
            
            <div>
              <SectionTitle>Meus Livros Emprestados</SectionTitle>
              <RecentItemsCard>
                {emprestimosLoading ? (
                  <LoadingMessage aria-live="polite" aria-busy="true">Carregando histórico...</LoadingMessage>
                ) : livrosEmprestados.length > 0 ? (
                  <ItemsList>
                    {livrosEmprestados.map((livro) => (
                      <ItemListItem key={livro.id}>
                        <ItemTitle title={livro.titulo}>{livro.titulo}</ItemTitle>
                        <ItemMeta>
                          <div style={{ flexBasis: '100%' }}>Autor Espiritual: {livro.autor || 'Não informado'}</div>
                          <div>Vezes emprestado: {livro.quantidade}</div>
                        </ItemMeta>
                        <ItemMeta>
                          <div>
                            Último empréstimo: {formatDate(livro.ultimoEmprestimo)}
                          </div>
                          <div>
                            {livro.emprestimos.some((e: any) => e.status === 'pendente' || e.status === 'renovado' || e.status === 'emprestado') ? (
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
                  <NoItems>
                    Você ainda não pegou nenhum livro emprestado
                    <br />
                    <EmptyAction to="/livros">Explorar catálogo</EmptyAction>
                  </NoItems>
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
                  <LoadingMessage aria-live="polite" aria-busy="true">Carregando empréstimos...</LoadingMessage>
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
                          <ItemTitle title={livroTitulo}>{livroTitulo}</ItemTitle>
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
                  <NoItems>
                    Nenhum empréstimo recente
                    <br />
                    <EmptyAction to="/emprestimos/novo">Registrar empréstimo</EmptyAction>
                  </NoItems>
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
              <SectionTitle>Novos Livros Catalogados</SectionTitle>
              <RecentItemsCard>
                {livrosLoading ? (
                  <LoadingMessage aria-live="polite" aria-busy="true">Carregando livros...</LoadingMessage>
                ) : livrosRecentes.length > 0 ? (
                  <ItemsList>
                    {livrosRecentes.map((livro) => {
                      const categoriaName = typeof livro.categoria === 'string'
                        ? 'Carregando...'
                        : livro.categoria?.nome;

                      return (
                        <ItemListItem key={livro._id}>
                          <ItemTitle title={livro.titulo}>{livro.titulo}</ItemTitle>
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
                  <NoItems>
                    Nenhum livro cadastrado recentemente
                    <br />
                    <EmptyAction to="/livros/novo">Cadastrar livro</EmptyAction>
                  </NoItems>
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
              <SectionTitle>Devoluções Atrasadas</SectionTitle>
              <RecentItemsCard>
                {emprestimosLoading ? (
                  <LoadingMessage aria-live="polite" aria-busy="true">Carregando atrasos...</LoadingMessage>
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
                          <ItemTitle title={livroTitulo}>{livroTitulo}</ItemTitle>
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
                  <NoItems>
                    Não há empréstimos atrasados
                    <br />
                    <EmptyAction to="/emprestimos">Ver todos os empréstimos</EmptyAction>
                  </NoItems>
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
