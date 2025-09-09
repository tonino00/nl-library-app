import React, { forwardRef } from 'react';
import styled from 'styled-components';

type InputElement = HTMLInputElement | HTMLTextAreaElement;

interface InputProps extends Omit<React.InputHTMLAttributes<InputElement>, 'as'> {
  label?: string;
  helperText?: string;
  error?: string;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  as?: 'input' | 'textarea';
}

const InputWrapper = styled.div<{ fullWidth?: boolean }>`
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
`;

const Label = styled.label`
  font-size: 14px;
  color: var(--text-color);
  margin-bottom: 6px;
`;

const InputContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const StyledInput = styled.input<{ hasError?: boolean; hasLeftIcon?: boolean; hasRightIcon?: boolean }>`
  width: 100%;
  padding: 10px 12px;
  border-radius: var(--border-radius);
  border: 1px solid var(--border-color);
  font-size: 16px;
  transition: var(--transition);
  font-family: inherit;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(46, 90, 136, 0.2);
  }
  
  &:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }
  
  ${({ hasError }) => hasError && `
    border-color: var(--danger-color);
    
    &:focus {
      box-shadow: 0 0 0 2px rgba(220, 53, 69, 0.2);
    }
  `}
  
  ${({ hasLeftIcon }) => hasLeftIcon && `
    padding-left: 40px;
  `}
  
  ${({ hasRightIcon }) => hasRightIcon && `
    padding-right: 40px;
  `}
`;

const StyledTextarea = styled.textarea<{ hasError?: boolean; hasLeftIcon?: boolean; hasRightIcon?: boolean }>`
  width: 100%;
  padding: 10px 12px;
  border-radius: var(--border-radius);
  border: 1px solid var(--border-color);
  font-size: 16px;
  transition: var(--transition);
  font-family: inherit;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(46, 90, 136, 0.2);
  }
  
  &:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }
  
  ${({ hasError }) => hasError && `
    border-color: var(--danger-color);
    
    &:focus {
      box-shadow: 0 0 0 2px rgba(220, 53, 69, 0.2);
    }
  `}
  
  ${({ hasLeftIcon }) => hasLeftIcon && `
    padding-left: 40px;
  `}
  
  ${({ hasRightIcon }) => hasRightIcon && `
    padding-right: 40px;
  `}
  
  resize: vertical;
  min-height: 100px;
`;

const IconWrapper = styled.div<{ position: 'left' | 'right' }>`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  ${({ position }) => (position === 'left' ? 'left: 12px;' : 'right: 12px;')}
  display: flex;
  align-items: center;
  color: var(--light-text-color);
`;

const HelperText = styled.span<{ hasError?: boolean }>`
  font-size: 12px;
  margin-top: 4px;
  color: ${({ hasError }) => (hasError ? 'var(--danger-color)' : 'var(--light-text-color)')};
`;

const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement, InputProps>(
  ({ label, helperText, error, fullWidth, leftIcon, rightIcon, as = 'input', ...rest }, ref) => {
    const hasError = !!error;
    const hasLeftIcon = !!leftIcon;
    const hasRightIcon = !!rightIcon;
    
    return (
      <InputWrapper fullWidth={fullWidth}>
        {label && <Label>{label}</Label>}
        <InputContainer>
          {leftIcon && <IconWrapper position="left">{leftIcon}</IconWrapper>}
          {
            as === 'textarea' ? (
              <StyledTextarea
                hasError={hasError}
                hasLeftIcon={hasLeftIcon}
                hasRightIcon={hasRightIcon}
                ref={ref as React.ForwardedRef<HTMLTextAreaElement>}
                {...rest as React.TextareaHTMLAttributes<HTMLTextAreaElement>}
              />
            ) : (
              <StyledInput
                hasError={hasError}
                hasLeftIcon={hasLeftIcon}
                hasRightIcon={hasRightIcon}
                ref={ref as React.ForwardedRef<HTMLInputElement>}
                {...rest as React.InputHTMLAttributes<HTMLInputElement>}
              />
            )
          }
          {rightIcon && <IconWrapper position="right">{rightIcon}</IconWrapper>}
        </InputContainer>
        {(helperText || error) && (
          <HelperText hasError={!!error}>{error || helperText}</HelperText>
        )}
      </InputWrapper>
    );
  }
);

Input.displayName = 'Input';

export default Input;
