const fs = require('fs');
const base = 'C:/Users/vasileselever/Desktop/projects/Juridic/legal/legal-ui/src';

fs.writeFileSync(base + '/pages/admin/LeadsPage.tsx', `
import { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from './AdminLayout';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { ErrorBanner } from '../../components/ui/ErrorBanner';
import { PageHeader } from '../../components/ui/PageHeader';
import { LeadDetailModal } from '../../components/LeadDetailModal';
import { leadService, LEAD_STATUS_LABELS, LEAD_STATUS_COLORS, URGENCY_LABELS, PRACTICE_AREAS } from '../../api/leadService';
import type { LeadItem } from '../../api/leadService';

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

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const r = await leadService.getLeads({
        page, pageSize: PAGE_SIZE,
        search: search || undefined,
        status: statusFilter,
        practiceArea: areaFilter,
      });
      setLeads(r.data); setTotal(r.pagination?.totalCount ?? 0);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }, [page, search, statusFilter, areaFilter]);

  useEffect(() => { load(); }, [load]);
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const si: React.CSSProperties = { padding: '0.5rem 0.75rem', border: '1px solid #ddd', borderRadius: '6px', fontSize: '0.9rem' };

  return (
    <AdminLayout>
      <PageHeader title="Lead-uri" subtitle={total + ' total'} />
      {error && <ErrorBanner message={error} onRetry={load} />}
      <div style={{ padding: '1.25rem 1.5rem' }}>
        <Card>
          <div style={{ padding: '1rem', borderBottom: '1px solid #f0f0f0', display: 'flex', gap: '0.65rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <input placeholder="?? Cauta dupa nume, email..." value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }} style={{ ...si, width: '240px' }} />
            <select value={statusFilter ?? ''} onChange={e => { setStatus(e.target.value ? Number(e.target.value) : undefined); setPage(1); }} style={si}>
              <option value="">Toate statusurile</option>
              {Object.entries(LEAD_STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <select value={areaFilter ?? ''} onChange={e => { setArea(e.target.value ? Number(e.target.value) : undefined); setPage(1); }} style={si}>
              <option value="">Toate domeniile</option>
              {PRACTICE_AREAS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
            <button onClick={load} style={{ marginLeft: 'auto', padding: '0.5rem 1rem', background: '#1a237e', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>?? Refresh</button>
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
              <div style={{ fontSize: '3rem' }}>??</div><p>Nu exista lead-uri.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
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
      {selected && <LeadDetailModal leadId={selected} onClose={() => setSelected(null)} onStatusChanged={load} />}
    </AdminLayout>
  );
}
`.trimStart(), 'utf8');

fs.writeFileSync(base + '/pages/admin/ConsultationsPage.tsx', `
import { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from './AdminLayout';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { ErrorBanner } from '../../components/ui/ErrorBanner';
import { PageHeader } from '../../components/ui/PageHeader';
import { LeadDetailModal } from '../../components/LeadDetailModal';
import { consultationService, CONSULTATION_STATUS_LABELS, CONSULTATION_STATUS_COLORS, CONSULTATION_TYPE_LABELS } from '../../api/consultationService';
import type { ConsultationItem } from '../../api/consultationService';

export function ConsultationsPage() {
  const [items, setItems]           = useState<ConsultationItem[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [statusFilter, setStatus]   = useState<number | undefined>();
  const [range, setRange]           = useState<'today'|'week'|'month'|'all'>('week');
  const [selectedLead, setSelectedLead] = useState<string | null>(null);

  const getDateRange = () => {
    const now = new Date();
    if (range === 'today') { const end = new Date(now); end.setHours(23,59,59); return { startDate: now.toISOString(), endDate: end.toISOString() }; }
    if (range === 'week')  { const end = new Date(now); end.setDate(end.getDate()+7); return { startDate: now.toISOString(), endDate: end.toISOString() }; }
    if (range === 'month') { const end = new Date(now); end.setMonth(end.getMonth()+1); return { startDate: now.toISOString(), endDate: end.toISOString() }; }
    return {};
  };

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try { setItems(await consultationService.getAll({ status: statusFilter, ...getDateRange() })); }
    catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }, [statusFilter, range]);

  useEffect(() => { load(); }, [load]);

  const handleStatusUpdate = async (id: string, newStatus: number) => {
    try { await consultationService.updateStatus(id, newStatus); await load(); }
    catch (e: any) { setError(e.message); }
  };

  const groups: Record<string, ConsultationItem[]> = {};
  items.forEach(c => {
    const day = new Date(c.scheduledAt).toLocaleDateString('ro-RO', { weekday:'long', day:'numeric', month:'long' });
    (groups[day] = groups[day] || []).push(c);
  });

  const btnStyle = (active: boolean, color = '#1a237e'): React.CSSProperties => ({
    padding: '0.4rem 0.85rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem',
    border: '1px solid ' + (active ? color : '#ddd'), background: active ? color : 'white',
    color: active ? 'white' : '#555', fontWeight: active ? 600 : 400,
  });

  return (
    <AdminLayout>
      <PageHeader title="Consultatii" subtitle={items.length + ' inregistrari'} />
      {error && <ErrorBanner message={error} onRetry={load} />}
      <div style={{ padding: '1.25rem 1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', marginBottom: '1.25rem', alignItems: 'center' }}>
          {(['today','week','month','all'] as const).map(r => (
            <button key={r} onClick={() => setRange(r)} style={btnStyle(range === r)}>
              {r==='today'?'Azi':r==='week'?'Saptamana':r==='month'?'Luna':'Toate'}
            </button>
          ))}
          <select value={statusFilter ?? ''} onChange={e => setStatus(e.target.value ? Number(e.target.value) : undefined)}
            style={{ padding: '0.45rem 0.65rem', border: '1px solid #ddd', borderRadius: '6px', fontSize: '0.88rem' }}>
            <option value="">Toate statusurile</option>
            {Object.entries(CONSULTATION_STATUS_LABELS).map(([v,l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <button onClick={load} style={{ ...btnStyle(false), marginLeft: 'auto' }}>?? Refresh</button>
        </div>

        {loading ? <Spinner /> : items.length === 0 ? (
          <Card style={{ padding: '3rem', textAlign: 'center', color: '#aaa' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>??</div>
            <p>Nicio consultatie in perioada selectata</p>
          </Card>
        ) : Object.entries(groups).map(([day, dayItems]) => (
          <div key={day} style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.65rem' }}>{day}</div>
            {dayItems.map(c => (
              <Card key={c.id} style={{ padding: '1rem 1.25rem', marginBottom: '0.6rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, color: '#1a237e', fontSize: '1rem' }}>
                        {new Date(c.scheduledAt).toLocaleTimeString('ro-RO', { hour:'2-digit', minute:'2-digit' })}
                        <span style={{ color: '#888', fontWeight: 400, marginLeft: '0.35rem', fontSize: '0.82rem' }}>({c.durationMinutes} min)</span>
                      </span>
                      <Badge label={CONSULTATION_TYPE_LABELS[c.type]} color="#1976d2" />
                      <Badge label={CONSULTATION_STATUS_LABELS[c.status] ?? '-'} color={CONSULTATION_STATUS_COLORS[c.status] ?? '#999'} />
                    </div>
                    <div style={{ fontSize: '0.88rem', color: '#555' }}>
                      <span style={{ fontWeight: 600, color: '#1a237e', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => setSelectedLead(c.leadId)}>
                        {c.leadName || 'Lead ' + c.leadId?.slice(0,8)}
                      </span>
                      {' · '}{c.lawyerName}
                      {c.location && <span style={{ color: '#888' }}> · {c.location}</span>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {c.status === 1 && <button onClick={() => handleStatusUpdate(c.id, 2)} style={{ padding:'0.3rem 0.7rem',background:'#e8f5e9',color:'#2e7d32',border:'1px solid #a5d6a7',borderRadius:'5px',cursor:'pointer',fontSize:'0.78rem',fontWeight:600 }}>? Confirma</button>}
                    {(c.status === 1 || c.status === 2) && <button onClick={() => handleStatusUpdate(c.id, 3)} style={{ padding:'0.3rem 0.7rem',background:'#e0f7fa',color:'#00838f',border:'1px solid #80deea',borderRadius:'5px',cursor:'pointer',fontSize:'0.78rem',fontWeight:600 }}>?? Finalizata</button>}
                    {c.status < 3 && <button onClick={() => handleStatusUpdate(c.id, 4)} style={{ padding:'0.3rem 0.7rem',background:'#ffebee',color:'#c62828',border:'1px solid #ef9a9a',borderRadius:'5px',cursor:'pointer',fontSize:'0.78rem',fontWeight:600 }}>? Anuleaza</button>}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ))}
      </div>
      {selectedLead && <LeadDetailModal leadId={selectedLead} onClose={() => setSelectedLead(null)} onStatusChanged={load} />}
    </AdminLayout>
  );
}
`.trimStart(), 'utf8');

fs.writeFileSync(
  'C:/Users/vasileselever/Desktop/projects/Juridic/legal/legal-ui/src/components/CreateLeadModal.tsx',
  `
import { useState } from 'react';
import { authService } from '../api/authService';
import type { UserInfo } from '../api/authService';
import { leadService, PRACTICE_AREAS, LEAD_SOURCES, URGENCY_LABELS } from '../api/leadService';
import type { CreateLeadDto } from '../api/leadService';

interface Props { onClose: () => void; onCreated: (leadId: string) => void; }
type FE = Partial<Record<keyof CreateLeadDto | 'consent', string>>;

const EMPTY: CreateLeadDto = {
  name:'', email:'', phone:'', source:1, practiceArea:1,
  description:'', urgency:2, budgetRange:'', preferredContactMethod:'',
  assignedTo:'', consentToMarketing:false, consentToDataProcessing:false,
};
const inp = (e=false): React.CSSProperties => ({
  width:'100%', padding:'0.55rem 0.75rem', border:'1px solid '+(e?'#ef5350':'#ddd'),
  borderRadius:'6px', fontSize:'0.9rem', boxSizing:'border-box',
});
const lbl: React.CSSProperties = { display:'block', fontSize:'0.82rem', fontWeight:600, color:'#333', marginBottom:'0.3rem' };
const err: React.CSSProperties = { color:'#c62828', fontSize:'0.75rem', marginTop:'0.2rem' };
const STEPS = ['Date contact','Detalii caz','Alocare si consimtamant'];

export function CreateLeadModal({ onClose, onCreated }: Props) {
  const [form, setForm]       = useState<CreateLeadDto>(EMPTY);
  const [errors, setErrors]   = useState<FE>({});
  const [step, setStep]       = useState(0);
  const [loading, setLoading] = useState(false);
  const [apiErr, setApiErr]   = useState('');
  const [users, setUsers]     = useState<UserInfo[]>([]);
  const [usersLoaded, setUsersLoaded] = useState(false);

  const set = <K extends keyof CreateLeadDto>(k: K, v: CreateLeadDto[K]) => {
    setForm(f => ({ ...f, [k]: v }));
    if ((errors as any)[k]) setErrors(e => ({ ...e, [k]: undefined }));
  };

  const loadUsers = async () => {
    if (usersLoaded) return;
    try { setUsers(await authService.getUsers()); setUsersLoaded(true); } catch {}
  };

  const validateStep = () => {
    const e: FE = {};
    if (step === 0) {
      if (!form.name.trim())                                     e.name  = 'Obligatoriu';
      if (!form.email.trim() || !/\\S+@\\S+\\.\\S+/.test(form.email)) e.email = 'Email invalid';
      if (!form.phone.trim() || form.phone.length < 7)           e.phone = 'Telefon invalid';
    }
    if (step === 1) {
      if (!form.description.trim() || form.description.trim().length < 10)
        e.description = 'Cel putin 10 caractere';
    }
    if (step === 2 && !form.consentToDataProcessing) {
      e.consent = 'Consimtamantul GDPR este obligatori
