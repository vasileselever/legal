export function Spinner({ size }: { size?: number } = {}) {
  if (size) {
    return (
      <span style={{ display: 'inline-block', width: size, height: size, border: '2px solid #ccc', borderTopColor: '#1a237e', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
    );
  }
  return <div style={{ padding: '3rem', textAlign: 'center', color: '#888' }}>? Se incarca...</div>;
}
