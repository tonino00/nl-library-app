import React from 'react';
import styled from 'styled-components';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  padding?: string;
  className?: string;
}

const CardContainer = styled.div<{ padding?: string }>`
  background: white;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  overflow: hidden;
  width: 100%;
  margin-bottom: 1rem;
`;

const CardHeader = styled.div`
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const TitleContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const CardTitle = styled.h3`
  margin: 0;
  font-size: 1.25rem;
  color: var(--text-color);
`;

const CardSubtitle = styled.p`
  margin: 4px 0 0 0;
  font-size: 0.875rem;
  color: var(--light-text-color);
`;

const CardBody = styled.div<{ padding?: string }>`
  padding: ${({ padding }) => padding || '16px'};
`;

const CardFooter = styled.div`
  padding: 16px;
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`;

const Card: React.FC<CardProps> = ({ 
  children, 
  title, 
  subtitle,
  actions,
  padding,
  className
}) => {
  const hasHeader = title || subtitle || actions;
  const hasFooter = typeof children === 'object' && children && 'footer' in children;
  
  let content = children;
  let footer;

  if (hasFooter && children && typeof children === 'object' && 'footer' in children) {
    const { footer: footerContent, ...restChildren } = children as any;
    content = restChildren.children;
    footer = footerContent;
  }

  return (
    <CardContainer className={className}>
      {hasHeader && (
        <CardHeader>
          {(title || subtitle) && (
            <TitleContainer>
              {title && <CardTitle>{title}</CardTitle>}
              {subtitle && <CardSubtitle>{subtitle}</CardSubtitle>}
            </TitleContainer>
          )}
          {actions && <div>{actions}</div>}
        </CardHeader>
      )}
      <CardBody padding={padding}>{content}</CardBody>
      {footer && <CardFooter>{footer}</CardFooter>}
    </CardContainer>
  );
};

export default Card;
