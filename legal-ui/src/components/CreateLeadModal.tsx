import { useState, useEffect, useRef } from 'react';
import { authService } from '../api/authService';
import type { UserInfo } from '../api/authService';
import { leadService, PRACTICE_AREAS, LEAD_SOURCES, URGENCY_LABELS } from '../api/leadService';
import type { CreateLeadDto, PriorLead } from '../api/leadService';

interface Props { onClose: () => void; onCreated: (leadId: string) => void; }
type FE = Partial<Record<keyof CreateLeadDto | 'consent', string>>;

const EMPTY: CreateLeadDto = {
  name: '', email: '', phone: '', source: 1, practiceArea: 1,
  description: '', urgency: 2, budgetRange: '', preferredContactMethod: '',
  assignedTo: '', consentToMarketing: false, consentToDataProcessing: false,
};
const STEPS = ['Date contact', 'Detalii caz', 'Alocare'];

const PRACTICE_AREA_LABELS: Record<number, string> = Object.fromEntries(PRACTICE_AREAS.map(p => [p.value, p.label]));
const STATUS_LABELS: Record<number, string> = {
  1: 'Nou', 2: 'Contactat', 3: 'Calificat', 4: 'Consultatie', 5: 'Finalizat',
  6: 'Propunere', 7: 'Convertit', 8: 'Pierdut', 9: 'Descalificat',
};

const mkInp = (e = false): React.CSSProperties => ({
  width: '100%', padding: '0.55rem 0.75rem',
  border: '1px solid ' + (e ? '#ef5350' : '#ddd'),
  borderRadius: '6px', fontSize: '0.9rem', boxSizing: 'border-box' as const,
});
const LBL: React.CSSProperties = { display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#333', marginBottom: '0.3rem' };
const ERR: React.CSSProperties = { color: '#c62828', fontSize: '0.75rem', marginTop: '0.2rem' };
const G2: React.CSSProperties  = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' };

export function CreateLeadModal({ onClose, onCreated }: Props) {
  const [form, setForm]       = useState<CreateLeadDto>(EMPTY);
  const [errors, setErrors]   = useState<FE>({});
  const [step, setStep]       = useState(0);
  const [loading, setLoading] = useState(false);
  const [apiErr, setApiErr]   = useState('');
  const [emailSentTo, setEmailSentTo] = useState('');
  const [users, setUsers]     = useState<UserInfo[]>([]);
  const [usersLoaded, setUL]  = useState(false);

  // Prior-leads state
  const [priorLeads, setPriorLeads]       = useState<PriorLead[]>([]);
  const [lookingUp, setLookingUp]         = useState(false);
  const [postSubmitPrior, setPostSubmitPrior] = useState<PriorLead[]>([]);

  // Debounce lookup when email or phone changes
  const lookupTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerLookup = (email: string, phone: string) => {
    if (lookupTimer.current) clearTimeout(lookupTimer.current);
    const emailOk = /\S+@\S+\.\S+/.test(email);
    const phoneOk = phone.replace(/\D/g, '').length >= 7;
    if (!emailOk && !phoneOk) { setPriorLeads([]); return; }
    lookupTimer.current = setTimeout(async () => {
      setLookingUp(true);
      try {
        const results = await leadService.lookupByContact({
          email: emailOk ? email : undefined,
          phone: phoneOk ? phone : undefined,
        });
        setPriorLeads(results);
      } catch {
        setPriorLeads([]);
      } finally {
        setLookingUp(false);
      }
    }, 600);
  };

  const set = <K extends keyof CreateLeadDto>(k: K, v: CreateLeadDto[K]) => {
    setForm(f => {
      const next = { ...f, [k]: v };
      if (k === 'email' || k === 'phone') {
        triggerLookup(
          k === 'email' ? (v as string) : next.email,
          k === 'phone' ? (v as string) : next.phone,
        );
      }
      return next;
    });
    setErrors(e => ({ ...e, [k]: undefined }));
  };

  // Clean up timer on unmount
  useEffect(() => () => { if (lookupTimer.current) clearTimeout(lookupTimer.current); }, []);

  const loadUsers = async () => {
    if (usersLoaded) return;
    try { setUsers(await authService.getUsers()); setUL(true); } catch { /* non-fatal */ }
  };

  const validate = (): boolean => {
    const e: FE = {};
    if (step === 0) {
      if (!form.name.trim()) e.name = 'Obligatoriu';
      if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Email invalid';
      if (!form.phone.trim() || form.phone.length < 7) e.phone = 'Telefon invalid';
    }
    if (step === 1 && form.description.trim().length < 10) e.description = 'Cel putin 10 caractere';
    if (step === 2 && !form.consentToDataProcessing) e.consent = 'Consimtamantul GDPR este obligatoriu';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (!validate()) return; if (step === 1) loadUsers(); setStep(s => s + 1); };
  const back = () => setStep(s => s - 1);

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true); setApiErr('');
    try {
      const result = await leadService.createLead({
        ...form,
        assignedTo: form.assignedTo || undefined,
        budgetRange: form.budgetRange || undefined,
        preferredContactMethod: form.preferredContactMethod || undefined,
      });
      setEmailSentTo(form.email);
      if (result.hasPriorLeads) setPostSubmitPrior(result.priorLeads);
      setTimeout(() => onCreated(result.leadId), result.hasPriorLeads ? 3000 : 2200);
    } catch (er: any) { setApiErr(er.response?.data?.message ?? er.message ?? 'Eroare la salvare'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1100, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: 'white', borderRadius: '12px', width: '100%', maxWidth: '600px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 8px 40px rgba(0,0,0,0.2)' }}>

        {/* Header */}
        <div style={{ padding: '1.25rem 1.5rem', borderRadius: '12px 12px 0 0', background: 'linear-gradient(135deg,#1a237e,#3949ab)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ color: 'white', fontWeight: 700, fontSize: '1.1rem' }}>+ Lead Nou</div>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.82rem', marginTop: '0.15rem' }}>
              Pas {step + 1} din {STEPS.length}: <strong style={{ color: 'white' }}>{STEPS[step]}</strong>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
        </div>

        {/* Progress bar */}
        <div style={{ display: 'flex', height: '4px', background: '#e8eaf6' }}>
          {STEPS.map((_, i) => <div key={i} style={{ flex: 1, background: i <= step ? '#1a237e' : 'transparent', transition: 'background 0.25s' }} />)}
        </div>

        {/* API error */}
        {apiErr && (
          <div style={{ margin: '0.75rem 1.5rem 0', background: '#ffebee', border: '1px solid #ef9a9a', borderRadius: '6px', padding: '0.65rem 1rem', color: '#c62828', fontSize: '0.87rem' }}>
            ? {apiErr}
          </div>
        )}

        {/* Post-submit: email confirmation */}
        {emailSentTo && (
          <div style={{ margin: '0.75rem 1.5rem 0', background: '#e3f2fd', border: '1px solid #90caf9', borderRadius: '8px', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontSize: '1.2rem' }}>??</span>
            <div>
              <div style={{ fontWeight: 700, color: '#1565c0', fontSize: '0.88rem' }}>Email de confirmare trimis!</div>
              <div style={{ color: '#1976d2', fontSize: '0.82rem' }}>Mesaj trimis la <strong>{emailSentTo}</strong></div>
            </div>
          </div>
        )}

        {/* Post-submit: prior leads notice */}
        {postSubmitPrior.length > 0 && (
          <div style={{ margin: '0.75rem 1.5rem 0', background: '#fff8e1', border: '1px solid #ffe082', borderRadius: '8px', padding: '0.75rem 1rem' }}>
            <div style={{ fontWeight: 700, color: '#f57f17', fontSize: '0.88rem', marginBottom: '0.4rem' }}>
              ?? Contact cunoscut — {postSubmitPrior.length} lead{postSubmitPrior.length > 1 ? '-uri' : ''} anterioare
            </div>
            {postSubmitPrior.map(pl => (
              <div key={pl.id} style={{ fontSize: '0.82rem', color: '#555', paddingLeft: '0.25rem', marginTop: '0.2rem' }}>
                • {PRACTICE_AREA_LABELS[pl.practiceArea] ?? pl.practiceArea} — {STATUS_LABELS[pl.status] ?? pl.status} — {new Date(pl.createdAt).toLocaleDateString('ro-RO')}
                {pl.assignedToName ? ` (${pl.assignedToName})` : ''}
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ flex: 1, overflowY: 'auto' }}>
          <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* ?? Step 0: Contact details ?? */}
            {step === 0 && (<>
              <div style={G2}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={LBL}>Nume complet *</label>
                  <input style={mkInp(!!errors.name)} placeholder="Ion Popescu" value={form.name} onChange={e => set('name', e.target.value)} />
                  {errors.name && <p style={ERR}>{errors.name}</p>}
                </div>
                <div>
                  <label style={LBL}>Email *</label>
                  <input style={mkInp(!!errors.email)} type="email" placeholder="ion@exemplu.ro" value={form.email} onChange={e => set('email', e.target.value)} />
                  {errors.email && <p style={ERR}>{errors.email}</p>}
                </div>
                <div>
                  <label style={LBL}>Telefon *</label>
                  <input style={mkInp(!!errors.phone)} type="tel" placeholder="+40721000000" value={form.phone} onChange={e => set('phone', e.target.value)} />
                  {errors.phone && <p style={ERR}>{errors.phone}</p>}
                </div>
              </div>

              {/* Prior-leads banner — shown while looking up or when results found */}
              {lookingUp && (
                <div style={{ background: '#f5f5f5', borderRadius: '8px', padding: '0.6rem 0.85rem', fontSize: '0.82rem', color: '#888' }}>
                  ?? Se cauta lead-uri existente...
                </div>
              )}

              {!lookingUp && priorLeads.length > 0 && (
                <div style={{ background: '#fff8e1', border: '1px solid #ffe082', borderRadius: '8px', padding: '0.85rem 1rem' }}>
                  <div style={{ fontWeight: 700, color: '#f57f17', fontSize: '0.88rem', marginBottom: '0.5rem' }}>
                    ?? Contact cunoscut — {priorLeads.length} lead{priorLeads.length > 1 ? '-uri' : ''} anterioare pentru acest email/telefon
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#666', marginBottom: '0.6rem', lineHeight: 1.5 }}>
                    Aceeasi persoana poate deschide mai multe dosare (domenii diferite). Continua daca este un caz nou.
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    {priorLeads.map(pl => (
                      <div key={pl.id} style={{
                        display: 'flex', alignItems: 'center', gap: '0.6rem',
                        background: 'white', borderRadius: '6px', padding: '0.45rem 0.75rem',
                        border: '1px solid #ffe082', fontSize: '0.82rem',
                      }}>
                        <span style={{ fontSize: '1rem' }}>{pl.isConverted ? '?' : '??'}</span>
                        <span style={{ fontWeight: 600, color: '#333' }}>
                          {PRACTICE_AREA_LABELS[pl.practiceArea] ?? `Domeniu ${pl.practiceArea}`}
                        </span>
                        <span style={{
                          background: pl.status === 7 ? '#e8f5e9' : pl.status === 8 ? '#ffebee' : '#e8eaf6',
                          color:      pl.status === 7 ? '#2e7d32' : pl.status === 8 ? '#c62828' : '#3949ab',
                          borderRadius: '4px', padding: '0.1rem 0.45rem', fontSize: '0.75rem', fontWeight: 600,
                        }}>
                          {STATUS_LABELS[pl.status] ?? pl.status}
                        </span>
                        <span style={{ color: '#999', marginLeft: 'auto', whiteSpace: 'nowrap' }}>
                          {new Date(pl.createdAt).toLocaleDateString('ro-RO')}
                        </span>
                        {pl.assignedToName && (
                          <span style={{ color: '#666', fontSize: '0.78rem' }}>· {pl.assignedToName}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={G2}>
                <div>
                  <label style={LBL}>Sursa lead</label>
                  <select style={mkInp()} value={form.source} onChange={e => set('source', Number(e.target.value))}>
                    {LEAD_SOURCES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={LBL}>Contact preferat</label>
                  <select style={mkInp()} value={form.preferredContactMethod ?? ''} onChange={e => set('preferredContactMethod', e.target.value)}>
                    <option value="">Indiferent</option>
                    <option value="Phone">Telefon</option>
                    <option value="Email">Email</option>
                    <option value="WhatsApp">WhatsApp</option>
                  </select>
                </div>
              </div>
            </>)}

            {/* ?? Step 1: Case details ?? */}
            {step === 1 && (<>
              <div style={G2}>
                <div>
                  <label style={LBL}>Domeniu juridic *</label>
                  <select style={mkInp()} value={form.practiceArea} onChange={e => set('practiceArea', Number(e.target.value))}>
                    {PRACTICE_AREAS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={LBL}>Urgenta *</label>
                  <select style={mkInp()} value={form.urgency} onChange={e => set('urgency', Number(e.target.value))}>
                    {Object.entries(URGENCY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={LBL}>Descrieti problema *</label>
                <textarea style={{ ...mkInp(!!errors.description), minHeight: '110px', resize: 'vertical' }}
                  placeholder="Descrieti pe scurt situatia juridica..." value={form.description} onChange={e => set('description', e.target.value)} />
                {errors.description && <p style={ERR}>{errors.description}</p>}
                <div style={{ fontSize: '0.75rem', color: '#aaa', textAlign: 'right' }}>{form.description.length} caractere (min. 10)</div>
              </div>
              <div>
                <label style={LBL}>Buget estimat</label>
                <input style={mkInp()} placeholder="ex: 1.000 - 3.000 RON" value={form.budgetRange ?? ''} onChange={e => set('budgetRange', e.target.value)} />
              </div>
            </>)}

            {/* ?? Step 2: Assignment & consent ?? */}
            {step === 2 && (<>
              <div>
                <label style={LBL}>Asigneaza avocatul</label>
                <select style={mkInp()} value={form.assignedTo ?? ''} onChange={e => set('assignedTo', e.target.value || undefined)}>
                  <option value="">-- Neasignat (se aloca ulterior) --</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>)}
                </select>
                <p style={{ color: '#888', fontSize: '0.78rem', marginTop: '0.3rem' }}>Poti aloca un avocat mai tarziu din detaliile lead-ului.</p>
              </div>

              {/* Prior leads reminder on final step too */}
              {priorLeads.length > 0 && (
                <div style={{ background: '#fff8e1', border: '1px solid #ffe082', borderRadius: '8px', padding: '0.75rem 1rem', fontSize: '0.82rem' }}>
                  <span style={{ fontWeight: 700, color: '#f57f17' }}>?? Amintire:</span>
                  {' '}Acest contact are {priorLeads.length} lead{priorLeads.length > 1 ? '-uri' : ''} anterioare.
                  Lead-urile multiple pentru aceeasi persoana sunt permise si normale.
                </div>
              )}

              <div style={{ background: '#f8f9ff', border: '1px solid #e8eaf6', borderRadius: '8px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ fontWeight: 600, color: '#1a237e', fontSize: '0.88rem' }}>Consimtamant</div>
                <label style={{ display: 'flex', gap: '0.65rem', alignItems: 'flex-start', cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.consentToMarketing} onChange={e => set('consentToMarketing', e.target.checked)} style={{ marginTop: '0.2rem', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.85rem', color: '#555', lineHeight: 1.5 }}>Clientul accepta sa primeasca oferte si informatii (optional)</span>
                </label>
                <label style={{ display: 'flex', gap: '0.65rem', alignItems: 'flex-start', cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.consentToDataProcessing} onChange={e => set('consentToDataProcessing', e.target.checked)} style={{ marginTop: '0.2rem', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.85rem', color: '#555', lineHeight: 1.5 }}><strong>*</strong> Clientul accepta prelucrarea datelor cu caracter personal conform GDPR.</span>
                </label>
                {errors.consent && <p style={{ ...ERR, marginTop: 0 }}>Eroare: {errors.consent}</p>}
              </div>

              <div style={{ background: '#e8f5e9', border: '1px solid #a5d6a7', borderRadius: '8px', padding: '1rem', fontSize: '0.87rem' }}>
                <div style={{ fontWeight: 700, color: '#2e7d32', marginBottom: '0.6rem' }}>Rezumat lead</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '0.35rem 1.25rem' }}>
                  <span style={{ color: '#666' }}>Nume:</span><span style={{ fontWeight: 600 }}>{form.name}</span>
                  <span style={{ color: '#666' }}>Email:</span><span>{form.email}</span>
                  <span style={{ color: '#666' }}>Telefon:</span><span>{form.phone}</span>
                  <span style={{ color: '#666' }}>Domeniu:</span><span>{PRACTICE_AREAS.find(p => p.value === form.practiceArea)?.label}</span>
                  <span style={{ color: '#666' }}>Urgenta:</span><span>{URGENCY_LABELS[form.urgency]}</span>
                  <span style={{ color: '#666' }}>Sursa:</span><span>{LEAD_SOURCES.find(s => s.value === form.source)?.label}</span>
                </div>
              </div>
            </>)}
          </div>

          {/* Footer */}
          <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #e8eaf6', background: '#fafafa', borderRadius: '0 0 12px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button type="button" onClick={step === 0 ? onClose : back}
              style={{ padding: '0.55rem 1.25rem', background: '#eee', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9rem', color: '#333' }}>
              {step === 0 ? 'Anuleaza' : 'Inapoi'}
            </button>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              {STEPS.map((_, i) => <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: i === step ? '#1a237e' : i < step ? '#90caf9' : '#e0e0e0', transition: 'background 0.2s' }} />)}
            </div>
            {step < STEPS.length - 1
              ? <button type="button" onClick={next} style={{ padding: '0.55rem 1.5rem', background: '#1a237e', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}>Urmator</button>
              : <button type="submit" disabled={loading} style={{ padding: '0.55rem 1.5rem', background: loading ? '#a5d6a7' : '#2e7d32', color: 'white', border: 'none', borderRadius: '6px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '0.9rem' }}>
                  {loading ? 'Se salveaza...' : 'Creeaza Lead'}
                </button>
            }
          </div>
        </form>
      </div>
    </div>
  );
}
