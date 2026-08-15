import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { FiPlus, FiEdit2, FiTrash2, FiEye } from "react-icons/fi";
import {
  deleteLivro,
  fetchLivrosPaginados,
} from "../../features/livros/livroSlice";
import { fetchCategorias } from "../../features/categorias/categoriaSlice";
import { AppDispatch, RootState } from "../../store";
import Button from "../../components/ui/Button";
import Table, { Column } from "../../components/ui/Table";
import SearchBar from "../../components/ui/SearchBar";
import Select from "../../components/ui/Select";
import Card from "../../components/ui/Card";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import DropdownMenu from "../../components/ui/DropdownMenu";
import { Livro } from "../../types";
import { toast } from "react-toastify";

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

const BookCover = styled.img`
  width: 40px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
  box-shadow: var(--box-shadow);
`;

const DefaultCover = styled.div`
  width: 40px;
  height: 60px;
  background-color: var(--disabled-bg);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--light-text-color);
  font-size: 20px;
`;

const AvailabilityStatus = styled.span<{ $available: boolean }>`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  background-color: ${({ $available }) =>
    $available ? "var(--status-success-bg)" : "var(--status-danger-bg)"};
  color: ${({ $available }) =>
    $available ? "var(--status-success-text)" : "var(--status-danger-text)"};
`;

const BookCoverImg: React.FC<{ src: string; titulo: string }> = ({ src, titulo }) => {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return <DefaultCover aria-hidden="true">📕</DefaultCover>;
  }

  return (
    <BookCover
      src={src}
      alt={titulo}
      loading="lazy"
      width={40}
      height={60}
      onError={() => setFailed(true)}
    />
  );
};

const ITEMS_PER_PAGE = 6;

const LivrosListPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { paginado, isLoading } = useSelector((state: RootState) => state.livros);
  const { categorias } = useSelector((state: RootState) => state.categorias);
  const { user } = useSelector((state: RootState) => state.auth);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoria, setSelectedCategoria] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [livroToDelete, setLivroToDelete] = useState<string>("");
  const isFirstRender = useRef(true);

  // Verificar se o usuário é admin
  const canEdit = user?.tipo === "admin";

  useEffect(() => {
    dispatch(fetchCategorias(false));
  }, [dispatch]);

  // Busca paginada/filtrada direto no servidor: dispara sempre que página, busca
  // ou categoria mudam. Volta pra página 1 quando um filtro muda (não quando só a página muda).
  useEffect(() => {
    dispatch(
      fetchLivrosPaginados({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        titulo: searchTerm || undefined,
        categoria: selectedCategoria && selectedCategoria !== "todas" ? selectedCategoria : undefined,
      })
    );
  }, [dispatch, currentPage, searchTerm, selectedCategoria]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setCurrentPage(1);
  }, [searchTerm, selectedCategoria]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleCategoriaChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategoria(e.target.value);
  }, []);

  const handleDeleteClick = useCallback((id: string) => {
    setLivroToDelete(id);
    setConfirmDeleteOpen(true);
  }, []);

  const handleConfirmDelete = async () => {
    try {
      await dispatch(deleteLivro(livroToDelete)).unwrap();
      toast.success("Livro excluído com sucesso!");
      // Recarrega a página atual para refletir a remoção
      dispatch(
        fetchLivrosPaginados({
          page: currentPage,
          limit: ITEMS_PER_PAGE,
          titulo: searchTerm || undefined,
          categoria: selectedCategoria && selectedCategoria !== "todas" ? selectedCategoria : undefined,
        })
      );
    } catch (error: any) {
      toast.error(error || "Erro ao excluir livro");
    }
  };

  const formatCategoriaName = useCallback((categoria: string | any) => {
    if (typeof categoria === "string") {
      // Verificar se categorias é um array antes de chamar find
      const foundCategoria = Array.isArray(categorias)
        ? categorias.find((cat) => cat._id === categoria)
        : undefined;
      return foundCategoria ? foundCategoria.nome : categoria;
    }
    return categoria?.nome || "Não categorizado";
  }, [categorias]);

  const columns: Column<Livro>[] = useMemo(() => [
    {
      header: "",
      width: "56px",
      render: (item) =>
        item.capa ? (
          <BookCoverImg src={item.capa} titulo={item.titulo} />
        ) : (
          <DefaultCover aria-hidden="true">📕</DefaultCover>
        ),
    },
    {
      header: "Título",
      key: "titulo",
      width: "22%",
    },
    {
      header: "Autor",
      key: "autor",
      width: "16%",
    },
    {
      header: "Autor Espiritual",
      render: (item) => item.autorEspiritual || "-",
      width: "14%",
    },
    {
      header: "Categoria",
      render: (item) => formatCategoriaName(item.categoria),
      width: "13%",
    },

    {
      header: "Quantidade",
      render: (item) => <div>{item.quantidade}</div>,
      width: "90px",
      align: "center",
    },

    {
      header: 'Disponibilidade',
      width: "130px",
      align: "center",
      render: (item) => (
        <div>
          <AvailabilityStatus $available={(item.disponiveis || 0) > 0}>
            {item.disponiveis || 0}/{item.quantidade || 0}
          </AvailabilityStatus>
        </div>
      ),
    },
    {
      header: "Ações",
      width: "70px",
      render: (item) => (
        <DropdownMenu
          triggerLabel={`Ações para ${item.titulo}`}
          items={[
            {
              label: "Ver",
              icon: <FiEye size={16} />,
              onClick: () => navigate(`/livros/${item._id}`),
            },
            ...(canEdit
              ? [
                  {
                    label: "Editar",
                    icon: <FiEdit2 size={16} />,
                    onClick: () => navigate(`/livros/editar/${item._id}`),
                  },
                  {
                    label: "Excluir",
                    icon: <FiTrash2 size={16} />,
                    variant: "danger" as const,
                    onClick: () => item._id && handleDeleteClick(item._id),
                  },
                ]
              : []),
          ]}
        />
      ),
      align: "right",
    },
  ], [canEdit, formatCategoriaName, handleDeleteClick, navigate]);

  return (
    <div>
      <PageHeader>
        <PageTitle>Livros</PageTitle>
        {canEdit && (
          <Button
            as={Link}
            to="/livros/novo"
            variant="primary"
            leftIcon={<FiPlus size={16} />}
          >
            Novo Livro
          </Button>
        )}
      </PageHeader>

      <Card>
        <SearchContainer>
          <SearchInputWrapper>
            <SearchBar
              onSearch={handleSearch}
              placeholder="Pesquisar por título ou autor..."
            />
          </SearchInputWrapper>
          <FilterContainer>
            <Select
              label="Filtrar por categoria"
              value={selectedCategoria}
              onChange={handleCategoriaChange}
              options={[
                { value: "todas", label: "Todas as categorias" },
                ...(Array.isArray(categorias)
                  ? categorias.map((cat) => ({
                      value: cat._id || "",
                      label: cat.nome,
                    }))
                  : []),
              ]}
              fullWidth
            />
          </FilterContainer>
        </SearchContainer>

        <Table
          columns={columns}
          data={paginado.livros}
          keyExtractor={(item) => item._id || ""}
          isLoading={isLoading || paginado.isLoading}
          emptyMessage="Nenhum livro encontrado"
          hoverable
          striped
          paginated={true}
          serverSide
          itemsPerPage={ITEMS_PER_PAGE}
          currentPage={currentPage}
          totalItems={paginado.total}
          onPageChange={setCurrentPage}
        />
      </Card>

      <ConfirmDialog
        isOpen={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirmação"
        message="Tem certeza que deseja excluir este livro?"
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  );
};

export default LivrosListPage;
