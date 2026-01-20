import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
import { toast } from 'react-toastify';

const PageHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  gap: 15px;
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
  
  svg {
    margin-right: 10px;
    color: var(--primary-color);
  }
`;

const InfoLabel = styled.span`
  font-weight: 500;
  margin-right: 8px;
`;

const StatusBadge = styled.div<{ status: string }>`
  display: inline-block;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 1rem;
  margin-bottom: 20px;
  
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
  background-color: #f8f9fa;
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
  background-color: #eee;
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
  background-color: #f8f9fa;
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

const EmprestimoDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { emprestimo, isLoading } = useSelector((state: RootState) => state.emprestimos);
  const [editingDate, setEditingDate] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [updatingDate, setUpdatingDate] = useState(false);
  
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
  
  const handleFinalizar = async () => {
    if (!id) return;
    
    if (window.confirm('Deseja finalizar este empréstimo? Isso irá registrar a devolução do livro.')) {
      try {
        await dispatch(finalizarEmprestimo(id)).unwrap();
        toast.success('Empréstimo finalizado com sucesso!');
      } catch (error: any) {
        toast.error(error || 'Erro ao finalizar empréstimo');
      }
    }
  };
  
  const handleRenovar = async () => {
    if (!id) return;
    
    if (window.confirm('Deseja renovar este empréstimo?')) {
      try {
        await dispatch(renovarEmprestimo(id)).unwrap();
        toast.success('Empréstimo renovado com sucesso!');
      } catch (error: any) {
        toast.error(error || 'Erro ao renovar empréstimo');
      }
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
    return <div>Carregando detalhes do empréstimo...</div>;
  }
  
  if (!emprestimo) {
    return <div>Empréstimo não encontrado.</div>;
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
          onClick={() => navigate('/emprestimos')}
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
          <StatusBadge status={emprestimo.status || 'pendente'}>
            Status: {emprestimo.status ? emprestimo.status.toUpperCase() : 'PENDENTE'}
          </StatusBadge>
          
          <InfoSection>
            <SectionTitle>Livro</SectionTitle>
            <BookInfo>
              {livro?.capa ? (
                <BookCover src={livro.capa} alt={livro.titulo} />
              ) : (
                <DefaultBookCover>📕</DefaultBookCover>
              )}
              <BookDetails>
                <BookTitle>{livro ? livro.titulo : 'Carregando...'}</BookTitle>
                <BookAuthor>{livro ? livro.autor : ''}</BookAuthor>
                {livro && (
                  <div style={{ marginTop: '5px' }}>
                    <Link to={`/livros/${livro._id}`}>Ver detalhes do livro</Link>
                  </div>
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
                  <div style={{ marginTop: '5px' }}>
                    <Link to={`/usuarios/${usuario._id}`}>Ver detalhes do usuário</Link>
                  </div>
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
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input 
                    type="date" 
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    style={{ padding: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <Button 
                      variant="primary" 
                      size="small" 
                      onClick={handleUpdateDate}
                      isLoading={updatingDate}
                    >
                      Salvar
                    </Button>
                    <Button 
                      variant="outline" 
                      size="small" 
                      onClick={handleCancelEditDate}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  {formatDate(emprestimo.dataPrevistaDevolucao)}
                  {emprestimo.status !== 'devolvido' && (
                    <Button 
                      variant="outline" 
                      size="small" 
                      style={{ marginLeft: '10px' }}
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
              <div style={{ marginTop: '15px' }}>
                <InfoLabel>Observações:</InfoLabel>
                <p>{emprestimo.observacoes}</p>
              </div>
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
                  <p style={{ color: 'var(--warning-color)' }}>
                    <FiAlertTriangle /> A devolução vence <strong>hoje</strong>.
                  </p>
                ) : (
                  <p style={{ color: 'var(--danger-color)' }}>
                    <FiAlertTriangle /> Devolução atrasada em <strong>{Math.abs(diasRestantes)} dias</strong>.
                  </p>
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
    </div>
  );
};

export default EmprestimoDetailPage;
