import React from 'react';
import styled, { keyframes } from 'styled-components';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  showLogo?: boolean;
  message?: string;
}

const SIZES: Record<NonNullable<LoadingSpinnerProps['size']>, { ring: number; border: number; logo: number }> = {
  small: { ring: 36, border: 4, logo: 26 },
  medium: { ring: 64, border: 5, logo: 48 },
  large: { ring: 96, border: 6, logo: 72 },
};

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const softPulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.45; }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  animation: ${fadeIn} 0.3s ease-out;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const SpinnerContainer = styled.div<{ $size: number }>`
  position: relative;
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
`;

// Trilha estática de fundo + um arco colorido girando por cima: o padrão
// consolidado de spinner de produto, mais legível que dois arcos cruzados.
const Track = styled.div<{ $size: number; $border: number }>`
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: ${({ $border }) => $border}px solid var(--border-color);
`;

const Arc = styled.div<{ $border: number }>`
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: ${({ $border }) => $border}px solid transparent;
  border-top-color: var(--primary-color);
  animation: ${spin} 0.8s cubic-bezier(0.4, 0, 0.2, 1) infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: ${softPulse} 1.6s ease-in-out infinite;
    border-top-color: transparent;
    border-color: var(--primary-color);
  }
`;

const Logo = styled.img<{ $size: number }>`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  object-fit: contain;
`;

const Message = styled.p`
  color: var(--text-color);
  font-size: 0.95rem;
  font-weight: 500;
  text-align: center;
`;

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  showLogo = true,
  message = 'Carregando...',
}) => {
  const { ring, border, logo } = SIZES[size];

  return (
    <Container role="status" aria-live="polite" aria-atomic="true">
      <SpinnerContainer $size={ring}>
        <Track $size={ring} $border={border} />
        <Arc $border={border} />
        {showLogo && <Logo src="/nlicon.png" alt="" $size={logo} />}
      </SpinnerContainer>
      {message && <Message>{message}</Message>}
    </Container>
  );
};

export default LoadingSpinner;
