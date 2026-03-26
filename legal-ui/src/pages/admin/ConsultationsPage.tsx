import { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from './AdminLayout';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { ErrorBanner } from '../../components/ui/ErrorBanner';
import { PageHeader } from '../../components/ui/PageHeader';
import { LeadDetailModal } from '../../components/LeadDetailModal';
import { ScheduleConsultationModal } from '../../components/ScheduleConsultationModal';
import { EditConsultationModal } from '../../components/EditConsultationModal';
import { ConsultationNotesModal } from '../../components/ConsultationNotesModal';
import { consultationService, CONSULTATION_STATUS_LABELS, CONSULTATION_STATUS_COLORS, CONSULTATION_TYPE_LABELS, CONSULTATION_TYPE_COLORS } from '../../api/consultationService';
import type { ConsultationItem } from '../../api/consultationService';

type Range = 'today' | 'week' | 'month' | 'all';

// Icon component for consistent rendering
const Icon = ({ type, size = '14px' }: { type: string; size?: string }) => {
  const icons: Record<string, string> = {
    'edit': '✎',
    'confirm': '✓',
    'complete': '✓',
    'absent': '⊗',
    'cancel': '✖',
    'notes': '📝',
    'trash': '🗑',
    'refresh': '↻',
    'plus': '+',
    'calendar': '📅',
    'video': '🎥',
    'clock': '⏰',
  };
  
  return (
    <span style={{ 
      fontSize: size, 
      fontWeight: 'bold',
      lineHeight: 1,
      display: 'inline-block',
    }}>
      {icons[type] ?? '•'}
    </span>
  );
};

export function ConsultationsPage() {
  const [items, setItems]             = useState<ConsultationItem[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [statusFilter, setStatus]     = useState<number | undefined>();
  const [range, setRange]             = useState<Range>('week');
  const [selectedLead, setSelectedLead]         = useState<string | null>(null);
  const [showSchedule, setShowSchedule]         = useState(false);
  const [editingNotes, setEditingNotes]         = useState<ConsultationItem | null>(null);
  const [editingConsultation, setEditingConsultation] = useState<ConsultationItem | null>(null);
  const [deletingId, setDeletingId]             = useState<string | null>(null);
  const [leadRefreshTrigger, setLeadRefreshTrigger] = useState(0);

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
    try { 
      await consultationService.updateStatus(id, newStatus); 
      await load(); 
      setLeadRefreshTrigger(prev => prev + 1);
    }
    catch (e: any) { setError(e.message); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Sigur doriti sa anulati aceasta consultatie?')) return;
    setDeletingId(id);
    try {
      await consultationService.delete(id);
      await load();
      setLeadRefreshTrigger(prev => prev + 1);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setDeletingId(null);
    }
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
            style={{ padding:'0.55rem 1.25rem', background:'#1a237e', color:'white', border:'none', borderRadius:'7px', cursor:'pointer', fontWeight:600, fontSize:'0.9rem', display:'flex', alignItems:'center', gap:'0.5rem' }}>
            <Icon type="plus" size="16px" />
            <span>Programeaza</span>
          </button>
        }
      />
      {error && <ErrorBanner message={error} onRetry={load} />}

      <div style={{ padding:'1.25rem 1.5rem' }}>

        {/* Stats row */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1rem', marginBottom:'1.5rem' }}>
          {[
            { label:'Total',      value:items.length, color:'#1a237e', icon:'calendar' },
            { label:'Confirmate', value:items.filter(c => c.status===2).length, color:'#2e7d32', icon:'confirm' },
            { label:'Azi',        value:items.filter(c => new Date(c.scheduledAt).toDateString()===new Date().toDateString()).length, color:'#f57c00', icon:'clock' },
          ].map(s => (
            <Card key={s.label} style={{ padding:'0.85rem 1.25rem', display:'flex', alignItems:'center', gap:'0.85rem' }}>
              <div style={{ fontSize:'2rem' }}><Icon type={s.icon} size="28px" /></div>
              <div>
                <div style={{ fontSize:'1.75rem', fontWeight:800, color:s.color }}>{s.value}</div>
                <div style={{ fontSize:'0.82rem', color:'#666', fontWeight:600 }}>{s.label}</div>
              </div>
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
          <button onClick={load} style={{ ...btn(false), marginLeft:'auto', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Icon type="refresh" />
            <span>Refresh</span>
          </button>
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
            <Icon type="calendar" size="48px" />
            <p style={{ marginTop:'0.75rem' }}>Nicio consultatie in perioada selectata</p>
            <button onClick={() => setShowSchedule(true)} style={{ marginTop:'0.75rem', padding:'0.55rem 1.25rem', background:'#1a237e', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:600, display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              <Icon type="plus" />
              <span>Programeaza prima consultatie</span>
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
                      <span style={{ fontWeight:700, color:'#1a237e', fontSize:'1rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Icon type="clock" />
                        {new Date(c.scheduledAt).toLocaleTimeString('ro-RO',{hour:'2-digit',minute:'2-digit'})}
                        <span style={{ color:'#888', fontWeight:400, marginLeft:'0.3rem', fontSize:'0.82rem' }}>({c.durationMinutes} min)</span>
                      </span>
                      <Badge label={CONSULTATION_TYPE_LABELS[c.type]} color={CONSULTATION_TYPE_COLORS[c.type] ?? '#555'} />
                      <Badge label={CONSULTATION_STATUS_LABELS[c.status] ?? '-'} color={CONSULTATION_STATUS_COLORS[c.status] ?? '#999'} />
                      {c.isConfirmed && <span style={{ fontSize:'0.75rem', color:'#2e7d32', background:'#e8f5e9', padding:'0.1rem 0.45rem', borderRadius:'8px', fontWeight:600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Icon type="confirm" size="12px" />Confirmat</span>}
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
                        style={{ fontSize:'0.78rem', color:'#1976d2', textDecoration:'underline', marginTop:'0.2rem', display:'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Icon type="video" size="14px" />
                        <span>Deschide link video</span>
                      </a>
                    )}
                    {c.consultationNotes && (
                      <div style={{ marginTop:'0.35rem', fontSize:'0.8rem', color:'#666', background:'#f5f5f5', borderRadius:'4px', padding:'0.3rem 0.6rem', maxWidth:'480px', whiteSpace:'pre-wrap' }}>
                        {c.consultationNotes.slice(0, 120)}{c.consultationNotes.length > 120 ? '...' : ''}
                      </div>
                    )}
                  </div>
                  <div style={{ display:'flex', gap:'0.4rem', flexWrap:'wrap', alignItems:'flex-start' }}>
                    {/* Edit button */}
                    {(c.status === 1 || c.status === 2) && (
                      <button
                        onClick={() => setEditingConsultation(c)}
                        style={{ padding:'0.35rem 0.75rem', background:'#fff3e0', color:'#e65100', border:'1px solid #ffb74d', borderRadius:'5px', cursor:'pointer', fontSize:'0.82rem', fontWeight:600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Icon type="edit" />
                        <span>Editeaza</span>
                      </button>
                    )}
                    
                    {c.status === 1 && (
                      <button onClick={() => handleStatusUpdate(c.id, 2)} style={{ padding:'0.35rem 0.75rem', background:'#e8f5e9', color:'#2e7d32', border:'1px solid #a5d6a7', borderRadius:'5px', cursor:'pointer', fontSize:'0.82rem', fontWeight:600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Icon type="confirm" />
                        <span>Confirma</span>
                      </button>
                    )}
                    
                    {(c.status===1||c.status===2) && (
                      <button onClick={() => handleStatusUpdate(c.id, 3)} style={{ padding:'0.35rem 0.75rem', background:'#e0f7fa', color:'#00838f', border:'1px solid #80deea', borderRadius:'5px', cursor:'pointer', fontSize:'0.82rem', fontWeight:600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Icon type="complete" />
                        <span>Finalizata</span>
                      </button>
                    )}
                    
                    {c.status < 4 && (
                      <button onClick={() => handleStatusUpdate(c.id, 5)} style={{ padding:'0.35rem 0.75rem', background:'#fafafa', color:'#757575', border:'1px solid #ddd', borderRadius:'5px', cursor:'pointer', fontSize:'0.82rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Icon type="absent" />
                        <span>Absent</span>
                      </button>
                    )}
                    
                    {c.status < 4 && (
                      <button onClick={() => handleStatusUpdate(c.id, 4)} style={{ padding:'0.35rem 0.75rem', background:'#ffebee', color:'#c62828', border:'1px solid #ef9a9a', borderRadius:'5px', cursor:'pointer', fontSize:'0.82rem', fontWeight:600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Icon type="cancel" />
                        <span>Anuleaza</span>
                      </button>
                    )}
                    
                    <button onClick={() => setEditingNotes(c)}
                      style={{ padding:'0.35rem 0.75rem', background:'#f3e5f5', color:'#6a1b9a', border:'1px solid #ce93d8', borderRadius:'5px', cursor:'pointer', fontSize:'0.82rem', fontWeight:600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Icon type="notes" />
                      <span>Note</span>
                    </button>

                    {/* Delete button */}
                    {(c.status === 1 || c.status === 2) && (
                      <button
                        onClick={() => handleDelete(c.id)}
                        disabled={deletingId === c.id}
                        style={{ padding:'0.35rem 0.75rem', background:'#ffebee', color:'#c62828', border:'1px solid #ef5350', borderRadius:'5px', cursor: deletingId === c.id ? 'wait' : 'pointer', fontSize:'0.82rem', fontWeight:600, opacity: deletingId === c.id ? 0.6 : 1, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Icon type="trash" />
                        <span>{deletingId === c.id ? 'Se sterge...' : 'Sterge'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ))}
      </div>

      {selectedLead && <LeadDetailModal leadId={selectedLead} onClose={() => setSelectedLead(null)} onStatusChanged={load} refreshTrigger={leadRefreshTrigger} />}
      {showSchedule && <ScheduleConsultationModal onClose={() => setShowSchedule(false)} onCreated={() => { setShowSchedule(false); load(); setLeadRefreshTrigger(prev => prev + 1); }} />}
      {editingNotes && <ConsultationNotesModal consultation={editingNotes} onClose={() => setEditingNotes(null)} onSaved={() => { setEditingNotes(null); load(); setLeadRefreshTrigger(prev => prev + 1); }} />}
      {editingConsultation && <EditConsultationModal consultation={editingConsultation} onClose={() => setEditingConsultation(null)} onUpdated={() => { setEditingConsultation(null); load(); setLeadRefreshTrigger(prev => prev + 1); }} />}
    </AdminLayout>
  );
}
