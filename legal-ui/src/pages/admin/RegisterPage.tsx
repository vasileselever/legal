import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export function RegisterPage() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firmName: '', firmEmail: '', firmPhone: '',
    firstName: '', lastName: '', email: '', password: '', confirmPassword: '',
  });
  const [error, setError] = useState('');

  const s = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.firmName || !form.firstName || !form.lastName || !form.email || !form.password)
      { setError('Completati campurile obligatorii (*)'); return; }
    if (form.password !== form.confirmPassword)
      { setError('Parolele nu coincid'); return; }
    if (form.password.length < 8)
      { setError('Parola trebuie sa aiba cel putin 8 caractere'); return; }
    try {
      await register(form);
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'Eroare la inregistrare');
    }
  };

  const inp: React.CSSProperties = { width: '100%', padding: '0.65rem 0.75rem', border: '1px solid #ddd', borderRadius: '6px', fontSize: '0.95rem', boxSizing: 'border-box' };
  const lbl: React.CSSProperties = { display: 'block', marginBottom: '0.3rem', fontWeight: 600, color: '#333', fontSize: '0.88rem' };
  const sec: React.CSSProperties = { color: '#1976d2', margin: '1.25rem 0 0.75rem', fontSize: '0.95rem', fontWeight: 700, borderBottom: '1px solid #e3f2fd', paddingBottom: '0.4rem' };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f7fa', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <div style={{ background: 'white', padding: '2.5rem', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', width: '100%', maxWidth: '540px' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '2.5rem' }}>??</div>
          <h1 style={{ margin: '0.25rem 0 0', color: '#1976d2', fontSize: '1.6rem' }}>LegalRO</h1>
          <p style={{ color: '#666', margin: '0.4rem 0 0', fontSize: '0.9rem' }}>Inregistrare cabinet de avocatura</p>
        </div>

        {error && (
          <div style={{ background: '#ffebee', border: '1px solid #ef9a9a', borderRadius: '6px', padding: '0.75rem', marginBottom: '1rem', color: '#c62828', fontSize: '0.9rem' }}>
            ?? {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <p style={sec}>Date Cabinet</p>
          <div style={{ marginBottom: '0.875rem' }}>
            <label style={lbl}>Nume Cabinet *</label>
            <input style={inp} placeholder="Cabinet Avocatura Popescu" value={form.firmName} onChange={s('firmName')} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.875rem' }}>
            <div><label style={lbl}>Email Cabinet</label><input style={inp} type="email" placeholder="office@firma.ro" value={form.firmEmail} onChange={s('firmEmail')} /></div>
            <div><label style={lbl}>Telefon</label><input style={inp} placeholder="0721 000 000" value={form.firmPhone} onChange={s('firmPhone')} /></div>
          </div>

          <p style={sec}>Cont Administrator</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.875rem' }}>
            <div><label style={lbl}>Prenume *</label><input style={inp} placeholder="Ion" value={form.firstName} onChange={s('firstName')} /></div>
            <div><label style={lbl}>Nume *</label><input style={inp} placeholder="Popescu" value={form.lastName} onChange={s('lastName')} /></div>
          </div>
          <div style={{ marginBottom: '0.875rem' }}>
            <label style={lbl}>Email *</label>
            <input style={inp} type="email" placeholder="avocat@firma.ro" value={form.email} onChange={s('email')} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div><label style={lbl}>Parola * (min 8)</label><input style={inp} type="password" value={form.password} onChange={s('password')} /></div>
            <div><label style={lbl}>Confirma Parola *</label><input style={inp} type="password" value={form.confirmPassword} onChange={s('confirmPassword')} /></div>
          </div>

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '0.875rem',
            background: loading ? '#90caf9' : '#1976d2',
            color: 'white', border: 'none', borderRadius: '6px',
            fontSize: '1rem', fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}>
            {loading ? 'Se inregistreaza...' : 'Inregistrare Cabinet'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.25rem', color: '#666', fontSize: '0.9rem' }}>
          Aveti deja cont?{' '}
          <Link to="/admin/login" style={{ color: '#1976d2', fontWeight: 600 }}>Autentificati-va</Link>
        </p>
      </div>
    </div>
  );
}