import React, { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import {
  FiArrowLeft,
  FiEdit2,
  FiCalendar,
  FiTag,
} from "react-icons/fi";
import { fetchLivroById } from "../../features/livros/livroSlice";
import { fetchEmprestimosByLivro } from "../../features/emprestimos/emprestimoSlice";
import { AppDispatch, RootState } from "../../store";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Table, { Column } from "../../components/ui/Table";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { Emprestimo } from "../../types";
import { getStatusColorVars, getStatusLabel } from "../../utils/statusEmprestimo";

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

const BookDetailsContainer = styled.div`
  display: grid;
  grid-template-columns: minmax(200px, 250px) 1fr;
  gap: 30px;

  /* Item de grid não encolhe abaixo do conteúdo por padrão — sem isso, um
     valor longo dentro empurra a página inteira pro lado no mobile. */
  & > * {
    min-width: 0;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const BookCover = styled.img`
  width: 100%;
  max-width: 250px;
  box-shadow: var(--box-shadow);
  border-radius: var(--border-radius);
`;

const DefaultCover = styled.div`
  width: 100%;
  max-width: 250px;
  aspect-ratio: 2/3;
  background-color: var(--disabled-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: var(--box-shadow);
  font-size: 5rem;
  color: var(--light-text-color);
`;

const DefaultCoverLabel = styled.span`
  font-size: 0.875rem;
  color: var(--light-text-color);
`;

const BookInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const BookTitle = styled.h2`
  font-size: 1.5rem;
  color: var(--text-color);
  margin: 0 0 5px 0;
`;

const Author = styled.h3`
  font-size: 1.1rem;
  color: var(--light-text-color);
  margin: 0 0 20px 0;
  font-weight: 500;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  row-gap: 4px;
  margin-bottom: 12px;
  /* Sem isso, um valor longo não quebra linha e empurra a página inteira
     pro lado no mobile. */
  min-width: 0;
  overflow-wrap: break-word;
  word-break: break-word;

  svg {
    margin-right: 10px;
    color: var(--primary-color);
    flex-shrink: 0;
  }
`;

const InfoLabel = styled.span`
  font-weight: 500;
  margin-right: 8px;
`;

const BookDescription = styled.p`
  color: var(--text-color);
  line-height: 1.6;
  margin-top: 20px;
`;

const AvailabilityBadge = styled.div<{ $available: boolean }>`
  display: inline-block;
  padding: 6px 12px;
  border-radius: 16px;
  font-weight: 500;
  background-color: ${({ $available }) =>
    $available ? "var(--status-success-bg)" : "var(--status-danger-bg)"};
  color: ${({ $available }) =>
    $available ? "var(--status-success-text)" : "var(--status-danger-text)"};
  margin-bottom: 20px;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;

  & > * {
    min-width: 0;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const LocationItem = styled(InfoItem)`
  flex-direction: column;
  align-items: flex-start;
`;

const LocationHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 5px;
`;

const LocationValue = styled.div`
  word-break: break-word;
  max-width: 100%;
  margin-left: 25px;
  line-height: 1.5;
`;

const EmprestimoStatus = styled.span<{ $status: string }>`
  display: inline-block;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;

  ${({ $status }) => {
    const { bg, text } = getStatusColorVars($status);
    return `
      background-color: ${bg};
      color: ${text};
    `;
  }}
`;

const SectionTitle = styled.h2`
  font-size: 1.3rem;
  margin: 30px 0 15px;
  color: var(--text-color);
`;

const LivroDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { livro, isLoading: livroLoading } = useSelector(
    (state: RootState) => state.livros
  );
  const { emprestimos, isLoading: emprestimosLoading } = useSelector(
    (state: RootState) => state.emprestimos
  );
  const { categorias } = useSelector((state: RootState) => state.categorias);
  const { user } = useSelector((state: RootState) => state.auth);

  // Verificar se o usuário é admin
  const canEdit = user?.tipo === "admin";

  useEffect(() => {
    if (id) {
      dispatch(fetchLivroById(id));
      dispatch(fetchEmprestimosByLivro(id));
    }
  }, [dispatch, id]);

  const formatCategoriaName = () => {
    if (!livro || !livro.categoria) return "Não categorizado";

    if (typeof livro.categoria === "string") {
      const foundCategoria = categorias.find(
        (cat) => cat._id === livro.categoria
      );
      return foundCategoria ? foundCategoria.nome : "Não categorizado";
    }

    return livro.categoria.nome || "Não categorizado";
  };

  const formatDate = (date?: Date | string | null) => {
    if (!date) return "-";
    try {
      return new Date(date).toLocaleDateString("pt-BR");
    } catch (error) {
      console.error("Erro ao formatar data:", date, error);
      return "-";
    }
  };

  const columns: Column<Emprestimo>[] = [
    {
      header: "Usuário",
      render: (item) =>
        typeof item.usuario === "string"
          ? "Carregando..."
          : item.usuario?.nome || "Usuário removido",
    },
    {
      header: "Data Empréstimo",
      render: (item) => formatDate(item.dataEmprestimo),
    },
    {
      header: "Data de Entrega",
      render: (item) => formatDate(item.dataPrevistaDevolucao),
    },
    {
      header: "Status",
      render: (item) => (
        <EmprestimoStatus $status={item.status || 'pendente'}>
          {getStatusLabel(item.status)}
        </EmprestimoStatus>
      ),
    },
    {
      header: "Devolução",
      render: (item) => formatDate(item.dataDevolucao),
    },
  ];

  if (livroLoading) {
    return (
      <LoadingContainer>
        <LoadingSpinner size="medium" message="Carregando detalhes do livro..." />
      </LoadingContainer>
    );
  }

  if (!livro) {
    return <div role="alert">Livro não encontrado.</div>;
  }

  return (
    <div>
      <PageHeader>
        <BackButton
          as={Link}
          to="/livros"
          variant="outline"
          size="medium"
          leftIcon={<FiArrowLeft />}
        >
          Voltar
        </BackButton>
        <PageTitle>Detalhes do Livro</PageTitle>
        {canEdit && (
          <Button
            as={Link}
            to={`/livros/editar/${id}`}
            variant="secondary"
            size="medium"
            leftIcon={<FiEdit2 />}
          >
            Editar
          </Button>
        )}
      </PageHeader>

      <Card>
        <BookDetailsContainer>
          <div>
            {livro.capa ? (
              <BookCover src={livro.capa} alt={livro.titulo} loading="lazy" width="250" height="375" />
            ) : (
              <DefaultCover>
                <span aria-hidden="true">📕</span>
                <DefaultCoverLabel>Sem capa</DefaultCoverLabel>
              </DefaultCover>
            )}
          </div>

          <BookInfo>
            <BookTitle>{livro.titulo}</BookTitle>
            <Author>{livro.autor}</Author>

            <AvailabilityBadge $available={(livro.disponiveis || 0) > 0}>
              {(livro.disponiveis || 0) > 0
                ? `Disponível (${livro.disponiveis}/${livro.quantidade})`
                : "Indisponível"}
            </AvailabilityBadge>

            <InfoGrid>
              {/* Coluna da esquerda */}
              <div>
                {/* <InfoItem>
                  <FiTag />
                  <InfoLabel>Número Classificado:</InfoLabel>
                  {livro.isbn}
                </InfoItem> */}

                <InfoItem>
                  <FiCalendar />
                  <InfoLabel>Ano:</InfoLabel>
                  {livro.anoPublicacao || "-"}
                </InfoItem>

                <InfoItem>
                  <FiTag />
                  <InfoLabel>Categoria:</InfoLabel>
                  {formatCategoriaName()}
                </InfoItem>

                <InfoItem>
                  <InfoLabel>Editora:</InfoLabel>
                  {livro.editora || "-"}
                </InfoItem>
              </div>
              
              {/* Coluna da direita */}
              <div>
                {livro.localizacao && (
                  <LocationItem>
                    <LocationHeader>
                      <FiTag />
                      <InfoLabel>Novo Número de Classificação:</InfoLabel>
                    </LocationHeader>
                    <LocationValue>
                      {livro.localizacao}
                    </LocationValue>
                  </LocationItem>
                )}
              </div>
            </InfoGrid>

            {livro.descricao && (
              <BookDescription>{livro.descricao}</BookDescription>
            )}
          </BookInfo>
        </BookDetailsContainer>
      </Card>

      {canEdit && (
        <>
          <SectionTitle>Histórico de Empréstimos</SectionTitle>

          <Card>
            <Table
              columns={columns}
              data={emprestimos}
              keyExtractor={(item) => item._id || ""}
              isLoading={emprestimosLoading}
              emptyMessage="Nenhum histórico de empréstimo para este livro"
              hoverable
              striped
            />
          </Card>
        </>
      )}
    </div>
  );
};

export default LivroDetailPage;
