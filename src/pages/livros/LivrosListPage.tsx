import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import styled from "styled-components";
import { FiPlus, FiEdit2, FiTrash2, FiEye } from "react-icons/fi";
import {
  fetchLivros,
  deleteLivro,
  fetchLivrosByCategoria,
  pesquisarLivros,
} from "../../features/livros/livroSlice";
import { fetchCategorias } from "../../features/categorias/categoriaSlice";
import { AppDispatch, RootState } from "../../store";
import Button from "../../components/ui/Button";
import Table, { Column } from "../../components/ui/Table";
import SearchBar from "../../components/ui/SearchBar";
import Select from "../../components/ui/Select";
import Card from "../../components/ui/Card";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
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

const LivrosListPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { livros, isLoading, isDataLoaded } = useSelector((state: RootState) => state.livros);
  const { categorias } = useSelector((state: RootState) => state.categorias);
  const { user } = useSelector((state: RootState) => state.auth);
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoria, setSelectedCategoria] = useState("");
  const [filteredLivros, setFilteredLivros] = useState<Livro[]>([]);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [livroToDelete, setLivroToDelete] = useState<string>("");

  // Verificar se o usuário é admin
  const canEdit = user?.tipo === "admin";

  useEffect(() => {
    // Verificar se precisamos forçar uma atualização dos dados
    const forceRefresh = location.state && (location.state as any).forceRefresh;

    // Buscar livros apenas se não foram carregados ainda ou se forceRefresh for true
    if (!isDataLoaded || forceRefresh) {
      dispatch(fetchLivros(forceRefresh || false));
    }
    dispatch(fetchCategorias());

    // Limpar o state de navegação para evitar atualizações desnecessárias
    if (forceRefresh && window.history) {
      window.history.replaceState({}, "", location.pathname);
    }
  }, [dispatch, location, isDataLoaded]);

  useEffect(() => {
    // Se uma categoria estiver selecionada e não for 'todas'
    if (selectedCategoria && selectedCategoria !== "todas") {
      dispatch(fetchLivrosByCategoria(selectedCategoria));
    } else if (searchTerm) {
      dispatch(pesquisarLivros(searchTerm));
    } else {
      dispatch(fetchLivros(false));
    }
  }, [selectedCategoria, dispatch, searchTerm]);

  // Atualizar a lista filtrada quando os livros mudarem
  useEffect(() => {
    if (!Array.isArray(livros)) {
      setFilteredLivros([]);
      return;
    }

    // Se não houver termo de busca, apenas usa a lista completa
    if (!searchTerm) {
      setFilteredLivros(livros);
      return;
    }

    // Se houver termo de busca mas a lista estiver vazia, faça uma pesquisa local
    // Isso é útil quando a API não encontra resultados, mas pode haver correspondências
    // em campos que a API não está considerando, como autorEspiritual
    if (searchTerm && livros.length === 0) {
      // Buscar todos os livros para fazer pesquisa local
      dispatch(fetchLivros(false)).then((action) => {
        if (fetchLivros.fulfilled.match(action)) {
          const todosLivros = action.payload.livros;
          const termoBusca = searchTerm.toLowerCase();

          // Filtrar localmente por autor espiritual e outros campos
          const resultadosLocais = todosLivros.filter(
            (livro) =>
              (livro.autorEspiritual &&
                livro.autorEspiritual.toLowerCase().includes(termoBusca)) ||
              livro.titulo.toLowerCase().includes(termoBusca) ||
              livro.autor.toLowerCase().includes(termoBusca)
          );

          setFilteredLivros(resultadosLocais);
        }
      });
    } else {
      setFilteredLivros(livros);
    }
  }, [livros, searchTerm, dispatch]);

  const handleSearch = (term: string) => {
    // Resetar a categoria quando fizer uma nova busca
    setSelectedCategoria("");
    setSearchTerm(term);

    if (term) {
      // Primeiro tenta a pesquisa pela API
      dispatch(pesquisarLivros(term));

      // A lógica de fallback para pesquisa local está no useEffect que monitora livros e searchTerm
    } else {
      dispatch(fetchLivros(false));
    }
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
      width: "50px",
      render: (item) =>
        item.capa ? (
          <BookCover src={item.capa} alt={item.titulo} loading="lazy" width={40} height={60} />
        ) : (
          <DefaultCover aria-hidden="true">📕</DefaultCover>
        ),
    },
    {
      header: "Título",
      key: "titulo",
    },
    {
      header: "Autor",
      key: "autor",
    },
    {
      header: "Autor Espiritual",
      render: (item) => item.autorEspiritual || "-",
    },
    {
      header: "Categoria",
      render: (item) => formatCategoriaName(item.categoria),
    },

    {
      header: "Quantidade",
      render: (item) => <div>{item.quantidade}</div>,
    },

    {
      header: 'Disponibilidade',
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
      render: (item) => (
        <ActionButtons>
          <Button
            as={Link}
            to={`/livros/${item._id}`}
            variant="info"
            size="medium"
            leftIcon={<FiEye size={16} />}
          >
            Ver
          </Button>
          {canEdit && (
            <>
              <Button
                as={Link}
                to={`/livros/editar/${item._id}`}
                variant="secondary"
                size="medium"
                leftIcon={<FiEdit2 size={16} />}
              >
                Editar
              </Button>
              <Button
                variant="danger"
                size="medium"
                leftIcon={<FiTrash2 size={16} />}
                onClick={() => item._id && handleDeleteClick(item._id)}
              >
                Excluir
              </Button>
            </>
          )}
        </ActionButtons>
      ),
      align: "right",
    },
  ], [canEdit, formatCategoriaName, handleDeleteClick]);

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
              placeholder="Pesquisar por título, autor ou autor espiritual..."
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
          data={filteredLivros}
          keyExtractor={(item) => item._id || ""}
          isLoading={isLoading}
          emptyMessage="Nenhum livro encontrado"
          hoverable
          striped
          paginated={true}
          itemsPerPage={6}
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
