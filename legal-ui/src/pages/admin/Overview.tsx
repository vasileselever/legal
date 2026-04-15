import { useState, useEffect, Component, type ReactNode } from 'react';
import { leadService } from '../../api/leadService';
import { consultationService } from '../../api/consultationService';
import type { LeadStats } from '../../api/leadService';
import type { ConsultationItem } from '../../api/consultationService';
import { AdminLayout } from './AdminLayout';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { ErrorBanner } from '../../components/ui/ErrorBanner';
import { PageHeader } from '../../components/ui/PageHeader';
import { CONSULTATION_STATUS_LABELS, CONSULTATION_STATUS_COLORS, CONSULTATION_TYPE_LABELS } from '../../api/consultationService';
import { LeadDetailModal } from '../../components/LeadDetailModal';

class DashboardErrorBoundary extends Component<{ children: ReactNode }, { error: string | null }> {
  state = { error: null };
  static getDerivedStateFromError(e: Error) { return { error: e.message }; }
  render() {
    if (this.state.error) {
      return (
        <AdminLayout>
          <div style={{ padding: '2rem' }}>
            <ErrorBanner message={`Eroare la incarcarea dashboard-ului: ${this.state.error}`} onRetry={() => this.setState({ error: null })} />
          </div>
        </AdminLayout>
      );
    }
    return this.props.children;
  }
}

function OverviewInner() {
  const [stats, setStats]       = useState<LeadStats | null>(null);
  const [conss, setConss]       = useState<ConsultationItem[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [selectedLead, setSelectedLead] = useState<string | null>(null);

  const load = async () => {
    setLoading(true); setError('');
    try {
      const today = new Date();
      const nextWeek = new Date(today); nextWeek.setDate(nextWeek.getDate() + 7);
      const [s, c] = await Promise.all([
        leadService.getStats(),
        consultationService.getAll({
          startDate: today.toISOString(),
          endDate: nextWeek.toISOString(),
        }),
      ]);
      setStats(s); setConss(c.slice(0, 8));
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const SC = (icon: string, label: string, val: string | number, color: string) => (
    <Card style={{ padding: '1.25rem', borderLeft: '4px solid ' + color }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ color: '#888', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color, marginTop: '0.2rem', lineHeight: 1 }}>{val}</div>
        </div>
        <div style={{ fontSize: '2rem', opacity: 0.6 }}>{icon}</div>
      </div>
    </Card>
  );

  return (
    <AdminLayout>
      <PageHeader title="Dashboard" subtitle="Rezumat activitate si lead-uri" />

      {error && <ErrorBanner message={error} onRetry={load} />}

      <div className="lro-page-body" style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Stats */}
        {loading && !stats ? <Spinner /> : stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '1rem' }}>
            {SC('👥', 'Total Leads',   stats.totalLeads ?? 0,                                         '#1976d2')}
            {SC('🆕', 'Noi',          stats.newLeads ?? 0,                                           '#7b1fa2')}
            {SC('✅', 'Calificati',    stats.qualifiedLeads ?? 0,                                     '#2e7d32')}
            {SC('📅', 'Consultatii',  stats.consultationsScheduled ?? 0,                             '#f57c00')}
            {SC('🔄', 'Convertiti',   stats.convertedLeads ?? 0,                                     '#00838f')}
            {SC('📈', 'Conversie',    ((stats.conversionRate ?? 0) as number).toFixed(1) + '%',      '#c62828')}
          </div>
        )}

        <div className="lro-grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          {/* Source breakdown */}
          {stats && Object.keys(stats.leadsBySource ?? {}).length > 0 && (
            <Card style={{ padding: '1.25rem' }}>
              <h3 style={{ margin: '0 0 1rem', fontSize: '0.95rem', color: '#1a237e' }}>Lead-uri dupa sursa</h3>
              {Object.entries(stats.leadsBySource ?? {}).map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '0.4rem 0', borderBottom: '1px solid #f0f0f0' }}>
                  <span style={{ fontSize: '0.88rem', color: '#555' }}>{k}</span>
                  <span style={{ fontWeight: 700, color: '#1a237e', fontSize: '0.9rem' }}>{v as number}</span>
                </div>
              ))}
            </Card>
          )}

          {/* Practice area breakdown */}
          {stats && Object.keys(stats.leadsByPracticeArea ?? {}).length > 0 && (
            <Card style={{ padding: '1.25rem' }}>
              <h3 style={{ margin: '0 0 1rem', fontSize: '0.95rem', color: '#1a237e' }}>Lead-uri dupa domeniu</h3>
              {Object.entries(stats.leadsByPracticeArea ?? {}).map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '0.4rem 0', borderBottom: '1px solid #f0f0f0' }}>
                  <span style={{ fontSize: '0.88rem', color: '#555' }}>{k}</span>
                  <span style={{ fontWeight: 700, color: '#1a237e', fontSize: '0.9rem' }}>{v as number}</span>
                </div>
              ))}
            </Card>
          )}
        </div>

        {/* Upcoming consultations */}
        <Card>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between' }}>
            <h3 style={{ margin: 0, fontSize: '0.95rem', color: '#1a237e' }}>Consultatii urmatoarele 7 zile</h3>
          </div>
          {loading ? <Spinner /> : conss.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#aaa' }}>
              Nicio consultatie programata in urmatoarele 7 zile
            </div>
          ) : (
            <div className="lro-table-wrap" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ background: '#f8f9fa' }}>
                    {['Data / Ora','Lead','Avocat','Tip','Durata','Status'].map(h =>
                      <th key={h} style={{ padding: '0.65rem 1rem', textAlign: 'left', color: '#555',
                        fontWeight: 700, borderBottom: '2px solid #e0e0e0', whiteSpace: 'nowrap' }}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {conss.map(c => (
                    <tr key={c.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                      <td style={{ padding: '0.65rem 1rem', whiteSpace: 'nowrap', color: '#333', fontWeight: 600 }}>
                        {new Date(c.scheduledAt).toLocaleString('ro-RO', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' })}
                      </td>
                      <td style={{ padding: '0.65rem 1rem', color: '#1a237e', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
                        onClick={() => c.leadId && setSelectedLead(c.leadId)}>
                        {c.leadName || c.leadId?.slice(0,8)}
                      </td>
                      <td style={{ padding: '0.65rem 1rem', color: '#555' }}>{c.lawyerName}</td>
                      <td style={{ padding: '0.65rem 1rem', color: '#555' }}>{CONSULTATION_TYPE_LABELS[c.type]}</td>
                      <td style={{ padding: '0.65rem 1rem', color: '#555' }}>{c.durationMinutes} min</td>
                      <td style={{ padding: '0.65rem 1rem' }}>
                        <Badge label={CONSULTATION_STATUS_LABELS[c.status] ?? '-'}
                          color={CONSULTATION_STATUS_COLORS[c.status] ?? '#999'} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {selectedLead && (
        <LeadDetailModal leadId={selectedLead} onClose={() => setSelectedLead(null)} onStatusChanged={load} />
      )}
    </AdminLayout>
  );
}

export function Overview() {
  return (
    <DashboardErrorBoundary>
      <OverviewInner />
    </DashboardErrorBoundary>
  );
}
