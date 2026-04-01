import { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from './AdminLayout';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { ErrorBanner } from '../../components/ui/ErrorBanner';
import { PageHeader } from '../../components/ui/PageHeader';
import { useAuth } from '../../hooks/useAuth';
import { apiClient } from '../../api/apiClient';
import { userService } from '../../api/userService';
import type { UserInfo, UserStats, UpdateUserDto } from '../../api/userService';

const ROLE_LABELS: Record<number, string> = { 0: 'Admin', 1: 'Admin', 2: 'Avocat', 3: 'Asociat', 4: 'Secretar Juridic', 5: 'Client' };
const ROLE_COLORS: Record<number, string> = { 0: '#c62828', 1: '#c62828', 2: '#1976d2', 3: '#2e7d32', 4: '#7b1fa2', 5: '#f57c00' };

// ?? Styles ?????????????????????????????????????????????????????????????????????
const inp: React.CSSProperties = {
  width: '100%', padding: '0.6rem 0.75rem', border: '1px solid #ddd',
  borderRadius: '6px', fontSize: '0.9rem', boxSizing: 'border-box',
};
const modalOverlay: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
};
const modalBox: React.CSSProperties = {
  background: 'white', borderRadius: '12px', padding: '1.75rem',
  width: '100%', maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto',
  boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
};
const btnPrimary: React.CSSProperties = {
  padding: '0.55rem 1.25rem', background: '#1a237e', color: 'white',
  border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem',
};
const btnSecondary: React.CSSProperties = {
  padding: '0.55rem 1.25rem', background: '#eee', color: '#333',
  border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9rem',
};
const btnDanger: React.CSSProperties = {
  padding: '0.55rem 1.25rem', background: '#c62828', color: 'white',
  border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem',
};
const actionBtn: React.CSSProperties = {
  padding: '0.3rem 0.55rem', border: '1px solid #ddd', borderRadius: '5px',
  cursor: 'pointer', background: 'white', fontSize: '0.82rem', lineHeight: 1,
  transition: 'background 0.15s, border-color 0.15s',
};

// ?? Toggle Switch ??????????????????????????????????????????????????????????????
function ToggleSwitch({ checked, disabled, loading: busy, onChange, label }: {
  checked: boolean;
  disabled?: boolean;
  loading?: boolean;
  onChange: () => void;
  label?: string;
}) {
  const isDisabled = disabled || busy;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={isDisabled}
        onClick={onChange}
        style={{
          position: 'relative',
          width: '40px', height: '22px',
          borderRadius: '11px', border: 'none',
          background: busy ? '#bdbdbd' : checked ? '#2e7d32' : '#ccc',
          cursor: isDisabled ? 'not-allowed' : 'pointer',
          transition: 'background 0.25s',
          padding: 0, flexShrink: 0,
          opacity: isDisabled && !busy ? 0.5 : 1,
        }}
      >
        <span style={{
          position: 'absolute',
          top: '2px',
          left: checked ? '20px' : '2px',
          width: '18px', height: '18px',
          borderRadius: '50%',
          background: 'white',
          boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
          transition: 'left 0.25s',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {busy && (
            <span style={{
              width: '10px', height: '10px',
              border: '2px solid #999', borderTopColor: 'transparent',
              borderRadius: '50%',
              animation: 'toggleSpin 0.6s linear infinite',
              display: 'block',
            }} />
          )}
        </span>
      </button>
      {label && (
        <span style={{
          fontSize: '0.78rem', fontWeight: 600,
          color: checked ? '#2e7d32' : '#999',
          minWidth: '42px',
        }}>
          {busy ? '...' : checked ? 'Activ' : 'Inactiv'}
        </span>
      )}
    </div>
  );
}

// ?? Main Component ?????????????????????????????????????????????????????????????
export function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [search, setSearch] = useState('');
  const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set());

  // Invite state
  const [showInvite, setShowInvite] = useState(false);
  const [invite, setInvite] = useState({ firstName: '', lastName: '', email: '', role: 2 });
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState('');

  // Modals
  const [editUser, setEditUser] = useState<UserInfo | null>(null);
  const [statsUser, setStatsUser] = useState<UserInfo | null>(null);
  const [resetUser, setResetUser] = useState<UserInfo | null>(null);
  const [deleteUser, setDeleteUser] = useState<UserInfo | null>(null);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try { setUsers(await userService.getAll(showInactive)); }
    catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }, [showInactive]);

  useEffect(() => { load(); }, [load]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviting(true); setInviteError(''); setInviteSuccess('');
    try {
      await apiClient.post('/auth/invite', invite);
      setInviteSuccess(`Utilizatorul ${invite.email} a fost invitat!`);
      setInvite({ firstName: '', lastName: '', email: '', role: 2 });
      setShowInvite(false);
      await load();
    } catch (e: any) {
      setInviteError(e.response?.data?.message || e.message);
    } finally { setInviting(false); }
  };

  const handleToggleActive = async (u: UserInfo) => {
    setTogglingIds(prev => new Set(prev).add(u.id));
    try {
      if (u.isActive) {
        await userService.deactivate(u.id);
        showToast(`${u.firstName} ${u.lastName} a fost dezactivat.`);
      } else {
        await userService.activate(u.id);
        showToast(`${u.firstName} ${u.lastName} a fost activat.`);
      }
      await load();
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setTogglingIds(prev => { const n = new Set(prev); n.delete(u.id); return n; });
    }
  };

  const isCurrentUser = (u: UserInfo) => u.id === currentUser?.id;

  // Filter users by search
  const filtered = users.filter(u => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      u.firstName.toLowerCase().includes(s) ||
      u.lastName.toLowerCase().includes(s) ||
      u.email.toLowerCase().includes(s)
    );
  });

  const activeCount = users.filter(u => u.isActive).length;
  const inactiveCount = users.filter(u => !u.isActive).length;

  return (
    <AdminLayout>
      <PageHeader
        title="Utilizatori"
        subtitle={`${activeCount} activi${showInactive && inactiveCount > 0 ? `, ${inactiveCount} inactivi` : ''}`}
        action={
          <button onClick={() => setShowInvite(f => !f)} style={btnPrimary}>
            {showInvite ? '\u2716 \u00CEnchide' : '+ Invit\u0103 Utilizator'}
          </button>
        }
      />

      {error && <ErrorBanner message={error} onRetry={load} />}

      {/* Toast notification */}
      {toast && (
        <div style={{
          position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 2000,
          background: toast.type === 'success' ? '#e8f5e9' : '#ffebee',
          border: `1px solid ${toast.type === 'success' ? '#a5d6a7' : '#ef9a9a'}`,
          borderRadius: '8px', padding: '0.875rem 1.25rem',
          color: toast.type === 'success' ? '#2e7d32' : '#c62828',
          fontWeight: 600, boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
          display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem',
          animation: 'slideIn 0.3s ease',
        }}>
          <span>{toast.type === 'success' ? '\u2714' : '\u26A0'}</span>
          {toast.message}
          <button onClick={() => setToast(null)} style={{
            marginLeft: '0.75rem', background: 'none', border: 'none',
            cursor: 'pointer', color: 'inherit', fontWeight: 700, fontSize: '1rem',
          }}>&times;</button>
        </div>
      )}

      <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {inviteSuccess && (
          <div style={{
            background: '#e8f5e9', border: '1px solid #a5d6a7', borderRadius: '8px',
            padding: '0.875rem', color: '#2e7d32', fontWeight: 600,
          }}>
            &#x2714; {inviteSuccess}
          </div>
        )}

        {/* Invite form */}
        {showInvite && (
          <Card style={{ padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1.25rem', color: '#1a237e', fontSize: '1rem' }}>
              Invit&#x103; Utilizator Nou
            </h3>
            {inviteError && (
              <div style={{
                background: '#ffebee', border: '1px solid #ef9a9a', borderRadius: '6px',
                padding: '0.65rem', marginBottom: '1rem', color: '#c62828', fontSize: '0.88rem',
              }}>
                &#x26A0; {inviteError}
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
                  {Object.entries(ROLE_LABELS)
                    .filter(([v]) => Number(v) !== 1 && Number(v) !== 5) // Cannot invite Admin or Client
                    .map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div style={{ gridColumn: '1/-1', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowInvite(false)} style={btnSecondary}>
                  Anuleaz&#x103;
                </button>
                <button type="submit" disabled={inviting} style={{
                  ...btnPrimary, background: inviting ? '#90caf9' : '#1a237e',
                  cursor: inviting ? 'not-allowed' : 'pointer',
                }}>
                  {inviting ? 'Se trimite...' : 'Trimite Invita\u021Bie'}
                </button>
              </div>
            </form>
          </Card>
        )}

        {/* Toolbar */}
        <Card>
          <div style={{
            padding: '0.75rem 1rem', borderBottom: '1px solid #f0f0f0',
            display: 'flex', gap: '0.65rem', flexWrap: 'wrap', alignItems: 'center',
          }}>
            <input
              placeholder="&#x1F50D; Caut&#x103; dup&#x103; nume, email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ ...inp, width: '260px' }}
            />
            <label style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              fontSize: '0.85rem', color: '#555', cursor: 'pointer', marginLeft: '0.5rem',
            }}>
              <input
                type="checkbox"
                checked={showInactive}
                onChange={e => setShowInactive(e.target.checked)}
                style={{ cursor: 'pointer' }}
              />
              Arat&#x103; utilizatori inactivi
            </label>
            <button onClick={load} style={{
              marginLeft: 'auto', padding: '0.5rem 1rem', background: '#1a237e',
              color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer',
              fontSize: '0.85rem',
            }}>
              &#x21BB; Refresh
            </button>
          </div>

          {/* Table */}
          {loading ? <Spinner /> : filtered.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#aaa' }}>
              <div style={{ fontSize: '3rem' }}>&#x1F465;</div>
              <p>Nu exist&#x103; utilizatori{search ? ' care corespund c&#x103;ut&#x103;rii' : ''}.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ background: '#f8f9fa' }}>
                    {['Utilizator', 'Email', 'Rol', 'Status', 'Creat', 'Ultima autentificare', 'Ac\u021Ciuni'].map(h =>
                      <th key={h} style={{
                        padding: '0.75rem 1rem', textAlign: 'left',
                        color: '#555', fontWeight: 700, borderBottom: '2px solid #e0e0e0',
                        whiteSpace: 'nowrap',
                      }}>{h}</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(u => (
                    <tr key={u.id} style={{
                      borderBottom: '1px solid #f5f5f5',
                      opacity: u.isActive ? 1 : 0.55,
                    }}>
                      {/* User name */}
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{
                            width: '36px', height: '36px', borderRadius: '50%',
                            background: u.isActive ? '#e8eaf6' : '#f5f5f5',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 700, color: u.isActive ? '#3949ab' : '#bbb', fontSize: '0.9rem',
                          }}>
                            {u.firstName[0]}{u.lastName[0]}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: u.isActive ? '#1a237e' : '#999' }}>
                              {u.firstName} {u.lastName}
                              {isCurrentUser(u) && (
                                <span style={{
                                  marginLeft: '0.4rem', fontSize: '0.7rem', background: '#e8eaf6',
                                  color: '#3949ab', padding: '0.1rem 0.4rem', borderRadius: '4px',
                                }}>tu</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      {/* Email */}
                      <td style={{ padding: '0.85rem 1rem', color: '#555' }}>{u.email}</td>
                      {/* Role */}
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <Badge label={ROLE_LABELS[u.role] ?? String(u.role)} color={ROLE_COLORS[u.role] ?? '#666'} />
                      </td>
                      {/* Status – toggle switch */}
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <ToggleSwitch
                          checked={u.isActive}
                          disabled={isCurrentUser(u) || u.role === 1}
                          loading={togglingIds.has(u.id)}
                          onChange={() => handleToggleActive(u)}
                          label={u.isActive ? 'Activ' : 'Inactiv'}
                        />
                      </td>
                      {/* Created */}
                      <td style={{ padding: '0.85rem 1rem', color: '#aaa', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                        {new Date(u.createdAt).toLocaleDateString('ro-RO')}
                      </td>
                      {/* Last login */}
                      <td style={{ padding: '0.85rem 1rem', color: '#aaa', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                        {u.lastLoginAt
                          ? new Date(u.lastLoginAt).toLocaleString('ro-RO', {
                            day: '2-digit', month: 'short', year: 'numeric',
                            hour: '2-digit', minute: '2-digit',
                          })
                          : <span style={{ color: '#ccc' }}>Niciodat&#x103;</span>
                        }
                      </td>
                      {/* Actions */}
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'nowrap' }}>
                          {/* Stats */}
                          <button
                            title="Statistici"
                            onClick={() => setStatsUser(u)}
                            style={{ ...actionBtn, color: '#1976d2', borderColor: '#bbdefb' }}
                          >
                            &#x1F4CA;
                          </button>
                          {/* Edit */}
                          <button
                            title="Editeaz&#x103;"
                            onClick={() => setEditUser(u)}
                            style={{ ...actionBtn, color: '#f57c00', borderColor: '#ffe0b2' }}
                          >
                            &#x270F;&#xFE0F;
                          </button>
                          {/* Reset password - not for self or Admin */}
                          {!isCurrentUser(u) && u.role !== 1 && (
                            <button
                              title="Reseteaz\u0103 parola"
                              onClick={() => setResetUser(u)}
                              style={{ ...actionBtn, color: '#7b1fa2', borderColor: '#ce93d8' }}
                            >
                              &#x1F511;
                            </button>
                          )}
                          {/* Delete - not for self or Admin */}
                          {!isCurrentUser(u) && u.role !== 1 && (
                            <button
                              title="\u0218terge"
                              onClick={() => setDeleteUser(u)}
                              style={{ ...actionBtn, color: '#c62828', borderColor: '#ef9a9a' }}
                            >
                              &#x1F5D1;&#xFE0F;
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* ?? Edit User Modal ??????????????????????????????????????????????????? */}
      {editUser && (
        <EditUserModal
          user={editUser}
          isCurrentUser={isCurrentUser(editUser)}
          onClose={() => setEditUser(null)}
          onSaved={() => { setEditUser(null); load(); showToast('Utilizator actualizat cu succes!'); }}
          onError={(msg) => showToast(msg, 'error')}
        />
      )}

      {/* ?? Stats Modal ??????????????????????????????????????????????????????? */}
      {statsUser && (
        <StatsModal
          user={statsUser}
          onClose={() => setStatsUser(null)}
        />
      )}

      {/* ?? Reset Password Modal ?????????????????????????????????????????????? */}
      {resetUser && (
        <ResetPasswordModal
          user={resetUser}
          onClose={() => setResetUser(null)}
          onSuccess={(msg) => { setResetUser(null); showToast(msg); }}
          onError={(msg) => showToast(msg, 'error')}
        />
      )}

      {/* ?? Delete Confirmation Modal ????????????????????????????????????????? */}
      {deleteUser && (
        <DeleteUserModal
          user={deleteUser}
          onClose={() => setDeleteUser(null)}
          onDeleted={() => { setDeleteUser(null); load(); showToast('Utilizator \u0219ters cu succes!'); }}
          onError={(msg) => showToast(msg, 'error')}
        />
      )}

      {/* Animation keyframes */}
      <style>{`
        @keyframes slideIn { from { transform: translateX(100px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes toggleSpin { to { transform: rotate(360deg); } }
      `}</style>
    </AdminLayout>
  );
}

// ?? Edit User Modal ????????????????????????????????????????????????????????????
function EditUserModal({ user, isCurrentUser, onClose, onSaved, onError }: {
  user: UserInfo;
  isCurrentUser: boolean;
  onClose: () => void;
  onSaved: () => void;
  onError: (msg: string) => void;
}) {
  const isAdmin = user.role === 1; // UserRole.Admin = 1
  const [form, setForm] = useState<UpdateUserDto>({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setFormError('');
    try {
      await userService.update(user.id, form);
      onSaved();
    } catch (e: any) {
      const msg = e.message || 'Eroare la salvare';
      setFormError(msg);
      onError(msg);
    } finally { setSaving(false); }
  };

  return (
    <div style={modalOverlay} onClick={onClose}>
      <div style={modalBox} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ margin: 0, color: '#1a237e', fontSize: '1.1rem' }}>
            &#x270F;&#xFE0F; Editeaz&#x103; Utilizator
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.3rem', cursor: 'pointer', color: '#999' }}>&times;</button>
        </div>

        {formError && (
          <div style={{
            background: '#ffebee', border: '1px solid #ef9a9a', borderRadius: '6px',
            padding: '0.65rem', marginBottom: '1rem', color: '#c62828', fontSize: '0.88rem',
          }}>
            &#x26A0; {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.3rem', color: '#333' }}>Prenume *</label>
              <input style={inp} required value={form.firstName || ''}
                onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.3rem', color: '#333' }}>Nume *</label>
              <input style={inp} required value={form.lastName || ''}
                onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.3rem', color: '#333' }}>Email *</label>
            <input style={inp} type="email" required value={form.email || ''}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.3rem', color: '#333' }}>Rol *</label>
            <select style={{ ...inp, ...(isAdmin ? { opacity: 0.6, cursor: 'not-allowed', background: '#f5f5f5' } : {}) }} value={form.role ?? 0}
              disabled={isAdmin}
              onChange={e => setForm(f => ({ ...f, role: Number(e.target.value) }))}>
              {Object.entries(ROLE_LABELS)
                .filter(([v]) => isAdmin ? true : Number(v) !== 1 && Number(v) !== 5) // Non-admin users cannot be promoted to Admin; exclude Client
                .map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            {isAdmin && (
              <div style={{ fontSize: '0.75rem', color: '#999', marginTop: '0.25rem' }}>
                Rolul de Admin nu poate fi modificat
              </div>
            )}
          </div>

          {/* Status toggle inside edit modal */}
          <div style={{
            padding: '0.875rem', background: '#f8f9ff', borderRadius: '8px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#333', marginBottom: '0.15rem' }}>
                Status cont
              </div>
              <div style={{ fontSize: '0.76rem', color: '#888' }}>
                {isCurrentUser
                  ? 'Nu pute\u021Bi dezactiva propriul cont'
                  : form.isActive
                    ? 'Utilizatorul poate accesa sistemul'
                    : 'Utilizatorul nu poate accesa sistemul'}
              </div>
            </div>
            <ToggleSwitch
              checked={form.isActive ?? true}
              disabled={isCurrentUser}
              onChange={() => setForm(f => ({ ...f, isActive: !f.isActive }))}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button type="button" onClick={onClose} style={btnSecondary}>Anuleaz&#x103;</button>
            <button type="submit" disabled={saving} style={{
              ...btnPrimary, background: saving ? '#90caf9' : '#1a237e',
              cursor: saving ? 'not-allowed' : 'pointer',
            }}>
              {saving ? 'Se salveaz\u0103...' : 'Salveaz\u0103'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


// ── Stats Modal ────────────────────────────────────────────────────────────────
function StatsModal({ user, onClose }: { user: UserInfo; onClose: () => void }) {
    const [stats, setStats] = useState<UserStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        (async () => {
            setLoading(true); setError('');
            try { setStats(await userService.getStats(user.id)); }
            catch (e: any) { setError(e.message); }
            finally { setLoading(false); }
        })();
    }, [user.id]);

    const statRowStyle: React.CSSProperties = {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '0.65rem 0', borderBottom: '1px solid #f0f0f0',
    };

    return (
        <div style={modalOverlay} onClick={onClose}>
            <div style={modalBox} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <h3 style={{ margin: 0, color: '#1a237e', fontSize: '1.1rem' }}>
                        &#x1F4CA; Statistici &mdash; {user.firstName} {user.lastName}
                    </h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.3rem', cursor: 'pointer', color: '#999' }}>&times;</button>
                </div>

                {/* User info header */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem',
                    padding: '0.875rem', background: '#f8f9ff', borderRadius: '8px',
                }}>
                    <div style={{
                        width: '44px', height: '44px', borderRadius: '50%',
                        background: '#e8eaf6', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, color: '#3949ab', fontSize: '1rem',
                    }}>
                        {user.firstName[0]}{user.lastName[0]}
                    </div>
                    <div>
                        <div style={{ fontWeight: 600, color: '#1a237e' }}>{user.firstName} {user.lastName}</div>
                        <div style={{ fontSize: '0.82rem', color: '#888' }}>{user.email}</div>
                    </div>
                    <Badge label={ROLE_LABELS[user.role] ?? String(user.role)} color={ROLE_COLORS[user.role] ?? '#666'} />
                </div>

                {loading ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>Se \u00EEncarc\u0103...</div>
                ) : error ? (
                    <div style={{ background: '#ffebee', borderRadius: '6px', padding: '0.75rem', color: '#c62828', fontSize: '0.88rem' }}>
                        {error}
                    </div>
                ) : stats && (
                    <div>
                        <div style={statRowStyle}>
                            <span style={{ fontSize: '0.9rem', color: '#555', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span>&#x1F4BC;</span> Dosare responsabil</span>
                            <span style={{ fontWeight: 700, color: '#1a237e', fontSize: '1.1rem' }}>{stats.casesResponsible}</span>
                        </div>
                        <div style={statRowStyle}>
                            <span style={{ fontSize: '0.9rem', color: '#555', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span>&#x1F4C1;</span> Dosare asignat</span>
                            <span style={{ fontWeight: 700, color: '#1a237e', fontSize: '1.1rem' }}>{stats.casesAssigned}</span>
                        </div>
                        <div style={statRowStyle}>
                            <span style={{ fontSize: '0.9rem', color: '#555', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span>&#x2705;</span> Task-uri asignate</span>
                            <span style={{ fontWeight: 700, color: '#1a237e', fontSize: '1.1rem' }}>{stats.tasksAssigned}</span>
                        </div>
                        <div style={statRowStyle}>
                            <span style={{ fontSize: '0.9rem', color: '#555', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span>&#x1F4C4;</span> Documente \u00EEnc\u0103rcate</span>
                            <span style={{ fontWeight: 700, color: '#1a237e', fontSize: '1.1rem' }}>{stats.documentsUploaded}</span>
                        </div>
                        <div style={statRowStyle}>
                            <span style={{ fontSize: '0.9rem', color: '#555', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span>&#x1F552;</span> Ultima activitate</span>
                            <span style={{ fontWeight: 700, color: '#1a237e', fontSize: '1.1rem' }}>
                                {stats.lastActivity
                                    ? new Date(stats.lastActivity).toLocaleString('ro-RO', {
                                        day: '2-digit', month: 'short', year: 'numeric',
                                        hour: '2-digit', minute: '2-digit',
                                    })
                                    : 'N/A'}
                            </span>
                        </div>
                    </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
                    <button onClick={onClose} style={btnSecondary}>\u00CEnchide</button>
                </div>
            </div>
        </div>
    );
}

// ?? Reset Password Modal ???????????????????????????????????????????????????????
function ResetPasswordModal({ user, onClose, onSuccess, onError }: {
  user: UserInfo;
  onClose: () => void;
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
}) {
  const [resetting, setResetting] = useState(false);
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleReset = async () => {
    setResetting(true);
    try {
      const pwd = await userService.resetPassword(user.id);
      setTempPassword(pwd);
    } catch (e: any) {
      onError(e.message);
    } finally { setResetting(false); }
  };

  const handleCopy = () => {
    if (tempPassword) {
      navigator.clipboard.writeText(tempPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div style={modalOverlay} onClick={onClose}>
      <div style={modalBox} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ margin: 0, color: '#7b1fa2', fontSize: '1.1rem' }}>
            &#x1F511; Resetare Parol&#x103;
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.3rem', cursor: 'pointer', color: '#999' }}>&times;</button>
        </div>

        {!tempPassword ? (
          <>
            <div style={{
              background: '#fff8e1', border: '1px solid #ffe082', borderRadius: '8px',
              padding: '1rem', marginBottom: '1.25rem', color: '#795548', fontSize: '0.9rem',
            }}>
              <strong>&#x26A0; Aten&#x21B;ie!</strong>
              <p style={{ margin: '0.5rem 0 0' }}>
                Sunte&#x21B;a sigur c&#x103; dori&#x21B;i s&#x103; reseta&#x21B;i parola pentru{' '}
                <strong>{user.firstName} {user.lastName}</strong> ({user.email})?
              </p>
              <p style={{ margin: '0.5rem 0 0' }}>
                Se va genera o parol&#x103; temporar&#x103; care trebuie comunicat&#x103; utilizatorului.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button onClick={onClose} style={btnSecondary}>Anuleaz&#x103;</button>
              <button onClick={handleReset} disabled={resetting} style={{
                ...btnPrimary, background: resetting ? '#ce93d8' : '#7b1fa2',
                cursor: resetting ? 'not-allowed' : 'pointer',
              }}>
                {resetting ? 'Se reseteaz\u0103...' : 'Reseteaz\u0103 Parola'}
              </button>
            </div>
          </>
        ) : (
          <>
            <div style={{
              background: '#e8f5e9', border: '1px solid #a5d6a7', borderRadius: '8px',
              padding: '1rem', marginBottom: '1rem', color: '#2e7d32',
            }}>
              <strong>&#x2714; Parola a fost resetat&#x103; cu succes!</strong>
            </div>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.3rem', color: '#333' }}>
                Parol&#x103; temporar&#x103;:
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input style={{ ...inp, fontFamily: 'monospace', fontWeight: 700, fontSize: '1rem' }}
                  readOnly value={tempPassword} />
                <button onClick={handleCopy} style={{
                  ...actionBtn, padding: '0.55rem 0.75rem', fontWeight: 600,
                  color: copied ? '#2e7d32' : '#1976d2',
                  borderColor: copied ? '#a5d6a7' : '#bbdefb',
                }}>
                  {copied ? '\u2714 Copiat' : '\uD83D\uDCCB Copiaz\u0103'}
                </button>
              </div>
              <p style={{ margin: '0.5rem 0 0', fontSize: '0.82rem', color: '#888' }}>
                Comunica&#x21B;i aceast&#x103; parol&#x103; utilizatorului. Acesta trebuie s&#x103; o schimbe la prima autentificare.
              </p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => { onSuccess('Parola a fost resetat\u0103 cu succes!'); }} style={btnPrimary}>
                \u00CEnchide
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ?? Delete User Modal ??????????????????????????????????????????????????????????
function DeleteUserModal({ user, onClose, onDeleted, onError }: {
  user: UserInfo;
  onClose: () => void;
  onDeleted: () => void;
  onError: (msg: string) => void;
}) {
  const [deleting, setDeleting] = useState(false);
  const [confirmation, setConfirmation] = useState('');

  const canDelete = confirmation.toLowerCase() === 'sterge';

  const handleDelete = async () => {
    if (!canDelete) return;
    setDeleting(true);
    try {
      await userService.delete(user.id);
      onDeleted();
    } catch (e: any) {
      onError(e.message);
    } finally { setDeleting(false); }
  };

  return (
    <div style={modalOverlay} onClick={onClose}>
      <div style={modalBox} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ margin: 0, color: '#c62828', fontSize: '1.1rem' }}>
            &#x1F5D1;&#xFE0F; &#x218;terge Utilizator
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.3rem', cursor: 'pointer', color: '#999' }}>&times;</button>
        </div>

        <div style={{
          background: '#ffebee', border: '1px solid #ef9a9a', borderRadius: '8px',
          padding: '1rem', marginBottom: '1.25rem', color: '#c62828', fontSize: '0.9rem',
        }}>
          <strong>&#x26A0; Aceast&#x103; ac&#x21B;iune nu poate fi anulat&#x103;!</strong>
          <p style={{ margin: '0.5rem 0 0' }}>
            Sunte&#x21B;i sigur c&#x103; dori&#x21B;i s&#x103; &#x219;terge&#x21B;i utilizatorul{' '}
            <strong>{user.firstName} {user.lastName}</strong> ({user.email})?
          </p>
          <p style={{ margin: '0.5rem 0 0' }}>
            Contul va fi dezactivat &#x219;i utilizatorul nu va mai putea accesa sistemul.
          </p>
        </div>

        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.3rem', color: '#333' }}>
            Scrie&#x21B;i <strong>sterge</strong> pentru a confirma:
          </label>
          <input style={inp} placeholder="sterge" value={confirmation}
            onChange={e => setConfirmation(e.target.value)} />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={btnSecondary}>Anuleaz&#x103;</button>
          <button onClick={handleDelete} disabled={!canDelete || deleting} style={{
            ...btnDanger, opacity: canDelete ? 1 : 0.5,
            cursor: canDelete && !deleting ? 'pointer' : 'not-allowed',
          }}>
            {deleting ? 'Se \u0219terge...' : '\u0218terge Utilizator'}
          </button>
        </div>
      </div>
    </div>
  );
}
