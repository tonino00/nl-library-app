import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { FiSearch, FiX } from '../../../src/utils/iconFix';

interface SearchBarProps {
  onSearch: (term: string) => void;
  placeholder?: string;
  initialValue?: string;
  className?: string;
  // Atraso antes de disparar a busca automaticamente enquanto o usuário digita.
  // Enter continua disparando na hora, sem esperar o debounce.
  debounceMs?: number;
}

const SearchContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 500px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 10px 40px 10px 40px;
  border-radius: 20px;
  border: 1px solid var(--border-color);
  font-size: 1rem;
  transition: var(--transition);

  &:focus {
    border-color: var(--primary-color);
  }

  &:focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
  }

  /* Remove o "x" nativo de limpar do input type="search" — já temos o nosso */
  &::-webkit-search-cancel-button,
  &::-webkit-search-decoration {
    -webkit-appearance: none;
    appearance: none;
  }
`;

const IconWrapper = styled.div<{ $position: 'left' | 'right' }>`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  ${({ $position }) => $position === 'left' ? 'left: 12px;' : 'right: 12px;'}
  display: flex;
  align-items: center;
  color: var(--light-text-color);
`;

const ClearButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  color: var(--light-text-color);

  &:hover {
    color: var(--text-color);
  }
`;

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  placeholder = 'Pesquisar...',
  initialValue = '',
  className,
  debounceMs = 350,
}) => {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const onSearchRef = useRef(onSearch);
  onSearchRef.current = onSearch;
  const isFirstRender = useRef(true);

  // Busca automaticamente enquanto o usuário digita, sem precisar apertar
  // Enter — só espera um pouco pra não disparar a cada letra.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const handle = setTimeout(() => {
      onSearchRef.current(searchTerm);
    }, debounceMs);

    return () => clearTimeout(handle);
  }, [searchTerm, debounceMs]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleClear = () => {
    setSearchTerm('');
    onSearch('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch(searchTerm);
    }
  };

  return (
    <SearchContainer className={className}>
      <IconWrapper $position="left">
        <FiSearch size={18} />
      </IconWrapper>
      <SearchInput
        type="search"
        enterKeyHint="search"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        placeholder={placeholder}
        value={searchTerm}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        aria-label="Campo de pesquisa"
      />
      {searchTerm && (
        <IconWrapper $position="right">
          <ClearButton
            type="button"
            onClick={handleClear}
            aria-label="Limpar pesquisa"
          >
            <FiX size={18} />
          </ClearButton>
        </IconWrapper>
      )}
    </SearchContainer>
  );
};

export default SearchBar;
