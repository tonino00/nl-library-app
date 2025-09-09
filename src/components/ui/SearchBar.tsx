import React, { useState } from 'react';
import styled from 'styled-components';
import { FiSearch, FiX } from '../../../src/utils/iconFix';

interface SearchBarProps {
  onSearch: (term: string) => void;
  placeholder?: string;
  initialValue?: string;
  className?: string;
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
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(46, 90, 136, 0.15);
  }
`;

const IconWrapper = styled.div<{ position: 'left' | 'right' }>`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  ${({ position }) => position === 'left' ? 'left: 12px;' : 'right: 12px;'}
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
}) => {
  const [searchTerm, setSearchTerm] = useState(initialValue);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
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
      <IconWrapper position="left">
        <FiSearch size={18} />
      </IconWrapper>
      <SearchInput
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        aria-label="Campo de pesquisa"
      />
      {searchTerm && (
        <IconWrapper position="right">
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
