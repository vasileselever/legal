import { useState, useEffect } from 'react';
import { AdminLayout } from './AdminLayout';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { ErrorBanner } from '../../components/ui/ErrorBanner';
import { PageHeader } from '../../components/ui/PageHeader';
import { authService } from '../../api/authService';
import { apiClient } from '../../api/apiClient';
import type { UserInfo } from '../../api/authService';

const ROLE_LABELS: Record<number, string> = { 0:'Avocat', 1:'Admin', 2:'Paralegal', 3:'Asistent' };
const ROLE_COLORS: Record<number, string> = { 0:'#1976d2', 1:'#c62828', 2:'#2e7d32', 3:'#7b1fa2' };

export function UsersPage() {
  const [users, setUsers]         = useState<UserInfo[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [showInvite, setShowInvite] = useState(false);
  const [invite, setInvite]       = useState({ firstName:'', lastName:'', email:'', role: 0 });
  const [inviting, setInviting]   = useState(false);
  const [inviteError, setInviteError] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try { setUsers(await authService.getUsers()); }
    catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviting(true); setInviteError(''); setInviteSuccess('');
    try {
      await apiClient.post('/auth/invite', invite);
      setInviteSuccess('Utilizatorul ' + invite.email + ' a fost invitat!');
      setInvite({ firstName:'', lastName:'', email:'', role:0 });
      setShowInvite(false);
      await load();
    } catch (e: any) {
      setInviteError(e.response?.data?.message || e.message);
    } finally { setInviting(false); }
  };

  const inp: React.CSSProperties = {
    width: '100%', padding: '0.6rem 0.75rem', border: '1px solid #ddd',
    borderRadius: '6px', fontSize: '0.9rem', boxSizing: 'border-box',
  };

  return (
    <AdminLayout>
      <PageHeader title="Utilizatori" subtitle={users.length + ' utilizatori activi'}
        action={
          <button onClick={() => setShowInvite(f => !f)} style={{
            padding: '0.55rem 1.25rem', background: '#1a237e', color: 'white',
            border: 'none', borderRadius: '7px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem',
          }}>
            {showInvite ? '? Inchide' : '+ Invita Utilizator'}
          </button>
        }
      />

      {error && <ErrorBanner message={error} onRetry={load} />}

      <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {inviteSuccess && (
          <div style={{ background: '#e8f5e9', border: '1px solid #a5d6a7', borderRadius: '8px',
            padding: '0.875rem', color: '#2e7d32', fontWeight: 600 }}>
            ? {inviteSuccess}
          </div>
        )}

        {showInvite && (
          <Card style={{ padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1.25rem', color: '#1a237e', fontSize: '1rem' }}>Invita Utilizator Nou</h3>
            {inviteError && (
              <div style={{ background: '#ffebee', border: '1px solid #ef9a9a', borderRadius: '6px',
                padding: '0.65rem', marginBottom: '1rem', color: '#c62828', fontSize: '0.88rem' }}>
                ?? {inviteError}
              </div>
            )}
            <form onSubmit={handleInvite} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.3rem', color: '#333' }}>Prenume *</label>
                <input style={inp} required placeholder="Ion" value={invite.firstName}
                  onChange={e => setInvite(f => ({ ...f, firstName: e.target.value }))} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.3rem', color: '#333' }}>Nume *</label>
                <input style={inp} required placeholder="Popescu" value={invite.lastName}
                  onChange={e => setInvite(f => ({ ...f, lastName: e.target.value }))} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.3rem', color: '#333' }}>Email *</label>
                <input style={inp} type="email" required placeholder="avocat@firma.ro" value={invite.email}
                  onChange={e => setInvite(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.3rem', color: '#333' }}>Rol *</label>
                <select style={inp} value={invite.role} onChange={e => setInvite(f => ({ ...f, role: Number(e.target.value) }))}>
                  {Object.entries(ROLE_LABELS).map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div style={{ gridColumn: '1/-1', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowInvite(false)} style={{
                  padding: '0.55rem 1.25rem', background: '#eee', border: 'none',
                  borderRadius: '6px', cursor: 'pointer', fontSize: '0.9rem',
                }}>Anuleaza</button>
                <button type="submit" disabled={inviting} style={{
                  padding: '0.55rem 1.5rem', background: inviting ? '#90caf9' : '#1a237e',
                  color: 'white', border: 'none', borderRadius: '6px',
                  cursor: inviting ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: '0.9rem',
                }}>
                  {inviting ? 'Se trimite...' : 'Trimite Invitatie'}
                </button>
              </div>
            </form>
          </Card>
        )}

        <Card>
          {loading ? <Spinner /> : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ background: '#f8f9fa' }}>
                    {['Utilizator','Email','Rol','ID Firma'].map(h =>
                      <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left',
                        color: '#555', fontWeight: 700, borderBottom: '2px solid #e0e0e0' }}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{
                            width: '36px', height: '36px', borderRadius: '50%',
                            background: '#e8eaf6', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', fontWeight: 700, color: '#3949ab', fontSize: '0.9rem',
                          }}>
                            {u.firstName[0]}{u.lastName[0]}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: '#1a237e' }}>{u.firstName} {u.lastName}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: '#555' }}>{u.email}</td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <Badge label={ROLE_LABELS[u.role] ?? String(u.role)} color={ROLE_COLORS[u.role] ?? '#666'} />
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: '#aaa', fontSize: '0.8rem', fontFamily: 'monospace' }}>
                        {u.firmId?.slice(0, 8)}...
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </AdminLayout>
  );
}
