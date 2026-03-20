import { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from './AdminLayout';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { ErrorBanner } from '../../components/ui/ErrorBanner';
import { PageHeader } from '../../components/ui/PageHeader';
import { LeadDetailModal } from '../../components/LeadDetailModal';
import { ScheduleConsultationModal } from '../../components/ScheduleConsultationModal';
import { ConsultationNotesModal } from '../../components/ConsultationNotesModal';
import { consultationService, CONSULTATION_STATUS_LABELS, CONSULTATION_STATUS_COLORS, CONSULTATION_TYPE_LABELS, CONSULTATION_TYPE_COLORS } from '../../api/consultationService';
import type { ConsultationItem } from '../../api/consultationService';

type Range = 'today' | 'week' | 'month' | 'all';

export function ConsultationsPage() {
  const [items, setItems]             = useState<ConsultationItem[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [statusFilter, setStatus]     = useState<number | undefined>();
  const [range, setRange]             = useState<Range>('week');
  const [selectedLead, setSelectedLead]         = useState<string | null>(null);
  const [showSchedule, setShowSchedule]         = useState(false);
  const [editingNotes, setEditingNotes]         = useState<ConsultationItem | null>(null);

  const getDateRange = (r: Range) => {
    const now = new Date();
    if (r === 'today') { const e = new Date(now); e.setHours(23,59,59); return { startDate: now.toISOString(), endDate: e.toISOString() }; }
    if (r === 'week')  { const e = new Date(now); e.setDate(e.getDate()+7); return { startDate: now.toISOString(), endDate: e.toISOString() }; }
    if (r === 'month') { const e = new Date(now); e.setMonth(e.getMonth()+1); return { startDate: now.toISOString(), endDate: e.toISOString() }; }
    return {};
  };

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try { setItems(await consultationService.getAll({ status: statusFilter, ...getDateRange(range) })); }
    catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }, [statusFilter, range]);

  useEffect(() => { load(); }, [load]);

  const handleStatusUpdate = async (id: string, newStatus: number) => {
    try { await consultationService.updateStatus(id, newStatus); await load(); }
    catch (e: any) { setError(e.message); }
  };

  // Group by calendar day
  const groups: Record<string, ConsultationItem[]> = {};
  items.forEach(c => {
    const day = new Date(c.scheduledAt).toLocaleDateString('ro-RO', { weekday:'long', day:'numeric', month:'long' });
    (groups[day] = groups[day] || []).push(c);
  });

  const btn = (active: boolean, color = '#1a237e'): React.CSSProperties => ({
    padding: '0.4rem 0.85rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem',
    border: '1px solid ' + (active ? color : '#ddd'),
    background: active ? color : 'white', color: active ? 'white' : '#555', fontWeight: active ? 600 : 400,
  });

  // Summary stats
  const counts = { total: items.length, confirmed: items.filter(c => c.status===2).length, today: items.filter(c => new Date(c.scheduledAt).toDateString()===new Date().toDateString()).length };

  return (
    <AdminLayout>
      <PageHeader
        title="Consultatii"
        subtitle={counts.total + ' total, ' + counts.today + ' azi'}
        action={
          <button onClick={() => setShowSchedule(true)}
            style={{ padding:'0.55rem 1.25rem', background:'#1a237e', color:'white', border:'none', borderRadius:'7px', cursor:'pointer', fontWeight:600, fontSize:'0.9rem', display:'flex', alignItems:'center', gap:'0.4rem' }}>
            + Programeaza
          </button>
        }
      />
      {error && <ErrorBanner message={error} onRetry={load} />}

      <div style={{ padding:'1.25rem 1.5rem' }}>

        {/* Stats row */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1rem', marginBottom:'1.5rem' }}>
          {[
            { label:'Total',      value:items.length, color:'#1a237e' },
            { label:'Confirmate', value:items.filter(c => c.status===2).length, color:'#2e7d32' },
            { label:'Azi',        value:items.filter(c => new Date(c.scheduledAt).toDateString()===new Date().toDateString()).length, color:'#f57c00' },
          ].map(s => (
            <Card key={s.label} style={{ padding:'0.85rem 1.25rem', display:'flex', alignItems:'center', gap:'0.85rem' }}>
              <div style={{ fontSize:'1.75rem', fontWeight:800, color:s.color }}>{s.value}</div>
              <div style={{ fontSize:'0.82rem', color:'#666', fontWeight:600 }}>{s.label}</div>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display:'flex', gap:'0.65rem', flexWrap:'wrap', marginBottom:'1.25rem', alignItems:'center' }}>
          {(['today','week','month','all'] as Range[]).map(r => (
            <button key={r} onClick={() => setRange(r)} style={btn(range===r)}>
              {r==='today'?'Azi':r==='week'?'Sapt.':r==='month'?'Luna':'Toate'}
            </button>
          ))}
          <select value={statusFilter ?? ''} onChange={e => setStatus(e.target.value ? Number(e.target.value) : undefined)}
            style={{ padding:'0.45rem 0.65rem', border:'1px solid #ddd', borderRadius:'6px', fontSize:'0.88rem' }}>
            <option value="">Toate statusurile</option>
            {Object.entries(CONSULTATION_STATUS_LABELS).map(([v,l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <button onClick={load} style={{ ...btn(false), marginLeft:'auto' }}>Refresh</button>
        </div>

        {/* Status pills */}
        <div style={{ display:'flex', gap:'0.35rem', flexWrap:'wrap', marginBottom:'1.25rem' }}>
          <button onClick={() => setStatus(undefined)} style={{ ...btn(statusFilter===undefined), fontSize:'0.78rem', padding:'0.2rem 0.65rem', borderRadius:'10px' }}>Toate</button>
          {Object.entries(CONSULTATION_STATUS_LABELS).map(([v,l]) => (
            <button key={v} onClick={() => setStatus(Number(v))}
              style={{ padding:'0.2rem 0.65rem', borderRadius:'10px', cursor:'pointer', fontSize:'0.78rem', border:'1px solid '+CONSULTATION_STATUS_COLORS[Number(v)], background:statusFilter===Number(v)?CONSULTATION_STATUS_COLORS[Number(v)]:'white', color:statusFilter===Number(v)?'white':CONSULTATION_STATUS_COLORS[Number(v)] }}>
              {l}
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? <Spinner /> : items.length === 0 ? (
          <Card style={{ padding:'3rem', textAlign:'center', color:'#aaa' }}>
            <div style={{ fontSize:'3rem', marginBottom:'0.75rem' }}>📅</div>
            <p>Nicio consultatie in perioada selectata</p>
            <button onClick={() => setShowSchedule(true)} style={{ marginTop:'0.75rem', padding:'0.55rem 1.25rem', background:'#1a237e', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:600 }}>
              + Programeaza prima consultatie
            </button>
          </Card>
        ) : Object.entries(groups).map(([day, dayItems]) => (
          <div key={day} style={{ marginBottom:'1.5rem' }}>
            <div style={{ fontSize:'0.82rem', fontWeight:700, color:'#888', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:'0.65rem' }}>{day}</div>
            {dayItems.map(c => (
              <Card key={c.id} style={{ padding:'1rem 1.25rem', marginBottom:'0.6rem' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'0.75rem' }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'0.65rem', marginBottom:'0.35rem', flexWrap:'wrap' }}>
                      <span style={{ fontWeight:700, color:'#1a237e', fontSize:'1rem' }}>
                        {new Date(c.scheduledAt).toLocaleTimeString('ro-RO',{hour:'2-digit',minute:'2-digit'})}
                        <span style={{ color:'#888', fontWeight:400, marginLeft:'0.3rem', fontSize:'0.82rem' }}>({c.durationMinutes} min)</span>
                      </span>
                      <Badge label={CONSULTATION_TYPE_LABELS[c.type]} color={CONSULTATION_TYPE_COLORS[c.type] ?? '#555'} />
                      <Badge label={CONSULTATION_STATUS_LABELS[c.status] ?? '-'} color={CONSULTATION_STATUS_COLORS[c.status] ?? '#999'} />
                      {c.isConfirmed && <span style={{ fontSize:'0.75rem', color:'#2e7d32', background:'#e8f5e9', padding:'0.1rem 0.45rem', borderRadius:'8px', fontWeight:600 }}>Confirmat</span>}
                    </div>
                    <div style={{ fontSize:'0.88rem', color:'#555' }}>
                      <span style={{ fontWeight:600, color:'#1a237e', cursor:'pointer', textDecoration:'underline' }} onClick={() => setSelectedLead(c.leadId)}>
                        {c.leadName || 'Lead ' + c.leadId?.slice(0,8)}
                      </span>
                      {' · '}{c.lawyerName}
                      {c.location && <span style={{ color:'#888' }}> · {c.location}</span>}
                    </div>
                    {c.videoMeetingLink && (
                      <a href={c.videoMeetingLink} target="_blank" rel="noopener noreferrer"
                        style={{ fontSize:'0.78rem', color:'#1976d2', textDecoration:'underline', marginTop:'0.2rem', display:'inline-block' }}>
                        Deschide link video
                      </a>
                    )}
                    {c.consultationNotes && (
                      <div style={{ marginTop:'0.35rem', fontSize:'0.8rem', color:'#666', background:'#f5f5f5', borderRadius:'4px', padding:'0.3rem 0.6rem', maxWidth:'480px', whiteSpace:'pre-wrap' }}>
                        {c.consultationNotes.slice(0, 120)}{c.consultationNotes.length > 120 ? '...' : ''}
                      </div>
                    )}
                  </div>
                  <div style={{ display:'flex', gap:'0.4rem', flexWrap:'wrap', alignItems:'flex-start' }}>
                    {c.status === 1 && <button onClick={() => handleStatusUpdate(c.id, 2)} style={{ padding:'0.3rem 0.7rem', background:'#e8f5e9', color:'#2e7d32', border:'1px solid #a5d6a7', borderRadius:'5px', cursor:'pointer', fontSize:'0.78rem', fontWeight:600 }}>Confirma</button>}
                    {(c.status===1||c.status===2) && <button onClick={() => handleStatusUpdate(c.id, 3)} style={{ padding:'0.3rem 0.7rem', background:'#e0f7fa', color:'#00838f', border:'1px solid #80deea', borderRadius:'5px', cursor:'pointer', fontSize:'0.78rem', fontWeight:600 }}>Finalizata</button>}
                    {c.status < 4 && <button onClick={() => handleStatusUpdate(c.id, 5)} style={{ padding:'0.3rem 0.7rem', background:'#fafafa', color:'#757575', border:'1px solid #ddd', borderRadius:'5px', cursor:'pointer', fontSize:'0.78rem' }}>Absent</button>}
                    {c.status < 4 && <button onClick={() => handleStatusUpdate(c.id, 4)} style={{ padding:'0.3rem 0.7rem', background:'#ffebee', color:'#c62828', border:'1px solid #ef9a9a', borderRadius:'5px', cursor:'pointer', fontSize:'0.78rem', fontWeight:600 }}>Anuleaza</button>}
                    <button onClick={() => setEditingNotes(c)}
                      style={{ padding:'0.3rem 0.7rem', background:'#f3e5f5', color:'#6a1b9a', border:'1px solid #ce93d8', borderRadius:'5px', cursor:'pointer', fontSize:'0.78rem', fontWeight:600 }}>
                      Note
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ))}
      </div>

      {selectedLead && <LeadDetailModal leadId={selectedLead} onClose={() => setSelectedLead(null)} onStatusChanged={load} />}
      {showSchedule && <ScheduleConsultationModal onClose={() => setShowSchedule(false)} onCreated={() => { setShowSchedule(false); load(); }} />}
      {editingNotes && <ConsultationNotesModal consultation={editingNotes} onClose={() => setEditingNotes(null)} onSaved={() => { setEditingNotes(null); load(); }} />}
    </AdminLayout>
  );
}
