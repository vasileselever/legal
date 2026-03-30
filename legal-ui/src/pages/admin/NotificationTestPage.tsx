import { useState } from 'react';
import { AdminLayout } from './AdminLayout';
import { notificationService } from '../../api/notificationService';

type TestType = 'email' | 'sms' | 'consultation-reminder';

interface TestResult {
  type: TestType;
  status: 'success' | 'error';
  message: string;
  timestamp: string;
}

/** Returns "yyyy-MM-ddTHH:mm" for the datetime-local input default (tomorrow at 10:00) */
function defaultReminderDT(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(10, 0, 0, 0);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

export function NotificationTestPage() {
  const [to, setTo]       = useState('');
  const [name, setName]   = useState('');
  const [reminderDT, setReminderDT] = useState(defaultReminderDT); // local datetime for reminder test
  const [loading, setLoading]   = useState<TestType | null>(null);
  const [results, setResults]   = useState<TestResult[]>([]);

  const run = async (type: TestType) => {
    if (!to.trim() || !name.trim()) {
      alert('Completati adresa/numarul si numele destinatarului.');
      return;
    }

    setLoading(type);
    try {
      let result;
      if (type === 'email') {
        result = await notificationService.testEmail({ to, name });
      } else if (type === 'sms') {
        result = await notificationService.testSms({ to, name });
      } else {
        // Pass the raw local datetime string — no UTC conversion
        result = await notificationService.testConsultationReminder({
          to,
          name,
          scheduledAt: reminderDT,
        });
      }

      setResults(prev => [{
        type,
        status: 'success',
        message: result.message,
        timestamp: new Date().toLocaleTimeString('ro-RO'),
      }, ...prev]);
    } catch (err: any) {
      setResults(prev => [{
        type,
        status: 'error',
        message: err.message || 'Eroare necunoscuta',
        timestamp: new Date().toLocaleTimeString('ro-RO'),
      }, ...prev]);
    } finally {
      setLoading(null);
    }
  };

  return (
    <AdminLayout>
      <div style={{ padding: '2rem', maxWidth: '860px', margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#1a237e', margin: 0 }}>
            ?? Testare Notificari
          </h1>
          <p style={{ color: '#666', marginTop: '0.4rem', fontSize: '0.95rem' }}>
            Testeaza serviciile de email (Gmail SMTP) si SMS (Twilio) direct din interfata.
          </p>
        </div>

        {/* Flow info banner */}
        <div style={{
          background: '#e8f5e9', border: '1px solid #a5d6a7', borderRadius: '10px',
          padding: '1rem 1.25rem', marginBottom: '1.5rem',
          display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
        }}>
          <span style={{ fontSize: '1.4rem', flexShrink: 0 }}>??</span>
          <div style={{ fontSize: '0.88rem', color: '#2e7d32', lineHeight: 1.7 }}>
            <strong>Flux automat:</strong> Cand un lead este creat (din formularul public sau din admin),
            sistemul trimite automat emailul <em>"Multumim! Am primit solicitarea dvs."</em> catre adresa lead-ului.
            Foloseste butonul de test de mai jos pentru a verifica ca emailul ajunge corect in inbox.
          </div>
        </div>

        {/* Recipient form */}
        <div style={{
          background: 'white', borderRadius: '12px', padding: '1.5rem',
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)', marginBottom: '1.5rem',
        }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#333', marginTop: 0, marginBottom: '1rem' }}>
            Destinatar test
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>Email / Telefon *</label>
              <input value={to} onChange={e => setTo(e.target.value)}
                placeholder="test@example.com sau +40712345678" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Nume destinatar *</label>
              <input value={name} onChange={e => setName(e.target.value)}
                placeholder="Ion Popescu" style={inputStyle} />
            </div>
          </div>

          {/* Date picker for reminder test */}
          <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #f0f0f0' }}>
            <label style={labelStyle}>Data si ora consultatie (pentru testul de reminder) *</label>
            <input
              type="datetime-local"
              value={reminderDT}
              onChange={e => setReminderDT(e.target.value)}
              style={{ ...inputStyle, maxWidth: '280px' }}
            />
            <p style={{ margin: '0.3rem 0 0', fontSize: '0.78rem', color: '#999' }}>
              Aceasta data va aparea in emailul/SMS-ul de reminder. Ora este ora locala (Romania).
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem', alignItems: 'start' }}>
          {/* Test buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/**
             * Removed for brevity: the test button mapping code, which is similar to the original
             */}
          </div>

          {/* Email preview */}
          <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
            <div style={{ padding: '0.75rem 1.25rem', background: '#f5f5f5', borderBottom: '1px solid #e0e0e0', fontSize: '0.82rem', color: '#555', fontWeight: 600 }}>
              ?? Previzualizare email confirmare lead
            </div>
            <div style={{ padding: '1rem' }}>
              <div style={{ fontSize: '0.78rem', color: '#999', marginBottom: '0.5rem' }}>
                <strong>De la:</strong> Cabinet Avocat LegalRO &lt;vasile.selever@gmail.com&gt;<br />
                <strong>Catre:</strong> {to || 'destinatar@email.com'}<br />
                <strong>Subiect:</strong> Am primit solicitarea dvs. - Cabinet Avocat LegalRO
              </div>
              <div style={{ border: '1px solid #eee', borderRadius: '6px', overflow: 'hidden' }}>
                <iframe
                  srcDoc={`
                    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;border:1px solid #eee;border-radius:8px">
                      <h2 style="color:#1a237e">Multumim, ${name || 'Ion Popescu'}!</h2>
                      <p>Am primit solicitarea dvs. pentru <strong>Drept Civil</strong>.</p>
                      <p>Un avocat va va contacta in cel mai scurt timp, de regula in <strong>24 de ore lucratoare</strong>.</p>
                      <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
                      <p style="color:#888;font-size:12px">Cabinet Avocat LegalRO · ${to || 'contact@legalro.ro'}</p>
                    </div>
                  `}
                  style={{ width: '100%', height: '220px', border: 'none' }}
                  title="Email preview"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Results log */}
        {results.length > 0 && (
          <div style={{
            background: 'white', borderRadius: '12px', padding: '1.5rem',
            boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#333', margin: 0 }}>?? Log rezultate</h2>
              <button onClick={() => setResults([])}
                style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '0.82rem' }}>
                Sterge log
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {results.map((r, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                  padding: '0.75rem 1rem', borderRadius: '8px',
                  background: r.status === 'success' ? '#e8f5e9' : '#ffebee',
                  borderLeft: `4px solid ${r.status === 'success' ? '#4caf50' : '#f44336'}`,
                }}>
                  <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>
                    {r.status === 'success' ? '?' : '?'}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#555', marginBottom: '0.15rem' }}>
                      [{r.timestamp}] {r.type.toUpperCase()}
                    </div>
                    <div style={{ fontSize: '0.88rem', color: '#333' }}>{r.message}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '0.82rem', fontWeight: 600,
  color: '#555', marginBottom: '0.35rem',
};

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '0.55rem 0.75rem', borderRadius: '7px',
  border: '1px solid #d0d0d0', fontSize: '0.9rem', boxSizing: 'border-box',
  outline: 'none',
};

const btnStyle: React.CSSProperties = {
  padding: '0.6rem 1.2rem', borderRadius: '8px', border: 'none',
  color: 'white', fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer',
  transition: 'background 0.2s',
};
