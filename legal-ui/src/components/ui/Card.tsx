interface CardProps { children: React.ReactNode; style?: React.CSSProperties; }
export function Card({ children, style }: CardProps) {
  return (
    <div style={{ background: 'white', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', ...style }}>
      {children}
    </div>
  );
}
