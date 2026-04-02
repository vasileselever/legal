import { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from './AdminLayout';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { ErrorBanner } from '../../components/ui/ErrorBanner';
import { PageHeader } from '../../components/ui/PageHeader';
import { leadService } from '../../api/leadService';
import type { LeadItem } from '../../api/leadService';
import {
  billingService,
  TIME_ENTRY_STATUS, TIME_ENTRY_STATUS_COLORS,
  EXPENSE_STATUS, EXPENSE_STATUS_COLORS, EXPENSE_CATEGORIES,
  INVOICE_STATUS, INVOICE_STATUS_COLORS,
  CURRENCY_LABELS, PAYMENT_METHODS, TRUST_TX_TYPES,
  type TimeEntryDto, type ExpenseDto, type InvoiceListItemDto,
  type TrustAccountDto, type TrustTransactionDto,
  type BillingRateDto, type BillingSummaryDto, type LawyerProductivityDto,
  type ArAgingDto, type PaymentDto, type CaseItem,
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
  const [entries, setEntries] = useState<TimeEntryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await billingService.getTimeEntries({ page, pageSize: 20 });
      setEntries(res.data); setTotalPages(res.pagination.totalPages);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const toggleSelect = (id: string) => {
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const handleApprove = async () => {
    if (selected.size === 0) return;
    try {
      await billingService.approveTimeEntries(Array.from(selected));
      setSelected(new Set());
      load();
    } catch (e: any) { setError(e.message); }
  };

  return (
    <div style={{ marginTop: '1rem' }}>
      <div className="lro-toolbar" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <button style={btnStyle} onClick={() => setShowCreate(true)}>+ Adauga pontaj</button>
        {selected.size > 0 && (
          <button style={{ ...btnOutline, color: '#2e7d32', borderColor: '#2e7d32' }} onClick={handleApprove}>
            Aproba ({selected.size})
          </button>
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
                  {['Data', 'Dosar', 'Avocat', 'Ore', 'Tarif/ora', 'Total', 'Descriere', 'Status'].map(h =>
                    <th key={h} style={thStyle}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {entries.map(e => (
                  <tr key={e.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                    <td style={tdStyle}>
                      {e.status === 1 && (
                        <input type="checkbox" checked={selected.has(e.id)} onChange={() => toggleSelect(e.id)} />
                      )}
                    </td>
                    <td style={{ ...tdStyle, fontWeight: 600 }}>{fmtDate(e.workDate)}</td>
                    <td style={tdStyle}>{e.caseNumber || e.leadName || (e.caseId ? e.caseId.slice(0, 8) : e.leadId?.slice(0, 8) || '-')}</td>
                    <td style={tdStyle}>{e.userFullName || '-'}</td>
                    <td style={{ ...tdStyle, fontWeight: 700, color: '#1a237e' }}>{fmtHours(e.durationHours)}</td>
                    <td style={tdStyle}>{fmtMoney(e.hourlyRate, e.currency)}</td>
                    <td style={{ ...tdStyle, fontWeight: 700 }}>{fmtMoney(e.totalAmount, e.currency)}</td>
                    <td style={{ ...tdStyle, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.description}</td>
                    <td style={tdStyle}><Badge label={TIME_ENTRY_STATUS[e.status] ?? '-'} color={TIME_ENTRY_STATUS_COLORS[e.status] ?? '#999'} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </Card>
      )}

      {showCreate && <CreateTimeEntryModal onClose={() => setShowCreate(false)} onCreated={load} />}
    </div>
  );
}

// =====================================================================
//  EXPENSES TAB
// =====================================================================

function ExpensesTab() {
  const [items, setItems] = useState<ExpenseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await billingService.getExpenses({ page, pageSize: 20 });
      setItems(res.data); setTotalPages(res.pagination.totalPages);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  return (
    <div style={{ marginTop: '1rem' }}>
      <button style={btnStyle} onClick={() => setShowCreate(true)}>+ Adauga cheltuiala</button>

      {error && <ErrorBanner message={error} onRetry={load} />}
      {loading ? <Spinner /> : items.length === 0 ? (
        <Card style={{ padding: '3rem', textAlign: 'center', color: '#aaa', marginTop: '1rem' }}>Nicio cheltuiala gasita</Card>
      ) : (
        <Card style={{ marginTop: '1rem' }}>
          <div className="lro-table-wrap" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8f9fa' }}>
                  {['Data', 'Dosar', 'Categorie', 'Descriere', 'Suma', 'Facturabil', 'Status'].map(h =>
                    <th key={h} style={thStyle}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {items.map(e => (
                  <tr key={e.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                    <td style={{ ...tdStyle, fontWeight: 600 }}>{fmtDate(e.expenseDate)}</td>
                    <td style={tdStyle}>{e.caseNumber || e.caseId?.slice(0, 8) || '-'}</td>
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
                  <tr key={e.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                    <td style={{ ...tdStyle, fontWeight: 600 }}>{e.invoiceNumber}</td>
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
    // Load clients (converted leads) — use leads endpoint since there may not be a separate clients endpoint
    leadService.getLeads({ page: 1, pageSize: 500 })
      .then(res => setClients(res.data.map((l: any) => ({ id: l.id, name: l.name })))) // <-- FIX: Closed setClients() properly
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

  /** Save + submit for approval — creates then immediately approves */
  const handleSubmit = async () => {
    if (!isValid()) { setError('Completeaza dosarul, data, durata si descrierea.'); return; }
    setLoading(true); setError('');
    try {
      const entry = await billingService.createTimeEntry(buildRequest());
      await billingService.approveTimeEntries([entry.id]);
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
//  CREATE EXPENSE MODAL
// =====================================================================

function CreateExpenseModal({ onClose, onCreated }: { onClose: () => void, onCreated: () => void }) {
  const [form, setForm] = useState({
    caseId: '', expenseDate: '', category: 0, description: '',
    amount: 0, currency: 1, markupPercent: 0, isBillable: true,
    vendor: '', status: 1,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [casesLoading, setCasesLoading] = useState(false);

  const loadCases = useCallback(async () => {
    setCasesLoading(true);
    try {
      const res = await billingService.getCases();
      setCases(res);
    } catch (e: any) { setError(e.message); }
    finally { setCasesLoading(false); }
  }, []);

  useEffect(() => { loadCases(); }, [loadCases]);

  const handleSubmit = async () => {
    if (!form.caseId) { setError('Selectati un dosar'); return; }
    if (!form.expenseDate) { setError('Introduceti data cheltuielii'); return; }
    if (!form.category) { setError('Selectati categoria'); return; }
    if (!form.amount || form.amount <= 0) { setError('Introduceti o suma valida'); return; }
    setLoading(true); setError('');
    try {
      await billingService.createExpense({
        caseId: form.caseId,
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
            {casesLoading ? (
              <div style={{ fontSize: '0.82rem', color: '#888', padding: '0.4rem 0' }}>Se incarca dosarele...</div>
            ) : (
              <select
                style={selectStyle}
                value={form.caseId}
                onChange={e => setForm({ ...form, caseId: e.target.value })}
              >
                <option value="">— Selecteaza dosarul —</option>
                {cases.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.caseNumber} · {c.title}{c.clientName ? ` · ${c.clientName}` : ''}
                  </option>
                ))}
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
            <label style={labelStyle}>Status</label>
            <select style={selectStyle}
              value={form.status}
              onChange={e => setForm({ ...form, status: parseInt(e.target.value) })}
            >
              {Object.entries(EXPENSE_STATUS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
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

function CreateInvoiceModal({ onClose, onCreated }: { onClose: () => void, onCreated: () => void }) {
  // ── form state ──────────────────────────────────────────────────────
  const [clientId,     setClientId]     = useState('');
  const [caseId,       setCaseId]       = useState('');
  const [dueDate,      setDueDate]      = useState('');
  const [currency,     setCurrency]     = useState(1);
  const [vatPercent,   setVatPercent]   = useState(19);
  const [periodStart,  setPeriodStart]  = useState('');
  const [periodEnd,    setPeriodEnd]    = useState('');
  const [notes,        setNotes]        = useState('');

  // multi-select IDs
  const [selectedExpenses,   setSelectedExpenses]   = useState<string[]>([]);
  const [selectedTimeEntries,setSelectedTimeEntries]= useState<string[]>([]);

  // manual line items
  const [manualLines, setManualLines] = useState<{ description: string; quantity: number; unitPrice: number; lineType: string }[]>([]);

  // ── data ────────────────────────────────────────────────────────────
  const [clients,       setClients]       = useState<{ id: string; name: string }[]>([]);
  const [cases,         setCases]         = useState<CaseItem[]>([]);
  const [expenses,      setExpenses]      = useState<ExpenseDto[]>([]);
  const [timeEntries,   setTimeEntries]   = useState<TimeEntryDto[]>([]);
  const [dataLoading,   setDataLoading]   = useState(true);

  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  // ── load data on open ───────────────────────────────────────────────
  useEffect(() => {
    Promise.all([
      billingService.getClients(),
      billingService.getCases(),
      billingService.getExpenses({ pageSize: 500, status: 2 }),
      billingService.getTimeEntries({ pageSize: 500, status: 3 }),
    ]).then(([cls, c, exp, te]) => {
      setClients(cls);
      setCases(c);
      setExpenses(exp.data.filter((e: ExpenseDto) => e.isBillable));
      setTimeEntries(te.data.filter((t: TimeEntryDto) => t.isBillable));
    }).catch((e: any) => setError(e.message))
      .finally(() => setDataLoading(false));
  }, []);

  // ── filter cases/expenses/time by selected client ──────────────────
  const filteredCases = clientId
    ? cases.filter(c => c.clientId === clientId)
    : cases;

  const filteredExpenses = caseId
    ? expenses.filter(e => e.caseId === caseId)
    : expenses;

  const filteredTimeEntries = caseId
    ? timeEntries.filter(t => t.caseId === caseId)
    : timeEntries;

  // ── totals preview ──────────────────────────────────────────────────
  const expenseTotal    = filteredExpenses.filter(e => selectedExpenses.includes(e.id)).reduce((s, e) => s + e.amount, 0);
  const timeTotal       = filteredTimeEntries.filter(t => selectedTimeEntries.includes(t.id)).reduce((s, t) => s + t.totalAmount, 0);
  const manualTotal     = manualLines.reduce((s, l) => s + l.quantity * l.unitPrice, 0);
  const subTotal        = expenseTotal + timeTotal + manualTotal;
  const vatAmount       = Math.round(subTotal * vatPercent) / 100;
  const total           = subTotal + vatAmount;

  // ── toggle helpers ──────────────────────────────────────────────────
  const toggleExpense = (id: string) =>
    setSelectedExpenses(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const toggleTimeEntry = (id: string) =>
    setSelectedTimeEntries(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  const addManualLine = () =>
    setManualLines(p => [...p, { description: '', quantity: 1, unitPrice: 0, lineType: 'FlatFee' }]);
  const removeManualLine = (i: number) =>
    setManualLines(p => p.filter((_, idx) => idx !== i));
  const patchManualLine = (i: number, patch: Partial<typeof manualLines[0]>) =>
    setManualLines(p => p.map((l, idx) => idx === i ? { ...l, ...patch } : l));

  // ── submit ──────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!clientId)                     { setError('Selectati clientul.');            return; }
    if (!dueDate)                      { setError('Introduceti data scadenta.');     return; }
    const hasLines = selectedExpenses.length > 0 || selectedTimeEntries.length > 0 || manualLines.length > 0;
    if (!hasLines)                     { setError('Adaugati cel putin o linie (cheltuiala, pontaj sau linie manuala).'); return; }
    const invalidManual = manualLines.find(l => !l.description || l.unitPrice <= 0);
    if (invalidManual)                 { setError('Completati descrierea si pretul pentru toate liniile manuale.'); return; }

    setLoading(true); setError('');
    try {
      await billingService.createInvoice({
        clientId,
        caseId:       caseId || undefined,
        dueDate,
        currency,
        vatPercent,
        periodStart:  periodStart || undefined,
        periodEnd:    periodEnd   || undefined,
        notes:        notes       || undefined,
        expenseIds:   selectedExpenses.length   > 0 ? selectedExpenses   : undefined,
        timeEntryIds: selectedTimeEntries.length > 0 ? selectedTimeEntries : undefined,
        manualLineItems: manualLines.length > 0 ? manualLines.map(l => ({
          description: l.description,
          quantity:    l.quantity,
          unitPrice:   l.unitPrice,
          lineType:    l.lineType,
        })) : undefined,
      });
      onCreated();
      onClose();
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const sectionTitle: React.CSSProperties = {
    fontSize: '0.78rem', fontWeight: 700, color: '#1a237e',
    textTransform: 'uppercase', letterSpacing: '0.05em',
    margin: '1.25rem 0 0.5rem', borderBottom: '1px solid #e8eaf6', paddingBottom: '0.35rem',
  };
  const checkRow: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: '0.6rem',
    padding: '0.45rem 0.6rem', borderRadius: '6px', cursor: 'pointer',
    fontSize: '0.85rem', color: '#333',
  };

  return (
    <div className="lro-overlay" style={overlayStyle} onClick={onClose}>
      <div className="lro-modal" style={{ ...modalStyle, maxWidth: 760, maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.1rem', color: '#1a237e' }}>Creaza factura noua</h2>
          <button onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.4rem', color: '#888', lineHeight: 1 }}>
            ✕
          </button>
        </div>

        {error && <div style={{ color: '#f44336', fontSize: '0.88rem', marginBottom: '1rem', padding: '0.5rem 0.75rem', background: '#fff3f3', borderRadius: '6px', border: '1px solid #ffcdd2' }}>{error}</div>}

        {dataLoading ? <div style={{ textAlign: 'center', padding: '2rem' }}><Spinner /></div> : <>

          {/* ── Section 1: Header fields ── */}
          <div style={sectionTitle}>Date factura</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.875rem' }}>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Client *</label>
              <select style={selectStyle} value={clientId} onChange={e => { setClientId(e.target.value); setCaseId(''); setSelectedExpenses([]); setSelectedTimeEntries([]); }}>
                <option value="">— Selecteaza clientul —</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Dosar (optional)</label>
              <select style={selectStyle} value={caseId} onChange={e => { setCaseId(e.target.value); setSelectedExpenses([]); setSelectedTimeEntries([]); }}>
                <option value="">— Toate dosarele clientului —</option>
                {filteredCases.map(c => <option key={c.id} value={c.id}>{c.caseNumber} · {c.title}</option>)}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Data scadenta *</label>
              <input type="date" style={inputStyle} value={dueDate} onChange={e => setDueDate(e.target.value)} />
            </div>

            <div>
              <label style={labelStyle}>Moneda</label>
              <select style={selectStyle} value={currency} onChange={e => setCurrency(+e.target.value)}>
                {Object.entries(CURRENCY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>

            <div>
              <label style={labelStyle}>TVA %</label>
              <input type="number" min="0" max="100" step="1" style={inputStyle}
                value={vatPercent} onChange={e => setVatPercent(+e.target.value)} />
            </div>

            <div>
              <label style={labelStyle}>Perioada de la</label>
              <input type="date" style={inputStyle} value={periodStart} onChange={e => setPeriodStart(e.target.value)} />
            </div>

            <div>
              <label style={labelStyle}>Perioada pana la</label>
              <input type="date" style={inputStyle} value={periodEnd} onChange={e => setPeriodEnd(e.target.value)} />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Notite</label>
              <textarea style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }}
                value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notite optionale pe factura..." />
            </div>
          </div>

          {/* ── Section 2: Cheltuieli ── */}
          <div style={sectionTitle}>Cheltuieli facturabile ({filteredExpenses.length})</div>
          {filteredExpenses.length === 0 ? (
            <div style={{ fontSize: '0.82rem', color: '#aaa', padding: '0.5rem 0' }}>
              Nu exista cheltuieli aprobate{caseId ? ' pentru dosarul selectat' : ''}. Aprobati cheltuielile din tab-ul Cheltuieli.
            </div>
          ) : (
            <div style={{ border: '1px solid #e8eaf6', borderRadius: '8px', overflow: 'hidden' }}>
              {filteredExpenses.map((exp, idx) => {
                const checked = selectedExpenses.includes(exp.id);
                return (
                  <div key={exp.id}
                    onClick={() => toggleExpense(exp.id)}
                    style={{ ...checkRow, background: checked ? '#f0f4ff' : idx % 2 === 0 ? '#fafafa' : 'white', borderBottom: idx < filteredExpenses.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                    <input type="checkbox" checked={checked} onChange={() => toggleExpense(exp.id)} onClick={e => e.stopPropagation()} />
                    <span style={{ flex: 1 }}>
                      <strong>{EXPENSE_CATEGORIES.find(c => c.value === exp.category)?.label ?? exp.category}</strong>
                      {exp.description ? ` — ${exp.description}` : ''}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: '#666', whiteSpace: 'nowrap' }}>
                      {fmtDate(exp.expenseDate)}
                    </span>
                    <span style={{ fontWeight: 700, color: '#1a237e', whiteSpace: 'nowrap', minWidth: 80, textAlign: 'right' }}>
                      {fmtMoney(exp.amount, exp.currency)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Section 3: Pontaj ── */}
          <div style={sectionTitle}>Pontaj facturat ({filteredTimeEntries.length})</div>
          {filteredTimeEntries.length === 0 ? (
            <div style={{ fontSize: '0.82rem', color: '#aaa', padding: '0.5rem 0' }}>
              Nu exista inregistrari de pontaj aprobate{caseId ? ' pentru dosarul selectat' : ''}.
            </div>
          ) : (
            <div style={{ border: '1px solid #e8eaf6', borderRadius: '8px', overflow: 'hidden' }}>
              {filteredTimeEntries.map((te, idx) => {
                const checked = selectedTimeEntries.includes(te.id);
                return (
                  <div key={te.id}
                    onClick={() => toggleTimeEntry(te.id)}
                    style={{ ...checkRow, background: checked ? '#f0f4ff' : idx % 2 === 0 ? '#fafafa' : 'white', borderBottom: idx < filteredTimeEntries.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                    <input type="checkbox" checked={checked} onChange={() => toggleTimeEntry(te.id)} onClick={e => e.stopPropagation()} />
                    <span style={{ flex: 1 }}>
                      <strong>{fmtHours(te.durationHours)}</strong>
                      {te.description ? ` — ${te.description}` : ''}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: '#666', whiteSpace: 'nowrap' }}>
                      {fmtDate(te.workDate)}
                    </span>
                    <span style={{ fontWeight: 700, color: '#1a237e', whiteSpace: 'nowrap', minWidth: 80, textAlign: 'right' }}>
                      {fmtMoney(te.totalAmount, te.currency)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Section 4: Manual lines ── */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={sectionTitle}>Linii manuale</div>
            <button style={{ ...btnOutline, padding: '0.25rem 0.75rem', fontSize: '0.8rem' }} onClick={addManualLine}>+ Adauga linie</button>
          </div>
          {manualLines.map((l, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 100px 100px 32px', gap: '0.5rem', alignItems: 'center', marginBottom: '0.4rem' }}>
              <input style={inputStyle} placeholder="Descriere *" value={l.description}
                onChange={e => patchManualLine(i, { description: e.target.value })} />
              <input type="number" style={inputStyle} placeholder="Cant." min="0.01" step="0.01" value={l.quantity}
                onChange={e => patchManualLine(i, { quantity: parseFloat(e.target.value) || 0 })} />
              <input type="number" style={inputStyle} placeholder="Pret unit." min="0" step="0.01" value={l.unitPrice}
                onChange={e => patchManualLine(i, { unitPrice: parseFloat(e.target.value) || 0 })} />
              <select style={selectStyle} value={l.lineType} onChange={e => patchManualLine(i, { lineType: e.target.value })}>
                <option value="FlatFee">Onorariu fix</option>
                <option value="Discount">Discount</option>
                <option value="Other">Altul</option>
              </select>
              <button onClick={() => removeManualLine(i)}
                style={{ border: '1px solid #ffcdd2', borderRadius: '5px', background: '#fff5f5', color: '#c62828', cursor: 'pointer', fontSize: '1rem', lineHeight: 1, padding: '0.3rem 0.4rem' }}>
                ×
              </button>
            </div>
          ))}

          {/* ── Totals preview ── */}
          {(selectedExpenses.length > 0 || selectedTimeEntries.length > 0 || manualLines.length > 0) && (
            <div style={{ marginTop: '1rem', background: '#f8f9ff', border: '1px solid #e8eaf6', borderRadius: '8px', padding: '0.875rem 1rem', fontSize: '0.88rem' }}>
              {expenseTotal > 0    && <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}><span>Cheltuieli</span><span>{fmtMoney(expenseTotal, currency)}</span></div>}
              {timeTotal > 0       && <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}><span>Pontaj</span><span>{fmtMoney(timeTotal, currency)}</span></div>}
              {manualTotal > 0     && <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}><span>Linii manuale</span><span>{fmtMoney(manualTotal, currency)}</span></div>}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', borderTop: '1px solid #e0e0e0', paddingTop: '0.35rem' }}><span>Subtotal</span><span>{fmtMoney(subTotal, currency)}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}><span>TVA {vatPercent}%</span><span>{fmtMoney(vatAmount, currency)}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '0.95rem', color: '#1a237e' }}><span>Total</span><span>{fmtMoney(total, currency)}</span></div>
            </div>
          )}

        </>}

        {/* Footer */}
        <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button style={btnOutline} onClick={onClose} disabled={loading}>Anuleaza</button>
          <button style={btnStyle} onClick={handleSubmit} disabled={loading || dataLoading}>
            {loading ? <Spinner size={18} /> : 'Creaza factura'}
          </button>
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
