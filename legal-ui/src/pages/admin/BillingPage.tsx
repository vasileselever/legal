import { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from './AdminLayout';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { ErrorBanner } from '../../components/ui/ErrorBanner';
import { apiClient } from '../../api/apiClient';
import { PageHeader } from '../../components/ui/PageHeader';
import { leadService } from '../../api/leadService';
import type { LeadItem } from '../../api/leadService';
import {
  billingService,
  TIME_ENTRY_STATUS, TIME_ENTRY_STATUS_COLORS,
  EXPENSE_STATUS, EXPENSE_STATUS_COLORS, EXPENSE_CATEGORIES,
  INVOICE_STATUS, INVOICE_STATUS_COLORS,
  CURRENCY_LABELS, PAYMENT_METHODS, TRUST_TX_TYPES,
  type InvoiceDto, type InvoiceLineItemDto,
  type TimeEntryDto, type ExpenseDto, type InvoiceListItemDto,
  type TrustAccountDto, type TrustTransactionDto,
  type BillingRateDto, type BillingSummaryDto, type LawyerProductivityDto,
  type ArAgingDto, type PaymentDto, type CaseItem, type LeadDropdownItem,
} from '../../api/billingService';

// -- Helpers ----------------------------------------------------------

const fmtDate = (d?: string) => d ? new Date(d).toLocaleDateString('ro-RO') : '-';
const fmtMoney = (n: number, cur = 1) => `${n.toLocaleString('ro-RO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${CURRENCY_LABELS[cur] ?? 'RON'}`;
const fmtHours = (h: number) => `${h.toFixed(2)}h`;

const TABS = [
  { key: 'dashboard', icon: '📊', label: 'Sumar' },
  { key: 'time',      icon: '⏱️', label: 'Pontaj' },
  { key: 'expenses',  icon: '🧾', label: 'Cheltuieli' },
  { key: 'invoices',  icon: '📄', label: 'Facturi' },
  { key: 'payments',  icon: '💳', label: 'Plati' },
  { key: 'trust',     icon: '🏦', label: 'Conturi Client' },
  { key: 'rates',     icon: '💲', label: 'Tarife' },
  { key: 'reports',   icon: '📈', label: 'Rapoarte' },
] as const;

type TabKey = (typeof TABS)[number]['key'];

// -- Shared Styles ----------------------------------------------------

const btnStyle: React.CSSProperties = {
  padding: '0.5rem 1rem', background: '#1a237e', color: '#fff',
  border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
};
const btnOutline: React.CSSProperties = {
  ...btnStyle, background: 'transparent', color: '#1a237e', border: '1px solid #1a237e',
};
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '6px', fontSize: '0.88rem',
};
const selectStyle: React.CSSProperties = { ...inputStyle };
const labelStyle: React.CSSProperties = { fontSize: '0.78rem', fontWeight: 600, color: '#555', marginBottom: '0.25rem', display: 'block' };
const thStyle: React.CSSProperties = {
  padding: '0.65rem 1rem', textAlign: 'left', color: '#555',
  fontWeight: 700, borderBottom: '2px solid #e0e0e0', whiteSpace: 'nowrap', fontSize: '0.82rem',
};
const tdStyle: React.CSSProperties = { padding: '0.65rem 1rem', fontSize: '0.88rem', color: '#333' };

const overlayStyle: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex',
  alignItems: 'center', justifyContent: 'center', zIndex: 1000,
};
const modalStyle: React.CSSProperties = {
  background: '#fff', borderRadius: '12px', padding: '1.5rem', width: '90%', maxWidth: '560px',
  maxHeight: '85vh', overflow: 'auto', boxShadow: '0 8px 40px rgba(0,0,0,0.2)',
};
// Mobile CSS classes applied alongside these styles:
// overlay element → className="lro-overlay"
// modal element   → className="lro-modal"

// =====================================================================
//  MAIN BILLING PAGE
// =====================================================================

export default function BillingPage() {
  const [tab, setTab] = useState<TabKey>('dashboard');

  return (
    <AdminLayout>
      <PageHeader title="Facturare & Management Financiar" subtitle="Pontaj, facturi, cheltuieli, conturi client, rapoarte" />

      {/* Tab bar */}
      <div className="lro-tabbar" style={{ display: 'flex', gap: '0.25rem', padding: '1rem 1.5rem 0', flexWrap: 'wrap' }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding: '0.5rem 1rem', borderRadius: '8px 8px 0 0', fontSize: '0.85rem', fontWeight: 600,
            border: 'none', cursor: 'pointer',
            background: tab === t.key ? '#1a237e' : '#e8eaf6', color: tab === t.key ? '#fff' : '#333',
          }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div className="lro-page-body" style={{ padding: '0 1.5rem 2rem' }}>
        {tab === 'dashboard' && <DashboardTab />}
        {tab === 'time'      && <TimeEntriesTab />}
        {tab === 'expenses'  && <ExpensesTab />}
        {tab === 'invoices'  && <InvoicesTab />}
        {tab === 'payments'  && <PaymentsTab />}
        {tab === 'trust'     && <TrustAccountsTab />}
        {tab === 'rates'     && <RatesTab />}
        {tab === 'reports'   && <ReportsTab />}
      </div>
    </AdminLayout>
  );
}

// =====================================================================
//  DASHBOARD TAB
// =====================================================================

function DashboardTab() {
  const [summary, setSummary] = useState<BillingSummaryDto | null>(null);
  const [aging, setAging] = useState<ArAgingDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [s, a] = await Promise.all([billingService.getBillingSummary(), billingService.getArAging()]);
      setSummary(s); setAging(a);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (error) return <ErrorBanner message={error} onRetry={load} />;
  if (loading || !summary) return <Spinner />;

  const SC = (icon: string, label: string, val: string, color: string) => (
    <Card style={{ padding: '1.25rem', borderLeft: '4px solid ' + color }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ color: '#888', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color, marginTop: '0.2rem', lineHeight: 1 }}>{val}</div>
        </div>
        <div style={{ fontSize: '2rem', opacity: 0.6 }}>{icon}</div>
      </div>
    </Card>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        {SC('🔧', 'WIP \(Nefacturat\)', fmtMoney(summary.totalWip), '#f57c00')}
        {SC('📄', 'Total Facturat', fmtMoney(summary.totalBilled), '#1976d2')}
        {SC('💰', 'Total Incasat', fmtMoney(summary.totalCollected), '#2e7d32')}
        {SC('⚠️', 'Restante', fmtMoney(summary.totalOutstanding), '#c62828')}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        {SC('📊', 'Rata realizare', `${summary.realizationRate}%`, '#6a1b9a')}
        {SC('📈', 'Rata colectare', `${summary.collectionRate}%`, '#00838f')}
        {SC('🔴', 'Facturi restante', `${summary.overdueInvoiceCount}`, '#c62828')}
        {SC('🏦', 'Sold conturi client', fmtMoney(summary.trustAccountsBalance), '#1a237e')}
      </div>

      {/* AR Aging */}
      {aging && (
        <Card style={{ padding: '1.25rem' }}>
          <h3 style={{ margin: '0 0 1rem', fontSize: '0.95rem', color: '#1a237e' }}>Vechime creante (AR Aging)</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
            {([['0-30 zile', aging.current, '#2e7d32'], ['31-60 zile', aging.thirtyDays, '#f57c00'],
              ['61-90 zile', aging.sixtyDays, '#e65100'], ['90+ zile', aging.ninetyPlusDays, '#c62828'],
              ['Total', aging.total, '#1a237e']] as [string, number, string][]).map(([label, val, color]) => (
              <div key={label} style={{ textAlign: 'center', padding: '0.75rem', background: color + '0a', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.72rem', color: '#888', fontWeight: 700, textTransform: 'uppercase' }}>{label}</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color, marginTop: '0.2rem' }}>{fmtMoney(val)}</div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

// =====================================================================
//  TIME ENTRIES TAB
// =====================================================================

function TimeEntriesTab() {
  const { user, initialising } = useAuth();
  const isAdmin = user?.role === 1;

  const [entries, setEntries]           = useState<TimeEntryDto[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [showCreate, setShowCreate]     = useState(false);
  const [selected, setSelected]         = useState<Set<string>>(new Set());
  const [page, setPage]                 = useState(1);
  const [totalPages, setTotalPages]     = useState(1);
  const [statusFilter, setStatusFilter] = useState<number | ''>('');
  const [rejectReason, setRejectReason] = useState('');
  const [showReject, setShowReject]     = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Once auth resolves, set default filter: Admin → Trimis(2), Lawyer → all
  useEffect(() => {
    if (!initialising) setStatusFilter(isAdmin ? 2 : '');
  }, [initialising, isAdmin]);

  const load = useCallback(async () => {
    if (initialising) return;
    setLoading(true); setError('');
    try {
      const params: Record<string, any> = { page, pageSize: 20 };
      if (statusFilter !== '') params.status = statusFilter;
      const res = await billingService.getTimeEntries(params);
      setEntries(res.data); setTotalPages(res.pagination?.totalPages ?? 1);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }, [page, statusFilter, initialising]);

  useEffect(() => { load(); }, [load]);

  const toggleSelect = (id: string) => {
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const handleSubmit = async () => {
    if (selected.size === 0) return;
    setActionLoading(true);
    try {
      await billingService.submitTimeEntries(Array.from(selected));
      setSelected(new Set()); load();
    } catch (e: any) { setError(e.message); }
    finally { setActionLoading(false); }
  };

  const handleApprove = async () => {
    if (selected.size === 0) return;
    setActionLoading(true);
    try {
      await billingService.approveTimeEntries(Array.from(selected));
      setSelected(new Set()); load();
    } catch (e: any) { setError(e.message); }
    finally { setActionLoading(false); }
  };

  const handleReject = async () => {
    if (selected.size === 0) return;
    setActionLoading(true);
    try {
      await billingService.rejectTimeEntries(Array.from(selected), rejectReason);
      setSelected(new Set()); setShowReject(false); setRejectReason(''); load();
    } catch (e: any) { setError(e.message); }
    finally { setActionLoading(false); }
  };

  // Which entries can be selected depends on role
  const canSelect = (e: TimeEntryDto) =>
    isAdmin ? e.status === 2 : e.status === 1; // Admin selects Submitted; Lawyer selects Draft

  const selectedEntries = entries.filter(e => selected.has(e.id));
  const [editEntry, setEditEntry] = useState<TimeEntryDto | null>(null);

  return (
    <div style={{ marginTop: '1rem' }}>
      {/* Admin pending-approval banner */}
      {isAdmin && statusFilter === 2 && !loading && entries.filter(e => e.status === 2).length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 1rem', background: '#fff3e0', border: '1px solid #ffb74d', borderRadius: '8px', marginBottom: '0.875rem', fontSize: '0.85rem', color: '#e65100', fontWeight: 600 }}>
          <span>⏳</span>
          <span>{entries.filter(e => e.status === 2).length} pontaj{entries.filter(e => e.status === 2).length !== 1 ? 'e' : ''} asteapta aprobare.</span>
          <span style={{ fontWeight: 400, color: '#795548' }}>Selecteaza-le din tabel si apasa Aproba sau Respinge.</span>
        </div>
      )}

      <div className="lro-toolbar" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <button style={btnStyle} onClick={() => setShowCreate(true)}>+ Adauga pontaj</button>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value === '' ? '' : Number(e.target.value)); setPage(1); setSelected(new Set()); }}
          style={{ ...selectStyle, width: 'auto', minWidth: '160px' }}
        >
          <option value="">Toate statusurile</option>
          {Object.entries(TIME_ENTRY_STATUS).map(([k, v]) =>
            <option key={k} value={k}>{v}</option>
          )}
        </select>

        {/* Lawyer actions — on Draft entries */}
        {!isAdmin && selected.size > 0 && (
          <button
            style={{ ...btnOutline, color: '#1976d2', borderColor: '#1976d2' }}
            onClick={handleSubmit} disabled={actionLoading}
          >
            &#128228; Trimite spre aprobare ({selected.size})
          </button>
        )}

        {/* Admin actions — on Submitted entries */}
        {isAdmin && selected.size > 0 && (
          <>
            <button
              style={{ ...btnOutline, color: '#2e7d32', borderColor: '#2e7d32' }}
              onClick={handleApprove} disabled={actionLoading}
            >
              ✓ Aproba ({selected.size})
            </button>
            <button
              style={{ ...btnOutline, color: '#c62828', borderColor: '#c62828' }}
              onClick={() => setShowReject(true)} disabled={actionLoading}
            >
              ✕ Respinge ({selected.size})
            </button>
          </>
        )}
      </div>

      {error && <ErrorBanner message={error} onRetry={load} />}
      {loading ? <Spinner /> : entries.length === 0 ? (
        <Card style={{ padding: '3rem', textAlign: 'center', color: '#aaa' }}>Niciun pontaj gasit</Card>
      ) : (
        <Card>
          <div className="lro-table-wrap" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8f9fa' }}>
                  <th style={thStyle}></th>
                  {['Data', 'Dosar', 'Avocat', 'Ore', 'Tarif/ora', 'Total', 'Descriere', 'Status', ''].map(h =>
                    <th key={h} style={thStyle}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {entries.map(e => (
                  <tr key={e.id} style={{ borderBottom: '1px solid #f5f5f5', background: e.rejectionReason ? '#fff8f8' : undefined }}>
                    <td style={tdStyle}>
                      {canSelect(e) && (
                        <input type="checkbox" checked={selected.has(e.id)} onChange={() => toggleSelect(e.id)} />
                      )}
                    </td>
                    <td style={{ ...tdStyle, fontWeight: 600 }}>{fmtDate(e.workDate)}</td>
                    <td style={tdStyle}>{e.caseNumber || e.leadName || (e.caseId ? e.caseId.slice(0, 8) : e.leadId?.slice(0, 8) || '-')}</td>
                    <td style={tdStyle}>{e.userFullName || '-'}</td>
                    <td style={{ ...tdStyle, fontWeight: 700, color: '#1a237e' }}>{fmtHours(e.durationHours)}</td>
                    <td style={tdStyle}>{fmtMoney(e.hourlyRate, e.currency)}</td>
                    <td style={{ ...tdStyle, fontWeight: 700 }}>{fmtMoney(e.totalAmount, e.currency)}</td>
                    <td style={{ ...tdStyle, maxWidth: '200px' }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.description}</div>
                      {e.rejectionReason && (
                        <div style={{ fontSize: '0.72rem', color: '#c62828', marginTop: '0.15rem' }}>
                          ✕ Respins: {e.rejectionReason}
                        </div>
                      )}
                    </td>
                    <td style={tdStyle}><Badge label={TIME_ENTRY_STATUS[e.status] ?? '-'} color={TIME_ENTRY_STATUS_COLORS[e.status] ?? '#999'} /></td>
                    <td style={tdStyle}>
                      {e.status === 1 && (
                        <button
                          onClick={() => setEditEntry(e)}
                          title="Editeaza"
                          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: '#1a237e', padding: '0.15rem 0.4rem' }}
                        >&#9998;</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </Card>
      )}

      {showCreate && <CreateTimeEntryModal onClose={() => setShowCreate(false)} onCreated={load} />}
      {editEntry && <EditTimeEntryModal entry={editEntry} onClose={() => setEditEntry(null)} onSaved={load} />}

      {/* Reject modal */}
      {showReject && (
        <div className="lro-overlay" style={overlayStyle} onClick={() => setShowReject(false)}>
          <div className="lro-modal" style={{ ...modalStyle, maxWidth: '420px' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 1rem', color: '#c62828', fontSize: '1rem' }}>Respinge pontaje ({selectedEntries.length})</h3>
            <div style={{ marginBottom: '1rem', fontSize: '0.85rem', color: '#555' }}>
              Motivul respingerii va fi vizibil avocatului care a introdus pontajul.
            </div>
            <label style={labelStyle}>Motiv (optional)</label>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              rows={3}
              placeholder="Ex: Durata incorecta, lipseste descrierea..."
              style={{ ...inputStyle, resize: 'vertical', marginBottom: '1rem' }}
            />
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button style={btnOutline} onClick={() => setShowReject(false)}>Anuleaza</button>
              <button
                style={{ ...btnStyle, background: '#c62828' }}
                onClick={handleReject} disabled={actionLoading}
              >
                {actionLoading ? 'Se proceseaza...' : 'Confirma respingere'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// =====================================================================
//  EXPENSES TAB
// =====================================================================

function ExpensesTab() {
  const { user, initialising } = useAuth();
  const isAdmin = user?.role === 1;

  const [items, setItems] = useState<ExpenseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [actionLoading, setActionLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<number | ''>('');

  // Admin defaults to Pending (1) filter
  useEffect(() => {
    if (!initialising) setStatusFilter(isAdmin ? 1 : '');
  }, [initialising, isAdmin]);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const params: Record<string, any> = { page, pageSize: 20 };
      if (statusFilter !== '') params.status = statusFilter;
      const res = await billingService.getExpenses(params);
      setItems(res.data); setTotalPages(res.pagination.totalPages);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }, [page, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const toggleSelect = (id: string) => {
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  // Only admin can select Pending expenses for approval
  const canSelect = (e: ExpenseDto) => isAdmin && e.status === 1;

  const handleApprove = async () => {
    if (selected.size === 0) return;
    setActionLoading(true);
    try {
      await billingService.approveExpenses(Array.from(selected));
      setSelected(new Set()); load();
    } catch (e: any) { setError(e.message); }
    finally { setActionLoading(false); }
  };

  const handleReject = async () => {
    if (selected.size === 0) return;
    setActionLoading(true);
    try {
      const ids = items.filter(e => selected.has(e.id)).map(e => e.id);
      for (let i = 0; i < ids.length; i++) {
        const exp = items.find(e => e.id === ids[i]);
        if (!exp) continue;
        await billingService.updateExpense(ids[i], {
          expenseDate: exp.expenseDate,
          category: exp.category,
          description: exp.description,
          amount: exp.amount,
          markupPercent: exp.markupPercent,
          isBillable: exp.isBillable,
          vendor: exp.vendor,
          status: 4,
        });
      }
      setSelected(new Set()); load();
    } catch (e: any) { setError(e.message); }
    finally { setActionLoading(false); }
  };

  return (
    <div style={{ marginTop: '1rem' }}>
      {/* Admin pending banner */}
      {isAdmin && statusFilter === 1 && !loading && items.filter(e => e.status === 1).length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 1rem', background: '#fff3e0', border: '1px solid #ffb74d', borderRadius: '8px', marginBottom: '0.875rem', fontSize: '0.85rem', color: '#e65100', fontWeight: 600 }}>
          <span>⏳</span>
          <span>{items.filter(e => e.status === 1).length} cheltuiel{items.filter(e => e.status === 1).length !== 1 ? 'i' : 'a'} asteapta aprobare.</span>
        </div>
      )}

      <div className="lro-toolbar" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <button style={btnStyle} onClick={() => setShowCreate(true)}>+ Adauga cheltuiala</button>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value === '' ? '' : Number(e.target.value)); setPage(1); setSelected(new Set()); }}
          style={{ ...selectStyle, width: 'auto', minWidth: '160px' }}
        >
          <option value="">Toate statusurile</option>
          {Object.entries(EXPENSE_STATUS).map(([k, v]) =>
            <option key={k} value={k}>{v}</option>
          )}
        </select>

        {/* Admin actions */}
        {isAdmin && selected.size > 0 && (
          <>
            <button
              style={{ ...btnOutline, color: '#2e7d32', borderColor: '#2e7d32' }}
              onClick={handleApprove} disabled={actionLoading}
            >
              ✓ Aproba ({selected.size})
            </button>
            <button
              style={{ ...btnOutline, color: '#c62828', borderColor: '#c62828' }}
              onClick={handleReject} disabled={actionLoading}
            >
              ✕ Respinge ({selected.size})
            </button>
          </>
        )}
      </div>

      {error && <ErrorBanner message={error} onRetry={load} />}
      {loading ? <Spinner /> : items.length === 0 ? (
        <Card style={{ padding: '3rem', textAlign: 'center', color: '#aaa', marginTop: '1rem' }}>Nicio cheltuiala gasita</Card>
      ) : (
        <Card style={{ marginTop: '1rem' }}>
          <div className="lro-table-wrap" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8f9fa' }}>
                  <th style={thStyle}></th>
                  {['Data', 'Dosar', 'Categorie', 'Descriere', 'Suma', 'Facturabil', 'Status'].map(h =>
                    <th key={h} style={thStyle}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {items.map(e => (
                  <tr key={e.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                    <td style={tdStyle}>
                      {canSelect(e) && (
                        <input type="checkbox" checked={selected.has(e.id)} onChange={() => toggleSelect(e.id)} />
                      )}
                    </td>
                    <td style={{ ...tdStyle, fontWeight: 600 }}>{fmtDate(e.expenseDate)}</td>
                    <td style={tdStyle}>{e.caseNumber || e.leadName || (e.caseId ? e.caseId.slice(0, 8) : e.leadId?.slice(0, 8) || '-')}</td>
                    <td style={tdStyle}>{EXPENSE_CATEGORIES.find(c => c.value === e.category)?.label ?? '-'}</td>
                    <td style={{ ...tdStyle, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.description}</td>
                    <td style={{ ...tdStyle, fontWeight: 700 }}>{fmtMoney(e.amount, e.currency)}</td>
                    <td style={{ ...tdStyle, fontWeight: 700, color: '#6a1b9a' }}>{fmtMoney(e.billableAmount, e.currency)}</td>
                    <td style={tdStyle}><Badge label={EXPENSE_STATUS[e.status] ?? '-'} color={EXPENSE_STATUS_COLORS[e.status] ?? '#999'} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </Card>
      )}

      {showCreate && <CreateExpenseModal onClose={() => setShowCreate(false)} onCreated={load} />}
    </div>
  );
}

// =====================================================================
//  INVOICES TAB
// =====================================================================

function InvoicesTab() {
  const [items, setItems] = useState<InvoiceListItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [viewId, setViewId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await billingService.getInvoices({ page, pageSize: 20 });
      setItems(res.data); setTotalPages(res.pagination.totalPages);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  return (
    <div style={{ marginTop: '1rem' }}>
      <div className="lro-toolbar" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <button style={btnStyle} onClick={() => setShowCreate(true)}>+ Creaza factura</button>
      </div>

      {error && <ErrorBanner message={error} onRetry={load} />}
      {loading ? <Spinner /> : items.length === 0 ? (
        <Card style={{ padding: '3rem', textAlign: 'center', color: '#aaa' }}>Niciun factura gasita</Card>
      ) : (
        <Card>
          <div className="lro-table-wrap" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8f9fa' }}>
                  {['Nr. factura', 'Data', 'Scadenta', 'Client', 'Dosar', 'Suma', 'Rest de plata', 'Status'].map(h =>
                    <th key={h} style={thStyle}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {items.map(e => (
                  <tr key={e.id}
                    onClick={() => setViewId(e.id)}
                    style={{ borderBottom: '1px solid #f5f5f5', cursor: 'pointer' }}
                    onMouseEnter={ev => (ev.currentTarget.style.background = '#f8f9ff')}
                    onMouseLeave={ev => (ev.currentTarget.style.background = '')}>
                    <td style={{ ...tdStyle, fontWeight: 600, color: '#1a237e' }}>{e.invoiceNumber}</td>
                    <td style={tdStyle}>{fmtDate(e.invoiceDate)}</td>
                    <td style={tdStyle}>{fmtDate(e.dueDate)}</td>
                    <td style={tdStyle}>{e.clientName || '-'}</td>
                    <td style={tdStyle}>{e.caseNumber || '-'}</td>
                    <td style={{ ...tdStyle, fontWeight: 700 }}>{fmtMoney(e.totalAmount, e.currency)}</td>
                    <td style={{ ...tdStyle, fontWeight: 700, color: e.balanceDue > 0 ? '#c62828' : '#2e7d32' }}>{fmtMoney(e.balanceDue, e.currency)}</td>
                    <td style={tdStyle}><Badge label={INVOICE_STATUS[e.status] ?? '-'} color={INVOICE_STATUS_COLORS[e.status] ?? '#999'} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </Card>
      )}

      {showCreate && <CreateInvoiceModal onClose={() => setShowCreate(false)} onCreated={load} />}
      {viewId && <ViewInvoiceModal id={viewId} onClose={() => setViewId(null)} onChanged={load} />}
    </div>
  );
}

// =====================================================================
//  PAYMENTS TAB
// =====================================================================

function PaymentsTab() {
  const [items, setItems] = useState<PaymentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await billingService.getPayments({ page, pageSize: 20 });
      setItems(res.data); setTotalPages(res.pagination.totalPages);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  return (
    <div style={{ marginTop: '1rem' }}>
      <div className="lro-toolbar" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <button style={btnStyle} onClick={() => setShowCreate(true)}>+ Adauga plata</button>
      </div>

      {error && <ErrorBanner message={error} onRetry={load} />}
      {loading ? <Spinner /> : items.length === 0 ? (
        <Card style={{ padding: '3rem', textAlign: 'center', color: '#aaa' }}>Niciun plata gasita</Card>
      ) : (
        <Card>
          <div className="lro-table-wrap" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8f9fa' }}>
                  {['Data', 'Client', 'Factura', 'Suma', 'Metoda de plata', 'Referinta'].map(h =>
                    <th key={h} style={thStyle}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {items.map(e => (
                  <tr key={e.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                    <td style={{ ...tdStyle, fontWeight: 600 }}>{fmtDate(e.paymentDate)}</td>
                    <td style={tdStyle}>{e.clientName || '-'}</td>
                    <td style={tdStyle}>{e.invoiceNumber || e.invoiceId?.slice(0, 8) || '-'}</td>
                    <td style={{ ...tdStyle, fontWeight: 700 }}>{fmtMoney(e.amount, e.currency)}</td>
                    <td style={tdStyle}>{PAYMENT_METHODS[e.method] ?? '-'}</td>
                    <td style={{ ...tdStyle, color: '#888' }}>{e.transactionReference || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </Card>
      )}

      {showCreate && <CreatePaymentModal onClose={() => setShowCreate(false)} onCreated={load} />}
    </div>
  );
}

// =====================================================================
//  TRUST ACCOUNTS TAB
// =====================================================================

function TrustAccountsTab() {
  const [accounts, setAccounts] = useState<TrustAccountDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<TrustTransactionDto[]>([]);
  const [txLoading, setTxLoading] = useState(false);
  const [showDeposit, setShowDeposit] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const data = await billingService.getTrustAccounts();
      setAccounts(data);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const loadTransactions = async (accountId: string) => {
    if (expandedId === accountId) { setExpandedId(null); return; }
    setExpandedId(accountId);
    setTxLoading(true);
    try {
      const res = await billingService.getTrustTransactions(accountId, { page: 1, pageSize: 50 });
      setTransactions(res.data);
    } catch (e: any) { setError(e.message); }
    finally { setTxLoading(false); }
  };

  const handleDeposit = async (accountId: string, amount: number, description: string) => {
    try {
      await billingService.createTrustTransaction({
        trustAccountId: accountId,
        transactionType: 1, // Deposit
        transactionDate: new Date().toISOString(),
        amount,
        description,
      });
      setShowDeposit(null);
      load();
      if (expandedId === accountId) loadTransactions(accountId);
    } catch (e: any) { setError(e.message); }
  };

  return (
    <div style={{ marginTop: '1rem' }}>
      <div className="lro-toolbar" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <button style={btnStyle} onClick={() => setShowCreate(true)}>+ Adauga cont client</button>
      </div>

      {error && <ErrorBanner message={error} onRetry={load} />}
      {loading ? <Spinner /> : accounts.length === 0 ? (
        <Card style={{ padding: '3rem', textAlign: 'center', color: '#aaa' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🏦</div>
          <div>Niciun cont client (trust) gasit.</div>
          <div style={{ fontSize: '0.82rem', marginTop: '0.5rem', color: '#999' }}>
            Conturile client sunt folosite pentru a gestiona fondurile depuse de clienti conform regulilor baroului.
          </div>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {accounts.map(a => (
            <Card key={a.id} style={{ padding: 0, overflow: 'hidden' }}>
              {/* Account header row */}
              <div
                style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', flexWrap: 'wrap' }}
                onClick={() => loadTransactions(a.id)}
              >
                <div style={{ flex: '1 1 200px' }}>
                  <div style={{ fontWeight: 700, color: '#1a237e', fontSize: '0.95rem' }}>{a.clientName || 'Client necunoscut'}</div>
                  <div style={{ fontSize: '0.78rem', color: '#888', marginTop: '0.15rem' }}>Ref: {a.accountReference}</div>
                </div>
                <div style={{ textAlign: 'right', minWidth: '120px' }}>
                  <div style={{ fontSize: '0.72rem', color: '#888', fontWeight: 700, textTransform: 'uppercase' }}>Sold</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: a.balance < a.minimumBalance ? '#c62828' : '#2e7d32' }}>
                    {fmtMoney(a.balance, a.currency)}
                  </div>
                </div>
                <div style={{ textAlign: 'right', minWidth: '100px' }}>
                  <div style={{ fontSize: '0.72rem', color: '#888', fontWeight: 700, textTransform: 'uppercase' }}>Minim</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#555' }}>{fmtMoney(a.minimumBalance, a.currency)}</div>
                </div>
                <div style={{ minWidth: '70px', textAlign: 'center' }}>
                  <Badge label={a.isActive ? 'Activ' : 'Inactiv'} color={a.isActive ? '#4caf50' : '#f44336'} />
                </div>
                <div style={{ minWidth: '90px', textAlign: 'right' }}>
                  <button style={{ ...btnOutline, padding: '0.3rem 0.6rem', fontSize: '0.78rem' }}
                    onClick={(e) => { e.stopPropagation(); setShowDeposit(a.id); }}>
                    + Depunere
                  </button>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#aaa', minWidth: '25px', textAlign: 'center' }}>
                  {expandedId === a.id ? '▲' : '▼'}
                </div>
              </div>

              {/* Notes */}
              {a.notes && (
                <div style={{ padding: '0 1.25rem 0.5rem', fontSize: '0.82rem', color: '#666', fontStyle: 'italic' }}>
                  {a.notes}
                </div>
              )}

              {/* Transaction history (expanded) */}
              {expandedId === a.id && (
                <div style={{ borderTop: '1px solid #f0f0f0', background: '#fafafa' }}>
                  {txLoading ? <div style={{ padding: '1rem', textAlign: 'center' }}><Spinner /></div> : transactions.length === 0 ? (
                    <div style={{ padding: '1.5rem', textAlign: 'center', color: '#aaa', fontSize: '0.85rem' }}>Nicio tranzactie</div>
                  ) : (
                    <div className="lro-table-wrap" style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ background: '#f0f0f0' }}>
                            {['Data', 'Tip', 'Descriere', 'Suma', 'Sold', 'Operator'].map(h =>
                              <th key={h} style={{ ...thStyle, fontSize: '0.75rem', padding: '0.45rem 0.75rem' }}>{h}</th>)}
                          </tr>
                        </thead>
                        <tbody>
                          {transactions.map(tx => (
                            <tr key={tx.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                              <td style={{ ...tdStyle, padding: '0.45rem 0.75rem', fontSize: '0.82rem' }}>{fmtDate(tx.transactionDate)}</td>
                              <td style={{ ...tdStyle, padding: '0.45rem 0.75rem', fontSize: '0.82rem' }}>
                                <Badge label={TRUST_TX_TYPES[tx.transactionType] ?? '-'} color={tx.amount >= 0 ? '#2e7d32' : '#c62828'} />
                              </td>
                              <td style={{ ...tdStyle, padding: '0.45rem 0.75rem', fontSize: '0.82rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tx.description}</td>
                              <td style={{ ...tdStyle, padding: '0.45rem 0.75rem', fontSize: '0.82rem', fontWeight: 700, color: tx.amount >= 0 ? '#2e7d32' : '#c62828' }}>
                                {tx.amount >= 0 ? '+' : ''}{fmtMoney(tx.amount, a.currency)}
                              </td>
                              <td style={{ ...tdStyle, padding: '0.45rem 0.75rem', fontSize: '0.82rem', fontWeight: 600 }}>{fmtMoney(tx.runningBalance, a.currency)}</td>
                              <td style={{ ...tdStyle, padding: '0.45rem 0.75rem', fontSize: '0.82rem', color: '#888' }}>{tx.performedByName || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Inline deposit form */}
              {showDeposit === a.id && (
                <DepositForm
                  onSubmit={(amount, desc) => handleDeposit(a.id, amount, desc)}
                  onCancel={() => setShowDeposit(null)}
                />
              )}
            </Card>
          ))}
        </div>
      )}

      {showCreate && <CreateTrustAccountModal onClose={() => setShowCreate(false)} onCreated={load} />}
    </div>
  );
}

// =====================================================================
//  DEPOSIT FORM (inline in trust account card)
// =====================================================================

function DepositForm({ onSubmit, onCancel }: { onSubmit: (amount: number, desc: string) => void; onCancel: () => void }) {
  const [amount, setAmount] = useState<number | ''>('');
  const [description, setDescription] = useState('');

  return (
    <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid #e0e0e0', background: '#f5f9ff', display: 'flex', gap: '0.75rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
      <div>
        <label style={labelStyle}>Suma</label>
        <input type="number" step="0.01" min="0.01" style={{ ...inputStyle, width: '120px' }}
          value={amount} onChange={e => setAmount(e.target.value ? parseFloat(e.target.value) : '')} />
      </div>
      <div style={{ flex: 1, minWidth: '200px' }}>
        <label style={labelStyle}>Descriere</label>
        <input type="text" style={inputStyle} placeholder="ex: Depunere onorariu dosar..."
          value={description} onChange={e => setDescription(e.target.value)} />
      </div>
      <button style={btnStyle} disabled={!amount || !description.trim()}
        onClick={() => amount && description.trim() && onSubmit(amount, description)}>
        Depune
      </button>
      <button style={btnOutline} onClick={onCancel}>Anuleaza</button>
    </div>
  );
}

// =====================================================================
//  CREATE TRUST ACCOUNT MODAL
// =====================================================================

function CreateTrustAccountModal({ onClose, onCreated }: { onClose: () => void, onCreated: () => void }) {
  const [clientId, setClientId] = useState('');
  const [currency, setCurrency] = useState(1);
  const [minimumBalance, setMinimumBalance] = useState<number | ''>('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [clients, setClients] = useState<{ id: string; name: string }[]>([]);
  const [clientsLoading, setClientsLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/v1/clients')
      .then(res => setClients((res.data ?? []).map((c: any) => ({ id: c.id, name: c.name }))))
      .catch(() => setClients([]))
      .finally(() => setClientsLoading(false));
  }, []);

  const handleSubmit = async () => {
    if (!clientId) { setError('Selectati un client.'); return; }
    setLoading(true); setError('');
    try {
      await billingService.createTrustAccount({
        clientId,
        currency,
        minimumBalance: minimumBalance || 0,
        notes: notes || undefined,
      });
      onCreated();
      onClose();
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="lro-overlay" style={overlayStyle} onClick={onClose}>
      <div className="lro-modal" style={modalStyle} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.1rem', color: '#1a237e' }}>Adauga cont client (trust)</h2>
          <button onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.4rem', color: '#888', lineHeight: 1, padding: '0 0.25rem' }}
            title="Inchide">✕</button>
        </div>

        {error && <div style={{ color: '#f44336', fontSize: '0.9rem', marginBottom: '1rem', padding: '0.5rem 0.75rem', background: '#fff3f3', borderRadius: '6px', border: '1px solid #f44336' }}>{error}</div>}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
          <div>
            <label style={labelStyle}>Client *</label>
            {clientsLoading ? (
              <div style={{ fontSize: '0.82rem', color: '#888', padding: '0.4rem 0' }}>Se incarca clientii...</div>
            ) : (
              <select style={selectStyle} value={clientId} onChange={e => setClientId(e.target.value)}>
                <option value="">— Selecteaza clientul —</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            )}
          </div>

          <div>
            <label style={labelStyle}>Moneda</label>
            <select style={selectStyle} value={currency} onChange={e => setCurrency(+e.target.value)}>
              {Object.entries(CURRENCY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Sold minim obligatoriu</label>
            <input type="number" step="0.01" min="0" style={inputStyle}
              value={minimumBalance}
              onChange={e => setMinimumBalance(e.target.value ? parseFloat(e.target.value) : '')}
              placeholder="0.00"
            />
            <div style={{ fontSize: '0.72rem', color: '#888', marginTop: '0.2rem' }}>
              Conform regulilor baroului, contul va afisa avertizare cand soldul scade sub aceasta valoare.
            </div>
          </div>

          <div>
            <label style={labelStyle}>Notite</label>
            <textarea style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Informatii suplimentare despre cont..."
            />
          </div>
        </div>

        <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button style={btnOutline} onClick={onClose} disabled={loading}>Anuleaza</button>
          <button style={btnStyle} onClick={handleSubmit} disabled={loading}>
            {loading ? <Spinner size={18} /> : 'Creeaza cont'}
          </button>
        </div>
      </div>
    </div>
  );
}

// =====================================================================
//  RATES TAB
// =====================================================================

function RatesTab() {
  const [rates, setRates] = useState<BillingRateDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const data = await billingService.getBillingRates();
      setRates(data);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: string) => {
    if (!confirm('Sigur doriti sa stergeti acest tarif?')) return;
    try {
      await billingService.deleteBillingRate(id);
      load();
    } catch (e: any) { setError(e.message); }
  };

  const scopeLabel = (r: BillingRateDto) => {
    const parts: string[] = [];
    if (r.userFullName) parts.push(`👤 ${r.userFullName}`);
    if (r.clientName) parts.push(`🏢 ${r.clientName}`);
    if (r.caseNumber) parts.push(`📁 ${r.caseNumber}`);
    return parts.length > 0 ? parts.join('  ·  ') : 'Tarif implicit firma';
  };

  return (
    <div style={{ marginTop: '1rem' }}>
      <div className="lro-toolbar" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <button style={btnStyle} onClick={() => setShowCreate(true)}>+ Adauga tarif</button>
        <span style={{ fontSize: '0.78rem', color: '#888', marginLeft: '0.5rem' }}>
          Tarifele se aplica in ordine de prioritate: dosar &gt; client &gt; avocat &gt; firma
        </span>
      </div>

      {error && <ErrorBanner message={error} onRetry={load} />}
      {loading ? <Spinner /> : rates.length === 0 ? (
        <Card style={{ padding: '3rem', textAlign: 'center', color: '#aaa' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>💲</div>
          <div>Niciun tarif configurat.</div>
          <div style={{ fontSize: '0.82rem', marginTop: '0.5rem', color: '#999' }}>
            Adaugati tarife orare pentru avocati, clienti sau dosare. Se va folosi tariful implicit de 300 RON/ora daca nu exista alte tarife.
          </div>
        </Card>
      ) : (
        <Card>
          <div className="lro-table-wrap" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8f9fa' }}>
                  {['Aplicabilitate', 'Tarif orar', 'Moneda', 'Valabil de la', 'Valabil pana la', 'Descriere', ''].map(h =>
                    <th key={h} style={thStyle}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {rates.map(r => (
                  <tr key={r.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                    <td style={{ ...tdStyle, fontWeight: 600 }}>
                      {scopeLabel(r)}
                    </td>
                    <td style={{ ...tdStyle, fontWeight: 700, color: '#1a237e', fontSize: '1rem' }}>
                      {fmtMoney(r.rate, r.currency)}
                    </td>
                    <td style={tdStyle}>{CURRENCY_LABELS[r.currency] ?? 'RON'}</td>
                    <td style={tdStyle}>{fmtDate(r.effectiveFrom)}</td>
                    <td style={tdStyle}>{r.effectiveTo ? fmtDate(r.effectiveTo) : <span style={{ color: '#aaa' }}>Nedefinit</span>}</td>
                    <td style={{ ...tdStyle, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#666' }}>
                      {r.description || '-'}
                    </td>
                    <td style={tdStyle}>
                      <button
                        onClick={() => handleDelete(r.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c62828', fontSize: '0.82rem', fontWeight: 600 }}
                        title="Sterge tariful"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {showCreate && <CreateBillingRateModal onClose={() => setShowCreate(false)} onCreated={load} />}
    </div>
  );
}

// =====================================================================
//  REPORTS TAB
// =====================================================================

function ReportsTab() {
  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [fromDate, setFromDate] = useState(firstOfMonth.toISOString().slice(0, 10));
  const [toDate, setToDate] = useState(now.toISOString().slice(0, 10));
  const [summary, setSummary] = useState<BillingSummaryDto | null>(null);
  const [productivity, setProductivity] = useState<LawyerProductivityDto[]>([]);
  const [aging, setAging] = useState<ArAgingDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const params = { from: fromDate, to: toDate };
      const [s, p, a] = await Promise.all([
        billingService.getBillingSummary(params),
        billingService.getLawyerProductivity(params),
        billingService.getArAging(),
      ]);
      setSummary(s); setProductivity(p); setAging(a);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }, [fromDate, toDate]);

  useEffect(() => { load(); }, [load]);

  // Quick date-range presets
  const setPreset = (months: number) => {
    const end = new Date();
    const start = new Date(end.getFullYear(), end.getMonth() - months + 1, 1);
    setFromDate(start.toISOString().slice(0, 10));
    setToDate(end.toISOString().slice(0, 10));
  };

  const presetBtn = (label: string, months: number) => (
    <button key={label} onClick={() => setPreset(months)}
      style={{ padding: '0.3rem 0.65rem', fontSize: '0.78rem', border: '1px solid #ccc', borderRadius: '4px', background: '#fff', cursor: 'pointer', color: '#555' }}>
      {label}
    </button>
  );

  const KPI = (icon: string, label: string, value: string, color: string) => (
    <div style={{ padding: '1rem', background: color + '08', borderRadius: '8px', borderLeft: `4px solid ${color}` }}>
      <div style={{ fontSize: '0.72rem', color: '#888', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{icon} {label}</div>
      <div style={{ fontSize: '1.4rem', fontWeight: 800, color, marginTop: '0.25rem', lineHeight: 1 }}>{value}</div>
    </div>
  );

  return (
    <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Date range filter bar */}
      <Card style={{ padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div>
            <label style={labelStyle}>De la</label>
            <input type="date" style={{ ...inputStyle, width: '160px' }} value={fromDate} onChange={e => setFromDate(e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Pana la</label>
            <input type="date" style={{ ...inputStyle, width: '160px' }} value={toDate} onChange={e => setToDate(e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
            {presetBtn('Luna curenta', 1)}
            {presetBtn('3 luni', 3)}
            {presetBtn('6 luni', 6)}
            {presetBtn('12 luni', 12)}
          </div>
          <button style={btnStyle} onClick={load} disabled={loading}>
            {loading ? '...' : '🔄 Genereaza'}
          </button>
        </div>
      </Card>

      {error && <ErrorBanner message={error} onRetry={load} />}
      {loading ? <Spinner /> : (
        <>
          {/* ── Financial Summary KPIs ───────────────────────── */}
          {summary && (
            <Card style={{ padding: '1.25rem' }}>
              <h3 style={{ margin: '0 0 1rem', fontSize: '0.95rem', color: '#1a237e' }}>📊 Sumar Financiar</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                {KPI('🔧', 'WIP (Nefacturat)', fmtMoney(summary.totalWip), '#f57c00')}
                {KPI('📄', 'Total Facturat', fmtMoney(summary.totalBilled), '#1976d2')}
                {KPI('💰', 'Total Incasat', fmtMoney(summary.totalCollected), '#2e7d32')}
                {KPI('⚠️', 'Restante', fmtMoney(summary.totalOutstanding), '#c62828')}
                {KPI('📊', 'Rata realizare', `${summary.realizationRate}%`, '#6a1b9a')}
                {KPI('📈', 'Rata colectare', `${summary.collectionRate}%`, '#00838f')}
                {KPI('🔴', 'Facturi restante', `${summary.overdueInvoiceCount}`, '#c62828')}
                {KPI('🏦', 'Sold conturi client', fmtMoney(summary.trustAccountsBalance), '#1a237e')}
              </div>
            </Card>
          )}

          {/* ── Lawyer Productivity ──────────────────────────── */}
          <Card style={{ padding: '1.25rem' }}>
            <h3 style={{ margin: '0 0 1rem', fontSize: '0.95rem', color: '#1a237e' }}>👤 Productivitate Avocati</h3>
            {productivity.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#aaa' }}>
                Niciun pontaj inregistrat in perioada selectata.
              </div>
            ) : (
              <div className="lro-table-wrap" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f8f9fa' }}>
                      {['Avocat', 'Ore totale', 'Ore facturabile', 'Ore nefacturabile', 'Utilizare', 'Facturat', 'Incasat'].map(h =>
                        <th key={h} style={thStyle}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {productivity.map(p => {
                      const utilColor = p.utilizationRate >= 70 ? '#2e7d32' : p.utilizationRate >= 40 ? '#f57c00' : '#c62828';
                      return (
                        <tr key={p.userId} style={{ borderBottom: '1px solid #f5f5f5' }}>
                          <td style={{ ...tdStyle, fontWeight: 600 }}>{p.fullName}</td>
                          <td style={tdStyle}>{fmtHours(p.totalHours)}</td>
                          <td style={{ ...tdStyle, fontWeight: 700, color: '#1a237e' }}>{fmtHours(p.billableHours)}</td>
                          <td style={{ ...tdStyle, color: '#888' }}>{fmtHours(p.nonBillableHours)}</td>
                          <td style={tdStyle}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <div style={{ width: '60px', height: '8px', background: '#e0e0e0', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{ width: `${Math.min(100, p.utilizationRate)}%`, height: '100%', background: utilColor, borderRadius: '4px' }} />
                              </div>
                              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: utilColor }}>{p.utilizationRate}%</span>
                            </div>
                          </td>
                          <td style={{ ...tdStyle, fontWeight: 700 }}>{fmtMoney(p.billedAmount)}</td>
                          <td style={{ ...tdStyle, fontWeight: 700, color: '#2e7d32' }}>{fmtMoney(p.collectedAmount)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  {/* Totals row */}
                  <tfoot>
                    <tr style={{ background: '#f0f0f0', fontWeight: 700 }}>
                      <td style={{ ...tdStyle, fontWeight: 800 }}>TOTAL</td>
                      <td style={tdStyle}>{fmtHours(productivity.reduce((s, p) => s + p.totalHours, 0))}</td>
                      <td style={{ ...tdStyle, color: '#1a237e' }}>{fmtHours(productivity.reduce((s, p) => s + p.billableHours, 0))}</td>
                      <td style={{ ...tdStyle, color: '#888' }}>{fmtHours(productivity.reduce((s, p) => s + p.nonBillableHours, 0))}</td>
                      <td style={tdStyle}>
                        {(() => {
                          const totalBillable = productivity.reduce((s, p) => s + p.billableHours, 0);
                          const totalAll = productivity.reduce((s, p) => s + p.totalHours, 0);
                          const avgUtil = totalAll > 0 ? Math.round(totalBillable / totalAll * 100) : 0;
                          return <span style={{ fontWeight: 700 }}>{avgUtil}% medie</span>;
                        })()}
                      </td>
                      <td style={{ ...tdStyle, fontWeight: 800 }}>{fmtMoney(productivity.reduce((s, p) => s + p.billedAmount, 0))}</td>
                      <td style={{ ...tdStyle, fontWeight: 800, color: '#2e7d32' }}>{fmtMoney(productivity.reduce((s, p) => s + p.collectedAmount, 0))}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </Card>

          {/* ── AR Aging ─────────────────────────────────────── */}
          {aging && (
            <Card style={{ padding: '1.25rem' }}>
              <h3 style={{ margin: '0 0 1rem', fontSize: '0.95rem', color: '#1a237e' }}>📅 Vechime Creante (AR Aging)</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem' }}>
                {([
                  ['0–30 zile', aging.current, '#2e7d32'],
                  ['31–60 zile', aging.thirtyDays, '#f57c00'],
                  ['61–90 zile', aging.sixtyDays, '#e65100'],
                  ['90+ zile', aging.ninetyPlusDays, '#c62828'],
                  ['Total', aging.total, '#1a237e'],
                ] as [string, number, string][]).map(([label, val, color]) => {
                  const pct = aging.total > 0 ? Math.round(val / aging.total * 100) : 0;
                  return (
                    <div key={label} style={{ textAlign: 'center', padding: '1rem', background: color + '0a', borderRadius: '8px', position: 'relative' }}>
                      <div style={{ fontSize: '0.72rem', color: '#888', fontWeight: 700, textTransform: 'uppercase' }}>{label}</div>
                      <div style={{ fontSize: '1.3rem', fontWeight: 800, color, marginTop: '0.25rem' }}>{fmtMoney(val)}</div>
                      {label !== 'Total' && aging.total > 0 && (
                        <div style={{ marginTop: '0.5rem' }}>
                          <div style={{ width: '100%', height: '6px', background: '#e0e0e0', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '3px' }} />
                          </div>
                          <div style={{ fontSize: '0.7rem', color: '#aaa', marginTop: '0.2rem' }}>{pct}% din total</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

// =====================================================================
//  CREATE TIME ENTRY MODAL
// =====================================================================

interface TimeEntryForm {
  caseId: string;
  workDate: string;
  startTime: string;
  endTime: string;
  durationHours: number | '';
  description: string;
  activityCode: string;
  isBillable: boolean;
  hourlyRateOverride: number | '';
  currency: number;
}

const emptyTimeForm = (): TimeEntryForm => ({
  caseId: '',
  workDate: new Date().toISOString().slice(0, 10),
  startTime: '',
  endTime: '',
  durationHours: '',
  description: '',
  activityCode: '',
  isBillable: true,
  hourlyRateOverride: '',
  currency: 1,
});

/** Compute decimal hours from HH:MM strings; returns '' when either is missing */
function computeHours(start: string, end: string): number | '' {
  if (!start || !end) return '';
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const diff = (eh * 60 + em) - (sh * 60 + sm);
  return diff > 0 ? Math.round(diff / 60 * 100) / 100 : '';
}

function CreateTimeEntryModal({ onClose, onCreated }: { onClose: () => void, onCreated: () => void }) {
  const [form, setForm] = useState<TimeEntryForm>(emptyTimeForm);
  const [loading, setLoading] = useState(false);
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [leadsLoading, setLeadsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    leadService.getLeads({ page: 1, pageSize: 500 })
      .then(res => setLeads(res.data))
      .catch(() => setLeads([]))
      .finally(() => setLeadsLoading(false));
  }, []);

  const patch = (fields: Partial<TimeEntryForm>) =>
    setForm(prev => {
      const next = { ...prev, ...fields };
      // Auto-compute duration when start or end changes
      if ('startTime' in fields || 'endTime' in fields) {
        next.durationHours = computeHours(next.startTime, next.endTime);
      }
      return next;
    });

  const buildRequest = () => ({
    leadId: form.caseId,
    workDate: form.workDate,
    durationHours: form.durationHours || 0,
    description: form.description,
    activityCode: form.activityCode || undefined,
    isBillable: form.isBillable,
    hourlyRateOverride: form.hourlyRateOverride !== '' ? form.hourlyRateOverride : undefined,
    currency: form.currency,
  });

  const isValid = () =>
    !!form.caseId && !!form.workDate && !!form.durationHours && !!form.description.trim();

  /** Save as Draft — creates with status=Draft (backend default) */
  const handleSaveDraft = async () => {
    if (!isValid()) { setError('Completeaza dosarul, data, durata si descrierea.'); return; }
    setLoading(true); setError('');
    try {
      await billingService.createTimeEntry(buildRequest());
      onCreated(); onClose();
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  /** Save + submit for approval — creates as Draft then immediately submits for approval */
  const handleSubmit = async () => {
    if (!isValid()) { setError('Completeaza dosarul, data, durata si descrierea.'); return; }
    setLoading(true); setError('');
    try {
      const entry = await billingService.createTimeEntry(buildRequest());
      await billingService.submitTimeEntries([entry.id]);
      onCreated(); onClose();
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="lro-overlay" style={overlayStyle} onClick={onClose}>
      <div className="lro-modal" style={modalStyle} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.1rem', color: '#1a237e' }}>Adauga pontaj nou</h2>
          <button onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.4rem', color: '#888', lineHeight: 1, padding: '0 0.25rem' }}
            title="Inchide">✕</button>
        </div>

        {error && <div style={{ color: '#f44336', fontSize: '0.9rem', marginBottom: '1rem', padding: '0.5rem 0.75rem', background: '#fff3f3', borderRadius: '6px', border: '1px solid #f44336' }}>{error}</div>}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
          {/* Dosar */}
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Dosar *</label>
            {leadsLoading ? (
              <div style={{ fontSize: '0.82rem', color: '#888', padding: '0.4rem 0' }}>Se incarca dosarele...</div>
            ) : leads.length === 0 ? (
              <div style={{ fontSize: '0.82rem', color: '#f57c00', padding: '0.4rem 0' }}>Nu exista dosare. Creati un lead din pagina Leads inainte de a adauga pontaj.</div>
            ) : (
              <select style={selectStyle} value={form.caseId} onChange={e => patch({ caseId: e.target.value })}>
                <option value="">— Selecteaza dosarul —</option>
                {leads.map(l => (
                  <option key={l.id} value={l.id}>
                    {l.name}{l.phone ? ` · ${l.phone}` : ''}{l.email ? ` · ${l.email}` : ''}
                  </option>
                ))}
              </select>
            ) }
          </div>

          {/* Data */}
          <div>
            <label style={labelStyle}>Data lucrata *</label>
            <input type="date" style={inputStyle}
              value={form.workDate}
              onChange={e => patch({ workDate: e.target.value })} />
          </div>

          {/* Facturabil */}
          <div>
            <label style={labelStyle}>Facturabil</label>
            <select style={selectStyle} value={form.isBillable ? '1' : '0'}
              onChange={e => patch({ isBillable: e.target.value === '1' })}>
              <option value="1">Da</option>
              <option value="0">Nu</option>
            </select>
          </div>

          {/* Ora inceput */}
          <div>
            <label style={labelStyle}>Ora inceput</label>
            <input type="time" style={inputStyle}
              value={form.startTime}
              onChange={e => patch({ startTime: e.target.value })} />
          </div>

          {/* Ora sfarsit */}
          <div>
            <label style={labelStyle}>Ora sfarsit</label>
            <input type="time" style={inputStyle}
              value={form.endTime}
              onChange={e => patch({ endTime: e.target.value })} />
          </div>

          {/* Durata */}
          <div>
            <label style={labelStyle}>Durata (ore) *</label>
            <input type="number" step="0.01" min="0.01" max="24" style={inputStyle}
              value={form.durationHours}
              onChange={e => patch({ durationHours: e.target.value ? parseFloat(e.target.value) : '' })} />
          </div>

          {/* Tarif ora override */}
          <div>
            <label style={labelStyle}>Tarif/ora (optional — gol = tarif automat)</label>
            <input type="number" step="0.01" style={inputStyle}
              value={form.hourlyRateOverride}
              onChange={e => patch({ hourlyRateOverride: e.target.value ? parseFloat(e.target.value) : '' })} />
          </div>

          {/* Cod activitate */}
          <div>
            <label style={labelStyle}>Cod activitate</label>
            <input type="text" style={inputStyle} placeholder="ex: RESEARCH, DRAFTING, COURT"
              value={form.activityCode}
              onChange={e => patch({ activityCode: e.target.value })} />
          </div>

          {/* Moneda */}
          <div>
            <label style={labelStyle}>Moneda</label>
            <select style={selectStyle} value={form.currency}
              onChange={e => patch({ currency: +e.target.value })}>
              {Object.entries(CURRENCY_LABELS).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>

          {/* Descriere — full width */}
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Descriere *</label>
            <textarea style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
              value={form.description}
              onChange={e => patch({ description: e.target.value })}
              placeholder="Descrieti activitatea desfasurata..." />
          </div>
        </div>

        <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button style={btnOutline} onClick={handleSaveDraft} disabled={loading}>
            {loading ? '...' : 'Salveaza ca draft'}
          </button>
          <button style={btnStyle} onClick={handleSubmit} disabled={loading}>
            {loading ? <Spinner size={18} /> : 'Salveaza si trimite spre aprobat'}
          </button>
        </div>
      </div>
    </div>
  );
}

// =====================================================================
//  EDIT TIME ENTRY MODAL (Draft only)
// =====================================================================

function EditTimeEntryModal({ entry, onClose, onSaved }: { entry: TimeEntryDto; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    workDate: entry.workDate ? new Date(entry.workDate).toISOString().slice(0, 10) : '',
    durationHours: entry.durationHours as number | '',
    description: entry.description,
    activityCode: entry.activityCode ?? '',
    isBillable: entry.isBillable,
    hourlyRateOverride: '' as number | '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const patch = (fields: Partial<typeof form>) => setForm(prev => ({ ...prev, ...fields }));

  const isValid = () =>
    !!form.workDate && !!form.durationHours && !!form.description.trim();

  const handleSave = async () => {
    if (!isValid()) { setError('Completeaza data, durata si descrierea.'); return; }
    setLoading(true); setError('');
    try {
      await billingService.updateTimeEntry(entry.id, {
        workDate: form.workDate,
        durationHours: form.durationHours || 0,
        description: form.description,
        activityCode: form.activityCode || undefined,
        isBillable: form.isBillable,
        hourlyRateOverride: form.hourlyRateOverride !== '' ? form.hourlyRateOverride : undefined,
      });
      onSaved(); onClose();
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="lro-overlay" style={overlayStyle} onClick={onClose}>
      <div className="lro-modal" style={modalStyle} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.1rem', color: '#1a237e' }}>Editeaza pontaj</h2>
          <button onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.4rem', color: '#888', lineHeight: 1, padding: '0 0.25rem' }}
            title="Inchide">&#10005;</button>
        </div>

        {entry.rejectionReason && (
          <div style={{ marginBottom: '1rem', padding: '0.5rem 0.75rem', background: '#fff3f3', borderRadius: '6px', border: '1px solid #ef9a9a', fontSize: '0.85rem', color: '#c62828' }}>
            &#10005; Respins: {entry.rejectionReason}
          </div>
        )}

        {error && <div style={{ color: '#f44336', fontSize: '0.9rem', marginBottom: '1rem', padding: '0.5rem 0.75rem', background: '#fff3f3', borderRadius: '6px', border: '1px solid #f44336' }}>{error}</div>}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
          <div>
            <label style={labelStyle}>Dosar</label>
            <input style={{ ...inputStyle, background: '#f5f5f5' }} disabled
              value={entry.caseNumber || entry.leadName || entry.caseId?.slice(0, 8) || '-'} />
          </div>

          <div>
            <label style={labelStyle}>Data lucrata *</label>
            <input type="date" style={inputStyle}
              value={form.workDate}
              onChange={e => patch({ workDate: e.target.value })} />
          </div>

          <div>
            <label style={labelStyle}>Durata (ore) *</label>
            <input type="number" step="0.01" min="0.01" max="24" style={inputStyle}
              value={form.durationHours}
              onChange={e => patch({ durationHours: e.target.value ? parseFloat(e.target.value) : '' })} />
          </div>

          <div>
            <label style={labelStyle}>Facturabil</label>
            <select style={selectStyle} value={form.isBillable ? '1' : '0'}
              onChange={e => patch({ isBillable: e.target.value === '1' })}>
              <option value="1">Da</option>
              <option value="0">Nu</option>
            </select>
          </div>

          <div>
            <label style={labelStyle}>Tarif/ora (optional)</label>
            <input type="number" step="0.01" style={inputStyle}
              value={form.hourlyRateOverride}
              onChange={e => patch({ hourlyRateOverride: e.target.value ? parseFloat(e.target.value) : '' })} />
          </div>

          <div>
            <label style={labelStyle}>Cod activitate</label>
            <input type="text" style={inputStyle} placeholder="ex: RESEARCH, DRAFTING"
              value={form.activityCode}
              onChange={e => patch({ activityCode: e.target.value })} />
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Descriere *</label>
            <textarea style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
              value={form.description}
              onChange={e => patch({ description: e.target.value })}
              placeholder="Descrieti activitatea desfasurata..." />
          </div>
        </div>

        <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button style={btnOutline} onClick={onClose}>Anuleaza</button>
          <button style={btnStyle} onClick={handleSave} disabled={loading}>
            {loading ? <Spinner size={18} /> : 'Salveaza modificarile'}
          </button>
        </div>
      </div>
    </div>
  );
}

// =====================================================================
//  CREATE EXPENSE MODAL
// =====================================================================

function CreateExpenseModal({ onClose, onCreated }: { onClose: () => void, onCreated: () => void }) {
  const [form, setForm] = useState({
    caseId: '', leadId: '', expenseDate: '', category: 0, description: '',
    amount: 0, currency: 1, markupPercent: 0, isBillable: true,
    vendor: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [leads, setLeads] = useState<LeadDropdownItem[]>([]);
  const [dosarLoading, setDosarLoading] = useState(false);

  const loadDosare = useCallback(async () => {
    setDosarLoading(true);
    try {
      const [c, l] = await Promise.all([
        billingService.getCases().catch(() => [] as CaseItem[]),
        billingService.getLeadsForDropdown(),
      ]);
      setCases(c);
      setLeads(l);
    } catch (e: any) { setError(e.message); }
    finally { setDosarLoading(false); }
  }, []);

  useEffect(() => { loadDosare(); }, [loadDosare]);

  const handleSubmit = async () => {
    if (!form.leadId && !form.caseId) { setError('Selectati un dosar sau un lead'); return; }
    if (!form.expenseDate) { setError('Introduceti data cheltuielii'); return; }
    if (!form.category) { setError('Selectati categoria'); return; }
    if (!form.amount || form.amount <= 0) { setError('Introduceti o suma valida'); return; }
    setLoading(true); setError('');
    try {
      await billingService.createExpense({
        caseId: form.caseId || undefined,
        leadId: form.leadId || undefined,
        expenseDate: form.expenseDate,
        category: form.category,
        description: form.description || '',
        amount: form.amount,
        currency: form.currency,
        markupPercent: form.markupPercent,
        isBillable: form.isBillable,
        vendor: form.vendor || undefined,
      });
      onCreated();
      onClose();
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="lro-overlay" style={overlayStyle} onClick={onClose}>
      <div className="lro-modal" style={modalStyle} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.1rem', color: '#1a237e' }}>Adauga cheltuiala noua</h2>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.4rem', color: '#888', lineHeight: 1, padding: '0 0.25rem' }}
            title="Inchide"
          >
            ✕
          </button>
        </div>

        {error && <div style={{ color: '#f44336', fontSize: '0.9rem', marginBottom: '1rem' }}>{error}</div>}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
          <div>
            <label style={labelStyle}>Data cheltuielii *</label>
            <input type="date" style={inputStyle}
              value={form.expenseDate?.toString().substring(0, 10) || ''}
              onChange={e => setForm({ ...form, expenseDate: e.target.value })}
            />
          </div>

          <div>
            <label style={labelStyle}>Dosar *</label>
            {dosarLoading ? (
              <div style={{ fontSize: '0.82rem', color: '#888', padding: '0.4rem 0' }}>Se incarca...</div>
            ) : (
              <select
                style={selectStyle}
                value={form.leadId || form.caseId}
                onChange={e => {
                  const val = e.target.value;
                  const isLead = leads.some(l => l.id === val);
                  setForm({ ...form, leadId: isLead ? val : '', caseId: isLead ? '' : val });
                }}
              >
                <option value="">— Selecteaza —</option>
                {leads.length > 0 && (
                  <optgroup label="Lead-uri">
                    {leads.map(l => (
                      <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                  </optgroup>
                )}
                {cases.length > 0 && (
                  <optgroup label="Dosare">
                    {cases.map(c => (
                      <option key={c.id} value={c.id}>{c.caseNumber} · {c.title}</option>
                    ))}
                  </optgroup>
                )}
              </select>
            )}
          </div>

          <div>
            <label style={labelStyle}>Categorie *</label>
            <select style={selectStyle}
              value={form.category}
              onChange={e => setForm({ ...form, category: parseInt(e.target.value) })}
            >
              <option value="">— Selecteaza categoria —</option>
              {EXPENSE_CATEGORIES.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Suma *</label>
            <input type="number" step="0.01" style={inputStyle}
              value={form.amount || ''}
              onChange={e => setForm({ ...form, amount: parseFloat(e.target.value) })}
            />
          </div>

          <div>
            <label style={labelStyle}>Facturabil</label>
            <select style={selectStyle}
              value={form.isBillable ? '1' : '0'}
              onChange={e => setForm({ ...form, isBillable: e.target.value === '1' })}
            >
              <option value="0">Nu</option>
              <option value="1">Da</option>
            </select>
          </div>

          <div>
            <label style={labelStyle}>Descriere</label>
            <textarea style={{ ...inputStyle, minHeight: '120px' }}
              value={form.description || ''}
              onChange={e => setForm({ ...form, description: e.target.value })}
            />
          </div>
        </div>

        <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button style={btnOutline} onClick={onClose} disabled={loading}>
            Anuleaza
          </button>
          <button style={btnStyle} onClick={handleSubmit} disabled={loading}>
            {loading ? <Spinner size={18} /> : 'Salveaza'}
          </button>
        </div>
      </div>
    </div>
  );
}

// =====================================================================
//  CREATE INVOICE MODAL
// =====================================================================

// =====================================================================
//  VIEW INVOICE MODAL
// =====================================================================

function ViewInvoiceModal({ id, onClose, onChanged }: { id: string; onClose: () => void; onChanged: () => void }) {
  const [inv, setInv]     = useState<InvoiceDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [acting, setActing] = useState(false);

  useEffect(() => {
    billingService.getInvoice(id)
      .then(setInv)
      .catch((e: any) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAction = async (action: 'send' | 'cancel') => {
    if (!inv) return;
    if (!window.confirm(action === 'cancel' ? 'Anulati factura?' : 'Trimiteti factura pe email clientului?')) return;
    setActing(true);
    try {
      if (action === 'send')   await billingService.sendInvoice(id);
      if (action === 'cancel') await billingService.cancelInvoice(id);
      const updated = await billingService.getInvoice(id);
      setInv(updated);
      onChanged();
    } catch (e: any) { setError(e.message); }
    finally { setActing(false); }
  };

  const pRow = (label: string, val?: string | null) => val
    ? <div style={{ fontSize: '0.78rem', marginBottom: '0.18rem' }}><span style={{ color: '#666' }}>{label}: </span><span style={{ fontWeight: 600 }}>{val}</span></div>
    : null;

  const overlayS: React.CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '1rem' };
  const modalS:   React.CSSProperties = { background: 'white', borderRadius: '12px', width: '100%', maxWidth: 860, maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 8px 40px rgba(0,0,0,0.2)' };

  return (
    <div style={overlayS} onClick={onClose}>
      <div style={modalS} onClick={e => e.stopPropagation()}>

        {/* ── Modal toolbar ── */}
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #e8eaf6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg,#1a237e,#3949ab)', borderRadius: '12px 12px 0 0' }}>
          <div style={{ color: 'white', fontWeight: 700, fontSize: '1rem' }}>
            {inv ? `Factura ${inv.invoiceNumber}` : 'Detalii factura'}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {inv && inv.status === 1 && (
              <button onClick={() => handleAction('send')} disabled={acting}
                style={{ padding: '0.35rem 0.85rem', background: '#1565c0', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}>
                📧 Trimite
              </button>
            )}
            {inv && (inv.status === 1 || inv.status === 2) && (
              <button onClick={() => handleAction('cancel')} disabled={acting}
                style={{ padding: '0.35rem 0.85rem', background: '#c62828', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}>
                🚫 Anuleaza
              </button>
            )}
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer', fontSize: '1.1rem' }}>✕</button>
          </div>
        </div>

        {error && <div style={{ background: '#ffebee', padding: '0.75rem 1.5rem', color: '#c62828', fontSize: '0.85rem' }}>⚠️ {error}</div>}
        {loading && <div style={{ padding: '3rem', textAlign: 'center' }}><Spinner /></div>}

        {inv && (
          <div style={{ padding: '1.5rem', fontFamily: 'Arial, sans-serif', fontSize: '0.88rem', color: '#222' }}>

            {/* Status badge */}
            <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <Badge label={INVOICE_STATUS[inv.status] ?? '-'} color={INVOICE_STATUS_COLORS[inv.status] ?? '#999'} />
              {inv.caseNumber && <span style={{ fontSize: '0.8rem', color: '#555' }}>Dosar: <strong>{inv.caseNumber}</strong></span>}
            </div>

            {/* Title */}
            <div style={{ textAlign: 'center', marginBottom: '1.25rem', borderBottom: '2px solid #1a237e', paddingBottom: '0.75rem' }}>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1a237e', letterSpacing: '0.05em' }}>FACTURA FISCALA</div>
            </div>

            {/* ── 3-column header ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '1rem', marginBottom: '1.25rem', alignItems: 'start' }}>

              {/* LEFT — Furnizor */}
              <div style={{ background: '#f0f4ff', borderRadius: '6px', padding: '0.75rem', borderLeft: '3px solid #1a237e' }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#1a237e', textTransform: 'uppercase', marginBottom: '0.4rem', letterSpacing: '0.06em' }}>Furnizor</div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.25rem' }}>{inv.firmName ?? '—'}</div>
                {pRow('Adresa', inv.firmAddress)}
                {pRow('CIF', inv.firmFiscalCode)}
                {pRow('Nr. Reg. Com.', inv.firmRegistrationCode)}
                {pRow('Banca', inv.firmBank)}
                {pRow('IBAN', inv.firmBankAccount)}
              </div>

              {/* CENTRE — Invoice meta */}
              <div style={{ textAlign: 'center', minWidth: 175, padding: '0.5rem' }}>
                <div style={{ fontSize: '0.72rem', color: '#888', marginBottom: '0.15rem' }}>Seria / Nr.</div>
                <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#1a237e', marginBottom: '0.75rem' }}>{inv.invoiceNumber}</div>
                <div style={{ fontSize: '0.72rem', color: '#888' }}>Data emiterii</div>
                <div style={{ fontWeight: 700, marginBottom: '0.5rem' }}>{fmtDate(inv.invoiceDate)}</div>
                <div style={{ fontSize: '0.72rem', color: '#888' }}>Data scadentei</div>
                <div style={{ fontWeight: 700, color: '#c62828', marginBottom: '0.5rem' }}>{fmtDate(inv.dueDate)}</div>
                {inv.caseNumber && <>
                  <div style={{ fontSize: '0.72rem', color: '#888' }}>Dosar</div>
                  <div style={{ fontWeight: 700 }}>{inv.caseNumber}</div>
                </>}
                {(inv.periodStart || inv.periodEnd) && (
                  <div style={{ fontSize: '0.72rem', color: '#888', marginTop: '0.4rem' }}>
                    Perioada: {fmtDate(inv.periodStart)} — {fmtDate(inv.periodEnd)}
                  </div>
                )}
              </div>

              {/* RIGHT — Client */}
              <div style={{ background: '#fff8e1', borderRadius: '6px', padding: '0.75rem', borderLeft: '3px solid #f57c00' }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#e65100', textTransform: 'uppercase', marginBottom: '0.4rem', letterSpacing: '0.06em' }}>
                  {inv.clientIsCorporate ? 'Beneficiar (Firma)' : 'Beneficiar (Persoana fizica)'}
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.25rem' }}>{inv.clientName ?? '—'}</div>
                {pRow('Adresa', inv.clientAddress)}
                {inv.clientIsCorporate && pRow('CIF', inv.clientFiscalCode)}
                {inv.clientIsCorporate && pRow('Nr. Reg. Com.', inv.clientRegistrationCode)}
                {inv.clientIsCorporate && pRow('Banca', inv.clientBank)}
                {inv.clientIsCorporate && pRow('IBAN', inv.clientBankAccount)}
              </div>
            </div>

            {/* ── Line items ── */}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', marginBottom: '1rem' }}>
              <thead>
                <tr style={{ background: '#1a237e', color: 'white' }}>
                  {['Nr.', 'Denumire produs/serviciu', 'Cod', 'UM', 'Cant.', 'TVA%', 'Pret (fara TVA)', 'Val. TVA', 'Valoare totala'].map(h => (
                    <th key={h} style={{ padding: '0.45rem 0.5rem', textAlign: ['Nr.', 'Cant.', 'TVA%', 'Pret (fara TVA)', 'Val. TVA', 'Valoare totala'].includes(h) ? 'right' : 'left', fontWeight: 600, fontSize: '0.75rem', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(inv.lineItems ?? []).map((l: InvoiceLineItemDto, i: number) => {
                  const tvaVal  = l.unitPrice * l.quantity * (l.vatPercent / 100);
                  const valoare = l.unitPrice * l.quantity + tvaVal;
                  return (
                    <tr key={l.id} style={{ borderBottom: '1px solid #eee', background: i % 2 === 0 ? '#fafafa' : 'white' }}>
                      <td style={{ padding: '0.4rem 0.5rem', textAlign: 'right' }}>{l.lineNumber}</td>
                      <td style={{ padding: '0.4rem 0.5rem' }}>{l.description}</td>
                      <td style={{ padding: '0.4rem 0.5rem', color: '#666' }}>{l.cod || '-'}</td>
                      <td style={{ padding: '0.4rem 0.5rem', textAlign: 'center' }}>{l.um || '-'}</td>
                      <td style={{ padding: '0.4rem 0.5rem', textAlign: 'right' }}>{l.quantity}</td>
                      <td style={{ padding: '0.4rem 0.5rem', textAlign: 'right' }}>{l.vatPercent}%</td>
                      <td style={{ padding: '0.4rem 0.5rem', textAlign: 'right' }}>{fmtMoney(l.unitPrice, inv.currency)}</td>
                      <td style={{ padding: '0.4rem 0.5rem', textAlign: 'right' }}>{fmtMoney(tvaVal, inv.currency)}</td>
                      <td style={{ padding: '0.4rem 0.5rem', textAlign: 'right', fontWeight: 700 }}>{fmtMoney(valoare, inv.currency)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* ── Totals ── */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
              <table style={{ fontSize: '0.88rem', borderCollapse: 'collapse', minWidth: 300 }}>
                <tbody>
                  <tr><td style={{ padding: '0.22rem 1.25rem 0.22rem 0', color: '#555' }}>Total fara TVA:</td><td style={{ textAlign: 'right', fontWeight: 600 }}>{fmtMoney(inv.subTotal, inv.currency)}</td></tr>
                  <tr><td style={{ padding: '0.22rem 1.25rem 0.22rem 0', color: '#555' }}>Total TVA ({inv.vatPercent}%):</td><td style={{ textAlign: 'right', fontWeight: 600 }}>{fmtMoney(inv.vatAmount, inv.currency)}</td></tr>
                  <tr style={{ borderTop: '2px solid #1a237e' }}>
                    <td style={{ padding: '0.5rem 1.25rem 0.22rem 0', fontWeight: 700, fontSize: '1rem', color: '#1a237e' }}>TOTAL:</td>
                    <td style={{ textAlign: 'right', fontWeight: 800, fontSize: '1rem', color: '#1a237e' }}>{fmtMoney(inv.totalAmount, inv.currency)}</td>
                  </tr>
                  {inv.paidAmount > 0 && <tr>
                    <td style={{ padding: '0.22rem 1.25rem 0.22rem 0', color: '#2e7d32' }}>Achitat:</td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: '#2e7d32' }}>{fmtMoney(inv.paidAmount, inv.currency)}</td>
                  </tr>}
                  {inv.balanceDue > 0 && <tr style={{ borderTop: '1px solid #e8eaf6' }}>
                    <td style={{ padding: '0.35rem 1.25rem 0.22rem 0', fontWeight: 700, color: '#c62828' }}>Rest de plata:</td>
                    <td style={{ textAlign: 'right', fontWeight: 800, color: '#c62828' }}>{fmtMoney(inv.balanceDue, inv.currency)}</td>
                  </tr>}
                </tbody>
              </table>
            </div>

            {/* ── Payments ── */}
            {inv.payments && inv.payments.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1a237e', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', borderTop: '1px solid #e8eaf6', paddingTop: '0.75rem' }}>Plati inregistrate</div>
                {inv.payments.map(p => (
                  <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', padding: '0.25rem 0', borderBottom: '1px solid #f5f5f5' }}>
                    <span>{fmtDate(p.paymentDate)} — {PAYMENT_METHODS[p.method] ?? '-'}</span>
                    <span style={{ fontWeight: 600, color: '#2e7d32' }}>{fmtMoney(p.amount, inv.currency)}</span>
                  </div>
                ))}
              </div>
            )}

            {inv.notes && (
              <div style={{ fontSize: '0.82rem', color: '#555', borderTop: '1px solid #eee', paddingTop: '0.75rem' }}>
                <strong>Mentiuni:</strong> {inv.notes}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// =====================================================================
//  CREATE INVOICE MODAL
// =====================================================================
function CreateInvoiceModal({ onClose, onCreated }: { onClose: () => void, onCreated: () => void }) {
  // ── header state ───────────────────────────────────────────────────
  const [clientId,      setClientId]      = useState('');
  const [caseId,        setCaseId]        = useState('');
  const [invoiceDate,   setInvoiceDate]   = useState(new Date().toISOString().slice(0, 10));
  const [dueDate,       setDueDate]       = useState('');
  const [invoiceSerial, setInvoiceSerial] = useState('LRO');
  const [invoiceNo,     setInvoiceNo]     = useState('');
  const [currency,      setCurrency]      = useState(1);
  const [vatPercent,    setVatPercent]    = useState(21);
  const [periodStart,   setPeriodStart]   = useState('');
  const [periodEnd,     setPeriodEnd]     = useState('');
  const [notes,         setNotes]         = useState('');
  const [showPreview,   setShowPreview]   = useState(false);

  // ── line items ─────────────────────────────────────────────────────
  interface LineItem {
    description: string; cod: string; um: string;
    quantity: number; vatPct: number; unitPrice: number;
  }
  const emptyLine = (): LineItem => ({ description: '', cod: '', um: 'buc', quantity: 1, vatPct: vatPercent, unitPrice: 0 });
  const [lines, setLines] = useState<LineItem[]>([emptyLine()]);

  const patchLine = (i: number, patch: Partial<LineItem>) =>
    setLines(prev => prev.map((l, idx) => idx === i ? { ...l, ...patch } : l));
  const addLine = () => setLines(prev => [...prev, emptyLine()]);
  const removeLine = (i: number) => setLines(prev => prev.filter((_, idx) => idx !== i));

  // ── data ────────────────────────────────────────────────────────────
  const [clients,     setClients]     = useState<any[]>([]);
  const [cases,       setCases]       = useState<CaseItem[]>([]);
  const [firmInfo,    setFirmInfo]    = useState<any>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');

  // ── inline client edit ─────────────────────────────────────────────
  const [showClientEdit, setShowClientEdit] = useState(false);
  const [clientEdit,     setClientEdit]     = useState<any>({});
  const [clientSaving,   setClientSaving]   = useState(false);

  useEffect(() => {
    Promise.all([billingService.getClients(), billingService.getCases(), billingService.getFirmInfo()])
      .then(([cls, c, firm]) => { setClients(cls); setCases(c); setFirmInfo(firm); })
      .catch((e: any) => setError(e.message))
      .finally(() => setDataLoading(false));
  }, []);

  const filteredCases = clientId ? cases.filter(c => c.clientId === clientId) : cases;

  // ── computed totals ────────────────────────────────────────────────
  const lineCalc = (l: LineItem) => {
    const valFaraTVA = l.quantity * l.unitPrice;
    const tvaVal = Math.round(valFaraTVA * l.vatPct) / 100;
    return { valFaraTVA, tvaVal, valoare: valFaraTVA + tvaVal };
  };
  const subTotal  = lines.reduce((s, l) => s + lineCalc(l).valFaraTVA, 0);
  const totalTVA  = lines.reduce((s, l) => s + lineCalc(l).tvaVal, 0);
  const total     = subTotal + totalTVA;

  const caseLabel  = cases.find(c => c.id === caseId)?.caseNumber;

  // ── submit ──────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!clientId)         { setError('Selectati clientul.');                   return; }
    if (!invoiceDate)      { setError('Introduceti data emiterii.');            return; }
    if (!dueDate)          { setError('Introduceti data scadentei.');           return; }
    if (!invoiceSerial)    { setError('Introduceti seria facturii.');           return; }
    const invalid = lines.find(l => !l.description || l.unitPrice <= 0 || l.quantity <= 0);
    if (invalid)           { setError('Completati toate liniile corect.');      return; }

    setLoading(true); setError('');
    try {
      await billingService.createInvoice({
        clientId,
        caseId:          caseId || undefined,
        invoiceDate,
        invoiceSerial,
        invoiceNumberOverride: invoiceNo || undefined,
        dueDate,
        currency,
        vatPercent,
        periodStart:     periodStart || undefined,
        periodEnd:       periodEnd   || undefined,
        notes:           notes       || undefined,
        manualLineItems: lines.map(l => ({
          description: l.description,
          cod:         l.cod || undefined,
          um:          l.um  || undefined,
          quantity:    l.quantity,
          unitPrice:   l.unitPrice,
          vatPercent:  l.vatPct,
          lineType:    'FlatFee',
        })),
      });
      onCreated(); onClose();
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const sec: React.CSSProperties = {
    fontSize: '0.75rem', fontWeight: 700, color: '#1a237e', textTransform: 'uppercase',
    letterSpacing: '0.05em', margin: '1.25rem 0 0.5rem',
    borderBottom: '1px solid #e8eaf6', paddingBottom: '0.3rem',
  };
  const thI: React.CSSProperties = { ...thStyle, padding: '0.4rem 0.5rem', fontSize: '0.75rem', background: '#f0f4ff' };
  const tdI: React.CSSProperties = { padding: '0.3rem 0.35rem' };
  const inpS: React.CSSProperties = { ...inputStyle, padding: '0.3rem 0.4rem', fontSize: '0.82rem' };

  // ── Preview ──────────────────────────────────────────────────────────
  if (showPreview) {
    const selectedClient = clients.find(c => c.id === clientId);
    const isCorporate = selectedClient?.isCorporate ?? false;
    const pRow = (label: string, val?: string) => val
      ? <div style={{ fontSize: '0.78rem', marginBottom: '0.15rem' }}><span style={{ color: '#666' }}>{label}: </span><span style={{ fontWeight: 600 }}>{val}</span></div>
      : null;

    return (
      <div className="lro-overlay" style={overlayStyle} onClick={() => setShowPreview(false)}>
        <div className="lro-modal" style={{ ...modalStyle, maxWidth: 860, maxHeight: '92vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.05rem', color: '#1a237e' }}>Previzualizare factura</h2>
            <button onClick={() => setShowPreview(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.4rem', color: '#888' }}>✕</button>
          </div>

          {/* ── Invoice document ── */}
          <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '1.5rem', fontFamily: 'Arial, sans-serif', fontSize: '0.88rem', color: '#222', background: '#fff' }}>

            {/* Title bar */}
            <div style={{ textAlign: 'center', marginBottom: '1.25rem', borderBottom: '2px solid #1a237e', paddingBottom: '0.75rem' }}>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1a237e', letterSpacing: '0.05em' }}>FACTURA FISCALA</div>
            </div>

            {/* ── 3-column header: Emitent | Invoice meta | Client ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '1rem', marginBottom: '1.25rem', alignItems: 'start' }}>

              {/* LEFT — Emitent (issuing firm) */}
              <div style={{ background: '#f0f4ff', borderRadius: '6px', padding: '0.75rem', borderLeft: '3px solid #1a237e' }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#1a237e', textTransform: 'uppercase', marginBottom: '0.4rem', letterSpacing: '0.06em' }}>Furnizor</div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.25rem' }}>{firmInfo?.name ?? '—'}</div>
                {pRow('Adresa', [firmInfo?.address, firmInfo?.city].filter(Boolean).join(', '))}
                {pRow('CIF', firmInfo?.fiscalCode)}
                {pRow('Nr. Reg. Com.', firmInfo?.registrationCode)}
                {pRow('Banca', firmInfo?.bank)}
                {pRow('IBAN', firmInfo?.bankAccount)}
                {pRow('Tel.', firmInfo?.phone)}
                {pRow('Email', firmInfo?.email)}
              </div>

              {/* CENTRE — Invoice meta */}
              <div style={{ textAlign: 'center', minWidth: 180, padding: '0.5rem' }}>
                <div style={{ fontSize: '0.75rem', color: '#888', marginBottom: '0.2rem' }}>Seria / Nr.</div>
                <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#1a237e', marginBottom: '0.75rem' }}>
                  {invoiceSerial} / {invoiceNo || <span style={{ color: '#aaa' }}>AUTO</span>}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#888' }}>Data emiterii</div>
                <div style={{ fontWeight: 700, marginBottom: '0.5rem' }}>{fmtDate(invoiceDate)}</div>
                <div style={{ fontSize: '0.75rem', color: '#888' }}>Data scadentei</div>
                <div style={{ fontWeight: 700, color: '#c62828', marginBottom: '0.5rem' }}>{fmtDate(dueDate)}</div>
                {caseLabel && <>
                  <div style={{ fontSize: '0.75rem', color: '#888' }}>Dosar</div>
                  <div style={{ fontWeight: 700 }}>{caseLabel}</div>
                </>}
              </div>

              {/* RIGHT — Client */}
              <div style={{ background: '#fff8e1', borderRadius: '6px', padding: '0.75rem', borderLeft: '3px solid #f57c00' }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#e65100', textTransform: 'uppercase', marginBottom: '0.4rem', letterSpacing: '0.06em' }}>Beneficiar / Client</div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.25rem' }}>{selectedClient?.name ?? '—'}</div>
                {pRow('Adresa', [selectedClient?.address, selectedClient?.city].filter(Boolean).join(', '))}
                {isCorporate && pRow('CIF', selectedClient?.fiscalCode)}
                {isCorporate && pRow('Nr. Reg. Com.', selectedClient?.registrationCode)}
                {isCorporate && pRow('Banca', selectedClient?.bank)}
                {isCorporate && pRow('IBAN', selectedClient?.bankAccount)}
              </div>
            </div>

            {/* ── Line items table ── */}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', marginBottom: '1rem' }}>
              <thead>
                <tr style={{ background: '#1a237e', color: 'white' }}>
                  {['Nr.', 'Denumire produs/serviciu', 'Cod', 'UM', 'Cant.', 'TVA%', 'Pret (fara TVA)', 'Val. TVA', 'Valoare totala'].map(h => (
                    <th key={h} style={{ padding: '0.45rem 0.5rem', textAlign: ['Cant.', 'TVA%', 'Nr.', 'Pret (fara TVA)', 'Val. TVA', 'Valoare totala'].includes(h) ? 'right' : 'left', fontWeight: 600, fontSize: '0.75rem', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {lines.map((l, i) => {
                  const { tvaVal, valoare } = lineCalc(l);
                  return (
                    <tr key={i} style={{ borderBottom: '1px solid #eee', background: i % 2 === 0 ? '#fafafa' : 'white' }}>
                      <td style={{ padding: '0.4rem 0.5rem', textAlign: 'right' }}>{i + 1}</td>
                      <td style={{ padding: '0.4rem 0.5rem' }}>{l.description}</td>
                      <td style={{ padding: '0.4rem 0.5rem', color: '#666' }}>{l.cod || '-'}</td>
                      <td style={{ padding: '0.4rem 0.5rem', textAlign: 'center' }}>{l.um}</td>
                      <td style={{ padding: '0.4rem 0.5rem', textAlign: 'right' }}>{l.quantity}</td>
                      <td style={{ padding: '0.4rem 0.5rem', textAlign: 'right' }}>{l.vatPct}%</td>
                      <td style={{ padding: '0.4rem 0.5rem', textAlign: 'right' }}>{fmtMoney(l.unitPrice, currency)}</td>
                      <td style={{ padding: '0.4rem 0.5rem', textAlign: 'right' }}>{fmtMoney(tvaVal, currency)}</td>
                      <td style={{ padding: '0.4rem 0.5rem', textAlign: 'right', fontWeight: 700 }}>{fmtMoney(valoare, currency)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* ── Totals ── */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <table style={{ fontSize: '0.88rem', borderCollapse: 'collapse', minWidth: 280 }}>
                <tbody>
                  <tr><td style={{ padding: '0.2rem 1rem 0.2rem 0', color: '#555' }}>Total fara TVA:</td><td style={{ textAlign: 'right', fontWeight: 600 }}>{fmtMoney(subTotal, currency)}</td></tr>
                  <tr><td style={{ padding: '0.2rem 1rem 0.2rem 0', color: '#555' }}>Total TVA:</td><td style={{ textAlign: 'right', fontWeight: 600 }}>{fmtMoney(totalTVA, currency)}</td></tr>
                  <tr style={{ borderTop: '2px solid #1a237e' }}>
                    <td style={{ padding: '0.5rem 1rem 0.2rem 0', fontWeight: 700, fontSize: '1rem', color: '#1a237e' }}>TOTAL DE PLATA:</td>
                    <td style={{ textAlign: 'right', fontWeight: 800, fontSize: '1rem', color: '#1a237e' }}>{fmtMoney(total, currency)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {notes && <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#555', borderTop: '1px solid #eee', paddingTop: '0.75rem' }}><strong>Mentiuni:</strong> {notes}</div>}
          </div>

          <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button style={btnOutline} onClick={() => setShowPreview(false)}>← Inapoi la editare</button>
            <button style={btnStyle} onClick={handleSubmit} disabled={loading}>
              {loading ? <Spinner size={18} /> : '✓ Emite factura'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="lro-overlay" style={overlayStyle} onClick={onClose}>
      <div className="lro-modal" style={{ ...modalStyle, maxWidth: 820, maxHeight: '92vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.1rem', color: '#1a237e' }}>Creaza factura noua</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.4rem', color: '#888', lineHeight: 1 }}>✕</button>
        </div>

        {error && <div style={{ color: '#f44336', fontSize: '0.88rem', marginBottom: '1rem', padding: '0.5rem 0.75rem', background: '#fff3f3', borderRadius: '6px', border: '1px solid #ffcdd2' }}>{error}</div>}

        {dataLoading ? <div style={{ textAlign: 'center', padding: '2rem' }}><Spinner /></div> : <>

          {/* ── Antet factura ── */}
          <div style={sec}>Antet factura</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Client *</label>
              <select style={selectStyle} value={clientId} onChange={e => { setClientId(e.target.value); setCaseId(''); setShowClientEdit(false); }}>
                <option value="">— Selecteaza clientul —</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            {/* ── Client data warning banner ── */}
            {(() => {
              const sel = clients.find(c => c.id === clientId);
              if (!sel) return null;
              const missingAddress = !sel.address && !sel.city;
              const missingFiscal  = sel.isCorporate && (!sel.fiscalCode || !sel.registrationCode);
              const missingBank    = !sel.bank || !sel.bankAccount;
              const hasGaps        = missingAddress || missingFiscal || missingBank;
              return (
                <div style={{ gridColumn: '1 / -1' }}>
                  {hasGaps && !showClientEdit && (
                    <div style={{ background: '#fff8e1', border: '1px solid #ffe082', borderRadius: '8px', padding: '0.65rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', fontSize: '0.82rem' }}>
                      <div>
                        <span style={{ fontWeight: 700, color: '#f57c00' }}>⚠️ Date incomplete — </span>
                        <span style={{ color: '#555' }}>
                          {[missingAddress && 'adresa', missingFiscal && 'date fiscale', missingBank && 'banca/IBAN'].filter(Boolean).join(', ')} lipsesc si nu vor aparea pe factura.
                        </span>
                      </div>
                      <button type="button"
                        onClick={() => { setClientEdit({ ...sel }); setShowClientEdit(true); }}
                        style={{ flexShrink: 0, padding: '0.3rem 0.75rem', background: '#f57c00', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}>
                        ✏️ Completeaza acum
                      </button>
                    </div>
                  )}
                  {!hasGaps && (
                    <div style={{ background: '#e8f5e9', border: '1px solid #a5d6a7', borderRadius: '6px', padding: '0.5rem 0.85rem', fontSize: '0.8rem', color: '#2e7d32' }}>
                      ✅ {sel.name} — {sel.isCorporate ? `CIF: ${sel.fiscalCode}` : 'Persoana fizica'}{sel.address ? ` · ${sel.address}` : ''}{sel.city ? `, ${sel.city}` : ''}
                    </div>
                  )}
                  {showClientEdit && (
                    <div style={{ background: '#f0f4ff', border: '1px solid #c5cae9', borderRadius: '8px', padding: '1rem', marginTop: '0.25rem' }}>
                      <div style={{ fontWeight: 700, color: '#1a237e', fontSize: '0.8rem', marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
                        <span>✏️ Completeaza datele clientului — <em>{sel.name}</em></span>
                        <button type="button" onClick={() => setShowClientEdit(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', fontSize: '1rem' }}>✕</button>
                      </div>
                      <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '0.6rem' }}>
                        {[{ v: false, l: '👤 Persoana fizica' }, { v: true, l: '🏢 Firma / PJ' }].map(({ v, l }) => (
                          <button key={String(v)} type="button"
                            onClick={() => setClientEdit((p: any) => ({ ...p, isCorporate: v }))}
                            style={{ flex: 1, padding: '0.35rem', border: '2px solid', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem',
                              borderColor: clientEdit.isCorporate === v ? '#1a237e' : '#ddd',
                              background: clientEdit.isCorporate === v ? '#e8eaf6' : '#fafafa',
                              color: clientEdit.isCorporate === v ? '#1a237e' : '#666' }}>{l}</button>
                        ))}
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <div style={{ gridColumn: '1 / -1' }}>
                          <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#555', display: 'block', marginBottom: '0.15rem' }}>Adresa</label>
                          <input style={inputStyle} value={clientEdit.address ?? ''} onChange={e => setClientEdit((p: any) => ({ ...p, address: e.target.value }))} placeholder="Str. Exemplu nr. 1" />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#555', display: 'block', marginBottom: '0.15rem' }}>Oras</label>
                          <input style={inputStyle} value={clientEdit.city ?? ''} onChange={e => setClientEdit((p: any) => ({ ...p, city: e.target.value }))} placeholder="Bucuresti" />
                        </div>
                        {clientEdit.isCorporate && <>
                          <div>
                            <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#555', display: 'block', marginBottom: '0.15rem' }}>CUI / CIF</label>
                            <input style={inputStyle} value={clientEdit.fiscalCode ?? ''} onChange={e => setClientEdit((p: any) => ({ ...p, fiscalCode: e.target.value }))} placeholder="RO12345678" />
                          </div>
                          <div>
                            <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#555', display: 'block', marginBottom: '0.15rem' }}>Nr. Reg. Com.</label>
                            <input style={inputStyle} value={clientEdit.registrationCode ?? ''} onChange={e => setClientEdit((p: any) => ({ ...p, registrationCode: e.target.value }))} placeholder="J40/1234/2020" />
                          </div>
                        </> }
                        <div>
                          <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#555', display: 'block', marginBottom: '0.15rem' }}>Banca</label>
                          <input style={inputStyle} value={clientEdit.bank ?? ''} onChange={e => setClientEdit((p: any) => ({ ...p, bank: e.target.value }))} placeholder="BCR / BRD..." />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#555', display: 'block', marginBottom: '0.15rem' }}>IBAN</label>
                          <input style={inputStyle} value={clientEdit.bankAccount ?? ''} onChange={e => setClientEdit((p: any) => ({ ...p, bankAccount: e.target.value }))} placeholder="RO49AAAA..." />
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <button type="button" onClick={() => setShowClientEdit(false)}
                          style={{ padding: '0.3rem 0.85rem', background: '#eee', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '0.82rem' }}>Anuleaza</button>
                        <button type="button" disabled={clientSaving}
                          onClick={async () => {
                            setClientSaving(true);
                            try {
                              const updated = await billingService.updateClient(sel.id, clientEdit);
                              setClients(prev => prev.map(c => c.id === sel.id ? { ...c, ...updated } : c));
                              setShowClientEdit(false);
                            } catch (e: any) { setError(e.message); }
                            finally { setClientSaving(false); }
                          }}
                          style={{ padding: '0.3rem 0.85rem', background: '#1a237e', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem' }}>
                          {clientSaving ? '...' : '✓ Salveaza'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Dosar (optional)</label>
              <select style={selectStyle} value={caseId} onChange={e => setCaseId(e.target.value)}>
                <option value="">— Toate dosarele clientului —</option>
                {filteredCases.map(c => <option key={c.id} value={c.id}>{c.caseNumber} · {c.title}</option>)}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Data emiterii *</label>
              <input type="date" style={inputStyle} value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Data scadentei *</label>
              <input type="date" style={inputStyle} value={dueDate} onChange={e => setDueDate(e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Moneda</label>
              <select style={selectStyle} value={currency} onChange={e => setCurrency(+e.target.value)}>
                {Object.entries(CURRENCY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Serie factura *</label>
              <input type="text" style={inputStyle} placeholder="ex: LRO" value={invoiceSerial}
                onChange={e => setInvoiceSerial(e.target.value.toUpperCase())} maxLength={10} />
            </div>
            <div>
              <label style={labelStyle}>Numar factura (gol = automat)</label>
              <input type="text" style={inputStyle} placeholder="ex: 00042" value={invoiceNo}
                onChange={e => setInvoiceNo(e.target.value)} maxLength={20} />
            </div>
            <div>
              <label style={labelStyle}>TVA implicit %</label>
              <input type="number" min="0" max="100" step="1" style={inputStyle}
                value={vatPercent} onChange={e => { const v = +e.target.value; setVatPercent(v); setLines(prev => prev.map(l => ({ ...l, vatPct: v }))); }} />
            </div>

            <div>
              <label style={labelStyle}>Perioada de la</label>
              <input type="date" style={inputStyle} value={periodStart} onChange={e => setPeriodStart(e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Perioada pana la</label>
              <input type="date" style={inputStyle} value={periodEnd} onChange={e => setPeriodEnd(e.target.value)} />
            </div>
            <div style={{ gridColumn: '3 / 4' }} />

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Notite (optionale)</label>
              <textarea style={{ ...inputStyle, minHeight: '55px', resize: 'vertical' }}
                value={notes} onChange={e => setNotes(e.target.value)} placeholder="Conditii de plata, mentiuni speciale..." />
            </div>
          </div>

          {/* ── Linii factura ── */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', ...sec, margin: '1.25rem 0 0.5rem' }}>
            <span>Linii factura</span>
            <button style={{ ...btnOutline, padding: '0.2rem 0.65rem', fontSize: '0.78rem' }} onClick={addLine}>+ Adauga</button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="inv-line-table" style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
              <thead>
                <tr>
                  {['Denumire produs sau serviciu *', 'Cod', 'UM', 'Cant. *', 'TVA %', 'Pret (fara TVA) *', 'Valoare', ''].map(h => (
                    <th key={h} style={thI}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {lines.map((l, i) => {
                  const { valFaraTVA, tvaVal, valoare } = lineCalc(l);
                  return (
                    <tr key={i} style={{ borderBottom: '1px solid #f0f0f0', background: i % 2 === 0 ? '#fafafa' : 'white' }}>
                      <td data-label="Denumire *" style={tdI}><input style={inpS} value={l.description} placeholder="ex: Consultanta juridica" onChange={e => patchLine(i, { description: e.target.value })} /></td>
                      <td data-label="Cod" style={tdI}><input style={{ ...inpS, width: 70 }} value={l.cod} placeholder="CPV..." onChange={e => patchLine(i, { cod: e.target.value })} /></td>
                      <td data-label="UM" style={tdI}>
                        <select style={{ ...inpS, width: 68 }} value={l.um} onChange={e => patchLine(i, { um: e.target.value })}>
                          {['ora', 'buc', 'km', 'zi', 'luna', 'set', 'pag'].map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                      </td>
                      <td data-label="Cantitate *" style={tdI}><input type="number" style={{ ...inpS, width: 68 }} min="0.01" step="0.01" value={l.quantity} onChange={e => patchLine(i, { quantity: parseFloat(e.target.value) || 0 })} /></td>
                      <td data-label="TVA %" style={tdI}><input type="number" style={{ ...inpS, width: 62 }} min="0" max="100" step="1" value={l.vatPct} onChange={e => patchLine(i, { vatPct: +e.target.value })} /></td>
                      <td data-label="Pret (fara TVA) *" style={tdI}><input type="number" style={{ ...inpS, width: 100 }} min="0" step="0.01" value={l.unitPrice || ''} onChange={e => patchLine(i, { unitPrice: parseFloat(e.target.value) || 0 })} /></td>
                      <td data-label="Valoare" className="inv-line-value" style={{ ...tdI, whiteSpace: 'nowrap', fontWeight: 600, fontSize: '0.82rem', textAlign: 'right', minWidth: 100 }}>
                        <div>{fmtMoney(valFaraTVA, currency)}</div>
                        <div style={{ fontSize: '0.72rem', color: '#888' }}>+TVA {fmtMoney(tvaVal, currency)}</div>
                        <div style={{ color: '#1a237e' }}>{fmtMoney(valoare, currency)}</div>
                      </td>
                      <td className="inv-line-remove" style={tdI}>
                        {lines.length > 1 && (
                          <button onClick={() => removeLine(i)} style={{ border: 'none', background: 'none', color: '#c62828', cursor: 'pointer', fontSize: '1.1rem', lineHeight: 1, padding: '0.2rem' }}>×</button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ── Totals ── */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.75rem' }}>
            <div style={{ background: '#f8f9ff', border: '1px solid #e8eaf6', borderRadius: '8px', padding: '0.75rem 1.25rem', fontSize: '0.88rem', minWidth: 260 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}><span style={{ color: '#666' }}>Total fara TVA:</span><span style={{ fontWeight: 600 }}>{fmtMoney(subTotal, currency)}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}><span style={{ color: '#666' }}>Total TVA:</span><span style={{ fontWeight: 600 }}>{fmtMoney(totalTVA, currency)}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #1a237e', paddingTop: '0.35rem', marginTop: '0.2rem' }}>
                <span style={{ fontWeight: 700, color: '#1a237e' }}>Total de plata:</span>
                <span style={{ fontWeight: 800, color: '#1a237e', fontSize: '1rem' }}>{fmtMoney(total, currency)}</span>
              </div>
            </div>
          </div>

        </>}

        {/* ── Footer ── */}
        <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button style={btnOutline} onClick={onClose} disabled={loading}>Anuleaza</button>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button style={{ ...btnOutline, color: '#6a1b9a', borderColor: '#6a1b9a' }} disabled={dataLoading || lines.length === 0} onClick={() => setShowPreview(true)}>
              🔍 Previzualizare
            </button>
            <button style={btnStyle} onClick={handleSubmit} disabled={loading || dataLoading}>
              {loading ? <Spinner size={18} /> : '✓ Emite factura'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

// =====================================================================
//  CREATE PAYMENT MODAL
// =====================================================================

// =====================================================================
//  PAGINATION COMPONENT
// =====================================================================

function Pagination({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (p: number) => void }) {
  if (totalPages <= 1) return null;
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', borderTop: '1px solid #f0f0f0' }}>
      <button
        style={{ ...btnOutline, padding: '0.3rem 0.6rem', fontSize: '0.78rem' }}
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        ← Inapoi
      </button>
      <span style={{ fontSize: '0.82rem', color: '#555' }}>
        Pagina {page} din {totalPages}
      </span>
      <button
        style={{ ...btnOutline, padding: '0.3rem 0.6rem', fontSize: '0.78rem' }}
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
      >
        Inainte →
      </button>
    </div>
  );
}

// =====================================================================
//  CREATE BILLING RATE MODAL
// =====================================================================

function CreateBillingRateModal({ onClose, onCreated }: { onClose: () => void, onCreated: () => void }) {
  const [rate, setRate] = useState<number | ''>('');
  const [currency, setCurrency] = useState(1);
  const [effectiveFrom, setEffectiveFrom] = useState(new Date().toISOString().slice(0, 10));
  const [effectiveTo, setEffectiveTo] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!rate) { setError('Introduceti tariful orar.'); return; }
    setLoading(true); setError('');
    try {
      await billingService.createBillingRate({
        rate: rate || 0,
        currency,
        effectiveFrom,
        effectiveTo: effectiveTo || undefined,
        description: description || undefined,
      });
      onCreated();
      onClose();
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="lro-overlay" style={overlayStyle} onClick={onClose}>
      <div className="lro-modal" style={modalStyle} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.1rem', color: '#1a237e' }}>Adauga tarif nou</h2>
          <button onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.4rem', color: '#888', lineHeight: 1, padding: '0 0.25rem' }}
            title="Inchide">✕</button>
        </div>

        {error && <div style={{ color: '#f44336', fontSize: '0.9rem', marginBottom: '1rem', padding: '0.5rem 0.75rem', background: '#fff3f3', borderRadius: '6px', border: '1px solid #f44336' }}>{error}</div>}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
          <div>
            <label style={labelStyle}>Tarif orar *</label>
            <input type="number" step="0.01" min="0.01" style={inputStyle}
              value={rate} onChange={e => setRate(e.target.value ? parseFloat(e.target.value) : '')} />
          </div>

          <div>
            <label style={labelStyle}>Moneda</label>
            <select style={selectStyle} value={currency} onChange={e => setCurrency(+e.target.value)}>
              {Object.entries(CURRENCY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Valabil de la *</label>
            <input type="date" style={inputStyle} value={effectiveFrom} onChange={e => setEffectiveFrom(e.target.value)} />
          </div>

          <div>
            <label style={labelStyle}>Valabil pana la</label>
            <input type="date" style={inputStyle} value={effectiveTo} onChange={e => setEffectiveTo(e.target.value)} />
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Descriere</label>
            <input type="text" style={inputStyle} value={description}
              onChange={e => setDescription(e.target.value)} placeholder="ex: Tarif standard avocat senior" />
          </div>
        </div>

        <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button style={btnOutline} onClick={onClose} disabled={loading}>Anuleaza</button>
          <button style={btnStyle} onClick={handleSubmit} disabled={loading}>
            {loading ? <Spinner size={18} /> : 'Salveaza tarif'}
          </button>
        </div>
      </div>
    </div>
  );
}

// =====================================================================
//  CREATE PAYMENT MODAL
// =====================================================================

function CreatePaymentModal({ onClose, onCreated }: { onClose: () => void, onCreated: () => void }) {
  const [invoiceId, setInvoiceId] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10));
  const [amount, setAmount] = useState<number | ''>('');
  const [currency, setCurrency] = useState(1);
  const [method, setMethod] = useState<number | ''>('');
  const [transactionReference, setTransactionReference] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [invoices, setInvoices] = useState<InvoiceListItemDto[]>([]);
  const [invoicesLoading, setInvoicesLoading] = useState(true);

  useEffect(() => {
    billingService.getInvoices({ page: 1, pageSize: 999 })
      .then(res => setInvoices(res.data))
      .catch(() => setInvoices([]))
      .finally(() => setInvoicesLoading(false));
  }, []);

  const handleSubmit = async () => {
    if (!invoiceId) { setError('Selectati factura.'); return; }
    if (!amount) { setError('Introduceti suma.'); return; }
    if (!method) { setError('Selectati metoda de plata.'); return; }
    setLoading(true); setError('');
    try {
      await billingService.recordPayment({
        invoiceId,
        paymentDate,
        amount: amount || 0,
        currency,
        method,
        transactionReference: transactionReference || undefined,
        notes: notes || undefined,
      });
      onCreated();
      onClose();
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="lro-overlay" style={overlayStyle} onClick={onClose}>
      <div className="lro-modal" style={modalStyle} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.1rem', color: '#1a237e' }}>Inregistreaza plata</h2>
          <button onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.4rem', color: '#888', lineHeight: 1, padding: '0 0.25rem' }}
            title="Inchide">✕</button>
        </div>

        {error && <div style={{ color: '#f44336', fontSize: '0.9rem', marginBottom: '1rem', padding: '0.5rem 0.75rem', background: '#fff3f3', borderRadius: '6px', border: '1px solid #f44336' }}>{error}</div>}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Factura asociata *</label>
            {invoicesLoading ? (
              <div style={{ fontSize: '0.82rem', color: '#888', padding: '0.4rem 0' }}>Se incarca facturile...</div>
            ) : invoices.length === 0 ? (
              <div style={{ fontSize: '0.82rem', color: '#f57c00', padding: '0.4rem 0' }}>Nu exista facturi.</div>
            ) : (
              <select style={selectStyle} value={invoiceId} onChange={e => setInvoiceId(e.target.value)}>
                <option value="">— Selecteaza factura —</option>
                {invoices.map(i => (
                  <option key={i.id} value={i.id}>
                    {i.invoiceNumber} · {i.clientName || '-'} · {fmtMoney(i.balanceDue, i.currency)} rest
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label style={labelStyle}>Data platii *</label>
            <input type="date" style={inputStyle} value={paymentDate} onChange={e => setPaymentDate(e.target.value)} />
          </div>

          <div>
            <label style={labelStyle}>Suma *</label>
            <input type="number" step="0.01" min="0.01" style={inputStyle}
              value={amount} onChange={e => setAmount(e.target.value ? parseFloat(e.target.value) : '')} />
          </div>

          <div>
            <label style={labelStyle}>Metoda de plata *</label>
            <select style={selectStyle} value={method} onChange={e => setMethod(e.target.value ? +e.target.value : '')}>
              <option value="">— Selecteaza metoda —</option>
              {Object.entries(PAYMENT_METHODS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Moneda</label>
            <select style={selectStyle} value={currency} onChange={e => setCurrency(+e.target.value)}>
              {Object.entries(CURRENCY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Referinta tranzactie</label>
            <input type="text" style={inputStyle} value={transactionReference}
              onChange={e => setTransactionReference(e.target.value)} placeholder="ex: OP-12345" />
          </div>

          <div>
            <label style={labelStyle}>Notite</label>
            <input type="text" style={inputStyle} value={notes}
              onChange={e => setNotes(e.target.value)} placeholder="Informatii suplimentare..." />
          </div>
        </div>

        <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button style={btnOutline} onClick={onClose} disabled={loading}>Anuleaza</button>
          <button style={btnStyle} onClick={handleSubmit} disabled={loading}>
            {loading ? <Spinner size={18} /> : 'Inregistreaza plata'}
          </button>
        </div>
      </div>
    </div>
  );
}
