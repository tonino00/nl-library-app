import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
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
  background-color: var(--surface-color);
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

const ModalTitle = styled.h2`
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
  padding: 4px;
  border-radius: var(--border-radius);
  transition: var(--transition);

  &:hover {
    color: var(--text-color);
    background-color: var(--hover-bg);
  }

  &:focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
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
  const containerRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<Element | null>(null);
  const titleId = React.useId();

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

  // Save previously focused element and focus first focusable element when opened
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement;
      const focusable = containerRef.current?.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      focusable?.focus();
    }
  }, [isOpen]);

  // Return focus when closed
  useEffect(() => {
    if (!isOpen && previousActiveElement.current instanceof HTMLElement) {
      previousActiveElement.current.focus();
    }
  }, [isOpen]);

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  // Focus trap
  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    const modal = containerRef.current;
    const focusableElements = modal.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusableElements[0];
    const last = focusableElements[focusableElements.length - 1];

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || focusableElements.length === 0) return;

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };

    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
  }, [isOpen, children, footer]);

  if (!isOpen || !modalRoot) return null;

  const modal = (
    <ModalOverlay onClick={onClose}>
      <ModalContainer
        ref={containerRef}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <ModalHeader>
          <ModalTitle id={titleId}>{title}</ModalTitle>
          <CloseButton onClick={onClose} aria-label="Fechar">&times;</CloseButton>
        </ModalHeader>
        <ModalBody>{children}</ModalBody>
        {footer && <ModalFooter>{footer}</ModalFooter>}
      </ModalContainer>
    </ModalOverlay>
  );

  return createPortal(modal, modalRoot);
};

export default Modal;
