import React, { forwardRef, useState } from 'react';
import styled from 'styled-components';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import Input, { InputProps } from './Input';

type PasswordInputProps = Omit<InputProps, 'type' | 'rightIcon' | 'as'>;

const ToggleButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  border-radius: var(--border-radius);
  background: none;
  color: var(--light-text-color);
  cursor: pointer;
  transition: var(--transition);

  &:hover {
    color: var(--text-color);
  }

  &:focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

// Input de senha com botão de mostrar/ocultar o valor digitado.
const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  (props, ref) => {
    const [visible, setVisible] = useState(false);

    return (
      <Input
        {...props}
        ref={ref}
        type={visible ? 'text' : 'password'}
        rightIcon={
          <ToggleButton
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
            aria-pressed={visible}
          >
            {visible ? <FiEyeOff size={18} /> : <FiEye size={18} />}
          </ToggleButton>
        }
      />
    );
  }
);

PasswordInput.displayName = 'PasswordInput';

export default PasswordInput;
