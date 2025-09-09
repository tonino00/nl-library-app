import React from 'react';
import styled, { css } from 'styled-components';

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
}

const TableWrapper = styled.div`
  width: 100%;
  overflow-x: auto;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  margin-bottom: 1rem;
`;

const StyledTable = styled.table<{ compact?: boolean; striped?: boolean; hoverable?: boolean }>`
  width: 100%;
  border-collapse: collapse;
  font-size: ${({ compact }) => (compact ? '0.875rem' : '1rem')};

  th, td {
    padding: ${({ compact }) => (compact ? '8px 12px' : '12px 16px')};
    border-bottom: 1px solid var(--border-color);
    text-align: left;
  }

  th {
    background-color: #f8f9fa;
    font-weight: 600;
    color: var(--text-color);
  }

  ${({ striped }) => striped && css`
    tbody tr:nth-child(even) {
      background-color: rgba(0, 0, 0, 0.02);
    }
  `}

  ${({ hoverable }) => hoverable && css`
    tbody tr:hover {
      background-color: rgba(46, 90, 136, 0.05);
    }
  `}

  tbody tr {
    transition: background-color 0.2s;
  }
`;

const Cell = styled.td<{ align?: 'left' | 'center' | 'right' }>`
  text-align: ${({ align }) => align || 'left'};
`;

const HeaderCell = styled.th<{ align?: 'left' | 'center' | 'right'; width?: string }>`
  text-align: ${({ align }) => align || 'left'};
  width: ${({ width }) => width || 'auto'};
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
}: TableProps<T>) {
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
            <Cell key={`cell-${colIndex}`} align={column.align}>
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
        striped={striped}
        hoverable={hoverable}
        compact={compact}
      >
        <thead>
          <tr>
            {columns.map((column, index) => (
              <HeaderCell
                key={`header-${index}`}
                align={column.align}
                width={column.width}
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
            data.map(renderRow)
          ) : (
            <tr>
              <td colSpan={columns.length}>
                <EmptyState>{emptyMessage}</EmptyState>
              </td>
            </tr>
          )}
        </tbody>
      </StyledTable>
    </TableWrapper>
  );
}

export default Table;
