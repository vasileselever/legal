interface PageHeaderProps { title: string; subtitle?: string; action?: React.ReactNode; }
export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div style={{ padding: '1.5rem 1.5rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <h1 style={{ margin: 0, fontSize: '1.4rem', color: '#1a237e', fontWeight: 700 }}>{title}</h1>
        {subtitle && <p style={{ margin: '0.25rem 0 0', color: '#888', fontSize: '0.88rem' }}>{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
