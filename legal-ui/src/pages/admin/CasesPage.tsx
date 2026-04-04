import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { AdminLayout } from './AdminLayout';
import { apiClient } from '../../api/apiClient';
import { authService } from '../../api/authService';
import type { UserInfo } from '../../api/authService';

// ?? Enums ?????????????????????????????????????????????????????????????
const CASE_STATUS: Record<number, string> = {
  1: 'Activ', 2: 'In asteptare', 3: 'Inchis', 4: 'Suspendat',
};
const CASE_STATUS_COLORS: Record<number, string> = {
  1: '#2e7d32', 2: '#f57c00', 3: '#757575', 4: '#1565c0',
};
const CASE_TYPE: Record<number, string> = {
  1: 'Litigiu', 2: 'Consultanta', 3: 'Tranzactional', 4: 'Altul',
};
const PRACTICE_AREA: Record<number, string> = {
  1: 'Civil', 2: 'Comercial', 3: 'Penal', 4: 'Familie',
  5: 'Imobiliar', 6: 'Munca', 7: 'Corporativ', 8: 'Administrativ', 9: 'Altul',
};
const BILLING: Record<number, string> = {
  1: 'Orar', 2: 'Suma fixa', 3: 'Contingenta', 4: 'Retainer', 5: 'Hibrid',
};

// ?? Types ?????????????????????????????????????????????????????????????
interface CaseListItem {
  id: string; caseNumber: string; title: string;
  status: number; practiceArea: number; clientName: string;
  responsibleLawyerName: string; openingDate: string;
  nextDeadline?: string; lastActivity?: string;
}
interface CaseDetail {
  id: string; caseNumber: string; title: string; description?: string;
  status: number; practiceArea: number; caseType: number; caseValue?: number;
  court?: string; opposingParty?: string; billingArrangement?: number;
  openingDate: string; closingDate?: string;
  client: { id: string; name: string; email?: string; phone?: string };
  responsibleLawyer: { id: string; fullName: string; email?: string };
  assignedUsers: { id: string; fullName: string; email?: string }[];
  documentCount: number; openTaskCount: number;
  nextDeadline?: string; createdAt: string;
}

// ?? Helpers ???????????????????????????????????????????????????????????
const fmtDate = (d?: string) => d ? new Date(d).toLocaleDateString('ro-RO') : '-';
const fmtMoney = (v?: number) => v != null ? v.toLocaleString('ro-RO', { minimumFractionDigits: 2 }) + ' RON' : '-';

// ?? Styles ????????????????????????????????????????????????????????????
const thStyle: React.CSSProperties = {
  padding: '0.65rem 1rem', textAlign: 'left', fontSize: '0.78rem',
  fontWeight: 700, color: '#555', borderBottom: '2px solid #e8eaf6',
  whiteSpace: 'nowrap',
};
const tdStyle: React.CSSProperties = {
  padding: '0.65rem 1rem', fontSize: '0.85rem', verticalAlign: 'middle',
};
const badgeStyle = (color: string): React.CSSProperties => ({
  display: 'inline-block', padding: '0.18rem 0.6rem', borderRadius: '12px',
  fontSize: '0.72rem', fontWeight: 700,
  background: color + '22', color,
});
const inputStyle: React.CSSProperties = {
  padding: '0.45rem 0.75rem', border: '1px solid #ddd', borderRadius: '6px',
  fontSize: '0.85rem', width: '100%', boxSizing: 'border-box',
};
const selectStyle: React.CSSProperties = { ...inputStyle };
const btnOutline: React.CSSProperties = {
  padding: '0.45rem 1rem', background: 'white', color: '#1a237e',
  border: '1px solid #1a237e', borderRadius: '6px', cursor: 'pointer',
  fontWeight: 600, fontSize: '0.85rem',
};
const overlayStyle: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
};
const modalStyle: React.CSSProperties = {
  background: 'white', borderRadius: '12px', padding: '2rem',
  width: '700px', maxWidth: '95vw', maxHeight: '90vh',
  overflowY: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
};
const sectionTitle: React.CSSProperties = {
  fontSize: '0.8rem', fontWeight: 700, color: '#1a237e',
  textTransform: 'uppercase', letterSpacing: '0.05em',
  borderBottom: '1px solid #e8eaf6', paddingBottom: '0.4rem',
  marginBottom: '0.75rem', marginTop: '1.25rem',
};

// ?? Case Detail Modal ?????????????????????????????????????????????????
function CaseDetailModal({ id, onClose }: { id: string; onClose: () => void }) {
  const [data, setData] = useState<CaseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    apiClient.get(`/v1/cases/${id}`)
      .then(r => setData(r.data))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="lro-overlay" style={overlayStyle} onClick={onClose}>
      <div className="lro-modal" style={modalStyle} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.1rem', color: '#1a237e' }}>
            {data ? `${data.caseNumber} - ${data.title}` : 'Detalii dosar'}
          </h2>
          <button onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.4rem', color: '#888', lineHeight: 1 }}>&times;</button>
        </div>

        {loading && <div style={{ color: '#888', padding: '2rem', textAlign: 'center' }}>Se incarca...</div>}
        {error && <div style={{ color: '#f44336', padding: '1rem' }}>{error}</div>}

        {data && (
          <>
            {/* Status + badges row */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
              <span style={badgeStyle(CASE_STATUS_COLORS[data.status] ?? '#999')}>
                {CASE_STATUS[data.status] ?? '-'}
              </span>
              <span style={badgeStyle('#5c6bc0')}>{PRACTICE_AREA[data.practiceArea] ?? '-'}</span>
              <span style={badgeStyle('#00838f')}>{CASE_TYPE[data.caseType] ?? '-'}</span>
              {data.billingArrangement && (
                <span style={badgeStyle('#6a1b9a')}>{BILLING[data.billingArrangement]}</span>
              )}
            </div>

            {/* Description */}
            {data.description && (
              <p style={{ fontSize: '0.88rem', color: '#444', marginBottom: '1rem', lineHeight: 1.6 }}>
                {data.description}
              </p>
            )}

            {/* Grid info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>

              <div>
                <div style={sectionTitle}>Client</div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem' }}>{data.client.name}</p>
                {data.client.email && <p style={{ margin: '0.15rem 0', fontSize: '0.82rem', color: '#666' }}>? {data.client.email}</p>}
                {data.client.phone && <p style={{ margin: '0.15rem 0', fontSize: '0.82rem', color: '#666' }}>?? {data.client.phone}</p>}
              </div>

              <div>
                <div style={sectionTitle}>Avocat responsabil</div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem' }}>{data.responsibleLawyer.fullName}</p>
                {data.responsibleLawyer.email && (
                  <p style={{ margin: '0.15rem 0', fontSize: '0.82rem', color: '#666' }}>? {data.responsibleLawyer.email}</p>
                )}
              </div>

              <div>
                <div style={sectionTitle}>Date dosar</div>
                <table style={{ fontSize: '0.83rem', borderCollapse: 'collapse', width: '100%' }}>
                  <tbody>
                    {[
                      ['Data deschiderii', fmtDate(data.openingDate)],
                      ['Data inchiderii', fmtDate(data.closingDate)],
                      ['Urmatorul termen', fmtDate(data.nextDeadline)],
                      ['Instanta', data.court || '-'],
                      ['Parte adversa', data.opposingParty || '-'],
                      ['Valoare dosar', fmtMoney(data.caseValue)],
                    ].map(([k, v]) => (
                      <tr key={k}>
                        <td style={{ padding: '0.2rem 0.5rem 0.2rem 0', color: '#777', whiteSpace: 'nowrap' }}>{k}</td>
                        <td style={{ padding: '0.2rem 0', fontWeight: 600 }}>{v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div>
                <div style={sectionTitle}>Statistici</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  {[
                    ['??', 'Documente', data.documentCount],
                    ['?', 'Sarcini deschise', data.openTaskCount],
                  ].map(([icon, label, val]) => (
                    <div key={String(label)} style={{
                      background: '#f5f5f5', borderRadius: '8px',
                      padding: '0.75rem', textAlign: 'center',
                    }}>
                      <div style={{ fontSize: '1.4rem' }}>{icon}</div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1a237e' }}>{val}</div>
                      <div style={{ fontSize: '0.72rem', color: '#777' }}>{label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {data.assignedUsers.length > 0 && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <div style={sectionTitle}>Echipa dosarului</div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {data.assignedUsers.map(u => (
                      <span key={u.id} style={{
                        background: '#e8eaf6', borderRadius: '20px',
                        padding: '0.25rem 0.75rem', fontSize: '0.82rem', fontWeight: 600,
                      }}>{u.fullName}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
          <button style={btnOutline} onClick={onClose}>Inchide</button>
        </div>
      </div>
    </div>
  );
}

// -- CreateCaseModal props allow pre-filling from a converted lead ----
interface CreateCaseModalProps {
  onClose: () => void;
  onCreated: () => void;
  prefilledClientId?: string;
  prefilledClientName?: string;
  prefilledPracticeArea?: number;
  prefilledLawyerId?: string;
}

function CreateCaseModal({ onClose, onCreated, prefilledClientId, prefilledClientName, prefilledPracticeArea, prefilledLawyerId }: CreateCaseModalProps) {
  const [clients,  setClients]  = useState<{ id: string; name: string }[]>([]);
  const [lawyers,  setLawyers]  = useState<UserInfo[]>([]);
  const [loading,  setLoading]  = useState(false);
  const [refLoading, setRefLoading] = useState(true);
  const [error,    setError]    = useState('');

  const [form, setForm] = useState({
    clientId:            prefilledClientId   ?? '',
    title:               prefilledClientName ? `Dosar - ${prefilledClientName}` : '',
    description:         '',
    practiceArea:        prefilledPracticeArea ?? 1,
    caseType:            1,
    responsibleLawyerId: prefilledLawyerId   ?? '',
    court:               '',
    opposingParty:       '',
    caseValue:           '' as number | '',
    billingArrangement:  1,
  });

  useEffect(() => {
    Promise.all([
      apiClient.get('/v1/clients').then(r => r.data ?? []),
      authService.getUsers(),
    ]).then(([c, u]) => {
      setClients(c.map((x: any) => ({ id: x.id, name: x.name })));
      setLawyers(u);
      // Apply prefilled lawyer once lawyers are loaded
      if (prefilledLawyerId) {
        const match = (u as UserInfo[]).find(l => l.id === prefilledLawyerId);
        if (match) setForm(f => ({ ...f, responsibleLawyerId: match.id }));
      }
    }).catch((e: any) => setError(e.message))
      .finally(() => setRefLoading(false));
  }, []);

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.clientId)            { setError('Selectati clientul.');          return; }
    if (!form.title.trim())        { setError('Introduceti titlul dosarului.'); return; }
    if (!form.responsibleLawyerId) { setError('Selectati avocatul responsabil.'); return; }
    setLoading(true); setError('');
    try {
      await apiClient.post('/v1/cases', {
        clientId:            form.clientId,
        title:               form.title.trim(),
        description:         form.description || undefined,
        practiceArea:        form.practiceArea,
        caseType:            form.caseType,
        responsibleLawyerId: form.responsibleLawyerId,
        court:               form.court || undefined,
        opposingParty:       form.opposingParty || undefined,
        caseValue:           form.caseValue !== '' ? form.caseValue : undefined,
        billingArrangement:  form.billingArrangement,
      });
      onCreated();
      onClose();
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const lbl: React.CSSProperties = { display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#555', marginBottom: '0.3rem' };
  const btnPrimary: React.CSSProperties = { padding: '0.5rem 1.2rem', background: '#1a237e', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' };

  return (
    <div className="lro-overlay" style={overlayStyle} onClick={onClose}>
      <div className="lro-modal" style={modalStyle} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.1rem', color: '#1a237e' }}>Adauga dosar nou</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.4rem', color: '#888', lineHeight: 1 }}>&times;</button>
        </div>

        {error && <div style={{ color: '#c62828', background: '#fff3f3', border: '1px solid #f44336', borderRadius: '6px', padding: '0.5rem 0.75rem', marginBottom: '1rem', fontSize: '0.88rem' }}>{error}</div>}
        {refLoading ? <div style={{ textAlign: 'center', color: '#888', padding: '2rem' }}>Se incarca...</div> : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={lbl}>Client *</label>
              <select style={selectStyle} value={form.clientId} onChange={e => set('clientId', e.target.value)}>
                <option value="">-- Selecteaza clientul --</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={lbl}>Titlu dosar *</label>
              <input style={inputStyle} value={form.title} onChange={e => set('title', e.target.value)} placeholder="ex: Divort - Ion Popescu" />
            </div>

            <div>
              <label style={lbl}>Arie juridica *</label>
              <select style={selectStyle} value={form.practiceArea} onChange={e => set('practiceArea', +e.target.value)}>
                {Object.entries(PRACTICE_AREA).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>

            <div>
              <label style={lbl}>Tip dosar *</label>
              <select style={selectStyle} value={form.caseType} onChange={e => set('caseType', +e.target.value)}>
                {Object.entries(CASE_TYPE).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={lbl}>Avocat responsabil *</label>
              <select style={selectStyle} value={form.responsibleLawyerId} onChange={e => set('responsibleLawyerId', e.target.value)}>
                <option value="">-- Selecteaza avocatul --</option>
                {lawyers.map(u => <option key={u.id} value={u.id}>{u.fullName}</option>)}
              </select>
            </div>

            <div>
              <label style={lbl}>Instanta</label>
              <input style={inputStyle} value={form.court} onChange={e => set('court', e.target.value)} placeholder="ex: Tribunalul Cluj" />
            </div>

            <div>
              <label style={lbl}>Parte adversa</label>
              <input style={inputStyle} value={form.opposingParty} onChange={e => set('opposingParty', e.target.value)} />
            </div>

            <div>
              <label style={lbl}>Valoare dosar (RON)</label>
              <input type="number" min="0" step="0.01" style={inputStyle}
                value={form.caseValue}
                onChange={e => set('caseValue', e.target.value ? parseFloat(e.target.value) : '')} />
            </div>

            <div>
              <label style={lbl}>Modalitate facturare</label>
              <select style={selectStyle} value={form.billingArrangement} onChange={e => set('billingArrangement', +e.target.value)}>
                {Object.entries(BILLING).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={lbl}>Descriere</label>
              <textarea style={{ ...inputStyle, minHeight: '70px', resize: 'vertical' }}
                value={form.description} onChange={e => set('description', e.target.value)}
                placeholder="Detalii despre dosar..." />
            </div>
          </div>
        )}

        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button style={btnOutline} onClick={onClose} disabled={loading}>Anuleaza</button>
          <button style={btnPrimary} onClick={handleSubmit} disabled={loading || refLoading}>
            {loading ? 'Se salveaza...' : 'Creeaza dosar'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ?? Main Page ?????????????????????????????????????????????????????????
export function CasesPage() {
  const [items, setItems] = useState<CaseListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [createPrefill, setCreatePrefill] = useState<{ clientId?: string; clientName?: string; practiceArea?: number; assignedTo?: string } | null>(null);

  const location = useLocation();
  useEffect(() => {
    const s = location.state as any;
    if (s?.openCreate) {
      setCreatePrefill({ clientId: s.clientId, clientName: s.clientName, practiceArea: s.practiceArea, assignedTo: s.assignedTo });
      setShowCreate(true);
      window.history.replaceState({}, '');
    }
  }, [location.state]);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [areaFilter, setAreaFilter] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const params: Record<string, any> = { page, pageSize: 20 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (areaFilter) params.practiceArea = areaFilter;
      const { data } = await apiClient.get('/v1/cases', { params });
      setItems(data.data ?? []);
      setTotal(data.pagination?.totalCount ?? 0);
      setTotalPages(data.pagination?.totalPages ?? 1);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }, [page, search, statusFilter, areaFilter]);

  useEffect(() => { load(); }, [load]);

  // Reset page on filter change
  const handleSearch = (v: string) => { setSearch(v); setPage(1); };
  const handleStatus = (v: string) => { setStatusFilter(v); setPage(1); };
  const handleArea   = (v: string) => { setAreaFilter(v);   setPage(1); };

  return (
    <AdminLayout>
      <div style={{ padding: '1.25rem 1.5rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.4rem', color: '#1a237e' }}>Dosare</h1>
            <p style={{ margin: '0.2rem 0 0', color: '#888', fontSize: '0.85rem' }}>{total} dosare totale</p>
          </div>
          <button
            style={{ padding: '0.5rem 1.2rem', background: '#1a237e', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
            onClick={() => setShowCreate(true)}>+ Adauga dosar</button>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <input
            style={{ ...inputStyle, maxWidth: '260px' }}
            placeholder="Cauta dupa titlu, numar, client..."
            value={search}
            onChange={e => handleSearch(e.target.value)}
          />
          <select style={{ ...selectStyle, maxWidth: '160px' }} value={statusFilter} onChange={e => handleStatus(e.target.value)}>
            <option value="">Toate statusurile</option>
            {Object.entries(CASE_STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <select style={{ ...selectStyle, maxWidth: '160px' }} value={areaFilter} onChange={e => handleArea(e.target.value)}>
            <option value="">Toate ariile</option>
            {Object.entries(PRACTICE_AREA).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <button style={btnOutline} onClick={load}>? Actualizeaza</button>
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: '#ffebee', border: '1px solid #f44336', borderRadius: '8px', padding: '0.75rem 1rem', color: '#c62828', marginBottom: '1rem', fontSize: '0.88rem' }}>
            {error} <button onClick={load} style={{ marginLeft: '1rem', ...btnOutline, padding: '0.2rem 0.6rem', fontSize: '0.8rem' }}>Reincearca</button>
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#aaa' }}>Se incarca...</div>
        ) : items.length === 0 ? (
          <div style={{ background: 'white', borderRadius: '12px', padding: '3rem', textAlign: 'center', color: '#aaa', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
            Niciun dosar gasit
          </div>
        ) : (
          <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', overflow: 'hidden' }}>
            <div className="lro-table-wrap" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8f9fa' }}>
                    {['Nr. dosar', 'Titlu', 'Client', 'Arie', 'Status', 'Avocat', 'Data deschiderii', 'Termen urmator'].map(h =>
                      <th key={h} style={thStyle}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {items.map(c => (
                    <tr key={c.id}
                      onClick={() => setSelectedId(c.id)}
                      style={{ borderBottom: '1px solid #f5f5f5', cursor: 'pointer', transition: 'background 0.15s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#f5f7ff')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'white')}
                    >
                      <td style={{ ...tdStyle, fontWeight: 700, color: '#1a237e', whiteSpace: 'nowrap' }}>{c.caseNumber}</td>
                      <td style={{ ...tdStyle, maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</td>
                      <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>{c.clientName}</td>
                      <td style={tdStyle}><span style={badgeStyle('#5c6bc0')}>{PRACTICE_AREA[c.practiceArea] ?? '-'}</span></td>
                      <td style={tdStyle}><span style={badgeStyle(CASE_STATUS_COLORS[c.status] ?? '#999')}>{CASE_STATUS[c.status] ?? '-'}</span></td>
                      <td style={{ ...tdStyle, whiteSpace: 'nowrap', fontSize: '0.82rem', color: '#666' }}>{c.responsibleLawyerName}</td>
                      <td style={{ ...tdStyle, whiteSpace: 'nowrap', fontSize: '0.82rem' }}>{fmtDate(c.openingDate)}</td>
                      <td style={{ ...tdStyle, whiteSpace: 'nowrap', fontSize: '0.82rem', color: c.nextDeadline ? '#e65100' : '#aaa', fontWeight: c.nextDeadline ? 700 : 400 }}>
                        {fmtDate(c.nextDeadline)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', padding: '1rem', borderTop: '1px solid #f0f0f0' }}>
                <button style={btnOutline} disabled={page <= 1} onClick={() => setPage(p => p - 1)}>&lsaquo; Anterior</button>
                <span style={{ fontSize: '0.85rem', color: '#666' }}>Pagina {page} din {totalPages}</span>
                <button style={btnOutline} disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Urmator &rsaquo;</button>
              </div>
            )}
          </div>
        )}
      </div>

      {selectedId && <CaseDetailModal id={selectedId} onClose={() => setSelectedId(null)} />}
      {showCreate && (
        <CreateCaseModal
          onClose={() => { setShowCreate(false); setCreatePrefill(null); }}
          onCreated={load}
          prefilledClientId={createPrefill?.clientId}
          prefilledClientName={createPrefill?.clientName}
          prefilledPracticeArea={createPrefill?.practiceArea}
          prefilledLawyerId={createPrefill?.assignedTo}
        />
      )}
    </AdminLayout>
  );
}
