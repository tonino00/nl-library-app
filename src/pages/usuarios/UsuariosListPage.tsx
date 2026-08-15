import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiToggleLeft,
  FiToggleRight,
} from "react-icons/fi";
import {
  fetchUsuarios,
  deleteUsuario,
  toggleAtivoUsuario,
} from "../../features/usuarios/usuarioSlice";
import { AppDispatch, RootState } from "../../store";
import Button from "../../components/ui/Button";
import Table, { Column } from "../../components/ui/Table";
import SearchBar from "../../components/ui/SearchBar";
import Card from "../../components/ui/Card";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import DropdownMenu, { DropdownMenuItem } from "../../components/ui/DropdownMenu";
import { Usuario } from "../../types";
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
  margin-bottom: 20px;
`;

const Avatar = styled.div<{ $url?: string }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${({ $url }) =>
    $url ? "transparent" : "var(--primary-color)"};
  background-image: ${({ $url }) => ($url ? `url(${$url})` : "none")};
  background-size: cover;
  background-position: center;
  color: var(--surface-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
`;

const StatusBadge = styled.span<{ $ativo: boolean }>`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  background-color: ${({ $ativo }) =>
    $ativo ? "var(--status-success-bg)" : "var(--status-danger-bg)"};
  color: ${({ $ativo }) =>
    $ativo ? "var(--status-success-text)" : "var(--status-danger-text)"};
`;

const TipoUsuario = styled.span`
  text-transform: capitalize;
`;

const UsuariosListPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { usuarios, isLoading, isDataLoaded } = useSelector(
    (state: RootState) => state.usuarios
  );
  const { user } = useSelector((state: RootState) => state.auth);
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [usuarioToDelete, setUsuarioToDelete] = useState<string>("");

  // Verificar se o usuário é admin
  const isAdmin = user?.tipo === "admin";

  useEffect(() => {
    // Verificar se precisamos forçar uma atualização dos dados
    const forceRefresh = location.state && (location.state as any).forceRefresh;

    // Buscar usuários apenas se ainda não buscamos ou se forceRefresh for true
    if (forceRefresh || !isDataLoaded) {
      dispatch(fetchUsuarios(forceRefresh || false));
    }

    // Limpar o state de navegação para evitar atualizações desnecessárias
    if (forceRefresh && window.history) {
      window.history.replaceState({}, "", location.pathname);
    }
  }, [dispatch, location, isDataLoaded]);

  // Deriva a lista filtrada durante o render, sem estado extra nem re-render duplicado
  const filteredUsuarios = useMemo(() => {
    if (!Array.isArray(usuarios)) return [];
    const termo = searchTerm.toLowerCase();
    if (!termo) return usuarios;
    return usuarios.filter(
      (usuario) =>
        usuario.nome.toLowerCase().includes(termo) ||
        usuario.email.toLowerCase().includes(termo) ||
        usuario.documento.toLowerCase().includes(termo)
    );
  }, [usuarios, searchTerm]);

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  const handleDeleteClick = useCallback((id: string) => {
    setUsuarioToDelete(id);
    setConfirmDeleteOpen(true);
  }, []);

  const handleConfirmDelete = async () => {
    try {
      await dispatch(deleteUsuario(usuarioToDelete)).unwrap();
      toast.success("Usuário excluído com sucesso!");
    } catch (error: any) {
      toast.error(error || "Erro ao excluir usuário");
    }
  };

  const handleToggleAtivo = useCallback(async (id: string) => {
    try {
      const result = await dispatch(toggleAtivoUsuario(id)).unwrap();
      const statusMessage = result.ativo ? "ativado" : "desativado";
      toast.success(`Usuário ${statusMessage} com sucesso!`);
    } catch (error: any) {
      toast.error(error || "Erro ao alterar status do usuário");
    }
  }, [dispatch]);

  const columns: Column<Usuario>[] = useMemo(() => [
    {
      header: "",
      width: "50px",
      render: (item) => (
        <Avatar $url={item.foto}>
          {!item.foto && item.nome.charAt(0).toUpperCase()}
        </Avatar>
      ),
    },
    {
      header: "Nome",
      key: "nome",
    },
    {
      header: "Email",
      key: "email",
    },
    {
      header: "Documento",
      key: "documento",
    },
    {
      header: "Tipo",
      render: (item) => (
        <TipoUsuario>
          {item.tipo || "leitor"}
        </TipoUsuario>
      ),
    },
    {
      header: "Status",
      render: (item) => (
        <StatusBadge $ativo={item.ativo !== false}>
          {item.ativo !== false ? "Ativo" : "Inativo"}
        </StatusBadge>
      ),
    },
    {
      header: "Ações",
      width: "70px",
      render: (item) => {
        const menuItems: DropdownMenuItem[] = [
          {
            label: "Ver",
            icon: <FiEye size={16} />,
            onClick: () => navigate(`/usuarios/${item._id}`),
          },
          {
            label: "Editar",
            icon: <FiEdit2 size={16} />,
            onClick: () => navigate(`/usuarios/editar/${item._id}`),
          },
          {
            label: item.ativo !== false ? "Desativar" : "Ativar",
            icon: item.ativo !== false ? <FiToggleRight size={16} /> : <FiToggleLeft size={16} />,
            onClick: () => item._id && handleToggleAtivo(item._id),
          },
          ...(isAdmin
            ? [
                {
                  label: "Excluir",
                  icon: <FiTrash2 size={16} />,
                  variant: "danger" as const,
                  onClick: () => item._id && handleDeleteClick(item._id),
                },
              ]
            : []),
        ];

        return <DropdownMenu triggerLabel={`Ações para ${item.nome}`} items={menuItems} />;
      },
      align: "right",
    },
  ], [isAdmin, handleDeleteClick, handleToggleAtivo, navigate]);

  return (
    <div>
      <PageHeader>
        <PageTitle>Usuários</PageTitle>
        <Button
          as={Link}
          to="/usuarios/novo"
          variant="primary"
          leftIcon={<FiPlus size={16} />}
        >
          Novo Usuário
        </Button>
      </PageHeader>

      <Card>
        <SearchContainer>
          <SearchBar
            onSearch={handleSearch}
            placeholder="Pesquisar usuários..."
          />
        </SearchContainer>

        <Table
          columns={columns}
          data={filteredUsuarios}
          keyExtractor={(item) => item._id || ""}
          isLoading={isLoading}
          emptyMessage="Nenhum usuário encontrado"
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
        message="Tem certeza que deseja excluir este usuário?"
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  );
};

export default UsuariosListPage;
