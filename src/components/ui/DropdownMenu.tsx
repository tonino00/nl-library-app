import React, { useCallback, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { createPortal } from 'react-dom';
import { FiMoreVertical } from 'react-icons/fi';

export interface DropdownMenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'danger';
  disabled?: boolean;
}

interface DropdownMenuProps {
  items: DropdownMenuItem[];
  triggerLabel?: string;
}

const TriggerButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  padding: 0;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  background-color: var(--surface-color);
  color: var(--text-color);
  cursor: pointer;
  transition: var(--transition);

  &:hover {
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

const MenuList = styled.ul<{ $top: number; $left: number }>`
  position: fixed;
  top: ${({ $top }) => $top}px;
  left: ${({ $left }) => $left}px;
  min-width: 160px;
  margin: 0;
  padding: 6px;
  list-style: none;
  background-color: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  /* Camada de dropdown: acima do header/sidebar (100/90), abaixo de modais (1000). */
  z-index: 500;
`;

const MenuItemButton = styled.button<{ $danger?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  min-height: 40px;
  padding: 8px 12px;
  border: none;
  border-radius: calc(var(--border-radius) - 2px);
  background: none;
  color: ${({ $danger }) => ($danger ? 'var(--danger-color)' : 'var(--text-color)')};
  font-size: 0.9rem;
  text-align: left;
  cursor: pointer;
  transition: var(--transition);

  &:hover:not(:disabled) {
    background-color: ${({ $danger }) => ($danger ? 'var(--status-danger-bg)' : 'var(--hover-bg)')};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: -2px;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const DropdownMenu: React.FC<DropdownMenuProps> = ({ items, triggerLabel = 'Mais ações' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);

  const close = useCallback(() => setIsOpen(false), []);

  const openMenu = () => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (rect) {
      // Alinha a borda direita do menu com a borda direita do gatilho,
      // com o menu para cima se não houver espaço embaixo.
      const menuHeight = items.length * 40 + 12;
      const spaceBelow = window.innerHeight - rect.bottom;
      const top = spaceBelow >= menuHeight + 8 ? rect.bottom + 4 : rect.top - menuHeight - 4;

      setPosition({
        top,
        left: Math.max(8, rect.right - 180),
      });
    }
    setIsOpen(true);
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }
      close();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        close();
        triggerRef.current?.focus();
      }
    };

    const handleScrollOrResize = () => close();

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isOpen, close]);

  return (
    <>
      <TriggerButton
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={triggerLabel}
        onClick={() => (isOpen ? close() : openMenu())}
      >
        <FiMoreVertical size={18} />
      </TriggerButton>

      {isOpen &&
        createPortal(
          <MenuList ref={menuRef} role="menu" $top={position.top} $left={position.left}>
            {items.map((item, index) => (
              <li key={index} role="none">
                <MenuItemButton
                  role="menuitem"
                  type="button"
                  $danger={item.variant === 'danger'}
                  disabled={item.disabled}
                  onClick={() => {
                    close();
                    item.onClick();
                  }}
                >
                  {item.icon}
                  {item.label}
                </MenuItemButton>
              </li>
            ))}
          </MenuList>,
          document.body
        )}
    </>
  );
};

export default DropdownMenu;
