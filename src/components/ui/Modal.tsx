import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import Button from './Button';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
`;

const ModalContainer = styled.div`
  background-color: var(--card-bg, #ffffff);
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  width: 100%;
  max-width: 500px;
  padding: 0;
  animation: slideIn 0.2s ease-out;
  opacity: 1;
  
  @keyframes slideIn {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

const ModalHeader = styled.div`
  padding: 16px 24px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ModalTitle = styled.h3`
  margin: 0;
  color: var(--text-color);
  font-size: 1.25rem;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 1.5rem;
  color: var(--light-text-color);
  padding: 0;
  
  &:hover {
    color: var(--text-color);
  }
`;

const ModalBody = styled.div`
  padding: 24px;
  color: var(--text-color);
`;

const ModalFooter = styled.div`
  padding: 16px 24px;
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer }) => {
  const [modalRoot, setModalRoot] = useState<HTMLElement | null>(null);
  
  useEffect(() => {
    // Find or create modal root element
    let element = document.getElementById('modal-root');
    if (!element) {
      element = document.createElement('div');
      element.id = 'modal-root';
      document.body.appendChild(element);
    }
    setModalRoot(element);
    
    // Prevent scrolling of body when modal is open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    
    // Cleanup
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  
  if (!isOpen || !modalRoot) return null;
  
  const modal = (
    <ModalOverlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>{title}</ModalTitle>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </ModalHeader>
        <ModalBody>{children}</ModalBody>
        {footer && <ModalFooter>{footer}</ModalFooter>}
      </ModalContainer>
    </ModalOverlay>
  );
  
  return createPortal(modal, modalRoot);
};

export default Modal;
