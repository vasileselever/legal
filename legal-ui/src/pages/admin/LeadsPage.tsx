import { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from './AdminLayout';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { ErrorBanner } from '../../components/ui/ErrorBanner';
import { PageHeader } from '../../components/ui/PageHeader';
import { LeadDetailModal } from '../../components/LeadDetailModal';
import { CreateLeadModal } from '../../components/CreateLeadModal';
import { leadService, LEAD_STATUS_LABELS, LEAD_STATUS_COLORS, URGENCY_LABELS, PRACTICE_AREAS } from '../../api/leadService';
import type { LeadItem } from '../../api/leadService';
import { useUnreadMessages } from '../../hooks/useUnreadMessages';

const PAGE_SIZE = 15;

export function LeadsPage() {
  const [leads, setLeads]           = useState<LeadItem[]>([]);
  const [total, setTotal]           = useState(0);
  const [page, setPage]             = useState(1);
  const [search, setSearch]         = useState('');
  const [statusFilter, setStatus]   = useState<number | undefined>();
  const [areaFilter, setArea]       = useState<number | undefined>();
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [selected, setSelected]     = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const { count: unreadCount, refresh: refreshUnread } = useUnreadMessages();

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const r = await leadService.getLeads({
        page, pageSize: PAGE_SIZE,
        search: search || undefined,
        status: statusFilter,
        practiceArea: areaFilter,
        unreadOnly: unreadOnly || undefined,
      });
      setLeads(r.data); setTotal(r.pagination?.totalCount ?? 0);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }, [page, search, statusFilter, areaFilter, unreadOnly]);

  useEffect(() => { load(); }, [load]);
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const si: React.CSSProperties = { padding: '0.5rem 0.75rem', border: '1px solid #ddd', borderRadius: '6px', fontSize: '0.9rem' };

  const handleCreated = (id: string) => {
    setShowCreate(false);
    load();
    setSelected(id);
  };

  const handleCloseDetail = () => {
    setSelected(null);
    refreshUnread();
    load();
  };

  return (
    <AdminLayout>
      <PageHeader
        title="Lead-uri"
        subtitle={total + ' total'}
        action={
          <button
            onClick={() => setShowCreate(true)}
            style={{
              padding: '0.55rem 1.25rem', background: '#1a237e', color: 'white',
              border: 'none', borderRadius: '7px', cursor: 'pointer',
              fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem',
            }}
          >
            + Lead Nou
          </button>
        }
      />
      {error && <ErrorBanner message={error} onRetry={load} />}
      <div className="lro-page-body" style={{ padding: '1.25rem 1.5rem' }}>
        <Card>
          <div className="lro-filterbar" style={{ padding: '1rem', borderBottom: '1px solid #f0f0f0', display: 'flex', gap: '0.65rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <input placeholder="Cauta dupa nume, email..." value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }} style={{ ...si, width: '240px' }} />
            <select value={statusFilter ?? ''} onChange={e => { setStatus(e.target.value ? Number(e.target.value) : undefined); setPage(1); }} style={si}>
              <option value="">Toate statusurile</option>
              {Object.entries(LEAD_STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <select value={areaFilter ?? ''} onChange={e => { setArea(e.target.value ? Number(e.target.value) : undefined); setPage(1); }} style={si}>
              <option value="">Toate domeniile</option>
              {PRACTICE_AREAS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
            <button onClick={load} style={{ marginLeft: 'auto', padding: '0.5rem 1rem', background: '#1a237e', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>&#8635; Refresh</button>
            <button
              onClick={() => { setUnreadOnly(v => !v); setPage(1); }}
              style={{ position: 'relative', padding: '0.5rem 1rem', border: '1px solid #ef5350', borderRadius: '6px', cursor: 'pointer', background: unreadOnly ? '#ef5350' : 'white', color: unreadOnly ? 'white' : '#ef5350', fontWeight: 600, fontSize: '0.85rem' }}>
              &#128276; Necitite
              {unreadCount > 0 && !unreadOnly && (
                <span style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#ef5350', color: 'white', borderRadius: '10px', fontSize: '0.6rem', fontWeight: 700, padding: '1px 4px', lineHeight: 1.4 }}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>
          </div>
          {/* Quick status pills */}
          <div style={{ padding: '0.5rem 1rem', borderBottom: '1px solid #f5f5f5', display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
            <button onClick={() => { setStatus(undefined); setPage(1); }} style={{ padding: '0.2rem 0.65rem', borderRadius: '10px', cursor: 'pointer', fontSize: '0.78rem', border: '1px solid #ccc', background: statusFilter === undefined ? '#1a237e' : 'white', color: statusFilter === undefined ? 'white' : '#555' }}>Toate</button>
            {Object.entries(LEAD_STATUS_LABELS).map(([v, l]) => (
              <button key={v} onClick={() => { setStatus(Number(v)); setPage(1); }} style={{ padding: '0.2rem 0.65rem', borderRadius: '10px', cursor: 'pointer', fontSize: '0.78rem', border: '1px solid ' + LEAD_STATUS_COLORS[Number(v)], background: statusFilter === Number(v) ? LEAD_STATUS_COLORS[Number(v)] : 'white', color: statusFilter === Number(v) ? 'white' : LEAD_STATUS_COLORS[Number(v)] }}>{l}</button>
            ))}
          </div>
          {loading ? <Spinner /> : leads.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#aaa' }}>
              <div style={{ fontSize: '3rem' }}>&#128203;</div><p>Nu exista lead-uri.</p>
            </div>
          ) : (
            <div className="lro-table-wrap" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.87rem' }}>
                <thead><tr style={{ background: '#f8f9fa' }}>
                  {['Nume', 'Contact', 'Domeniu', 'Status', 'Score', 'Urgenta', 'Avocat', 'Data'].map(h =>
                    <th key={h} style={{ padding: '0.65rem 1rem', textAlign: 'left', color: '#555', fontWeight: 700, borderBottom: '2px solid #e0e0e0', whiteSpace: 'nowrap' }}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {leads.map(lead => (
                    <tr key={lead.id} style={{ borderBottom: '1px solid #f5f5f5', cursor: 'pointer' }} onClick={() => setSelected(lead.id)}
                      onMouseEnter={e => (e.currentTarget.style.background = '#f0f4ff')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'white')}>
                      <td style={{ padding: '0.65rem 1rem', fontWeight: 600, color: '#1a237e' }}>
                        {lead.name}
                        {lead.unreadMessages > 0 && <span style={{ marginLeft: '0.4rem', background: '#c62828', color: 'white', borderRadius: '10px', padding: '0.1rem 0.4rem', fontSize: '0.7rem' }}>{lead.unreadMessages}</span>}
                        {lead.nextConsultation && <div style={{ fontSize: '0.72rem', color: '#f57c00', fontWeight: 400 }}>?? {new Date(lead.nextConsultation).toLocaleDateString('ro-RO')}</div>}
                      </td>
                      <td style={{ padding: '0.65rem 1rem' }}>
                        <div style={{ color: '#555', fontSize: '0.85rem' }}>{lead.email}</div>
                        <div style={{ color: '#999', fontSize: '0.78rem' }}>{lead.phone}</div>
                      </td>
                      <td style={{ padding: '0.65rem 1rem', color: '#555' }}>{PRACTICE_AREAS.find(p => p.value === lead.practiceArea)?.label ?? '-'}</td>
                      <td style={{ padding: '0.65rem 1rem' }}><Badge label={LEAD_STATUS_LABELS[lead.status] ?? '-'} color={LEAD_STATUS_COLORS[lead.status] ?? '#999'} /></td>
                      <td style={{ padding: '0.65rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <div style={{ width: '44px', height: '5px', background: '#eee', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: lead.score + '%', height: '100%', borderRadius: '3px', background: lead.score > 70 ? '#2e7d32' : lead.score > 40 ? '#f57c00' : '#c62828' }} />
                          </div>
                          <span style={{ fontWeight: 700, fontSize: '0.82rem', color: lead.score > 70 ? '#2e7d32' : lead.score > 40 ? '#f57c00' : '#c62828' }}>{lead.score}</span>
                        </div>
                      </td>
                      <td style={{ padding: '0.65rem 1rem', color: '#666', fontSize: '0.82rem' }}>{URGENCY_LABELS[lead.urgency] ?? '-'}</td>
                      <td style={{ padding: '0.65rem 1rem', color: '#666', fontSize: '0.82rem' }}>{lead.assignedToName ?? <span style={{ color: '#aaa' }}>Neasignat</span>}</td>
                      <td style={{ padding: '0.65rem 1rem', color: '#aaa', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{new Date(lead.createdAt).toLocaleDateString('ro-RO')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {totalPages > 1 && (
            <div style={{ padding: '0.875rem', borderTop: '1px solid #f0f0f0', display: 'flex', gap: '0.4rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '0.35rem 0.75rem', border: '1px solid #ddd', borderRadius: '5px', background: 'white', cursor: page === 1 ? 'not-allowed' : 'pointer', color: page === 1 ? '#ccc' : '#333' }}>?</button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + Math.max(1, page - 3)).filter(p => p <= totalPages).map(p => (
                <button key={p} onClick={() => setPage(p)} style={{ padding: '0.35rem 0.65rem', borderRadius: '5px', cursor: 'pointer', border: p === page ? 'none' : '1px solid #ddd', background: p === page ? '#1a237e' : 'white', color: p === page ? 'white' : '#333', fontWeight: p === page ? 700 : 400 }}>{p}</button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ padding: '0.35rem 0.75rem', border: '1px solid #ddd', borderRadius: '5px', background: 'white', cursor: page === totalPages ? 'not-allowed' : 'pointer', color: page === totalPages ? '#ccc' : '#333' }}>?</button>
            </div>
          )}
        </Card>
      </div>
      {selected && <LeadDetailModal leadId={selected} onClose={handleCloseDetail} onStatusChanged={() => { load(); refreshUnread(); }} />}
      {showCreate && (
        <CreateLeadModal
          onClose={() => setShowCreate(false)}
          onCreated={handleCreated}
        />
      )}
    </AdminLayout>
  );
}
