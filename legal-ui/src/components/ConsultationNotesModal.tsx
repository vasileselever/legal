import { useState } from 'react';
import { consultationService, CONSULTATION_TYPE_LABELS, CONSULTATION_TYPE_COLORS, CONSULTATION_STATUS_LABELS, CONSULTATION_STATUS_COLORS } from '../api/consultationService';
import type { ConsultationItem } from '../api/consultationService';
import { Badge } from './ui/Badge';

interface Props { consultation: ConsultationItem; onClose: () => void; onSaved: () => void; }
const mkInp = (): React.CSSProperties => ({ width:'100%', padding:'0.55rem 0.75rem', border:'1px solid #ddd', borderRadius:'6px', fontSize:'0.9rem', boxSizing:'border-box' as const });
const LBL: React.CSSProperties = { display:'block', fontSize:'0.82rem', fontWeight:600, color:'#333', marginBottom:'0.3rem' };

export function ConsultationNotesModal({ consultation: c, onClose, onSaved }: Props) {
  const [notes, setNotes]     = useState(c.consultationNotes ?? '');
  const [status, setStatus]   = useState(c.status);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleSave = async () => {
    setLoading(true); setError('');
    try { await consultationService.updateStatus(c.id, status, notes); onSaved(); }
    catch (er: any) { setError(er.response?.data?.message ?? er.message ?? 'Eroare'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ position:'fixed', inset:0, zIndex:1200, background:'rgba(0,0,0,0.45)', display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background:'white', borderRadius:'12px', width:'100%', maxWidth:'500px', display:'flex', flexDirection:'column', boxShadow:'0 8px 40px rgba(0,0,0,0.2)' }}>

        <div style={{ padding:'1.25rem 1.5rem', borderRadius:'12px 12px 0 0', background:'linear-gradient(135deg,#006064,#00838f)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <div style={{ color:'white', fontWeight:700, fontSize:'1.05rem' }}>Note Consultatie</div>
            <div style={{ color:'rgba(255,255,255,0.75)', fontSize:'0.8rem', marginTop:'0.1rem' }}>
              {new Date(c.scheduledAt).toLocaleString('ro-RO',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit',hour12:false})} - {c.lawyerName}
            </div>
          </div>
          <button onClick={onClose} style={{ background:'rgba(255,255,255,0.15)', border:'none', color:'white', width:'32px', height:'32px', borderRadius:'50%', cursor:'pointer', fontSize:'1.2rem', display:'flex', alignItems:'center', justifyContent:'center' }}>x</button>
        </div>

        <div style={{ padding:'1.5rem', display:'flex', flexDirection:'column', gap:'1rem' }}>
          <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap', alignItems:'center' }}>
            <Badge label={CONSULTATION_TYPE_LABELS[c.type]} color={CONSULTATION_TYPE_COLORS[c.type] ?? '#555'} />
            <Badge label={CONSULTATION_STATUS_LABELS[c.status] ?? '-'} color={CONSULTATION_STATUS_COLORS[c.status] ?? '#999'} />
            <span style={{ fontSize:'0.82rem', color:'#666' }}>{c.durationMinutes} min</span>
            {c.videoMeetingLink && <a href={c.videoMeetingLink} target="_blank" rel="noopener noreferrer" style={{ fontSize:'0.82rem', color:'#1976d2', textDecoration:'underline' }}>Link video</a>}
          </div>

          {error && <div style={{ background:'#ffebee', border:'1px solid #ef9a9a', borderRadius:'6px', padding:'0.6rem 0.85rem', color:'#c62828', fontSize:'0.85rem' }}>Eroare: {error}</div>}

          <div>
            <label style={LBL}>Actualizeaza statusul</label>
            <select style={mkInp()} value={status} onChange={e => setStatus(Number(e.target.value))}>
              {Object.entries(CONSULTATION_STATUS_LABELS).map(([v,l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>

          <div>
            <label style={LBL}>Note consultatie</label>
            <textarea style={{ ...mkInp(), minHeight:'140px', resize:'vertical' }} placeholder="Rezumat discutie, concluzii, urmatorii pasi..." value={notes} onChange={e => setNotes(e.target.value)} />
            <div style={{ fontSize:'0.72rem', color:'#aaa', textAlign:'right' }}>{notes.length} caractere</div>
          </div>

          <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap' }}>
            {['Client interesat - follow-up necesar','Dosar deschis','Client nu s-a prezentat','Consultatie reprogramata'].map(t => (
              <button key={t} type="button" onClick={() => setNotes(n => n ? n + '\n' + t : t)}
                style={{ padding:'0.25rem 0.6rem', background:'#f0f4ff', border:'1px solid #c5cae9', borderRadius:'4px', cursor:'pointer', fontSize:'0.75rem', color:'#3949ab' }}>
                + {t}
              </button>
            ))}
          </div>
        </div>

        <div style={{ padding:'1rem 1.5rem', borderTop:'1px solid #e8eaf6', background:'#fafafa', borderRadius:'0 0 12px 12px', display:'flex', justifyContent:'space-between' }}>
          <button onClick={onClose} style={{ padding:'0.55rem 1.25rem', background:'#eee', border:'none', borderRadius:'6px', cursor:'pointer', fontSize:'0.9rem' }}>Inchide</button>
          <button onClick={handleSave} disabled={loading} style={{ padding:'0.55rem 1.5rem', background:loading?'#80deea':'#006064', color:'white', border:'none', borderRadius:'6px', cursor:loading?'not-allowed':'pointer', fontWeight:700, fontSize:'0.9rem' }}>
            {loading ? 'Se salveaza...' : 'Salveaza'}
          </button>
        </div>
      </div>
    </div>
  );
}
