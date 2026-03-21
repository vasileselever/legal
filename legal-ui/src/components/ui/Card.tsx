import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  style?: React.CSSProperties;
}
export function Card({ children, style, ...rest }: CardProps) {
  return (
    <div {...rest} style={{ background: 'white', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', ...style }}>
      {children}
    </div>
  );
}
