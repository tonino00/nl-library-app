import React, { forwardRef } from 'react';
import styled, { css } from 'styled-components';

export interface Option {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: Option[];
  label?: string;
  helperText?: string;
  error?: string;
  fullWidth?: boolean;
}

const SelectWrapper = styled.div<{ $fullWidth?: boolean }>`
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
  width: ${({ $fullWidth }) => ($fullWidth ? '100%' : 'auto')};
`;

const Label = styled.label`
  font-size: 14px;
  color: var(--text-color);
  margin-bottom: 6px;
`;

const StyledSelect = styled.select<{ $hasError?: boolean }>`
  width: 100%;
  padding: 10px 12px;
  border-radius: var(--border-radius);
  border: 1px solid var(--border-color);
  font-size: 16px;
  background-color: white;
  transition: var(--transition);
  appearance: none; /* Remove default arrow */
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236C757D' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(46, 90, 136, 0.2);
  }
  
  &:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }
  
  ${({ $hasError }) => $hasError && css`
    border-color: var(--danger-color);
    
    &:focus {
      box-shadow: 0 0 0 2px rgba(220, 53, 69, 0.2);
    }
  `}
`;

const HelperText = styled.span<{ $hasError?: boolean }>`
  font-size: 12px;
  margin-top: 4px;
  color: ${({ $hasError }) => ($hasError ? 'var(--danger-color)' : 'var(--light-text-color)')};
`;

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ options, label, helperText, error, fullWidth, ...rest }, ref) => {
    return (
      <SelectWrapper $fullWidth={fullWidth}>
        {label && <Label>{label}</Label>}
        <StyledSelect
          $hasError={!!error}
          ref={ref}
          {...rest}
        >
          <option value="" disabled>
            Selecione uma opção...
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </StyledSelect>
        {(helperText || error) && (
          <HelperText $hasError={!!error}>{error || helperText}</HelperText>
        )}
      </SelectWrapper>
    );
  }
);

Select.displayName = 'Select';

export default Select;
