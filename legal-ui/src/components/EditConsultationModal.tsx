import { useState, useEffect } from 'react';
import { consultationService, CONSULTATION_TYPE_LABELS, DURATION_OPTIONS } from '../api/consultationService';
import type { ConsultationItem, UpdateConsultationDto } from '../api/consultationService';
import { apiClient } from '../api/apiClient';

interface UserOption { id: string; firstName: string; lastName: string; }
interface Props { consultation: ConsultationItem; onClose: () => void; onUpdated: () => void; }
type FE = Partial<Record<keyof UpdateConsultationDto | 'general', string>>;

const mkInp = (e = false): React.CSSProperties => ({
    width: '100%', padding: '0.55rem 0.75rem', border: '1px solid ' + (e ? '#ef5350' : '#ddd'),
    borderRadius: '6px', fontSize: '0.9rem', boxSizing: 'border-box' as const,
});
const LBL: React.CSSProperties = { display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#333', marginBottom: '0.3rem' };
const ERR: React.CSSProperties = { color: '#c62828', fontSize: '0.75rem', marginTop: '0.2rem' };
const G2: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' };

function toLocalDT(d: Date) {
    const p = (n: number) => String(n).padStart(2, '0');
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + 'T' + p(d.getHours()) + ':' + p(d.getMinutes());
}

export function EditConsultationModal({ consultation: c, onClose, onUpdated }: Props) {
    const [form, setForm] = useState<UpdateConsultationDto>({
        lawyerId: c.lawyerId,
        scheduledAt: toLocalDT(new Date(c.scheduledAt)),
        durationMinutes: c.durationMinutes,
        type: c.type,
        location: c.location ?? '',
        preparationNotes: '',
    });
    const [errors, setErrors] = useState<FE>({});
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState<UserOption[]>([]);
    const [availability, setAvail] = useState<string[]>([]);
    const [loadingAvail, setLA] = useState(false);

    useEffect(() => {
        apiClient.get('/auth/users').then(r => {
            if (r.data?.success) setUsers(r.data.data);
        }).catch(() => { });
    }, []);

    const set = <K extends keyof UpdateConsultationDto>(k: K, v: UpdateConsultationDto[K]) => {
        setForm(f => ({ ...f, [k]: v }));
        setErrors(e => ({ ...e, [k]: undefined, general: undefined }));
    };

    useEffect(() => {
        if (!form.lawyerId) { setAvail([]); return; }
        const dt = new Date(form.scheduledAt);
        if (isNaN(dt.getTime())) return;
        const start = new Date(dt); start.setHours(0, 0, 0, 0);
        const end = new Date(dt); end.setHours(23, 59, 59, 999);
        setLA(true);
        consultationService.getAvailability(form.lawyerId, start.toISOString(), end.toISOString(), form.durationMinutes)
            .then(setAvail).catch(() => setAvail([])).finally(() => setLA(false));
    }, [form.lawyerId, form.scheduledAt.slice(0, 10), form.durationMinutes]);

    const validate = (): boolean => {
        const e: FE = {};
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
            await consultationService.update(c.id, {
                ...form,
                scheduledAt: new Date(form.scheduledAt).toISOString(),
                location: form.location || undefined,
                preparationNotes: form.preparationNotes || undefined,
            });
            onUpdated();
        } catch (er: any) {
            setErrors(e => ({ ...e, general: er.response?.data?.message ?? er.message ?? 'Eroare la salvare' }));
        } finally { setLoading(false); }
    };

    return (
        <div
            style={{ position: 'fixed', inset: 0, zIndex: 1100, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div style={{ background: 'white', borderRadius: '12px', width: '100%', maxWidth: '580px', maxHeight: '92vh', display: 'flex', flexDirection: 'column', boxShadow: '0 8px 40px rgba(0,0,0,0.2)' }}>

                <div style={{ padding: '1.25rem 1.5rem', borderRadius: '12px 12px 0 0', background: 'linear-gradient(135deg,#e65100,#f57c00)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ color: 'white', fontWeight: 700, fontSize: '1.1rem' }}>Editeaza Consultatie</div>
                        <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.82rem', marginTop: '0.1rem' }}>
                            {c.leadName || 'Lead ' + c.leadId?.slice(0, 8)}
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        &times;
                    </button>
                </div>

                {errors.general && (
                    <div style={{ background: '#ffebee', borderBottom: '1px solid #ef9a9a', padding: '0.65rem 1.5rem', color: '#c62828', fontSize: '0.87rem' }}>
                        Eroare: {errors.general}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ flex: 1, overflowY: 'auto' }}>
                    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                        <div style={{ background: '#f5f5f5', borderRadius: '6px', padding: '0.75rem', fontSize: '0.85rem', color: '#666' }}>
                            <div><strong>Lead:</strong> {c.leadName || 'Lead ' + c.leadId?.slice(0, 8)}</div>
                            <div style={{ marginTop: '0.25rem' }}><strong>Programat original:</strong> {new Date(c.scheduledAt).toLocaleString('ro-RO')}</div>
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
                                    {Object.entries(CONSULTATION_TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                                </select>
                            </div>
                        </div>

                        <div style={G2}>
                            <div>
                                <label style={LBL}>Data si ora *</label>
                                <input style={mkInp(!!errors.scheduledAt)} type="datetime-local" value={form.scheduledAt} onChange={e => set('scheduledAt', e.target.value)} />
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
                            <div style={{ background: '#e8f4fd', border: '1px solid #90caf9', borderRadius: '6px', padding: '0.65rem 0.85rem', fontSize: '0.82rem' }}>
                                {loadingAvail
                                    ? 'Se incarca disponibilitatea...'
                                    : availability.length === 0
                                        ? 'Nicio ora libera in aceasta zi.'
                                        : <>Ore libere: <strong>{availability.slice(0, 8).map(s => new Date(s).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })).join(', ')}{availability.length > 8 ? ' ...' : ''}</strong></>
                                }
                            </div>
                        )}

                        {form.type === 3 && (
                            <div>
                                <label style={LBL}>Locatie</label>
                                <input style={mkInp()} placeholder="Str. Exemplu nr. 1, Bucuresti" value={form.location ?? ''}
                                    onChange={e => set('location', e.target.value)} />
                            </div>
                        )}

                        {form.type === 2 && (
                            <div style={{ background: '#e8f5e9', border: '1px solid #a5d6a7', borderRadius: '6px', padding: '0.65rem 0.85rem', fontSize: '0.82rem', color: '#2e7d32' }}>
                                Linkul video existent va ramane activ.
                            </div>
                        )}

                        <div>
                            <label style={LBL}>Note de pregatire (interne)</label>
                            <textarea
                                style={{ ...mkInp(), minHeight: '80px', resize: 'vertical' }}
                                placeholder="Aspecte de discutat, documente necesare..."
                                value={form.preparationNotes ?? ''}
                                onChange={e => set('preparationNotes', e.target.value)}
                            />
                        </div>
                    </div>

                    <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #e8eaf6', background: '#fafafa', borderRadius: '0 0 12px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <button type="button" onClick={onClose}
                            style={{ padding: '0.55rem 1.25rem', background: '#eee', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9rem' }}>
                            Anuleaza
                        </button>
                        <button type="submit" disabled={loading}
                            style={{ padding: '0.55rem 1.5rem', background: loading ? '#ffb74d' : '#e65100', color: 'white', border: 'none', borderRadius: '6px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '0.9rem' }}>
                            {loading ? 'Se salveaza...' : 'Actualizeaza'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}