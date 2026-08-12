import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { FiArrowLeft, FiEdit2, FiCalendar, FiCheck, FiRepeat, FiAlertTriangle } from 'react-icons/fi';
import { 
  fetchEmprestimoById, 
  finalizarEmprestimo, 
  renovarEmprestimo,
  updateEmprestimo
} from '../../features/emprestimos/emprestimoSlice';
import { AppDispatch, RootState } from '../../store';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { toast } from 'react-toastify';
import { getStatusColorVars, getStatusLabel } from '../../utils/statusEmprestimo';

const PageHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  gap: 15px;
  flex-wrap: wrap;
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
`;

const BackButton = styled(Button)`
  margin-right: 10px;
`;

const PageTitle = styled.h1`
  font-size: 1.75rem;
  color: var(--text-color);
  margin: 0;
`;

const EmprestimoDetailsContainer = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 30px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const InfoPanel = styled.div`
  display: flex;
  flex-direction: column;
`;

const InfoSection = styled.div`
  margin-bottom: 30px;
`;

const SectionTitle = styled.h2`
  font-size: 1.3rem;
  color: var(--text-color);
  margin: 0 0 15px 0;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border-color);
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  flex-wrap: wrap;
  gap: 8px;

  svg {
    margin-right: 10px;
    color: var(--primary-color);
  }
`;

const DateEditContainer = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
`;

const DateInput = styled.input`
  padding: 8px 12px;
  border-radius: var(--border-radius);
  border: 1px solid var(--border-color);
  font-size: 16px;
  font-family: inherit;

  &:focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
  }
`;

const DateActions = styled.div`
  display: flex;
  gap: 5px;
`;

const InfoLabel = styled.span`
  font-weight: 500;
  margin-right: 8px;
`;

const StatusBadge = styled.div<{ $status: string }>`
  display: inline-block;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 1rem;
  margin-bottom: 20px;

  ${({ $status }) => {
    const { bg, text } = getStatusColorVars($status);
    return `
      background-color: ${bg};
      color: ${text};
    `;
  }}
`;

const ActionPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const ActionCard = styled(Card)`
  padding: 20px;
`;

const ActionTitle = styled.h3`
  font-size: 1.1rem;
  color: var(--text-color);
  margin: 0 0 15px 0;
`;

const MultaValue = styled.p<{ hasMulta: boolean }>`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${({ hasMulta }) => hasMulta ? 'var(--danger-color)' : 'var(--text-color)'};
  margin: 10px 0;
`;

const BookInfo = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  padding: 15px;
  background-color: var(--hover-bg);
  border-radius: var(--border-radius);
`;

const BookCover = styled.img`
  width: 60px;
  height: 90px;
  object-fit: cover;
  border-radius: 4px;
  margin-right: 15px;
`;

const DefaultBookCover = styled.div`
  width: 60px;
  height: 90px;
  background-color: var(--disabled-bg);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  color: var(--light-text-color);
  font-size: 24px;
`;

const BookDetails = styled.div`
  flex: 1;
`;

const BookTitle = styled.h4`
  margin: 0 0 5px 0;
  font-size: 1.1rem;
`;

const BookAuthor = styled.p`
  margin: 0;
  color: var(--light-text-color);
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  padding: 15px;
  background-color: var(--hover-bg);
  border-radius: var(--border-radius);
`;

const Avatar = styled.div<{ url?: string }>`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: ${({ url }) => (url ? 'transparent' : 'var(--primary-color)')};
  background-image: ${({ url }) => (url ? `url(${url})` : 'none')};
  background-size: cover;
  background-position: center;
  margin-right: 15px;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
`;

const UserDetails = styled.div`
  flex: 1;
`;

const UserName = styled.h4`
  margin: 0 0 5px 0;
  font-size: 1.1rem;
`;

const UserEmail = styled.p`
  margin: 0;
  color: var(--light-text-color);
  font-size: 0.9rem;
`;

const LinkContainer = styled.div`
  margin-top: 5px;
`;

const ObservacoesSection = styled.div`
  margin-top: 15px;
`;

const WarningText = styled.p`
  color: var(--warning-color);
  margin: 0;
`;

const DangerText = styled.p`
  color: var(--danger-color);
  margin: 0;
`;

const EmprestimoDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { emprestimo, isLoading } = useSelector((state: RootState) => state.emprestimos);
  const [editingDate, setEditingDate] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [updatingDate, setUpdatingDate] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'finalizar' | 'renovar' | null>(null);
  
  useEffect(() => {
    if (id) {
      dispatch(fetchEmprestimoById(id));
    }
  }, [dispatch, id]);
  
  const formatDate = (date?: Date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR');
  };
  
  const calcularDiasRestantes = () => {
    if (!emprestimo?.dataPrevistaDevolucao) return 0;
    
    const hoje = new Date();
    const dataPrevista = new Date(emprestimo.dataPrevistaDevolucao);
    const diffTime = dataPrevista.getTime() - hoje.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };
  
  const diasRestantes = emprestimo ? calcularDiasRestantes() : 0;
  const podeFinalizar = emprestimo && (emprestimo.status === 'pendente' || emprestimo.status === 'renovado' || emprestimo.status === 'atrasado');
  const podeRenovar = emprestimo && 
                    (emprestimo.status === 'pendente' || emprestimo.status === 'renovado' || emprestimo.status === 'atrasado') && 
                    (emprestimo.renovacoes === undefined || emprestimo.renovacoes < 2);
  
  const handleFinalizar = () => {
    if (!id) return;
    setConfirmAction('finalizar');
    setConfirmDialogOpen(true);
  };

  const handleRenovar = () => {
    if (!id) return;
    setConfirmAction('renovar');
    setConfirmDialogOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!id || !confirmAction) return;

    try {
      if (confirmAction === 'finalizar') {
        await dispatch(finalizarEmprestimo(id)).unwrap();
        toast.success('Empréstimo finalizado com sucesso!');
      } else {
        await dispatch(renovarEmprestimo(id)).unwrap();
        toast.success('Empréstimo renovado com sucesso!');
      }
    } catch (error: any) {
      toast.error(error || `Erro ao ${confirmAction === 'finalizar' ? 'finalizar' : 'renovar'} empréstimo`);
    } finally {
      setConfirmDialogOpen(false);
      setConfirmAction(null);
    }
  };
  
  const handleStartEditingDate = () => {
    if (emprestimo && emprestimo.dataPrevistaDevolucao) {
      // Formatar a data para o formato YYYY-MM-DD para o input date
      const date = new Date(emprestimo.dataPrevistaDevolucao);
      const formattedDate = date.toISOString().split('T')[0];
      setNewDate(formattedDate);
      setEditingDate(true);
    }
  };
  
  const handleCancelEditDate = () => {
    setEditingDate(false);
    setNewDate('');
  };
  
  const handleUpdateDate = async () => {
    if (!id || !newDate || !emprestimo) return;
    
    setUpdatingDate(true);
    try {
      // Criar um objeto de empréstimo com os mesmos dados do atual,
      // mas com a data prevista atualizada
      const emprestimoAtualizado = {
        ...emprestimo,
        dataPrevistaDevolucao: new Date(newDate)
      };
      
      await dispatch(updateEmprestimo({ 
        id, 
        emprestimo: emprestimoAtualizado
      })).unwrap();
      
      toast.success('Data de devolução atualizada com sucesso!');
      setEditingDate(false);
    } catch (error: any) {
      toast.error(error || 'Erro ao atualizar a data de devolução');
    } finally {
      setUpdatingDate(false);
    }
  };
  
  if (isLoading) {
    return (
      <LoadingContainer>
        <LoadingSpinner size="medium" message="Carregando detalhes do empréstimo..." />
      </LoadingContainer>
    );
  }

  if (!emprestimo) {
    return <div role="alert">Empréstimo não encontrado.</div>;
  }

  const livro = typeof emprestimo.livro === 'object' ? emprestimo.livro : null;
  const usuario = typeof emprestimo.usuario === 'object' ? emprestimo.usuario : null;
  
  return (
    <div>
      <PageHeader>
        <BackButton
          variant="outline"
          size="small"
          leftIcon={<FiArrowLeft />}
          as={Link}
          to="/emprestimos"
        >
          Voltar
        </BackButton>
        <PageTitle>Detalhes do Empréstimo</PageTitle>
        <Button
          as={Link}
          to={`/emprestimos/editar/${id}`}
          variant="secondary"
          size="small"
          leftIcon={<FiEdit2 />}
        >
          Editar
        </Button>
      </PageHeader>
      
      <EmprestimoDetailsContainer>
        <InfoPanel>
          <StatusBadge $status={emprestimo.status || 'pendente'}>
            Status: {getStatusLabel(emprestimo.status)}
          </StatusBadge>
          
          <InfoSection>
            <SectionTitle>Livro</SectionTitle>
            <BookInfo>
              {livro?.capa ? (
                <BookCover src={livro.capa} alt={livro.titulo} loading="lazy" width="60" height="90" />
              ) : (
                <DefaultBookCover aria-hidden="true">📕</DefaultBookCover>
              )}
              <BookDetails>
                <BookTitle>{livro ? livro.titulo : 'Carregando...'}</BookTitle>
                <BookAuthor>{livro ? livro.autor : ''}</BookAuthor>
                {livro && (
                  <LinkContainer>
                    <Link to={`/livros/${livro._id}`}>Ver detalhes do livro</Link>
                  </LinkContainer>
                )}
              </BookDetails>
            </BookInfo>
          </InfoSection>
          
          <InfoSection>
            <SectionTitle>Usuário</SectionTitle>
            <UserInfo>
              <Avatar url={usuario?.foto && usuario?.foto.startsWith('http') ? usuario.foto : undefined}>
                {usuario?.nome ? usuario.nome.charAt(0).toUpperCase() : '?'}
              </Avatar>
              <UserDetails>
                <UserName>{usuario ? usuario.nome : 'Carregando...'}</UserName>
                <UserEmail>{usuario ? usuario.email : ''}</UserEmail>
                {usuario && (
                  <LinkContainer>
                    <Link to={`/usuarios/${usuario._id}`}>Ver detalhes do usuário</Link>
                  </LinkContainer>
                )}
              </UserDetails>
            </UserInfo>
          </InfoSection>
          
          <InfoSection>
            <SectionTitle>Informações do Empréstimo</SectionTitle>
            <InfoItem>
              <FiCalendar />
              <InfoLabel>Data do Empréstimo:</InfoLabel>
              {formatDate(emprestimo.dataEmprestimo)}
            </InfoItem>
            
            <InfoItem>
              <FiCalendar />
              <InfoLabel>Data Prevista para Devolução:</InfoLabel>
              {editingDate ? (
                <DateEditContainer>
                  <DateInput
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    aria-label="Nova data prevista para devolução"
                  />
                  <DateActions>
                    <Button
                      variant="primary"
                      size="medium"
                      onClick={handleUpdateDate}
                      isLoading={updatingDate}
                    >
                      Salvar
                    </Button>
                    <Button
                      variant="outline"
                      size="medium"
                      onClick={handleCancelEditDate}
                    >
                      Cancelar
                    </Button>
                  </DateActions>
                </DateEditContainer>
              ) : (
                <>
                  {formatDate(emprestimo.dataPrevistaDevolucao)}
                  {emprestimo.status !== 'devolvido' && (
                    <Button
                      variant="outline"
                      size="medium"
                      onClick={handleStartEditingDate}
                    >
                      Editar
                    </Button>
                  )}
                </>
              )}
            </InfoItem>
            
            {emprestimo.dataDevolucao && (
              <InfoItem>
                <FiCheck />
                <InfoLabel>Data da Devolução:</InfoLabel>
                {formatDate(emprestimo.dataDevolucao)}
              </InfoItem>
            )}
            
            <InfoItem>
              <FiRepeat />
              <InfoLabel>Renovações:</InfoLabel>
              {emprestimo.renovacoes || 0} {emprestimo.renovacoes === 1 ? 'vez' : 'vezes'}
            </InfoItem>
            
            {emprestimo.observacoes && (
              <ObservacoesSection>
                <InfoLabel>Observações:</InfoLabel>
                <p>{emprestimo.observacoes}</p>
              </ObservacoesSection>
            )}
          </InfoSection>
        </InfoPanel>
        
        <ActionPanel>
          {podeFinalizar && (
            <ActionCard>
              <ActionTitle>Finalizar Empréstimo</ActionTitle>
              <p>Registre a devolução do livro pelo usuário.</p>
              <Button
                variant="success"
                leftIcon={<FiCheck size={18} />}
                onClick={handleFinalizar}
                fullWidth
              >
                Registrar Devolução
              </Button>
            </ActionCard>
          )}
          
          {podeRenovar && (
            <ActionCard>
              <ActionTitle>Renovar Empréstimo</ActionTitle>
              <p>Estenda o período do empréstimo por mais 7 dias.</p>
              <Button
                variant="primary"
                leftIcon={<FiRepeat size={18} />}
                onClick={handleRenovar}
                fullWidth
              >
                Renovar Empréstimo
              </Button>
            </ActionCard>
          )}
          
          <ActionCard>
            <ActionTitle>Status do Prazo</ActionTitle>
            {emprestimo.status === 'devolvido' ? (
              <p>Este empréstimo já foi finalizado.</p>
            ) : (
              <>
                {diasRestantes > 0 ? (
                  <p>Restam <strong>{diasRestantes} dias</strong> para a devolução.</p>
                ) : diasRestantes === 0 ? (
                  <WarningText>
                    <FiAlertTriangle /> A devolução vence <strong>hoje</strong>.
                  </WarningText>
                ) : (
                  <DangerText>
                    <FiAlertTriangle /> Devolução atrasada em <strong>{Math.abs(diasRestantes)} dias</strong>.
                  </DangerText>
                )}
              </>
            )}
          </ActionCard>
          
          {emprestimo.multa !== undefined && emprestimo.multa > 0 && (
            <ActionCard>
              <ActionTitle>Multa por Atraso</ActionTitle>
              <MultaValue hasMulta={true}>
                R$ {emprestimo.multa.toFixed(2)}
              </MultaValue>
              <p>Esta multa deve ser paga no momento da devolução.</p>
            </ActionCard>
          )}
        </ActionPanel>
      </EmprestimoDetailsContainer>

      <ConfirmDialog
        isOpen={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        onConfirm={handleConfirmAction}
        title="Confirmação"
        message={
          confirmAction === 'finalizar'
            ? 'Deseja finalizar este empréstimo? Isso irá registrar a devolução do livro.'
            : 'Deseja renovar este empréstimo?'
        }
        confirmText={confirmAction === 'finalizar' ? 'Finalizar' : 'Renovar'}
        cancelText="Cancelar"
        variant="info"
      />
    </div>
  );
};

export default EmprestimoDetailPage;
