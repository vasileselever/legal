import { useState } from 'react';
import { AdminLayout } from './AdminLayout';

export default function MarketingEmailPreviewPage() {
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');

  const iframeWidth = device === 'mobile' ? 390 : '100%';

  const btn = (active: boolean): React.CSSProperties => ({
    padding: '0.4rem 1rem',
    border: '1px solid #1a237e',
    borderRadius: '6px',
    background: active ? '#1a237e' : 'white',
    color: active ? 'white' : '#1a237e',
    fontWeight: 600,
    fontSize: '0.82rem',
    cursor: 'pointer',
  });

  return (
    <AdminLayout>
      <div style={{ padding: '1.25rem 1.5rem', height: '100%', display: 'flex', flexDirection: 'column' }}>

        {/* Header bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.3rem', color: '#1a237e' }}>
              ?? Previzualizare Email Marketing
            </h1>
            <p style={{ margin: '0.2rem 0 0', color: '#888', fontSize: '0.83rem' }}>
              Email promotional pentru clienti potentiali � <code>marketing-email.html</code>
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {/* Device toggle */}
            <button style={btn(device === 'desktop')} onClick={() => setDevice('desktop')}>
              {String.fromCodePoint(0x1F5A5)} Desktop
            </button>
            <button style={btn(device === 'mobile')} onClick={() => setDevice('mobile')}>
              {String.fromCodePoint(0x1F4F1)} Mobile
            </button>

            {/* Open in new tab */}
            <a
              href="/marketing-email.html"
              target="_blank"
              rel="noopener noreferrer"
              style={{ ...btn(false), textDecoration: 'none', display: 'inline-block' }}
            >
              {String.fromCodePoint(0x2197)} Deschide tab nou
            </a>
          </div>
        </div>

        {/* Preview frame */}
        <div style={{ flex: 1, background: '#e8eaf6', borderRadius: '10px',
                      display: 'flex', justifyContent: 'center', alignItems: 'flex-start',
                      padding: '1.5rem', overflowY: 'auto', minHeight: 0 }}>
          <div style={{
            width: iframeWidth,
            transition: 'width 0.3s ease',
            boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
            borderRadius: '8px',
            overflow: 'hidden',
            background: 'white',
          }}>
            <iframe
              src="/marketing-email.html"
              title="Marketing Email Preview"
              style={{
                width: '100%',
                height: '900px',
                border: 'none',
                display: 'block',
              }}
            />
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}
