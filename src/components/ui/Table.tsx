import React, { useState, useEffect } from 'react';
import styled, { css } from 'styled-components';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export interface Column<T> {
  header: string;
  key?: string;
  render?: (item: T, index: number) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  width?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  striped?: boolean;
  hoverable?: boolean;
  compact?: boolean;
  className?: string;
  // Paginação
  paginated?: boolean;
  itemsPerPage?: number;
  initialPage?: number;
  onPageChange?: (page: number) => void;
  // Paginação server-side: quando true, `data` já é só a página atual (não é fatiada
  // no client) e `currentPage`/`totalItems` controlam a UI de paginação a partir de fora.
  serverSide?: boolean;
  currentPage?: number;
  totalItems?: number;
}

const TableWrapper = styled.div`
  width: 100%;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  margin-bottom: 1rem;

  /* Acima de 640px a tabela rola horizontalmente como uma tabela normal. */
  @media (min-width: 641px) {
    overflow-x: auto;
  }
`;

const StyledTable = styled.table<{ $compact?: boolean; $striped?: boolean; $hoverable?: boolean }>`
  width: 100%;
  border-collapse: collapse;
  font-size: ${({ $compact }) => ($compact ? '0.875rem' : '1rem')};

  th, td {
    padding: ${({ $compact }) => ($compact ? '8px 12px' : '12px 16px')};
    border-bottom: 1px solid var(--border-color);
    text-align: left;
  }

  th {
    background-color: var(--table-header-bg);
    font-weight: 600;
    color: var(--text-color);
  }

  ${({ $striped }) => $striped && css`
    @media (min-width: 641px) {
      tbody tr:nth-child(even) {
        background-color: var(--table-striped-bg);
      }
    }
  `}

  ${({ $hoverable }) => $hoverable && css`
    @media (hover: hover) and (min-width: 641px) {
      tbody tr:hover {
        background-color: var(--table-hover-bg);
      }
    }
  `}

  tbody tr {
    transition: background-color 0.2s;
  }

  @media (prefers-reduced-motion: reduce) {
    tbody tr {
      transition: none;
    }
  }

  /* Abaixo de 641px a tabela vira uma lista de cards: cada <tr> é um card e
     cada <td> mostra seu header como rótulo (via data-label), no lugar de
     rolar horizontalmente com texto minúsculo. */
  @media (max-width: 640px) {
    thead {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip: rect(0 0 0 0);
      white-space: nowrap;
      border: 0;
    }

    tbody,
    tr,
    td {
      display: block;
      width: 100%;
    }

    tbody tr {
      margin-bottom: 12px;
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius);
      overflow: hidden;
      background-color: var(--surface-color);
    }

    tbody tr:last-child {
      margin-bottom: 0;
    }

    td {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      min-height: 44px;
      border-bottom: 1px solid var(--border-color);
      text-align: right;
    }

    td:last-child {
      border-bottom: none;
    }

    td::before {
      content: attr(data-label);
      font-weight: 600;
      color: var(--text-color);
      text-align: left;
      flex-shrink: 0;
    }

    /* Colunas sem header (ex.: capa/avatar) não mostram rótulo e centralizam o conteúdo */
    td[data-label=""] {
      justify-content: center;
    }

    td[data-label=""]::before {
      display: none;
    }
  }
`;

const Cell = styled.td<{ $align?: 'left' | 'center' | 'right' }>`
  text-align: ${({ $align }) => $align || 'left'};

  @media (max-width: 640px) {
    text-align: right;
  }
`;

const TableRow = styled.tr<{ $clickable?: boolean }>`
  cursor: ${({ $clickable }) => ($clickable ? 'pointer' : 'default')};
`;

const HeaderCell = styled.th<{ $align?: 'left' | 'center' | 'right'; $width?: string }>`
  text-align: ${({ $align }) => $align || 'left'};
  width: ${({ $width }) => $width || 'auto'};
`;

const EmptyState = styled.div`
  padding: 2rem;
  text-align: center;
  color: var(--light-text-color);
`;

const LoadingRow = styled.tr`
  td {
    padding: 2rem;
    text-align: center;
  }
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-top: 1px solid var(--border-color);
  background-color: var(--pagination-bg);
  border-radius: 0 0 var(--border-radius) var(--border-radius);

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: stretch;
    text-align: center;
  }
`;

const PaginationInfo = styled.div`
  color: var(--light-text-color);
  font-size: 0.9rem;
`;

const PaginationControls = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;

  @media (max-width: 480px) {
    justify-content: center;
  }
`;

const PaginationButton = styled.button<{ $disabled?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  min-height: 44px;
  border: 1px solid var(--border-color);
  background-color: var(--pagination-button-bg);
  border-radius: var(--border-radius);
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  opacity: ${({ $disabled }) => ($disabled ? 0.6 : 1)};
  transition: var(--transition);
  color: var(--text-color);

  &:hover {
    background-color: ${({ $disabled }) => ($disabled ? 'var(--pagination-button-bg)' : 'var(--pagination-button-hover-bg)')};
  }

  &:active {
    transform: ${({ $disabled }) => ($disabled ? 'none' : 'scale(0.98)')};
  }

  &:focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const PageNumber = styled.span`
  min-width: 28px;
  text-align: center;
  font-size: 0.9rem;
`;

function TableInner<T>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  emptyMessage = 'Nenhum dado encontrado',
  onRowClick,
  striped = true,
  hoverable = true,
  compact = false,
  className,
  // Paginação
  paginated = false,
  itemsPerPage = 10,
  initialPage = 1,
  onPageChange,
  serverSide = false,
  currentPage: controlledPage,
  totalItems: controlledTotalItems,
}: TableProps<T>) {
  // Estado para paginação client-side (ignorado quando serverSide)
  const [internalPage, setInternalPage] = useState(initialPage);

  // Resetar paginação client-side quando os dados mudam
  useEffect(() => {
    if (paginated && !serverSide) {
      setInternalPage(1);
    }
  }, [data, paginated, serverSide]);

  const currentPage = serverSide ? (controlledPage ?? 1) : internalPage;

  // Calcular dados paginados
  const totalItems = serverSide ? (controlledTotalItems ?? data.length) : data.length;
  const totalPages = paginated ? Math.max(1, Math.ceil(totalItems / itemsPerPage)) : 1;

  // Garante que a página client-side está dentro dos limites válidos
  useEffect(() => {
    if (!serverSide && internalPage > totalPages) {
      setInternalPage(Math.max(1, totalPages));
    }
  }, [internalPage, totalPages, serverSide]);

  // Itens da página atual: no modo server-side, `data` já é a página atual
  const paginatedData = serverSide
    ? data
    : paginated
    ? data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    : data;

  // Manipuladores de paginação
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      if (!serverSide) setInternalPage(newPage);
      if (onPageChange) onPageChange(newPage);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      const newPage = currentPage + 1;
      if (!serverSide) setInternalPage(newPage);
      if (onPageChange) onPageChange(newPage);
    }
  };
  
  const renderRow = (item: T, index: number) => {
    return (
      <TableRow
        key={keyExtractor(item)}
        onClick={() => onRowClick && onRowClick(item)}
        $clickable={!!onRowClick}
      >
        {columns.map((column, colIndex) => {
          const key = column.key;
          const content = column.render
            ? column.render(item, index)
            : key
            ? (item as any)[key]
            : '';

          return (
            <Cell key={`cell-${colIndex}`} $align={column.align} data-label={column.header}>
              {content}
            </Cell>
          );
        })}
      </TableRow>
    );
  };

  return (
    <TableWrapper className={className}>
      <StyledTable
        $striped={striped}
        $hoverable={hoverable}
        $compact={compact}
      >
        <thead>
          <tr>
            {columns.map((column, index) => (
              <HeaderCell
                key={`header-${index}`}
                $align={column.align}
                $width={column.width}
                scope="col"
              >
                {column.header}
              </HeaderCell>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <LoadingRow>
              <td colSpan={columns.length} data-label="">
                <span aria-live="polite">Carregando...</span>
              </td>
            </LoadingRow>
          ) : data.length > 0 ? (
            paginatedData.map(renderRow)
          ) : (
            <tr>
              <td colSpan={columns.length} data-label="">
                <EmptyState>{emptyMessage}</EmptyState>
              </td>
            </tr>
          )}
        </tbody>
      </StyledTable>
      
      {paginated && data.length > 0 && (
        <PaginationContainer>
          <PaginationInfo>
            Mostrando {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}-
            {Math.min(currentPage * itemsPerPage, totalItems)} de {totalItems} itens
          </PaginationInfo>
          
          <PaginationControls>
            <PaginationButton 
              onClick={handlePreviousPage} 
              $disabled={currentPage <= 1}
              disabled={currentPage <= 1}
            >
              <FiChevronLeft size={18} />
            </PaginationButton>
            
            <PageNumber>
              {currentPage} / {totalPages}
            </PageNumber>
            
            <PaginationButton 
              onClick={handleNextPage} 
              $disabled={currentPage >= totalPages}
              disabled={currentPage >= totalPages}
            >
              <FiChevronRight size={18} />
            </PaginationButton>
          </PaginationControls>
        </PaginationContainer>
      )}
    </TableWrapper>
  );
}

const Table = React.memo(TableInner) as <T>(props: TableProps<T>) => React.ReactElement | null;

export default Table;
