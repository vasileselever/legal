import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { leadService } from '../api/leadService';
import { authService } from '../api/authService';
import type { LeadDetailItem, ConversationItem, LeadDocumentItem } from '../api/leadService';
import type { UserInfo } from '../api/authService';
import { Badge } from './ui/Badge';
import { Spinner } from './ui/Spinner';
import { DateTimePicker } from './ui/DateTimePicker';
import {
  LEAD_STATUS_LABELS, LEAD_STATUS_COLORS, URGENCY_LABELS,
  PRACTICE_AREAS, LEAD_SOURCES,
} from '../api/leadService';
import {
  CONSULTATION_TYPE_LABELS, CONSULTATION_STATUS_LABELS,
  CONSULTATION_STATUS_COLORS, consultationService,
} from '../api/consultationService';

interface Props { leadId: string; onClose: () => void; onStatusChanged: () => void; refreshTrigger?: number; } // ✅ ADDED: refreshTrigger

// Ensure API datetime strings (no timezone suffix) are parsed as UTC
const parseApiDate = (s: string): Date =>
  new Date(s.endsWith('Z') || s.includes('+') ? s : s + 'Z');

// Shared formatter used for consultation time display
const fmtDateTime = (d: string) =>
  parseApiDate(d).toLocaleString('ro-RO', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false });

const FIELDS = (lead: LeadDetailItem) => [
  ['Email', lead.email],
  ['Telefon', lead.phone],
  ['Domeniu', PRACTICE_AREAS.find(p => p.value === lead.practiceArea)?.label ?? '-'],
  ['Sursa', LEAD_SOURCES.find(s => s.value === lead.source)?.label ?? '-'],
  ['Buget', lead.budgetRange || '-'],
  ['Avocat Asignat', lead.assignedToName || 'Neasignat'],
  ['Data Crearii', parseApiDate(lead.createdAt).toLocaleDateString('ro-RO')],
  ['Ultima Activitate', lead.lastActivityAt ? parseApiDate(lead.lastActivityAt).toLocaleDateString('ro-RO') : '-'],
] as [string, string][];

const STATUS_FLOW = [1, 2, 3, 4, 5, 6, 7];
const STATUS_TERMINAL = [8, 9]; // Lost, Disqualified

const COLLAPSE_LENGTH = 120; // chars before truncating

function MessageBubble({ conv }: { conv: ConversationItem }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = conv.message.length > COLLAPSE_LENGTH;
  const displayed = isLong && !expanded ? conv.message.slice(0, COLLAPSE_LENGTH) + '…' : conv.message;

  return (
    <div style={{ display: 'flex', justifyContent: conv.isFromLead ? 'flex-start' : 'flex-end' }}>
      <div
        onClick={() => isLong && setExpanded(e => !e)}
        style={{
          maxWidth: '75%', padding: '0.6rem 0.85rem',
          borderRadius: conv.isFromLead ? '4px 12px 12px 12px' : '12px 4px 12px 12px',
          background: conv.isFromLead ? '#e8eaf6' : '#1a237e',
          color: conv.isFromLead ? '#1a237e' : 'white',
          fontSize: '0.88rem', lineHeight: 1.5,
          cursor: isLong ? 'pointer' : 'default',
        }}
      >
        <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{displayed}</div>
        {isLong && (
          <div style={{ fontSize: '0.72rem', fontWeight: 700, marginTop: '0.2rem', opacity: 0.8 }}>
            {expanded ? '▲ Restrânge' : '▼ Extinde'}
          </div>
        )}
        <div style={{ fontSize: '0.72rem', opacity: 0.65, marginTop: '0.25rem', textAlign: 'right' }}>
          {conv.sender && <span>{conv.sender} · </span>}
          {new Date(conv.messageTimestamp).toLocaleString('ro-RO', { hour12: false })}
        </div>
      </div>
    </div>
  );
}

export function LeadDetailModal({ leadId, onClose, onStatusChanged, refreshTrigger }: Props) {
  const [lead, setLead]                 = useState<LeadDetailItem | null>(null);
  const [convs, setConvs]               = useState<ConversationItem[]>([]);
  const [users, setUsers]               = useState<UserInfo[]>([]);
  const [loading, setLoading]           = useState(true);
  const [tab, setTab]                   = useState<'info'|'messages'|'consultations'|'documents'>('info');
  const [msg, setMsg]                   = useState('');
  const [sendingMsg, setSendingMsg]     = useState(false);
  const [error, setError]               = useState('');
  const [showConsForm, setShowConsForm] = useState(false);
  const [documents, setDocuments]       = useState<LeadDocumentItem[]>([]);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [consForm, setConsForm]         = useState<{ lawyerId: string; scheduledAt: string; durationMinutes: number; type: number; location: string; _showLawyerPicker?: boolean }>({ lawyerId: '', scheduledAt: '', durationMinutes: 30, type: 1, location: '' });
  const [notifyClientCons, setNotifyClientCons] = useState(true);

  const inp: React.CSSProperties = {
    width: '100%', padding: '0.5rem 0.65rem', border: '1px solid #ddd',
    borderRadius: '6px', fontSize: '0.9rem', boxSizing: 'border-box',
  };

  const load = async () => {
    setLoading(true);
    try {
      const [l, c, u, docs] = await Promise.all([
        leadService.getLead(leadId),
        leadService.getConversations(leadId),
        authService.getUsers(),
        leadService.getDocuments(leadId),
      ]);
      setLead(l); setConvs(c); setUsers(u); setDocuments(docs);
      // Pre-fill consultation lawyer from lead's assigned lawyer
      if (l.assignedTo) setConsForm(f => ({ ...f, lawyerId: l.assignedTo! }));
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [leadId]);
  
  // ✅ ADDED: Refresh when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger !== undefined) {
      load();
    }
  }, [refreshTrigger]);

  const handleStatusChange = async (newStatus: number) => {
    if (!lead) return;
    try {
      await leadService.updateLead(leadId, { status: newStatus });
      setLead({ ...lead, status: newStatus });
      onStatusChanged();
    } catch (e: any) { setError(e.message); }
  };

  const handleSendMessage = async () => {
    if (!msg.trim()) return;
    setSendingMsg(true);
    try {
      await leadService.sendMessage(leadId, msg.trim());
      setMsg('');
      setConvs(await leadService.getConversations(leadId));
    } catch (e: any) { setError(e.message); }
    finally { setSendingMsg(false); }
  };

  const handleScheduleConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      leadId,
      lawyerId: consForm.lawyerId,
      scheduledAt: new Date(consForm.scheduledAt).toISOString(),
      durationMinutes: consForm.durationMinutes,
      type: consForm.type,
      location: consForm.location || undefined,
      sendNotification: notifyClientCons,
    };
    try {
      await consultationService.create(payload);

      await handleStatusChange(4);
      setShowConsForm(false);
      setTab('consultations');
      await load();
    } catch (e: any) { setError(e.message); }
  };

  const navigate = useNavigate();

  // ── Convert to client: review/complete fiscal data first ──────────
  const [showConvertModal, setShowConvertModal] = useState(false);

  const handleConvert = () => {
    if (!lead) return;
    setShowConvertModal(true);
  };

  const handleConvertConfirm = async (dto: {
    isCorporate: boolean; address: string; city: string;
    fiscalCode: string; registrationCode: string; bank: string; bankAccount: string;
  }) => {
    if (!lead) return;
    setShowConvertModal(false);
    try {
      const clientId = await leadService.convertToClient(leadId, {
        clientName: lead.name,
        isCorporate: dto.isCorporate,
        address: dto.address || undefined,
        city: dto.city || undefined,
        fiscalCode: dto.fiscalCode || undefined,
        registrationCode: dto.registrationCode || undefined,
        bank: dto.bank || undefined,
        bankAccount: dto.bankAccount || undefined,
      });
      onStatusChanged();
      onClose();
      navigate('/admin/cases', {
        state: {
          openCreate: true,
          clientId,
          clientName: lead.name,
          practiceArea: lead.practiceArea,
          assignedTo: lead.assignedTo,
          assignedToName: lead.assignedToName,
        }
      });
    } catch (e: any) { setError(e.message); }
  };

  if (loading) return <Overlay onClose={onClose}><div style={{ padding: '3rem' }}><Spinner /></div></Overlay>;
  if (!lead) return null;

  return (
    <Overlay onClose={onClose}>
      {showConvertModal && (
        <ConvertToClientModal
          lead={lead}
          onCancel={() => setShowConvertModal(false)}
          onConfirm={handleConvertConfirm}
        />
      )}
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e8eaf6',
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
          background: 'linear-gradient(135deg,#1a237e,#3949ab)' }}>
          <div>
            <h2 style={{ margin: '0 0 0.25rem', color: 'white', fontSize: '1.25rem' }}>{lead.name}</h2>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <Badge label={LEAD_STATUS_LABELS[lead.status] ?? '-'} color={LEAD_STATUS_COLORS[lead.status] ?? '#999'} />
              <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.82rem' }}>
                Score: <strong style={{ color: 'white' }}>{lead.score}</strong>
              </span>
              <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.82rem' }}>{URGENCY_LABELS[lead.urgency]}</span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white',
            width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontSize: '1.1rem' }}>×</button>
        </div>

        {error && (
          <div style={{ background: '#ffebee', padding: '0.6rem 1.5rem', color: '#c62828', fontSize: '0.85rem' }}>⚠️ {error}</div>
        )}

        {/* Status pipeline */}
        <div style={{ padding: '0.75rem 1.5rem', background: '#f8f9ff',
          borderBottom: '1px solid #e8eaf6', display: 'flex', gap: '0.35rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {STATUS_FLOW.map(s => (
            <button key={s} onClick={() => handleStatusChange(s)} style={{
              padding: '0.25rem 0.65rem', borderRadius: '12px', cursor: 'pointer', fontSize: '0.76rem',
              fontWeight: lead.status === s ? 700 : 400, border: '1px solid ' + LEAD_STATUS_COLORS[s],
              background: lead.status === s ? LEAD_STATUS_COLORS[s] : 'white',
              color: lead.status === s ? 'white' : LEAD_STATUS_COLORS[s],
            }}>{LEAD_STATUS_LABELS[s]}</button>
          ))}

          {/* Separator */}
          <span style={{ color: '#ddd', margin: '0 0.2rem', fontWeight: 300, fontSize: '1rem' }}>|</span>

          {/* Terminal statuses: Lost & Disqualified */}
          {STATUS_TERMINAL.map(s => (
            <button key={s} onClick={() => handleStatusChange(s)} style={{
              padding: '0.25rem 0.65rem', borderRadius: '12px', cursor: 'pointer', fontSize: '0.76rem',
              fontWeight: lead.status === s ? 700 : 400, border: '1px solid ' + LEAD_STATUS_COLORS[s],
              background: lead.status === s ? LEAD_STATUS_COLORS[s] : 'white',
              color: lead.status === s ? 'white' : LEAD_STATUS_COLORS[s],
            }}>{LEAD_STATUS_LABELS[s]}</button>
          ))}

          {/* Convert button — hidden for terminal or already-converted leads */}
          {lead.status !== 7 && lead.status !== 8 && lead.status !== 9 && (
            <button onClick={handleConvert} style={{ marginLeft: 'auto', padding: '0.25rem 0.85rem',
              borderRadius: '12px', background: '#2e7d32', color: 'white',
              border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>
              Converteste
            </button>
          )}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '2px solid #e8eaf6', background: 'white' }}>
          {(['info', 'messages', 'consultations', 'documents'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '0.75rem 1.25rem', border: 'none', cursor: 'pointer',
              background: tab === t ? 'white' : 'transparent',
              borderBottom: tab === t ? '2px solid #1a237e' : '2px solid transparent',
              color: tab === t ? '#1a237e' : '#888', fontWeight: tab === t ? 700 : 400,
              fontSize: '0.88rem', marginBottom: '-2px',
            }}>
              {t === 'info' ? '📋 Informatii' : t === 'messages' ? '💬 Mesaje' : t === 'consultations' ? '📅 Consultatii' : `📎 Documente${documents.length > 0 ? ` (${documents.length})` : ''}`}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          {tab === 'info' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {FIELDS(lead).map(([k, v]) => (
                <div key={k} style={{ background: '#f8f9ff', borderRadius: '8px', padding: '0.75rem' }}>
                  <div style={{ fontSize: '0.75rem', color: '#888', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem' }}>{k}</div>
                  <div style={{ fontWeight: 600, color: '#1a237e', fontSize: '0.9rem' }}>{v || '-'}</div>
                </div>
              ))}
              <div style={{ gridColumn: '1/-1', background: '#f8f9ff', borderRadius: '8px', padding: '0.75rem' }}>
                <div style={{ fontSize: '0.75rem', color: '#888', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Descriere</div>
                <div style={{ color: '#333', lineHeight: 1.6, fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>{lead.description || '-'}</div>
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: 600, fontSize: '0.88rem', color: '#333' }}>
                  Asigneaza Avocat
                </label>
                <select style={{ ...inp, width: 'auto', minWidth: '220px' }}
                  value={lead.assignedTo || ''}
                  onChange={async e => {
                    try { 
                      await leadService.updateLead(leadId, { assignedTo: e.target.value || undefined }); 
                      await load();
                      onStatusChanged(); // ✅ ADDED: Notify parent to refresh the list
                    }
                    catch (err: any) { setError(err.message); }
                  }}>
                  <option value="">-- Neasignat --</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>)}
                </select>
              </div>
            </div>
          )}

          {tab === 'messages' && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
              {/* Scrollable message list */}
              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.6rem', minHeight: 0, paddingBottom: '0.5rem' }}>
                {convs.length === 0
                  ? <div style={{ textAlign: 'center', color: '#aaa', padding: '2rem' }}>📭 Niciun mesaj</div>
                  : convs.map(c => (
                    <MessageBubble key={c.id} conv={c} />
                  ))
                }
              </div>
              {/* Pinned compose box */}
              <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid #e8eaf6', flexShrink: 0 }}>
                <textarea value={msg} onChange={e => setMsg(e.target.value)}
                  placeholder="Scrieti un mesaj... (Ctrl+Enter pentru trimitere)"
                  style={{ ...inp, flex: 1, minHeight: '60px', resize: 'vertical' }}
                  onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) handleSendMessage(); }} />
                <button onClick={handleSendMessage} disabled={sendingMsg || !msg.trim()} style={{
                  padding: '0 1rem', background: sendingMsg ? '#90caf9' : '#1a237e',
                  color: 'white', border: 'none', borderRadius: '6px',
                  cursor: sendingMsg ? 'not-allowed' : 'pointer', fontWeight: 600,
                }}>
                  {sendingMsg ? '...' : 'Trimite'}
                </button>
              </div>
            </div>
          )}

          {tab === 'consultations' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', color: '#1a237e' }}>Consultatii</h3>
                <button onClick={() => setShowConsForm(f => !f)} style={{
                  padding: '0.45rem 1rem', background: '#1a237e', color: 'white',
                  border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.88rem',
                }}>
                  {showConsForm ? 'Anuleaza' : '+ Programeaza'}
                </button>
              </div>

              {showConsForm && (
                <form onSubmit={handleScheduleConsultation} style={{
                  background: '#f0f4ff', borderRadius: '8px', padding: '1rem', marginBottom: '1rem',
                  display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem',
                }}>
                  <div style={{ gridColumn: '1/-1' }}>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.25rem' }}>Avocat *</label>
                    {consForm.lawyerId && !consForm._showLawyerPicker ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.45rem 0.75rem', background: '#f5f7ff', border: '1px solid #c5cae9', borderRadius: '6px' }}>
                        <span style={{ fontWeight: 600, color: '#1a237e', fontSize: '0.9rem' }}>
                          {users.find(u => u.id === consForm.lawyerId)?.firstName + ' ' + users.find(u => u.id === consForm.lawyerId)?.lastName}
                        </span>
                        <button type="button" onClick={() => setConsForm(f => ({ ...f, _showLawyerPicker: true } as any))}
                          style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#5c6bc0', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, padding: 0 }}>
                          Schimba
                        </button>
                      </div>
                    ) : (
                      <select style={inp} required value={consForm.lawyerId}
                        onChange={e => setConsForm(f => ({ ...f, lawyerId: e.target.value, _showLawyerPicker: false } as any))}>
                        <option value="">Selectati avocatul</option>
                        {users.map(u => <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>)}
                      </select>
                    )}
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.25rem' }}>Data si Ora *</label>
                    <DateTimePicker
                      value={consForm.scheduledAt}
                      onChange={v => setConsForm(f => ({ ...f, scheduledAt: v }))}
                      hasError={false}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.25rem' }}>Durata</label>
                    <select style={inp} value={consForm.durationMinutes} onChange={e => setConsForm(f => ({ ...f, durationMinutes: Number(e.target.value) }))}>
                      {[15, 30, 45, 60, 90, 120].map(d => <option key={d} value={d}>{d} min</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.25rem' }}>Tip</label>
                    <select style={inp} value={consForm.type} onChange={e => setConsForm(f => ({ ...f, type: Number(e.target.value) }))}>
                      {Object.entries(CONSULTATION_TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.25rem' }}>Locatie</label>
                    <input style={inp} placeholder="Adresa sau link video" value={consForm.location} onChange={e => setConsForm(f => ({ ...f, location: e.target.value }))} />
                  </div>

                  {/* Notification checkbox */}
                  <div style={{ gridColumn: '1/-1' }}>
                    <label style={{
                      display: 'flex', alignItems: 'center', gap: '0.65rem',
                      padding: '0.6rem 0.85rem',
                      background: notifyClientCons ? '#e3f2fd' : '#f5f5f5',
                      border: `1px solid ${notifyClientCons ? '#90caf9' : '#e0e0e0'}`,
                      borderRadius: '8px', cursor: 'pointer',
                      transition: 'background 0.15s, border-color 0.15s',
                      userSelect: 'none',
                    }}>
                      <input
                        type="checkbox"
                        checked={notifyClientCons}
                        onChange={e => setNotifyClientCons(e.target.checked)}
                        style={{ width: '16px', height: '16px', accentColor: '#1976d2', cursor: 'pointer', flexShrink: 0 }}
                      />
                      <span style={{ fontSize: '0.88rem', fontWeight: 600, color: notifyClientCons ? '#1565c0' : '#666' }}>
                        📧 Trimite mail de notificare
                      </span>
                      {notifyClientCons && lead?.email && (
                        <span style={{ fontSize: '0.78rem', color: '#1976d2', marginLeft: 'auto', whiteSpace: 'nowrap' }}>
                          → {lead.email}
                        </span>
                      )}
                      {!notifyClientCons && (
                        <span style={{ fontSize: '0.78rem', color: '#aaa', marginLeft: 'auto', fontStyle: 'italic' }}>
                          emailul nu va fi trimis
                        </span>
                      )}
                    </label>
                  </div>

                  <div style={{ gridColumn: '1/-1', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <button type="button" onClick={() => setShowConsForm(false)} style={{ padding: '0.5rem 1rem', background: '#eee', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Anuleaza</button>
                    <button type="submit" style={{ padding: '0.5rem 1.25rem', background: '#1a237e', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>Salveaza</button>
                  </div>
                </form>
              )}

              {!lead.consultations || lead.consultations.length === 0
                ? <div style={{ textAlign: 'center', color: '#aaa', padding: '2rem' }}>📭 Niciuna consultatie programata</div>
                : lead.consultations.map((c: any) => (
                  <div key={c.id} style={{ background: 'white', border: '1px solid #e8eaf6', borderRadius: '8px',
                    padding: '0.875rem', marginBottom: '0.6rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600, color: '#1a237e', fontSize: '0.9rem' }}>
                        {fmtDateTime(c.scheduledAt)} · {c.durationMinutes} min · {CONSULTATION_TYPE_LABELS[c.type]}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: '#666', marginTop: '0.2rem' }}>
                        {c.lawyerName}{c.location ? ' · ' + c.location : ''}
                      </div>
                    </div>
                    <Badge label={CONSULTATION_STATUS_LABELS[c.status] ?? '-'} color={CONSULTATION_STATUS_COLORS[c.status] ?? '#999'} />
                  </div>
                ))
              }
            </div>
          )}

          {/* ── Documents tab ── */}
          {tab === 'documents' && (
            <div>
              {/* Upload button */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.55rem 1.25rem', background: '#1a237e', color: 'white',
                  borderRadius: '6px', cursor: uploadingDoc ? 'not-allowed' : 'pointer',
                  fontSize: '0.9rem', fontWeight: 600, opacity: uploadingDoc ? 0.6 : 1,
                }}>
                  {uploadingDoc ? '⏳ Se incarca...' : '📎 Adauga document'}
                  <input type="file" style={{ display: 'none' }} disabled={uploadingDoc}
                    onChange={async e => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setUploadingDoc(true);
                      try {
                        const doc = await leadService.uploadDocument(leadId, file);
                        setDocuments(d => [doc, ...d]);
                      } catch (err: any) {
                        setError(err.message ?? 'Upload failed');
                      } finally {
                        setUploadingDoc(false);
                        e.target.value = '';
                      }
                    }}
                  />
                </label>
              </div>

              {documents.length === 0
                ? <div style={{ textAlign: 'center', color: '#aaa', padding: '2rem' }}>📭 Niciun document atasat</div>
                : documents.map(doc => (
                  <div key={doc.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: 'white', border: '1px solid #e8eaf6', borderRadius: '8px',
                    padding: '0.75rem 1rem', marginBottom: '0.5rem',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                      <span style={{ fontSize: '1.4rem' }}>📄</span>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 600, color: '#1a237e', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {doc.fileName}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#888', marginTop: '0.1rem' }}>
                          {(doc.fileSize / 1024).toFixed(1)} KB · {new Date(doc.createdAt).toLocaleDateString('ro-RO')}
                          {doc.description && ` · ${doc.description}`}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                      <a
                        href={leadService.getDocumentDownloadUrl(leadId, doc.id)}
                        download={doc.fileName}
                        style={{ padding: '0.35rem 0.75rem', background: '#e8f5e9', color: '#2e7d32', borderRadius: '5px', fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none' }}
                      >
                        ⬇ Descarca
                      </a>
                      <button
                        onClick={async () => {
                          if (!window.confirm(`Sterge ${doc.fileName}?`)) return;
                          try {
                            await leadService.deleteDocument(leadId, doc.id);
                            setDocuments(d => d.filter(x => x.id !== doc.id));
                          } catch (err: any) { setError(err.message ?? 'Delete failed'); }
                        }}
                        style={{ padding: '0.35rem 0.75rem', background: '#ffebee', color: '#c62828', border: 'none', borderRadius: '5px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}
                      >
                        🗑 Sterge
                      </button>
                    </div>
                  </div>
                ))
              }
            </div>
          )}
        </div>
      </div>
    </Overlay>
  );
}

function Overlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000,
      display: 'flex', alignItems: 'stretch', justifyContent: 'flex-end' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ width: '100%', maxWidth: '780px', background: 'white',
        display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', boxShadow: '-4px 0 24px rgba(0,0,0,0.15)' }}>
        {children}
      </div>
    </div>
  );
}

// ── ConvertToClientModal ─────────────────────────────────────────────
function ConvertToClientModal({ lead, onCancel, onConfirm }: {
  lead: LeadDetailItem;
  onCancel: () => void;
  onConfirm: (dto: { isCorporate: boolean; address: string; city: string; fiscalCode: string; registrationCode: string; bank: string; bankAccount: string }) => void;
}) {
  const [isCorporate,      setIsCorporate]      = useState(lead.isCorporate ?? false);
  const [address,          setAddress]          = useState(lead.address ?? '');
  const [city,             setCity]             = useState(lead.city ?? '');
  const [fiscalCode,       setFiscalCode]       = useState(lead.fiscalCode ?? '');
  const [registrationCode, setRegistrationCode] = useState(lead.registrationCode ?? '');
  const [bank,             setBank]             = useState(lead.bank ?? '');
  const [bankAccount,      setBankAccount]      = useState(lead.bankAccount ?? '');
  const [gdprAccepted,     setGdprAccepted]     = useState(lead.consentToDataProcessing ?? false);
  const [gdprErr,          setGdprErr]          = useState('');

  const inp: React.CSSProperties = { width: '100%', padding: '0.45rem 0.65rem', border: '1px solid #ddd', borderRadius: '6px', fontSize: '0.88rem', boxSizing: 'border-box' };
  const lbl: React.CSSProperties = { display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#444', marginBottom: '0.2rem' };
  const G2: React.CSSProperties  = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' };

  const handleConfirm = () => {
    if (!gdprAccepted) { setGdprErr('Consimtamantul GDPR este obligatoriu pentru a crea fisa clientului.'); return; }
    onConfirm({ isCorporate, address, city, fiscalCode, registrationCode, bank, bankAccount });
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200 }}
      onClick={onCancel}>
      <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', width: '540px', maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 8px 40px rgba(0,0,0,0.25)' }}
        onClick={e => e.stopPropagation()}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ margin: 0, fontSize: '1rem', color: '#1a237e' }}>⚖️ Convertire in client — {lead.name}</h3>
          <button onClick={onCancel} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: '#888' }}>✕</button>
        </div>

        <p style={{ fontSize: '0.83rem', color: '#555', margin: '0 0 1.1rem', lineHeight: 1.6 }}>
          Verificati si completati datele clientului. Acestea vor fi salvate in fisa clientului si folosite la facturare.
        </p>

        {/* Type toggle */}
        <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1rem' }}>
          {[{ v: false, label: '👤 Persoana fizica' }, { v: true, label: '🏢 Firma / PJ' }].map(({ v, label }) => (
            <button key={String(v)} type="button" onClick={() => setIsCorporate(v)} style={{
              flex: 1, padding: '0.5rem', border: '2px solid', borderRadius: '7px', cursor: 'pointer',
              fontWeight: 600, fontSize: '0.85rem',
              borderColor: isCorporate === v ? '#1a237e' : '#ddd',
              background: isCorporate === v ? '#e8eaf6' : '#fafafa',
              color: isCorporate === v ? '#1a237e' : '#666',
            }}>{label}</button>
          ))}
        </div>

        {/* Common fields */}
        <div style={G2}>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={lbl}>Adresa</label>
            <input style={inp} value={address} onChange={e => setAddress(e.target.value)} placeholder="Str. Exemplu nr. 1" />
          </div>
          <div>
            <label style={lbl}>Oras / Localitate</label>
            <input style={inp} value={city} onChange={e => setCity(e.target.value)} placeholder="Bucuresti" />
          </div>
        </div>

        {/* Firm-only fiscal fields */}
        {isCorporate && (
          <div style={{ background: '#f0f4ff', border: '1px solid #c5cae9', borderRadius: '8px', padding: '1rem', marginTop: '0.9rem' }}>
            <div style={{ fontWeight: 700, color: '#1a237e', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.65rem' }}>Date fiscale firma</div>
            <div style={G2}>
              <div>
                <label style={lbl}>CUI / CIF</label>
                <input style={inp} value={fiscalCode} onChange={e => setFiscalCode(e.target.value)} placeholder="RO12345678" />
              </div>
              <div>
                <label style={lbl}>Nr. Reg. Comertului</label>
                <input style={inp} value={registrationCode} onChange={e => setRegistrationCode(e.target.value)} placeholder="J40/1234/2020" />
              </div>
              <div>
                <label style={lbl}>Banca</label>
                <input style={inp} value={bank} onChange={e => setBank(e.target.value)} placeholder="BCR / BRD / ING..." />
              </div>
              <div>
                <label style={lbl}>IBAN</label>
                <input style={inp} value={bankAccount} onChange={e => setBankAccount(e.target.value)} placeholder="RO49AAAA1B31007593840000" />
              </div>
            </div>
          </div>
        )}

        {/* ── GDPR ── */}
        <div style={{ background: '#fafafa', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '1rem', marginTop: '1rem' }}>
          <div style={{ fontWeight: 700, color: '#1a237e', fontSize: '0.82rem', marginBottom: '0.55rem' }}>
            🔒 Informare GDPR
          </div>
          <div style={{ fontSize: '0.76rem', color: '#444', lineHeight: 1.6, background: '#fff', border: '1px solid #e8eaf6', borderRadius: '6px', padding: '0.7rem', maxHeight: '100px', overflowY: 'auto', marginBottom: '0.75rem' }}>
            {isCorporate ? (<>
              <strong>Operator:</strong> Cabinetul de avocatura.<br />
              <strong>Date prelucrate:</strong> Denumire, CUI, nr. Reg. Comertului, adresa sediului, date de contact ale reprezentantilor, informatii referitoare la situatia juridica.<br />
              <strong>Scop:</strong> Furnizarea de servicii juridice si gestionarea relatiei contractuale.<br />
              <strong>Temei:</strong> Art. 6 alin. (1) lit. b) si c) GDPR (executarea contractului; obligatii legale — Legea nr. 51/1995).<br />
              <strong>Stocare:</strong> Pe durata contractului + minim 5 ani. <strong>Drepturi:</strong> Acces, rectificare, stergere (cu exceptiile legale), opozitie — la adresa cabinetului sau ANSPDCP (dataprotection.ro).
            </>) : (<>
              <strong>Operator:</strong> Cabinetul de avocatura.<br />
              <strong>Date prelucrate:</strong> Nume, adresa, date de contact, informatii privind situatia juridica.<br />
              <strong>Scop:</strong> Furnizarea de servicii juridice si gestionarea relatiei contractuale.<br />
              <strong>Temei:</strong> Art. 6 alin. (1) lit. b) si c) GDPR (executarea contractului; obligatii legale — Legea nr. 51/1995).<br />
              <strong>Stocare:</strong> Pe durata contractului + minim 5 ani. <strong>Drepturi:</strong> Acces, rectificare, stergere (cu exceptiile legale), opozitie — la adresa cabinetului sau ANSPDCP (dataprotection.ro).
            </>)}
          </div>
          <label style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start', cursor: 'pointer' }}>
            <input type="checkbox" checked={gdprAccepted} onChange={e => { setGdprAccepted(e.target.checked); setGdprErr(''); }}
              style={{ marginTop: '0.25rem', flexShrink: 0, width: '15px', height: '15px' }} />
            <span style={{ fontSize: '0.82rem', color: '#222', lineHeight: 1.5 }}>
              <strong>* Obligatoriu —</strong> Clientul a fost informat si <strong>si-a dat consimtamantul</strong> pentru prelucrarea datelor cu caracter personal conform GDPR.
            </span>
          </label>
          {gdprErr && <p style={{ color: '#c62828', fontSize: '0.76rem', margin: '0.35rem 0 0' }}>{gdprErr}</p>}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
          <button onClick={onCancel} style={{ padding: '0.5rem 1.1rem', background: '#eee', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.88rem' }}>Anuleaza</button>
          <button onClick={handleConfirm}
            style={{ padding: '0.5rem 1.25rem', background: '#1a237e', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 700, fontSize: '0.88rem' }}>
            ✓ Converteste in client
          </button>
        </div>
      </div>
    </div>
  );
}
