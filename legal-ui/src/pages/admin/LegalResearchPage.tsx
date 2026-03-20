import { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from './AdminLayout';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { ErrorBanner } from '../../components/ui/ErrorBanner';
import { Badge } from '../../components/ui/Badge';
import {
  legalResearchService,
  type LegalResearchResult,
  type LegalResearchHistoryItem,
  type LegalSource,
} from '../../api/legalResearchService';

// ── Constants ──────────────────────────────────────────────────────────────────

const PRACTICE_AREAS: Record<number, string> = {
  1: 'Drept Civil', 2: 'Drept Comercial', 3: 'Drept Penal',
  4: 'Dreptul Familiei', 5: 'Drept Imobiliar', 6: 'Dreptul Muncii',
  7: 'Drept Corporativ', 8: 'Drept Administrativ', 9: 'Altul',
};

const SOURCE_TYPE_COLORS: Record<string, string> = {
  Lege: '#1976d2', Hotarare: '#7b1fa2',
  Jurisprudenta: '#2e7d32', Doctrina: '#f57c00',
};

const SUGGESTIONS = [
  'Care sunt conditiile pentru concedierea unui angajat?',
  'Cum se calculeaza termenul de prescriptie in materie civila?',
  'Care este procedura de divort prin acordul partilor?',
  'Ce drepturi are un inculpat in procesul penal?',
  'Care sunt conditiile de validitate ale unui contract?',
  'Cum se contesta o decizie de concediere?',
];

// ── Sub-components ─────────────────────────────────────────────────────────────

function ConfidenceBadge({ score }: { score: number }) {
  const color = score >= 80 ? '#2e7d32' : score >= 60 ? '#f57c00' : '#c62828';
  const label = score >= 80 ? 'Ridicata' : score >= 60 ? 'Medie' : 'Scazuta';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
      background: color + '18', color, border: `1px solid ${color}40`,
      borderRadius: '12px', padding: '0.15rem 0.6rem', fontSize: '0.75rem', fontWeight: 700,
    }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: color, display: 'inline-block' }} />
      {score}% &middot; {label}
    </span>
  );
}

function MarkdownAnswer({ text }: { text: string }) {
  const html = text
    .replace(/^### (.+)$/gm, '<h3 style="margin:1.1rem 0 0.4rem;color:#1a237e;font-size:0.95rem">$1</h3>')
    .replace(/^## (.+)$/gm,  '<h2 style="margin:1.25rem 0 0.5rem;color:#1a237e;font-size:1.05rem">$1</h2>')
    .replace(/^---$/gm, '<hr style="border:none;border-top:1px solid #e0e0e0;margin:1rem 0"/>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`(.+?)`/g, '<code style="background:#f0f4ff;padding:0.1rem 0.35rem;border-radius:3px;font-size:0.88rem">$1</code>')
    .replace(/^> (.+)$/gm, '<blockquote style="border-left:3px solid #1976d2;margin:0.75rem 0;padding:0.5rem 1rem;background:#f0f4ff;border-radius:0 6px 6px 0;color:#555;font-style:italic">$1</blockquote>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener" style="color:#1976d2">$1</a>')
    .replace(/^(\d+\.) (.+)$/gm, '<li style="margin-bottom:0.25rem">$2</li>')
    .replace(/^[-*] (.+)$/gm, '<li style="margin-bottom:0.2rem">$1</li>')
    .replace(/(<li[^>]*>.*?<\/li>\n?)+/gs, m => `<ul style="padding-left:1.4rem;margin:0.5rem 0">${m}</ul>`)
    .split('\n').map(l => l.startsWith('<') ? l : `<p style="margin:0.3rem 0;line-height:1.65">${l}</p>`).join('\n');
  return <div style={{ fontSize: '0.9rem', color: '#333', lineHeight: 1.65 }} dangerouslySetInnerHTML={{ __html: html }} />;
}

function SourceCard({ source }: { source: LegalSource }) {
  const color = SOURCE_TYPE_COLORS[source.type] ?? '#607d8b';
  return (
    <div style={{ border: '1px solid #e8eaf6', borderRadius: '8px', padding: '0.75rem 1rem', background: 'white', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, background: color + '18', color, border: `1px solid ${color}30`, borderRadius: '8px', padding: '0.1rem 0.5rem' }}>
            {source.type}
          </span>
          <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#1a237e', marginTop: '0.35rem' }}>{source.title}</div>
          {source.reference && <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.15rem' }}>{source.reference}</div>}
        </div>
        <div style={{ fontSize: '0.72rem', color: '#888', whiteSpace: 'nowrap', flexShrink: 0, textAlign: 'right' }}>
          <div>Relevanta {source.relevance}%</div>
          <div style={{ height: 4, background: '#f0f0f0', borderRadius: 2, marginTop: 3, width: 64 }}>
            <div style={{ height: '100%', width: source.relevance + '%', background: color, borderRadius: 2 }} />
          </div>
        </div>
      </div>
      {source.excerpt && (
        <div style={{ fontSize: '0.8rem', color: '#555', fontStyle: 'italic', borderLeft: `2px solid ${color}50`, paddingLeft: '0.6rem' }}>
          &ldquo;{source.excerpt}&rdquo;
        </div>
      )}
      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.1rem', alignItems: 'center' }}>
        {source.publishedDate && <span style={{ fontSize: '0.72rem', color: '#999' }}>{source.publishedDate}</span>}
        {source.url && (
          <a href={source.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.72rem', color: '#1976d2', textDecoration: 'none' }}>
            Sursa originala &rarr;
          </a>
        )}
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export function LegalResearchPage() {
  const [query, setQuery]               = useState('');
  const [practiceArea, setPracticeArea] = useState<number | undefined>();
  const [searching, setSearching]       = useState(false);
  const [result, setResult]             = useState<LegalResearchResult | null>(null);
  const [error, setError]               = useState('');

  const [history, setHistory]               = useState<LegalResearchHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [bookmarkedOnly, setBookmarkedOnly] = useState(false);
  const [activeTab, setActiveTab]           = useState<'search' | 'history'>('search');

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    try { setHistory(await legalResearchService.getHistory(bookmarkedOnly)); }
    catch { /* silent */ }
    finally { setHistoryLoading(false); }
  }, [bookmarkedOnly]);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  const handleSearch = async (q = query) => {
    const trimmed = q.trim();
    if (!trimmed || trimmed.length < 10) { setError('Intrebarea trebuie sa aiba cel putin 10 caractere.'); return; }
    setSearching(true); setError(''); setResult(null); setActiveTab('search');
    try {
      const res = await legalResearchService.search({ query: trimmed, practiceArea });
      setResult(res);
      loadHistory();
    } catch (e: any) {
      setError(e.message ?? 'Eroare la cercetare');
    } finally { setSearching(false); }
  };

  const handleBookmark = async (id: string, current: boolean) => {
    await legalResearchService.toggleBookmark(id, !current);
    if (result?.id === id) setResult(r => r ? { ...r, isBookmarked: !current } : r);
    loadHistory();
  };

  const handleHistoryClick = async (item: LegalResearchHistoryItem) => {
    setActiveTab('search');
    try { const full = await legalResearchService.getById(item.id); setResult(full); setQuery(full.query); }
    catch { /* silent */ }
  };

  const handleDelete = async (id: string) => {
    await legalResearchService.delete(id);
    if (result?.id === id) setResult(null);
    loadHistory();
  };

  const tab = (active: boolean): React.CSSProperties => ({
    padding: '0.5rem 1.25rem', border: 'none', cursor: 'pointer',
    fontWeight: active ? 700 : 400,
    borderBottom: active ? '2px solid #1a237e' : '2px solid transparent',
    background: 'none', color: active ? '#1a237e' : '#888',
    fontSize: '0.88rem', transition: 'all 0.15s',
  });

  return (
    <AdminLayout>
      <PageHeader
        title="Cercetare Juridica AI"
        subtitle="Asistent AI specializat pe legislatia romana"
        action={
          <span style={{ fontWeight: 700, color: '#1a237e', fontSize: '0.82rem', background: '#e8eaf6', padding: '0.25rem 0.75rem', borderRadius: '8px' }}>
            LegalRO AI
          </span>
        }
      />

      {/* Disclaimer */}
      <div style={{ margin: '0.75rem 1.5rem 0', padding: '0.6rem 1rem', background: '#fff8e1', border: '1px solid #ffe082', borderRadius: '8px', fontSize: '0.78rem', color: '#795548', display: 'flex', gap: '0.5rem' }}>
        <strong>Avertisment:</strong>
        <span>Raspunsurile AI sunt orientative si nu constituie consultanta juridica. Verificati intotdeauna textul legal oficial.</span>
      </div>

      <div style={{ padding: '1rem 1.5rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

        {/* Search box */}
        <Card>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f0f0f0' }}>
            <h3 style={{ margin: 0, fontSize: '0.92rem', color: '#1a237e', fontWeight: 700 }}>Intrebare juridica</h3>
          </div>
          <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <textarea
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSearch(); }}
              placeholder={'Ex: Care sunt conditiile pentru concedierea unui angajat?\n\nApasati Ctrl+Enter pentru a cauta'}
              rows={3}
              style={{ width: '100%', padding: '0.875rem', border: '1.5px solid #e0e0e0', borderRadius: '8px', fontSize: '0.9rem', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit', lineHeight: 1.5 }}
            />

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <select
                value={practiceArea ?? ''}
                onChange={e => setPracticeArea(e.target.value ? Number(e.target.value) : undefined)}
                style={{ padding: '0.55rem 0.75rem', border: '1px solid #ddd', borderRadius: '7px', fontSize: '0.85rem' }}
              >
                <option value="">Toate domeniile</option>
                {Object.entries(PRACTICE_AREAS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>

              <button
                onClick={() => handleSearch()}
                disabled={searching || !query.trim()}
                style={{ padding: '0.6rem 1.5rem', background: searching || !query.trim() ? '#9fa8da' : '#1a237e', color: 'white', border: 'none', borderRadius: '7px', fontWeight: 700, fontSize: '0.88rem', cursor: searching || !query.trim() ? 'not-allowed' : 'pointer' }}
              >
                {searching ? 'Se analizeaza...' : 'Cerceteaza'}
              </button>

              <span style={{ fontSize: '0.75rem', color: '#aaa' }}>Ctrl+Enter</span>

              {query.trim().length > 0 && (
                <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: query.trim().length < 10 ? '#c62828' : '#888' }}>
                  {query.trim().length} / 2000
                </span>
              )}
            </div>

            {/* Suggestions */}
            {!result && !searching && (
              <div>
                <div style={{ fontSize: '0.73rem', color: '#999', marginBottom: '0.5rem', fontWeight: 700, letterSpacing: '0.05em' }}>INTREBARI FRECVENTE</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {SUGGESTIONS.map(s => (
                    <button key={s} onClick={() => { setQuery(s); handleSearch(s); }}
                      style={{ padding: '0.3rem 0.75rem', border: '1px solid #c5cae9', borderRadius: '14px', background: '#f8f9ff', color: '#3949ab', fontSize: '0.78rem', cursor: 'pointer' }}>
                      {s.length > 55 ? s.slice(0, 52) + '...' : s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>

        {error && <ErrorBanner message={error} onRetry={() => setError('')} />}

        {/* Tabs */}
        <div>
          <div style={{ display: 'flex', borderBottom: '1px solid #e0e0e0', marginBottom: '1rem' }}>
            <button style={tab(activeTab === 'search')} onClick={() => setActiveTab('search')}>Rezultat</button>
            <button style={tab(activeTab === 'history')} onClick={() => setActiveTab('history')}>
              Istoric ({history.length})
            </button>
            {activeTab === 'history' && (
              <label style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#555', cursor: 'pointer', paddingRight: '0.5rem' }}>
                <input type="checkbox" checked={bookmarkedOnly} onChange={e => setBookmarkedOnly(e.target.checked)} />
                Doar salvate
              </label>
            )}
          </div>

          {/* Result tab */}
          {activeTab === 'search' && (
            <>
              {searching && (
                <Card>
                  <div style={{ padding: '3rem', textAlign: 'center' }}>
                    <Spinner />
                    <div style={{ color: '#666', fontWeight: 600, marginTop: '0.5rem' }}>Analizez legislatia romana...</div>
                    <div style={{ color: '#aaa', fontSize: '0.82rem', marginTop: '0.4rem' }}>Procesare AI in curs</div>
                  </div>
                </Card>
              )}

              {!searching && result && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <Card>
                    {/* Result header */}
                    <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <ConfidenceBadge score={result.confidenceScore} />
                        {result.practiceArea && <Badge label={PRACTICE_AREAS[result.practiceArea] ?? 'General'} color="#1a237e" />}
                        <span style={{ fontSize: '0.72rem', color: '#bbb' }}>
                          {result.sources.length} surse &middot; {result.processingMs}ms &middot; {result.modelUsed}
                        </span>
                      </div>
                      <button
                        onClick={() => handleBookmark(result.id, result.isBookmarked)}
                        style={{ padding: '0.35rem 0.8rem', border: `1px solid ${result.isBookmarked ? '#f57c00' : '#ddd'}`, borderRadius: '6px', background: result.isBookmarked ? '#fff3e0' : 'white', cursor: 'pointer', fontSize: '0.82rem', color: result.isBookmarked ? '#f57c00' : '#888' }}
                      >
                        {result.isBookmarked ? '★ Salvat' : '☆ Salveaza'}
                      </button>
                    </div>

                    {/* Query echo */}
                    <div style={{ padding: '0.75rem 1.25rem', background: '#f8f9ff', borderBottom: '1px solid #f0f0f0' }}>
                      <div style={{ fontSize: '0.72rem', color: '#888', fontWeight: 700, marginBottom: '0.2rem' }}>INTREBARE</div>
                      <div style={{ fontSize: '0.88rem', color: '#333', fontStyle: 'italic' }}>&ldquo;{result.query}&rdquo;</div>
                    </div>

                    {/* Answer */}
                    <div style={{ padding: '1.25rem 1.5rem' }}>
                      <MarkdownAnswer text={result.answer} />
                    </div>
                  </Card>

                  {/* Sources */}
                  {result.sources.length > 0 && (
                    <Card>
                      <div style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid #f0f0f0' }}>
                        <h3 style={{ margin: 0, fontSize: '0.88rem', color: '#1a237e', fontWeight: 700 }}>
                          Surse ({result.sources.length})
                        </h3>
                      </div>
                      <div style={{ padding: '1rem 1.25rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '0.75rem' }}>
                        {result.sources.slice().sort((a, b) => b.relevance - a.relevance).map((s, i) => (
                          <SourceCard key={i} source={s} />
                        ))}
                      </div>
                    </Card>
                  )}
                </div>
              )}

              {!searching && !result && (
                <Card>
                  <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem', color: '#c5cae9' }}>&#9878;</div>
                    <div style={{ fontWeight: 700, color: '#1a237e', fontSize: '1.05rem', marginBottom: '0.5rem' }}>Asistent Juridic AI</div>
                    <div style={{ color: '#888', fontSize: '0.88rem', maxWidth: 420, margin: '0 auto', lineHeight: 1.6 }}>
                      Adresati o intrebare juridica in limba romana. Asistentul va cauta in legislatia
                      romana, jurisprudenta ICCJ si doctrina relevanta.
                    </div>
                  </div>
                </Card>
              )}
            </>
          )}

          {/* History tab */}
          {activeTab === 'history' && (
            <Card>
              {historyLoading ? <Spinner /> : history.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: '#aaa' }}>
                  {bookmarkedOnly ? 'Nu aveti cercetari salvate.' : 'Nu aveti istoric de cercetari.'}
                </div>
              ) : (
                <div>
                  {history.map((item, idx) => (
                    <div
                      key={item.id}
                      onClick={() => handleHistoryClick(item)}
                      style={{ padding: '0.875rem 1.25rem', borderBottom: idx < history.length - 1 ? '1px solid #f5f5f5' : 'none', display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f8f9ff'}
                      onMouseLeave={e => e.currentTarget.style.background = 'white'}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
                          {item.title && <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1a237e' }}>{item.title}</span>}
                          {item.practiceArea && <Badge label={PRACTICE_AREAS[item.practiceArea] ?? ''} color="#1a237e" />}
                          <ConfidenceBadge score={item.confidenceScore} />
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#444', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.query}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#bbb', marginTop: '0.2rem' }}>
                          {new Date(item.createdAt).toLocaleString('ro-RO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          {item.sourceCount > 0 && ` \u00b7 ${item.sourceCount} surse`}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => handleBookmark(item.id, item.isBookmarked)}
                          style={{ padding: '0.25rem 0.5rem', border: `1px solid ${item.isBookmarked ? '#f57c00' : '#e0e0e0'}`, borderRadius: '5px', background: item.isBookmarked ? '#fff3e0' : 'white', cursor: 'pointer', fontSize: '0.85rem', color: item.isBookmarked ? '#f57c00' : '#aaa' }}
                        >
                          {item.isBookmarked ? '\u2605' : '\u2606'}
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          style={{ padding: '0.25rem 0.5rem', border: '1px solid #ffcdd2', borderRadius: '5px', background: '#fff5f5', cursor: 'pointer', fontSize: '0.8rem', color: '#c62828' }}
                        >
                          &times;
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}