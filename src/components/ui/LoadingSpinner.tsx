import React from 'react';
import styled, { keyframes } from 'styled-components';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  showLogo?: boolean;
  message?: string;
}

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const pulse = keyframes`
  0% { transform: scale(0.95); }
  50% { transform: scale(1.05); }
  100% { transform: scale(0.95); }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  animation: ${fadeIn} 0.5s ease-in-out;
`;

const SpinnerContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SpinnerRing = styled.div<{ size: string }>`
  display: inline-block;
  width: ${({ size }) => 
    size === 'small' ? '30px' : 
    size === 'large' ? '80px' : '50px'};
  height: ${({ size }) => 
    size === 'small' ? '30px' : 
    size === 'large' ? '80px' : '50px'};
  
  &:after {
    content: "";
    display: block;
    width: ${({ size }) => 
      size === 'small' ? '24px' : 
      size === 'large' ? '64px' : '40px'};
    height: ${({ size }) => 
      size === 'small' ? '24px' : 
      size === 'large' ? '64px' : '40px'};
    margin: 8px;
    border-radius: 50%;
    border: 3px solid var(--primary-color);
    border-color: var(--primary-color) transparent var(--primary-color) transparent;
    animation: ${spin} 1.2s linear infinite;
  }
`;

const Logo = styled.img<{ size: string }>`
  position: absolute;
  width: ${({ size }) => 
    size === 'small' ? '16px' : 
    size === 'large' ? '40px' : '25px'};
  height: ${({ size }) => 
    size === 'small' ? '16px' : 
    size === 'large' ? '40px' : '25px'};
  object-fit: contain;
  animation: ${pulse} 2s ease-in-out infinite;
`;

const Message = styled.p`
  margin-top: 16px;
  color: var(--text-color);
  font-size: 16px;
  font-weight: 500;
  text-align: center;
`;

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  showLogo = true,
  message = 'Carregando...'
}) => {
  return (
    <Container>
      <SpinnerContainer>
        <SpinnerRing size={size} />
        {showLogo && (
          <Logo 
            src="/nlicon.png" 
            alt="Logo da aplicação" 
            size={size}
          />
        )}
      </SpinnerContainer>
      {message && <Message>{message}</Message>}
    </Container>
  );
};

export default LoadingSpinner;
