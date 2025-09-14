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
}

const TableWrapper = styled.div`
  width: 100%;
  overflow-x: auto;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  margin-bottom: 1rem;
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
    background-color: #f8f9fa;
    font-weight: 600;
    color: var(--text-color);
  }

  ${({ $striped }) => $striped && css`
    tbody tr:nth-child(even) {
      background-color: rgba(0, 0, 0, 0.02);
    }
  `}

  ${({ $hoverable }) => $hoverable && css`
    tbody tr:hover {
      background-color: rgba(46, 90, 136, 0.05);
    }
  `}

  tbody tr {
    transition: background-color 0.2s;
  }
`;

const Cell = styled.td<{ $align?: 'left' | 'center' | 'right' }>`
  text-align: ${({ $align }) => $align || 'left'};
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
  padding: 12px 16px;
  border-top: 1px solid var(--border-color);
  background-color: #f8f9fa;
  border-radius: 0 0 var(--border-radius) var(--border-radius);
`;

const PaginationInfo = styled.div`
  color: var(--light-text-color);
  font-size: 0.9rem;
`;

const PaginationControls = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const PaginationButton = styled.button<{ $disabled?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid var(--border-color);
  background-color: white;
  border-radius: var(--border-radius);
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  opacity: ${({ $disabled }) => ($disabled ? 0.6 : 1)};
  transition: all 0.2s;
  color: var(--text-color);
  
  &:hover {
    background-color: ${({ $disabled }) => ($disabled ? 'white' : '#f0f0f0')};
  }
  
  &:active {
    transform: ${({ $disabled }) => ($disabled ? 'none' : 'scale(0.98)')};
  }
`;

const PageNumber = styled.span`
  min-width: 28px;
  text-align: center;
  font-size: 0.9rem;
`;

function Table<T>({
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
}: TableProps<T>) {
  // Estado para paginação
  const [currentPage, setCurrentPage] = useState(initialPage);
  
  // Resetar paginação quando os dados mudam
  useEffect(() => {
    if (paginated) {
      setCurrentPage(1);
    }
  }, [data]);
  
  // Calcular dados paginados
  const totalItems = data.length;
  const totalPages = paginated ? Math.max(1, Math.ceil(totalItems / itemsPerPage)) : 1;
  
  // Garante que a página atual está dentro dos limites válidos
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(Math.max(1, totalPages));
    }
  }, [currentPage, totalPages]);
  
  // Itens da página atual
  const paginatedData = paginated
    ? data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    : data;
  
  // Manipuladores de paginação
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      if (onPageChange) onPageChange(newPage);
    }
  };
  
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      if (onPageChange) onPageChange(newPage);
    }
  };
  
  const renderRow = (item: T, index: number) => {
    return (
      <tr
        key={keyExtractor(item)}
        onClick={() => onRowClick && onRowClick(item)}
        style={{ cursor: onRowClick ? 'pointer' : 'default' }}
      >
        {columns.map((column, colIndex) => {
          const key = column.key;
          const content = column.render
            ? column.render(item, index)
            : key
            ? (item as any)[key]
            : '';

          return (
            <Cell key={`cell-${colIndex}`} $align={column.align}>
              {content}
            </Cell>
          );
        })}
      </tr>
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
              >
                {column.header}
              </HeaderCell>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <LoadingRow>
              <td colSpan={columns.length}>Carregando...</td>
            </LoadingRow>
          ) : data.length > 0 ? (
            paginatedData.map(renderRow)
          ) : (
            <tr>
              <td colSpan={columns.length}>
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

export default Table;
