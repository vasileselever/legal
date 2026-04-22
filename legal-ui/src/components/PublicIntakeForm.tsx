import { useState } from 'react';
import { leadService, PRACTICE_AREAS, LEAD_SOURCES } from '../api/leadService';

const URGENCY = [
  { value: 1, label: 'Scazuta - am timp' },
  { value: 2, label: 'Medie - in urmatoarele zile' },
  { value: 3, label: 'Ridicata - urgent' },
  { value: 4, label: 'Urgenta - acum (arest / termen maine)' },
];

export function PublicIntakeForm() {
  const [step, setStep] = useState<'form' | 'success' | 'error'>('form');
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [form, setForm] = useState({
    name: '', email: '', phone: '', practiceArea: 1, source: 1,
    description: '', urgency: 2, budgetRange: '',
    consentToMarketing: false, consentToDataProcessing: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (k: string, v: unknown) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: '' }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim())            e.name        = 'Numele este obligatoriu';
    if (!form.email.includes('@'))    e.email       = 'Email invalid';
    if (form.phone.replace(/\D/g,'').length < 10) e.phone = 'Telefon invalid (min 10 cifre)';
    if (form.description.length < 10) e.description = 'Descrieti problema (min 10 caractere)';
    if (!form.consentToDataProcessing) e.consent    = 'Trebuie sa fiti de acord cu prelucrarea datelor';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true); setSubmitError('');
    try {
      await leadService.createLead(form);
      setStep('success');
    } catch (err: any) {
      setSubmitError(err.response?.data?.message || err.message || 'Eroare la trimitere');
      setStep('error');
    } finally { setLoading(false); }
  };

  const inp = (hasErr: boolean): React.CSSProperties => ({
    width: '100%', padding: '0.75rem',
    border: '1px solid ' + (hasErr ? '#c62828' : '#ddd'),
    borderRadius: '6px', fontSize: '0.95rem', boxSizing: 'border-box',
    fontFamily: 'inherit',
  });
  const lbl: React.CSSProperties = { display: 'block', marginBottom: '0.35rem', fontWeight: 600, color: '#333', fontSize: '0.9rem' };
  const errT: React.CSSProperties = { color: '#c62828', fontSize: '0.8rem', marginTop: '0.25rem' };
  const row: React.CSSProperties = { marginBottom: '1rem' };

  if (step === 'success') return (
    <div style={{ maxWidth: '600px', margin: '4rem auto', padding: '2rem', textAlign: 'center', background: 'white', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
      <h2 style={{ color: '#2e7d32', marginBottom: '0.75rem' }}>Cerere trimisa cu succes!</h2>

      {/* Email confirmation notice */}
      <div style={{
        background: '#e3f2fd', border: '1px solid #90caf9', borderRadius: '10px',
        padding: '1rem 1.25rem', marginBottom: '1.5rem',
        display: 'flex', alignItems: 'flex-start', gap: '0.75rem', textAlign: 'left',
      }}>
        <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>📧</span>
        <div>
          <div style={{ fontWeight: 700, color: '#1565c0', marginBottom: '0.25rem', fontSize: '0.95rem' }}>
            Email de confirmare trimis!
          </div>
          <div style={{ color: '#1976d2', fontSize: '0.88rem', lineHeight: 1.6 }}>
            Am trimis un email de confirmare la <strong>{form.email}</strong>.
            Verificati inbox-ul (si folderul Spam daca nu il gasiti).
          </div>
        </div>
      </div>

      <p style={{ color: '#555', lineHeight: 1.7, marginBottom: '1.5rem' }}>
        Un avocat va va contacta in maxim <strong>24 de ore</strong> lucratoare.
      </p>

      <button onClick={() => {
        setStep('form');
        setForm({ name: '', email: '', phone: '', practiceArea: 1, source: 1, description: '', urgency: 2, budgetRange: '', consentToMarketing: false, consentToDataProcessing: false });
      }} style={{
        padding: '0.75rem 2rem', background: '#1976d2', color: 'white',
        border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '1rem', fontWeight: 600,
      }}>
        Trimite alt mesaj
      </button>
    </div>
  );

  return (
    <div style={{ maxWidth: '700px', margin: '2rem auto', padding: '0 1rem' }}>
      <div style={{ background: 'linear-gradient(135deg,#1976d2,#42a5f5)', color: 'white', padding: '2rem', borderRadius: '10px', marginBottom: '2rem', textAlign: 'center' }}>
        <h1 style={{ margin: '0 0 0.5rem', fontSize: '1.75rem' }}>Consultatie Gratuita</h1>
        <p style={{ margin: 0, opacity: 0.9 }}>Completati formularul si va contactam in 24h</p>
      </div>

      {step === 'error' && (
        <div style={{ background: '#ffebee', border: '1px solid #ef9a9a', borderRadius: '8px', padding: '1rem', marginBottom: '1.25rem', color: '#c62828' }}>
          ?? {submitError}
          <button onClick={() => setStep('form')} style={{ marginLeft: '1rem', background: 'none', border: 'none', color: '#c62828', cursor: 'pointer', fontWeight: 600, textDecoration: 'underline' }}>
            Incearca din nou
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ background: 'white', padding: '2rem', borderRadius: '10px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', ...row }}>
          <div>
            <label style={lbl}>Nume complet *</label>
            <input style={inp(!!errors.name)} placeholder="Ion Popescu" value={form.name} onChange={e => set('name', e.target.value)} />
            {errors.name && <p style={errT}>{errors.name}</p>}
          </div>
          <div>
            <label style={lbl}>Telefon *</label>
            <input style={inp(!!errors.phone)} placeholder="0721 000 000" value={form.phone} onChange={e => set('phone', e.target.value)} />
            {errors.phone && <p style={errT}>{errors.phone}</p>}
          </div>
        </div>

        <div style={row}>
          <label style={lbl}>Email *</label>
          <input style={inp(!!errors.email)} type="email" placeholder="email@exemplu.ro" value={form.email} onChange={e => set('email', e.target.value)} />
          {errors.email && <p style={errT}>{errors.email}</p>}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', ...row }}>
          <div>
            <label style={lbl}>Domeniu juridic *</label>
            <select style={inp(false)} value={form.practiceArea} onChange={e => set('practiceArea', Number(e.target.value))}>
              {PRACTICE_AREAS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>Urgenta *</label>
            <select style={inp(false)} value={form.urgency} onChange={e => set('urgency', Number(e.target.value))}>
              {URGENCY.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
            </select>
          </div>
        </div>

        <div style={row}>
          <label style={lbl}>Descrieti problema *</label>
          <textarea style={{ ...inp(!!errors.description), minHeight: '120px', resize: 'vertical' }}
            placeholder="Descrieti pe scurt situatia juridica si ce asistenta aveti nevoie..."
            value={form.description} onChange={e => set('description', e.target.value)} />
          {errors.description && <p style={errT}>{errors.description}</p>}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', ...row }}>
          <div>
            <label style={lbl}>Buget estimat</label>
            <input style={inp(false)} placeholder="ex: 1000-3000 RON" value={form.budgetRange} onChange={e => set('budgetRange', e.target.value)} />
          </div>
          <div>
            <label style={lbl}>Cum ne-ati gasit?</label>
            <select style={inp(false)} value={form.source} onChange={e => set('source', Number(e.target.value))}>
              {LEAD_SOURCES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        </div>

        {/* 🔒 GDPR Disclaimer 🔒 */}
        <div style={{ background: '#fafafa', border: '1px solid #e0e0e0', borderRadius: '10px', padding: '1.1rem', marginBottom: '1.25rem' }}>
          <div style={{ fontWeight: 700, color: '#1a237e', fontSize: '0.92rem', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            🔒 Informare privind prelucrarea datelor cu caracter personal (GDPR)
          </div>

          <div style={{ fontSize: '0.78rem', color: '#444', lineHeight: 1.65, background: '#fff', border: '1px solid #e8eaf6', borderRadius: '6px', padding: '0.85rem', maxHeight: '120px', overflowY: 'auto', marginBottom: '0.9rem' }}>
            <strong>Operator de date:</strong> Cabinetul de avocatura inregistrat conform Legii nr. 51/1995.<br />
            <strong>Date prelucrate:</strong> Nume, prenume, adresa de email, numarul de telefon, informatii privind situatia juridica descrisa.<br />
            <strong>Scopul prelucrarii:</strong> Evaluarea cererii de consultanta si contactarea dumneavoastra in vederea furnizarii de servicii juridice.<br />
            <strong>Temeiul juridic:</strong> Art. 6 alin. (1) lit. b) GDPR — masuri precontractuale la cererea persoanei vizate; art. 6 alin. (1) lit. c) GDPR — obligatii legale ale avocatului.<br />
            <strong>Destinatari:</strong> Datele nu sunt transmise tertilor, cu exceptia cazurilor prevazute de lege sau a expertilor implicati in dosar cu acordul dvs.<br />
            <strong>Perioada de stocare:</strong> Datele sunt pastrate pe durata relatiei contractuale si cel putin 5 ani ulterior, conform obligatiilor legale de arhivare.<br />
            <strong>Drepturile dvs. (GDPR):</strong> Aveti dreptul de acces, rectificare, stergere (in limitele obligatiilor legale), restrictionare, portabilitate si opozitie. Puteti exercita aceste drepturi scriind la adresa cabinetului sau la Autoritatea Nationala de Supraveghere (ANSPDCP — <em>www.dataprotection.ro</em>).
          </div>

          <label style={{ display: 'flex', gap: '0.65rem', alignItems: 'flex-start', cursor: 'pointer', marginBottom: '0.65rem' }}>
            <input type="checkbox" checked={form.consentToDataProcessing} onChange={e => set('consentToDataProcessing', e.target.checked)}
              style={{ marginTop: '0.25rem', flexShrink: 0, width: '16px', height: '16px' }} />
            <span style={{ fontSize: '0.85rem', color: '#222', lineHeight: 1.5 }}>
              <strong>* Obligatoriu —</strong> Am citit informarea de mai sus si <strong>sunt de acord cu prelucrarea datelor mele cu caracter personal</strong> in scopul obtinerii unei consultatii juridice, conform Regulamentului UE 2016/679 (GDPR).
            </span>
          </label>
          {errors.consent && <p style={errT}>{errors.consent}</p>}

          <label style={{ display: 'flex', gap: '0.65rem', alignItems: 'flex-start', cursor: 'pointer' }}>
            <input type="checkbox" checked={form.consentToMarketing} onChange={e => set('consentToMarketing', e.target.checked)}
              style={{ marginTop: '0.25rem', flexShrink: 0, width: '16px', height: '16px' }} />
            <span style={{ fontSize: '0.82rem', color: '#555', lineHeight: 1.5 }}>
              <em>Optional —</em> Sunt de acord sa primesc informatii despre servicii juridice, noutati legislative si oferte ale cabinetului. Imi pot retrage oricand consimtamantul.
            </span>
          </label>
        </div>

        <button type="submit" disabled={loading} style={{
          width: '100%', padding: '0.875rem',
          background: loading ? '#90caf9' : '#1976d2',
          color: 'white', border: 'none', borderRadius: '6px',
          fontSize: '1.05rem', fontWeight: 700,
          cursor: loading ? 'not-allowed' : 'pointer',
        }}>
          {loading ? '⏳ Se trimite...' : '📨 Trimite Cererea'}
        </button>
      </form>
    </div>
  );
}