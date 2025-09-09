import React from 'react';
import styled, { css } from 'styled-components';
import { Link } from 'react-router-dom';

type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'outline' | 'text';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  as?: any;
  to?: string;
}

const getButtonStyles = (variant: ButtonVariant) => {
  switch (variant) {
    case 'primary':
      return css`
        background-color: var(--primary-color);
        color: white;
        &:hover:not(:disabled) {
          background-color: var(--secondary-color);
        }
      `;
    case 'secondary':
      return css`
        background-color: var(--secondary-color);
        color: white;
        &:hover:not(:disabled) {
          background-color: #4a7ca9;
        }
      `;
    case 'success':
      return css`
        background-color: var(--success-color);
        color: white;
        &:hover:not(:disabled) {
          background-color: #218838;
        }
      `;
    case 'danger':
      return css`
        background-color: var(--danger-color);
        color: white;
        &:hover:not(:disabled) {
          background-color: #c82333;
        }
      `;
    case 'warning':
      return css`
        background-color: var(--warning-color);
        color: var(--text-color);
        &:hover:not(:disabled) {
          background-color: #e0a800;
        }
      `;
    case 'info':
      return css`
        background-color: var(--info-color);
        color: white;
        &:hover:not(:disabled) {
          background-color: #138496;
        }
      `;
    case 'outline':
      return css`
        background-color: transparent;
        color: var(--primary-color);
        border: 1px solid var(--primary-color);
        &:hover:not(:disabled) {
          background-color: var(--primary-color);
          color: white;
        }
      `;
    case 'text':
      return css`
        background-color: transparent;
        color: var(--primary-color);
        border: none;
        padding: 0;
        &:hover:not(:disabled) {
          text-decoration: underline;
        }
      `;
    default:
      return css`
        background-color: var(--primary-color);
        color: white;
        &:hover:not(:disabled) {
          background-color: var(--secondary-color);
        }
      `;
  }
};

const getButtonSize = (size: ButtonSize) => {
  switch (size) {
    case 'small':
      return css`
        padding: 6px 12px;
        font-size: 0.875rem;
      `;
    case 'large':
      return css`
        padding: 12px 24px;
        font-size: 1.125rem;
      `;
    case 'medium':
    default:
      return css`
        padding: 8px 16px;
        font-size: 1rem;
      `;
  }
};

const StyledButton = styled.button<ButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--border-radius);
  font-weight: 500;
  border: none;
  transition: var(--transition);
  cursor: pointer;
  
  ${({ variant = 'primary' }) => getButtonStyles(variant)};
  ${({ size = 'medium' }) => getButtonSize(size)};
  
  ${({ fullWidth }) => fullWidth && css`
    width: 100%;
  `}
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
  
  svg {
    vertical-align: middle;
  }
`;

const IconWrapper = styled.span<{ position: 'left' | 'right' }>`
  display: inline-flex;
  align-items: center;
  margin-left: ${({ position }) => position === 'right' ? '8px' : '0'};
  margin-right: ${({ position }) => position === 'left' ? '8px' : '0'};
`;

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'medium', 
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  as,
  ...rest 
}) => {
  const Component = as || 'button';

  return (
    <StyledButton
      as={Component}
      variant={variant}
      size={size}
      disabled={disabled || isLoading}
      {...rest}
    >
      {isLoading ? (
        'Carregando...'
      ) : (
        <>
          {leftIcon && <IconWrapper position="left">{leftIcon}</IconWrapper>}
          {children}
          {rightIcon && <IconWrapper position="right">{rightIcon}</IconWrapper>}
        </>
      )}
    </StyledButton>
  );
};

export default Button;
