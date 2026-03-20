interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
}

const isOffline = (msg: string) =>
  msg.includes('502') || msg.includes('503') || msg.includes('504') ||
  msg.includes('accesibil') || msg.includes('raspunde') || msg.includes('portul 5000');

export function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
  const offline = isOffline(message);
  const bg     = offline ? '#fff8e1' : '#ffebee';
  const border = offline ? '#ffe082' : '#ef9a9a';
  const color  = offline ? '#795548' : '#c62828';

  return (
    <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: '8px',
      padding: '0.875rem 1rem', margin: '1rem 1.5rem', color,
      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        <span style={{ fontWeight: 700 }}>{offline ? 'Server offline' : 'Eroare'}</span>
        <span style={{ fontSize: '0.88rem' }}>{message}</span>
        {offline && (
          <code style={{ fontSize: '0.78rem', background: '#fff3cd', padding: '0.2rem 0.5rem',
            borderRadius: '4px', color: '#5d4037', marginTop: '0.15rem', fontFamily: 'monospace' }}>
            cd legal &amp;&amp; dotnet run --launch-profile http
          </code>
        )}
      </div>
      {onRetry && (
        <button onClick={onRetry} style={{ flexShrink: 0, background: 'none', border: 'none',
          color, cursor: 'pointer', fontWeight: 700, textDecoration: 'underline', whiteSpace: 'nowrap' }}>
          Reincearca
        </button>
      )}
    </div>
  );
}