import React from 'react';
import styled from 'styled-components';
import Modal from './Modal';
import Button from './Button';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

const MessageContainer = styled.div`
  font-size: 1rem;
  line-height: 1.5;
`;

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger'
}) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const footer = (
    <>
      <Button 
        variant="text" 
        onClick={onClose}
      >
        {cancelText}
      </Button>
      <Button 
        variant={variant} 
        onClick={handleConfirm}
      >
        {confirmText}
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={footer}
    >
      <MessageContainer>{message}</MessageContainer>
    </Modal>
  );
};

export default ConfirmDialog;
