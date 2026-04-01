import { useState, useEffect } from 'react';
import { authService } from '../api/authService';
import type { UserInfo } from '../api/authService';
import { leadService, PRACTICE_AREAS } from '../api/leadService';
import type { LeadItem } from '../api/leadService';
import { consultationService, CONSULTATION_TYPE_LABELS, DURATION_OPTIONS } from '../api/consultationService';
import type { CreateConsultationDto } from '../api/consultationService';
import { notificationService } from '../api/notificationService';
import { DateTimePicker } from './ui/DateTimePicker';

interface Props { onClose: () => void; onCreated: () => void; prefillLeadId?: string; }
type FE = Partial<Record<keyof CreateConsultationDto | 'general', string>>;

const mkInp = (e = false): React.CSSProperties => ({
  width: '100%', padding: '0.55rem 0.75rem', border: '1px solid ' + (e ? '#ef5350' : '#ddd'),
  borderRadius: '6px', fontSize: '0.9rem', boxSizing: 'border-box' as const,
});
const LBL: React.CSSProperties = { display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#333', marginBottom: '0.3rem' };
const ERR: React.CSSProperties = { color: '#c62828', fontSize: '0.75rem', marginTop: '0.2rem' };
const G2: React.CSSProperties  = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' };

function toLocalDT(d: Date) {
  const p = (n: number) => String(n).padStart(2, '0');
  return d.getFullYear() + '-' + p(d.getMonth()+1) + '-' + p(d.getDate()) + 'T' + p(d.getHours()) + ':' + p(d.getMinutes());
}
const defaultDT = () => { const d = new Date(); d.setMinutes(0,0,0); d.setHours(d.getHours()+1); return toLocalDT(d); };

export function ScheduleConsultationModal({ onClose, onCreated, prefillLeadId }: Props) {
  const [form, setForm]          = useState<CreateConsultationDto>({ leadId: prefillLeadId ?? '', lawyerId: '', scheduledAt: defaultDT(), durationMinutes: 30, type: 1, location: '', preparationNotes: '' });
  const [errors, setErrors]      = useState<FE>({});
  const [loading, setLoading]    = useState(false);
  const [leads, setLeads]        = useState<LeadItem[]>([]);
  const [users, setUsers]        = useState<UserInfo[]>([]);
  const [availability, setAvail] = useState<string[]>([]);
  const [loadingAvail, setLA]    = useState(false);
  const [notifStatus, setNotifStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifyClient, setNotifyClient] = useState(true);

  useEffect(() => {
    Promise.all([
      authService.getUsers().then(setUsers).catch(() => {}),
      leadService.getLeads({ pageSize: 200 }).then(r => setLeads(r.data)).catch(() => {}),
    ]);
  }, []);

  const set = <K extends keyof CreateConsultationDto>(k: K, v: CreateConsultationDto[K]) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: undefined, general: undefined }));
  };

  useEffect(() => {
    if (!form.lawyerId) { setAvail([]); return; }
    const dt = new Date(form.scheduledAt);
    if (isNaN(dt.getTime())) return;
    const start = new Date(dt); start.setHours(0,0,0,0);
    const end = new Date(dt); end.setHours(23,59,59,999);
    setLA(true);
    consultationService.getAvailability(form.lawyerId, start.toISOString(), end.toISOString(), form.durationMinutes)
      .then(setAvail).catch(() => setAvail([])).finally(() => setLA(false));
  }, [form.lawyerId, form.scheduledAt.slice(0, 10), form.durationMinutes]);

  const validate = (): boolean => {
    const e: FE = {};
    if (!form.leadId)   e.leadId   = 'Selecteaza lead-ul';
    if (!form.lawyerId) e.lawyerId = 'Selecteaza avocatul';
    const dt = new Date(form.scheduledAt);
    if (isNaN(dt.getTime()) || dt <= new Date()) e.scheduledAt = 'Data trebuie sa fie in viitor';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await consultationService.create({
        ...form,
        scheduledAt: new Date(form.scheduledAt).toISOString(),
        location: form.location || undefined,
        preparationNotes: form.preparationNotes || undefined,
      });

      // Send reminder notification to lead
      if (notifyClient && selLead?.email) {
        setNotifStatus('sending');
        try {
          const res = await notificationService.testConsultationReminder({
            to: selLead.email,
            name: selLead.name,
            scheduledAt: form.scheduledAt, // already local time from datetime-local input
          });
          setNotifStatus('sent');
          setNotifMessage(res.message);
        } catch (ne: any) {
          setNotifStatus('error');
          setNotifMessage(ne.message ?? 'Eroare la trimiterea notificarii');
        }
        // Wait so the user sees the confirmation, then close
        setTimeout(() => onCreated(), 2000);
      } else {
        onCreated();
      }
    } catch (er: any) {
      setErrors(e => ({ ...e, general: er.response?.data?.message ?? er.message ?? 'Eroare la salvare' }));
    } finally {
      setLoading(false);
    }
  };

  const selLead = leads.find(l => l.id === form.leadId);

  return (
    <div style={{ position:'fixed', inset:0, zIndex:1100, background:'rgba(0,0,0,0.45)', display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background:'white', borderRadius:'12px', width:'100%', maxWidth:'580px', maxHeight:'92vh', display:'flex', flexDirection:'column', boxShadow:'0 8px 40px rgba(0,0,0,0.2)' }}>

        <div style={{ padding:'1.25rem 1.5rem', borderRadius:'12px 12px 0 0', background:'linear-gradient(135deg,#1a237e,#3949ab)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <div style={{ color:'white', fontWeight:700, fontSize:'1.1rem' }}>Programeaza Consultatie</div>
            <div style={{ color:'rgba(255,255,255,0.7)', fontSize:'0.82rem', marginTop:'0.1rem' }}>Seteaza data, tipul si avocatul responsabil</div>
          </div>
          <button onClick={onClose} style={{ background:'rgba(255,255,255,0.15)', border:'none', color:'white', width:'32px', height:'32px', borderRadius:'50%', cursor:'pointer', fontSize:'1.2rem', display:'flex', alignItems:'center', justifyContent:'center' }}>x</button>
        </div>

        {errors.general && <div style={{ background:'#ffebee', borderBottom:'1px solid #ef9a9a', padding:'0.65rem 1.5rem', color:'#c62828', fontSize:'0.87rem' }}>Eroare: {errors.general}</div>}

        <form onSubmit={handleSubmit} style={{ flex:1, overflowY:'auto' }}>
          <div style={{ padding:'1.5rem', display:'flex', flexDirection:'column', gap:'1rem' }}>

            <div>
              <label style={LBL}>Lead / Client *</label>
              <select style={mkInp(!!errors.leadId)} value={form.leadId} onChange={e => set('leadId', e.target.value)}>
                <option value="">-- Selecteaza lead-ul --</option>
                {leads.map(l => <option key={l.id} value={l.id}>{l.name} ({l.email})</option>)}
              </select>
              {errors.leadId && <p style={ERR}>{errors.leadId}</p>}
              {selLead && (
                <div style={{ marginTop:'0.4rem', fontSize:'0.8rem', color:'#666', background:'#f5f5f5', borderRadius:'5px', padding:'0.4rem 0.65rem' }}>
                  {PRACTICE_AREAS.find(p => p.value === selLead.practiceArea)?.label} &bull; {selLead.phone}
                </div>
              )}
            </div>

            <div style={G2}>
              <div>
                <label style={LBL}>Avocat *</label>
                <select style={mkInp(!!errors.lawyerId)} value={form.lawyerId} onChange={e => set('lawyerId', e.target.value)}>
                  <option value="">-- Selecteaza --</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>)}
                </select>
                {errors.lawyerId && <p style={ERR}>{errors.lawyerId}</p>}
              </div>
              <div>
                <label style={LBL}>Tip consultatie *</label>
                <select style={mkInp()} value={form.type} onChange={e => set('type', Number(e.target.value))}>
                  {Object.entries(CONSULTATION_TYPE_LABELS).map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
            </div>

            <div style={G2}>
              <div>
                <label style={LBL}>Data si ora *</label>
                <DateTimePicker
                  value={form.scheduledAt}
                  onChange={v => set('scheduledAt', v)}
                  hasError={!!errors.scheduledAt}
                  required
                />
                {errors.scheduledAt && <p style={ERR}>{errors.scheduledAt}</p>}
              </div>
              <div>
                <label style={LBL}>Durata</label>
                <select style={mkInp()} value={form.durationMinutes} onChange={e => set('durationMinutes', Number(e.target.value))}>
                  {DURATION_OPTIONS.map(d => <option key={d} value={d}>{d} min</option>)}
                </select>
              </div>
            </div>

            {form.lawyerId && (
              <div style={{ background:'#e8f4fd', border:'1px solid #90caf9', borderRadius:'6px', padding:'0.65rem 0.85rem', fontSize:'0.82rem' }}>
                {loadingAvail
                  ? 'Se incarca disponibilitatea...'
                  : availability.length === 0
                    ? 'Nicio ora libera in aceasta zi.'
                    : <>Ore libere: <strong>{availability.slice(0,8).map(s => new Date(s).toLocaleTimeString('ro-RO',{hour:'2-digit',minute:'2-digit',hour12:false})).join(', ')}{availability.length > 8 ? ' ...' : ''}</strong></>
                }
              </div>
            )}

            {form.type === 1 && (
              <div>
                <label style={LBL}>Locatie</label>
                <input style={mkInp()} placeholder="Str. Exemplu nr. 1, Bucuresti" value={form.location ?? ''}
                  onChange={e => set('location', e.target.value)} />
              </div>
            )}

            {form.type === 3 && (
              <div style={{ background:'#e8f5e9', border:'1px solid #a5d6a7', borderRadius:'6px', padding:'0.65rem 0.85rem', fontSize:'0.82rem', color:'#2e7d32' }}>
                Un link video va fi generat automat dupa programare.
              </div>
            )}

            {/* Notify client checkbox — placed before notes so it's visible without scrolling */}
            <label style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.7rem 1rem',
              background: notifyClient ? '#e3f2fd' : '#f5f5f5',
              border: `1px solid ${notifyClient ? '#90caf9' : '#e0e0e0'}`,
              borderRadius: '8px', cursor: 'pointer',
              transition: 'background 0.15s, border-color 0.15s',
              userSelect: 'none',
            }}>
              <input
                type="checkbox"
                checked={notifyClient}
                onChange={e => setNotifyClient(e.target.checked)}
                style={{ width: '17px', height: '17px', accentColor: '#1976d2', cursor: 'pointer', flexShrink: 0 }}
              />
              <span style={{ fontSize: '0.9rem', color: notifyClient ? '#1565c0' : '#666', fontWeight: 600 }}>
                ?? Trimite mail de notificare
              </span>
              {notifyClient && selLead?.email && (
                <span style={{ fontSize: '0.8rem', color: '#1976d2', marginLeft: 'auto', whiteSpace: 'nowrap' }}>
                  ? {selLead.email}
                </span>
              )}
              {!notifyClient && (
                <span style={{ fontSize: '0.8rem', color: '#aaa', marginLeft: 'auto', fontStyle: 'italic' }}>
                  emailul nu va fi trimis
                </span>
              )}
            </label>

            <div>
              <label style={LBL}>Note de pregatire (interne)</label>
              <textarea style={{ ...mkInp(), minHeight:'80px', resize:'vertical' }}
                placeholder="Aspecte de discutat, documente necesare..." value={form.preparationNotes ?? ''}
                onChange={e => set('preparationNotes', e.target.value)} />
            </div>

            {/* Notification status banners */}
            {notifStatus === 'sending' && (
              <div style={{ background:'#e3f2fd', border:'1px solid #90caf9', borderRadius:'8px', padding:'0.75rem 1rem', display:'flex', alignItems:'center', gap:'0.6rem', fontSize:'0.87rem', color:'#1565c0' }}>
                <span style={{ fontSize:'1.1rem' }}>??</span>
                <span>Se trimite emailul de reminder catre <strong>{selLead?.email}</strong>...</span>
              </div>
            )}

            {notifStatus === 'sent' && (
              <div style={{ background:'#e8f5e9', border:'1px solid #a5d6a7', borderRadius:'8px', padding:'0.75rem 1rem', display:'flex', alignItems:'center', gap:'0.6rem', fontSize:'0.87rem' }}>
                <span style={{ fontSize:'1.1rem' }}>?</span>
                <div>
                  <div style={{ fontWeight:700, color:'#2e7d32', marginBottom:'0.1rem' }}>Reminder trimis cu succes!</div>
                  <div style={{ color:'#388e3c' }}>
                    Email trimis la <strong>{selLead?.email}</strong> cu detaliile consultatiei programate pe{' '}
                    <strong>{new Date(form.scheduledAt).toLocaleString('ro-RO', { day:'2-digit', month:'long', hour:'2-digit', minute:'2-digit', hour12: false })}</strong>.
                  </div>
                </div>
              </div>
            )}

            {notifStatus === 'error' && (
              <div style={{ background:'#fff3e0', border:'1px solid #ffcc80', borderRadius:'8px', padding:'0.75rem 1rem', display:'flex', alignItems:'center', gap:'0.6rem', fontSize:'0.87rem' }}>
                <span style={{ fontSize:'1.1rem' }}>??</span>
                <div>
                  <div style={{ fontWeight:700, color:'#e65100', marginBottom:'0.1rem' }}>Consultatia a fost salvata, dar emailul nu a putut fi trimis.</div>
                  <div style={{ color:'#bf360c', fontSize:'0.82rem' }}>{notifMessage}</div>
                </div>
              </div>
            )}

          </div>

          <div style={{ padding:'1rem 1.5rem', borderTop:'1px solid #e8eaf6', background:'#fafafa', borderRadius:'0 0 12px 12px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <button type="button" onClick={onClose} disabled={notifStatus === 'sending'}
              style={{ padding:'0.55rem 1.25rem', background:'#eee', border:'none', borderRadius:'6px', cursor: notifStatus === 'sending' ? 'not-allowed' : 'pointer', fontSize:'0.9rem', opacity: notifStatus === 'sending' ? 0.5 : 1 }}>
              Anuleaza
            </button>
            <button type="submit" disabled={loading || notifStatus === 'sending' || notifStatus === 'sent'}
              style={{ padding:'0.55rem 1.5rem', background: loading || notifStatus === 'sending' ? '#90caf9' : notifStatus === 'sent' ? '#a5d6a7' : '#1a237e', color:'white', border:'none', borderRadius:'6px', cursor: loading || notifStatus !== 'idle' ? 'not-allowed' : 'pointer', fontWeight:700, fontSize:'0.9rem' }}>
              {loading ? 'Se salveaza...' : notifStatus === 'sending' ? 'Se trimite emailul...' : notifStatus === 'sent' ? '? Programat!' : 'Programeaza'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
