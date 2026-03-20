import { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from './AdminLayout';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { ErrorBanner } from '../../components/ui/ErrorBanner';
import { PageHeader } from '../../components/ui/PageHeader';
import {
  billingService,
  TIME_ENTRY_STATUS, TIME_ENTRY_STATUS_COLORS,
  EXPENSE_STATUS, EXPENSE_STATUS_COLORS, EXPENSE_CATEGORIES,
  INVOICE_STATUS, INVOICE_STATUS_COLORS,
  CURRENCY_LABELS, PAYMENT_METHODS, TRUST_TX_TYPES,
  type TimeEntryDto, type ExpenseDto, type InvoiceListItemDto,
  type InvoiceDto, type TrustAccountDto, type TrustTransactionDto,
  type BillingRateDto, type BillingSummaryDto, type LawyerProductivityDto,
  type ArAgingDto, type PaymentDto,
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

// =====================================================================
//  MAIN BILLING PAGE
// =====================================================================

export default function BillingPage() {
  const [tab, setTab] = useState<TabKey>('dashboard');

  return (
    <AdminLayout>
      <PageHeader title="Facturare & Management Financiar" subtitle="Pontaj, facturi, cheltuieli, conturi client, rapoarte" />

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: '0.25rem', padding: '1rem 1.5rem 0', flexWrap: 'wrap' }}>
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

      <div style={{ padding: '0 1.5rem 2rem' }}>
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
      await billingService.approveTimeEntries([...selected]);
      setSelected(new Set());
      load();
    } catch (e: any) { setError(e.message); }
  };

  return (
    <div style={{ marginTop: '1rem' }}>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
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
          <div style={{ overflowX: 'auto' }}>
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
                    <td style={tdStyle}>{e.caseNumber || e.caseId.slice(0, 8)}</td>
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
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8f9fa' }}>
                  {['Data', 'Dosar', 'Categorie', 'Descriere', 'Suma', 'Facturat', 'Status'].map(h =>
                    <th key={h} style={thStyle}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {items.map(e => (
                  <tr key={e.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                    <td style={{ ...tdStyle, fontWeight: 600 }}>{fmtDate(e.expenseDate)}</td>
                    <td style={tdStyle}>{e.caseNumber || e.caseId.slice(0, 8)}</td>
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
  const [detail, setDetail] = useState<string | null>(null);
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
      <button style={btnStyle} onClick={() => setShowCreate(true)}>+ Creeaza factura</button>

      {error && <ErrorBanner message={error} onRetry={load} />}
      {loading ? <Spinner /> : items.length === 0 ? (
        <Card style={{ padding: '3rem', textAlign: 'center', color: '#aaa', marginTop: '1rem' }}>Nicio factura gasita</Card>
      ) : (
        <Card style={{ marginTop: '1rem' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8f9fa' }}>
                  {['Nr. Factura', 'Client', 'Dosar', 'Data', 'Scadenta', 'Total', 'Sold', 'Status', ''].map(h =>
                    <th key={h} style={thStyle}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {items.map(inv => (
                  <tr key={inv.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                    <td style={{ ...tdStyle, fontWeight: 700, color: '#1a237e', cursor: 'pointer', textDecoration: 'underline' }}
                      onClick={() => setDetail(inv.id)}>{inv.invoiceNumber}</td>
                    <td style={tdStyle}>{inv.clientName ?? '-'}</td>
                    <td style={tdStyle}>{inv.caseNumber ?? '-'}</td>
                    <td style={tdStyle}>{fmtDate(inv.invoiceDate)}</td>
                    <td style={tdStyle}>{fmtDate(inv.dueDate)}</td>
                    <td style={{ ...tdStyle, fontWeight: 700 }}>{fmtMoney(inv.totalAmount, inv.currency)}</td>
                    <td style={{ ...tdStyle, fontWeight: 700, color: inv.balanceDue > 0 ? '#c62828' : '#2e7d32' }}>{fmtMoney(inv.balanceDue, inv.currency)}</td>
                    <td style={tdStyle}><Badge label={INVOICE_STATUS[inv.status] ?? '-'} color={INVOICE_STATUS_COLORS[inv.status] ?? '#999'} /></td>
                    <td style={tdStyle}>
                      <button style={{ ...btnOutline, padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => setDetail(inv.id)}>Detalii</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </Card>
      )}

      {showCreate && <CreateInvoiceModal onClose={() => setShowCreate(false)} onCreated={load} />}
      {detail && <InvoiceDetailModal invoiceId={detail} onClose={() => { setDetail(null); load(); }} />}
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
      <button style={btnStyle} onClick={() => setShowCreate(true)}>+ Inregistreaza plata</button>

      {error && <ErrorBanner message={error} onRetry={load} />}
      {loading ? <Spinner /> : items.length === 0 ? (
        <Card style={{ padding: '3rem', textAlign: 'center', color: '#aaa', marginTop: '1rem' }}>Nicio plata inregistrata</Card>
      ) : (
        <Card style={{ marginTop: '1rem' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8f9fa' }}>
                  {['Data', 'Factura', 'Client', 'Suma', 'Metoda', 'Referinta'].map(h =>
                    <th key={h} style={thStyle}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {items.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                    <td style={{ ...tdStyle, fontWeight: 600 }}>{fmtDate(p.paymentDate)}</td>
                    <td style={{ ...tdStyle, color: '#1a237e', fontWeight: 600 }}>{p.invoiceNumber ?? '-'}</td>
                    <td style={tdStyle}>{p.clientName ?? '-'}</td>
                    <td style={{ ...tdStyle, fontWeight: 700, color: '#2e7d32' }}>{fmtMoney(p.amount, p.currency)}</td>
                    <td style={tdStyle}>{PAYMENT_METHODS.find(m => m.value === p.method)?.label ?? '-'}</td>
                    <td style={tdStyle}>{p.transactionReference ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </Card>
      )}

      {showCreate && <RecordPaymentModal onClose={() => setShowCreate(false)} onCreated={load} />}
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
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try { setAccounts(await billingService.getTrustAccounts()); }
    catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div style={{ marginTop: '1rem' }}>
      <button style={btnStyle} onClick={() => setShowCreate(true)}>+ Cont client nou</button>

      {error && <ErrorBanner message={error} onRetry={load} />}
      {loading ? <Spinner /> : accounts.length === 0 ? (
        <Card style={{ padding: '3rem', textAlign: 'center', color: '#aaa', marginTop: '1rem' }}>Niciun cont client creat</Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
          {accounts.map(a => (
            <Card key={a.id} style={{ padding: '1.25rem', cursor: 'pointer', borderLeft: `4px solid ${a.balance < a.minimumBalance ? '#c62828' : '#2e7d32'}` }}
              onClick={() => setSelectedAccount(a.id)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: 700, color: '#1a237e', fontSize: '0.95rem' }}>{a.accountReference}</div>
                  <div style={{ fontSize: '0.82rem', color: '#555', marginTop: '0.15rem' }}>{a.clientName}</div>
                </div>
                <Badge label={a.isActive ? 'Activ' : 'Inactiv'} color={a.isActive ? '#2e7d32' : '#757575'} />
              </div>
              <div style={{ marginTop: '0.75rem', fontSize: '1.5rem', fontWeight: 800, color: a.balance < a.minimumBalance ? '#c62828' : '#2e7d32' }}>
                {fmtMoney(a.balance, a.currency)}
              </div>
              {a.balance < a.minimumBalance && (
                <div style={{ fontSize: '0.75rem', color: '#c62828', marginTop: '0.25rem' }}>Sub soldul minim ({fmtMoney(a.minimumBalance, a.currency)})</div>
              )}
            </Card>
          ))}
        </div>
      )}

      {showCreate && <CreateTrustAccountModal onClose={() => setShowCreate(false)} onCreated={load} />}
      {selectedAccount && <TrustTransactionsModal accountId={selectedAccount} onClose={() => { setSelectedAccount(null); load(); }} />}
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
    try { setRates(await billingService.getBillingRates()); }
    catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: string) => {
    if (!confirm('Stergeti acest tarif?')) return;
    try { await billingService.deleteBillingRate(id); load(); }
    catch (e: any) { setError(e.message); }
  };

  return (
    <div style={{ marginTop: '1rem' }}>
      <button style={btnStyle} onClick={() => setShowCreate(true)}>+ Adauga tarif</button>

      {error && <ErrorBanner message={error} onRetry={load} />}
      {loading ? <Spinner /> : rates.length === 0 ? (
        <Card style={{ padding: '3rem', textAlign: 'center', color: '#aaa', marginTop: '1rem' }}>Niciun tarif configurat</Card>
      ) : (
        <Card style={{ marginTop: '1rem' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8f9fa' }}>
                  {['Avocat', 'Client', 'Dosar', 'Tarif', 'De la', 'Pana la', 'Descriere', ''].map(h =>
                    <th key={h} style={thStyle}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {rates.map(r => (
                  <tr key={r.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                    <td style={tdStyle}>{r.userFullName ?? 'Firma (implicit)'}</td>
                    <td style={tdStyle}>{r.clientName ?? '-'}</td>
                    <td style={tdStyle}>{r.caseNumber ?? '-'}</td>
                    <td style={{ ...tdStyle, fontWeight: 700, color: '#1a237e' }}>{fmtMoney(r.rate, r.currency)}/ora</td>
                    <td style={tdStyle}>{fmtDate(r.effectiveFrom)}</td>
                    <td style={tdStyle}>{r.effectiveTo ? fmtDate(r.effectiveTo) : '-'}</td>
                    <td style={tdStyle}>{r.description ?? '-'}</td>
                    <td style={tdStyle}>
                      <button onClick={() => handleDelete(r.id)} style={{ background: 'none', border: 'none', color: '#c62828', cursor: 'pointer', fontWeight: 700 }}>X</button>
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
  const [productivity, setProductivity] = useState<LawyerProductivityDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try { setProductivity(await billingService.getLawyerProductivity()); }
    catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div style={{ marginTop: '1rem' }}>
      {error && <ErrorBanner message={error} onRetry={load} />}

      <Card style={{ marginTop: '0.5rem' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f0f0f0' }}>
          <h3 style={{ margin: 0, fontSize: '0.95rem', color: '#1a237e' }}>Productivitate avocati (ultima luna)</h3>
        </div>
        {loading ? <Spinner /> : productivity.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#aaa' }}>Nicio data disponibila</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8f9fa' }}>
                  {['Avocat', 'Total ore', 'Ore facturabile', 'Ore nefacturabile', 'Utilizare %', 'Facturat'].map(h =>
                    <th key={h} style={thStyle}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {productivity.map(p => (
                  <tr key={p.userId} style={{ borderBottom: '1px solid #f5f5f5' }}>
                    <td style={{ ...tdStyle, fontWeight: 700, color: '#1a237e' }}>{p.fullName}</td>
                    <td style={tdStyle}>{fmtHours(p.totalHours)}</td>
                    <td style={{ ...tdStyle, color: '#2e7d32', fontWeight: 600 }}>{fmtHours(p.billableHours)}</td>
                    <td style={{ ...tdStyle, color: '#757575' }}>{fmtHours(p.nonBillableHours)}</td>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ flex: 1, height: '8px', background: '#e0e0e0', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ width: `${Math.min(p.utilizationRate, 100)}%`, height: '100%', background: p.utilizationRate >= 70 ? '#2e7d32' : p.utilizationRate >= 50 ? '#f57c00' : '#c62828', borderRadius: '4px' }} />
                        </div>
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#555', minWidth: '3.5rem' }}>{p.utilizationRate}%</span>
                      </div>
                    </td>
                    <td style={{ ...tdStyle, fontWeight: 700 }}>{fmtMoney(p.billedAmount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

// =====================================================================
//  MODALS
// =====================================================================

function CreateTimeEntryModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ caseId: '', workDate: new Date().toISOString().slice(0, 10), durationHours: '1', description: '', activityCode: '', isBillable: true, hourlyRateOverride: '', currency: 1 });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setSubmitting(true); setError('');
    try {
      await billingService.createTimeEntry({
        caseId: form.caseId, workDate: form.workDate,
        durationHours: parseFloat(form.durationHours),
        description: form.description, activityCode: form.activityCode || undefined,
        isBillable: form.isBillable,
        hourlyRateOverride: form.hourlyRateOverride ? parseFloat(form.hourlyRateOverride) : undefined,
        currency: form.currency,
      });
      onCreated(); onClose();
    } catch (e: any) { setError(e.message); }
    finally { setSubmitting(false); }
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={e => e.stopPropagation()}>
        <h2 style={{ margin: '0 0 1rem', color: '#1a237e', fontSize: '1.1rem' }}>Adauga pontaj</h2>
        {error && <div style={{ color: '#c62828', marginBottom: '0.75rem', fontSize: '0.85rem' }}>{error}</div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div><label style={labelStyle}>ID Dosar *</label><input style={inputStyle} value={form.caseId} onChange={e => setForm({ ...form, caseId: e.target.value })} placeholder="GUID dosar" /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div><label style={labelStyle}>Data *</label><input type="date" style={inputStyle} value={form.workDate} onChange={e => setForm({ ...form, workDate: e.target.value })} /></div>
            <div><label style={labelStyle}>Ore *</label><input type="number" step="0.25" min="0.25" max="24" style={inputStyle} value={form.durationHours} onChange={e => setForm({ ...form, durationHours: e.target.value })} /></div>
          </div>
          <div><label style={labelStyle}>Descriere *</label><textarea style={{ ...inputStyle, minHeight: '60px' }} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div><label style={labelStyle}>Cod activitate</label><input style={inputStyle} value={form.activityCode} onChange={e => setForm({ ...form, activityCode: e.target.value })} placeholder="ex: RESEARCH" /></div>
            <div><label style={labelStyle}>Tarif/ora (optional)</label><input type="number" step="0.01" style={inputStyle} value={form.hourlyRateOverride} onChange={e => setForm({ ...form, hourlyRateOverride: e.target.value })} /></div>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem' }}>
            <input type="checkbox" checked={form.isBillable} onChange={e => setForm({ ...form, isBillable: e.target.checked })} />
            Facturabil
          </label>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem', justifyContent: 'flex-end' }}>
          <button style={btnOutline} onClick={onClose}>Anuleaza</button>
          <button style={btnStyle} onClick={handleSubmit} disabled={submitting || !form.caseId || !form.description}>
            {submitting ? 'Se salveaza...' : 'Salveaza'}
          </button>
        </div>
      </div>
    </div>
  );
}

function CreateExpenseModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ caseId: '', expenseDate: new Date().toISOString().slice(0, 10), category: 1, description: '', amount: '', currency: 1, markupPercent: '0', isBillable: true, vendor: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setSubmitting(true); setError('');
    try {
      await billingService.createExpense({
        caseId: form.caseId, expenseDate: form.expenseDate, category: form.category,
        description: form.description, amount: parseFloat(form.amount),
        currency: form.currency, markupPercent: parseFloat(form.markupPercent),
        isBillable: form.isBillable, vendor: form.vendor || undefined,
      });
      onCreated(); onClose();
    } catch (e: any) { setError(e.message); }
    finally { setSubmitting(false); }
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={e => e.stopPropagation()}>
        <h2 style={{ margin: '0 0 1rem', color: '#1a237e', fontSize: '1.1rem' }}>Adauga cheltuiala</h2>
        {error && <div style={{ color: '#c62828', marginBottom: '0.75rem', fontSize: '0.85rem' }}>{error}</div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div><label style={labelStyle}>ID Dosar *</label><input style={inputStyle} value={form.caseId} onChange={e => setForm({ ...form, caseId: e.target.value })} /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div><label style={labelStyle}>Data *</label><input type="date" style={inputStyle} value={form.expenseDate} onChange={e => setForm({ ...form, expenseDate: e.target.value })} /></div>
            <div><label style={labelStyle}>Categorie *</label>
              <select style={selectStyle} value={form.category} onChange={e => setForm({ ...form, category: +e.target.value })}>
                {EXPENSE_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
          </div>
          <div><label style={labelStyle}>Descriere *</label><input style={inputStyle} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
            <div><label style={labelStyle}>Suma *</label><input type="number" step="0.01" style={inputStyle} value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} /></div>
            <div><label style={labelStyle}>Markup %</label><input type="number" step="0.5" style={inputStyle} value={form.markupPercent} onChange={e => setForm({ ...form, markupPercent: e.target.value })} /></div>
            <div><label style={labelStyle}>Furnizor</label><input style={inputStyle} value={form.vendor} onChange={e => setForm({ ...form, vendor: e.target.value })} /></div>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem' }}>
            <input type="checkbox" checked={form.isBillable} onChange={e => setForm({ ...form, isBillable: e.target.checked })} /> Facturabil
          </label>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem', justifyContent: 'flex-end' }}>
          <button style={btnOutline} onClick={onClose}>Anuleaza</button>
          <button style={btnStyle} onClick={handleSubmit} disabled={submitting || !form.caseId || !form.description || !form.amount}>
            {submitting ? 'Se salveaza...' : 'Salveaza'}
          </button>
        </div>
      </div>
    </div>
  );
}

function CreateInvoiceModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ clientId: '', caseId: '', dueDate: '', vatPercent: '19', notes: '', currency: 1 });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setSubmitting(true); setError('');
    try {
      await billingService.createInvoice({
        clientId: form.clientId, caseId: form.caseId || undefined,
        dueDate: form.dueDate, vatPercent: parseFloat(form.vatPercent),
        notes: form.notes || undefined, currency: form.currency,
      });
      onCreated(); onClose();
    } catch (e: any) { setError(e.message); }
    finally { setSubmitting(false); }
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={e => e.stopPropagation()}>
        <h2 style={{ margin: '0 0 1rem', color: '#1a237e', fontSize: '1.1rem' }}>Creeaza factura</h2>
        {error && <div style={{ color: '#c62828', marginBottom: '0.75rem', fontSize: '0.85rem' }}>{error}</div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div><label style={labelStyle}>ID Client *</label><input style={inputStyle} value={form.clientId} onChange={e => setForm({ ...form, clientId: e.target.value })} placeholder="GUID client" /></div>
          <div><label style={labelStyle}>ID Dosar (optional)</label><input style={inputStyle} value={form.caseId} onChange={e => setForm({ ...form, caseId: e.target.value })} /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div><label style={labelStyle}>Scadenta *</label><input type="date" style={inputStyle} value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} /></div>
            <div><label style={labelStyle}>TVA %</label><input type="number" style={inputStyle} value={form.vatPercent} onChange={e => setForm({ ...form, vatPercent: e.target.value })} /></div>
          </div>
          <div><label style={labelStyle}>Note</label><textarea style={{ ...inputStyle, minHeight: '50px' }} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem', justifyContent: 'flex-end' }}>
          <button style={btnOutline} onClick={onClose}>Anuleaza</button>
          <button style={btnStyle} onClick={handleSubmit} disabled={submitting || !form.clientId || !form.dueDate}>
            {submitting ? 'Se creeaza...' : 'Creeaza factura'}
          </button>
        </div>
      </div>
    </div>
  );
}

function InvoiceDetailModal({ invoiceId, onClose }: { invoiceId: string; onClose: () => void }) {
  const [inv, setInv] = useState<InvoiceDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try { setInv(await billingService.getInvoice(invoiceId)); }
      catch (e: any) { setError(e.message); }
      finally { setLoading(false); }
    })();
  }, [invoiceId]);

  const handleSend = async () => {
    try { setInv(await billingService.sendInvoice(invoiceId)); } catch (e: any) { setError(e.message); }
  };
  const handleCancel = async () => {
    if (!confirm('Anulati factura?')) return;
    try { setInv(await billingService.cancelInvoice(invoiceId)); } catch (e: any) { setError(e.message); }
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={{ ...modalStyle, maxWidth: '700px' }} onClick={e => e.stopPropagation()}>
        {loading ? <Spinner /> : error ? <ErrorBanner message={error} /> : inv && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <h2 style={{ margin: 0, color: '#1a237e', fontSize: '1.1rem' }}>Factura {inv.invoiceNumber}</h2>
                <div style={{ fontSize: '0.82rem', color: '#555', marginTop: '0.2rem' }}>{inv.clientName} - {fmtDate(inv.invoiceDate)}</div>
              </div>
              <Badge label={INVOICE_STATUS[inv.status] ?? '-'} color={INVOICE_STATUS_COLORS[inv.status] ?? '#999'} />
            </div>

            {/* Totals */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '0.5rem', marginBottom: '1rem' }}>
              {([['Subtotal', inv.subTotal], ['TVA', inv.vatAmount], ['Total', inv.totalAmount], ['Platit', inv.paidAmount], ['Sold', inv.balanceDue]] as [string, number][]).map(([l, v]) => (
                <div key={l} style={{ textAlign: 'center', padding: '0.5rem', background: '#f8f9fa', borderRadius: '6px' }}>
                  <div style={{ fontSize: '0.7rem', color: '#888', fontWeight: 700, textTransform: 'uppercase' }}>{l}</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: l === 'Sold' && v > 0 ? '#c62828' : '#1a237e' }}>{fmtMoney(v, inv.currency)}</div>
                </div>
              ))}
            </div>

            {/* Line Items */}
            {inv.lineItems.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.88rem', color: '#333' }}>Linii factura</h4>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                  <thead>
                    <tr style={{ background: '#f8f9fa' }}>
                      {['#', 'Descriere', 'Tip', 'Cantitate', 'Pret', 'Total'].map(h => <th key={h} style={{ ...thStyle, fontSize: '0.78rem' }}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {inv.lineItems.map(li => (
                      <tr key={li.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                        <td style={tdStyle}>{li.lineNumber}</td>
                        <td style={{ ...tdStyle, maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{li.description}</td>
                        <td style={tdStyle}><Badge label={li.lineType} color={li.lineType === 'Time' ? '#1976d2' : li.lineType === 'Expense' ? '#f57c00' : '#6a1b9a'} /></td>
                        <td style={tdStyle}>{li.quantity}</td>
                        <td style={tdStyle}>{fmtMoney(li.unitPrice, inv.currency)}</td>
                        <td style={{ ...tdStyle, fontWeight: 700 }}>{fmtMoney(li.amount, inv.currency)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
              {inv.status === 1 && <button style={{ ...btnStyle, background: '#2e7d32' }} onClick={handleSend}>Trimite</button>}
              {(inv.status === 1 || inv.status === 2) && <button style={{ ...btnOutline, color: '#c62828', borderColor: '#c62828' }} onClick={handleCancel}>Anuleaza</button>}
              <button style={btnOutline} onClick={onClose}>Inchide</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function RecordPaymentModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ invoiceId: '', paymentDate: new Date().toISOString().slice(0, 10), amount: '', currency: 1, method: 1, transactionReference: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setSubmitting(true); setError('');
    try {
      await billingService.recordPayment({
        invoiceId: form.invoiceId, paymentDate: form.paymentDate,
        amount: parseFloat(form.amount), currency: form.currency,
        method: form.method, transactionReference: form.transactionReference || undefined,
        notes: form.notes || undefined,
      });
      onCreated(); onClose();
    } catch (e: any) { setError(e.message); }
    finally { setSubmitting(false); }
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={e => e.stopPropagation()}>
        <h2 style={{ margin: '0 0 1rem', color: '#1a237e', fontSize: '1.1rem' }}>Inregistreaza plata</h2>
        {error && <div style={{ color: '#c62828', marginBottom: '0.75rem', fontSize: '0.85rem' }}>{error}</div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div><label style={labelStyle}>ID Factura *</label><input style={inputStyle} value={form.invoiceId} onChange={e => setForm({ ...form, invoiceId: e.target.value })} /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div><label style={labelStyle}>Data *</label><input type="date" style={inputStyle} value={form.paymentDate} onChange={e => setForm({ ...form, paymentDate: e.target.value })} /></div>
            <div><label style={labelStyle}>Suma *</label><input type="number" step="0.01" style={inputStyle} value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div><label style={labelStyle}>Metoda *</label>
              <select style={selectStyle} value={form.method} onChange={e => setForm({ ...form, method: +e.target.value })}>
                {PAYMENT_METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
            <div><label style={labelStyle}>Referinta tranzactie</label><input style={inputStyle} value={form.transactionReference} onChange={e => setForm({ ...form, transactionReference: e.target.value })} /></div>
          </div>
          <div><label style={labelStyle}>Note</label><input style={inputStyle} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem', justifyContent: 'flex-end' }}>
          <button style={btnOutline} onClick={onClose}>Anuleaza</button>
          <button style={btnStyle} onClick={handleSubmit} disabled={submitting || !form.invoiceId || !form.amount}>
            {submitting ? 'Se salveaza...' : 'Salveaza plata'}
          </button>
        </div>
      </div>
    </div>
  );
}

function CreateTrustAccountModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ clientId: '', currency: 1, minimumBalance: '0', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setSubmitting(true); setError('');
    try {
      await billingService.createTrustAccount({
        clientId: form.clientId, currency: form.currency,
        minimumBalance: parseFloat(form.minimumBalance), notes: form.notes || undefined,
      });
      onCreated(); onClose();
    } catch (e: any) { setError(e.message); }
    finally { setSubmitting(false); }
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={e => e.stopPropagation()}>
        <h2 style={{ margin: '0 0 1rem', color: '#1a237e', fontSize: '1.1rem' }}>Cont client nou</h2>
        {error && <div style={{ color: '#c62828', marginBottom: '0.75rem', fontSize: '0.85rem' }}>{error}</div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div><label style={labelStyle}>ID Client *</label><input style={inputStyle} value={form.clientId} onChange={e => setForm({ ...form, clientId: e.target.value })} /></div>
          <div><label style={labelStyle}>Sold minim alerta</label><input type="number" step="0.01" style={inputStyle} value={form.minimumBalance} onChange={e => setForm({ ...form, minimumBalance: e.target.value })} /></div>
          <div><label style={labelStyle}>Note</label><input style={inputStyle} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem', justifyContent: 'flex-end' }}>
          <button style={btnOutline} onClick={onClose}>Anuleaza</button>
          <button style={btnStyle} onClick={handleSubmit} disabled={submitting || !form.clientId}>{submitting ? 'Se creeaza...' : 'Creeaza cont'}</button>
        </div>
      </div>
    </div>
  );
}

function TrustTransactionsModal({ accountId, onClose }: { accountId: string; onClose: () => void }) {
  const [account, setAccount] = useState<TrustAccountDto | null>(null);
  const [txs, setTxs] = useState<TrustTransactionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [a, t] = await Promise.all([
        billingService.getTrustAccount(accountId),
        billingService.getTrustTransactions(accountId, { page, pageSize: 15 }),
      ]);
      setAccount(a); setTxs(t.data); setTotalPages(t.pagination.totalPages);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }, [accountId, page]);

  useEffect(() => { load(); }, [load]);

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={{ ...modalStyle, maxWidth: '750px' }} onClick={e => e.stopPropagation()}>
        {loading ? <Spinner /> : error ? <ErrorBanner message={error} /> : account && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <h2 style={{ margin: 0, color: '#1a237e', fontSize: '1.1rem' }}>{account.accountReference}</h2>
                <div style={{ fontSize: '0.82rem', color: '#555' }}>{account.clientName}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: account.balance < account.minimumBalance ? '#c62828' : '#2e7d32' }}>
                  {fmtMoney(account.balance, account.currency)}
                </div>
              </div>
            </div>

            <button style={{ ...btnStyle, marginBottom: '1rem' }} onClick={() => setShowAdd(true)}>+ Adauga tranzactie</button>

            {txs.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#aaa' }}>Nicio tranzactie</div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                  <thead>
                    <tr style={{ background: '#f8f9fa' }}>
                      {['Data', 'Tip', 'Suma', 'Sold', 'Descriere', 'Ref.'].map(h => <th key={h} style={{ ...thStyle, fontSize: '0.78rem' }}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {txs.map(tx => (
                      <tr key={tx.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                        <td style={tdStyle}>{fmtDate(tx.transactionDate)}</td>
                        <td style={tdStyle}>{TRUST_TX_TYPES[tx.transactionType] ?? '-'}</td>
                        <td style={{ ...tdStyle, fontWeight: 700, color: tx.amount >= 0 ? '#2e7d32' : '#c62828' }}>
                          {tx.amount >= 0 ? '+' : ''}{fmtMoney(tx.amount, account.currency)}
                        </td>
                        <td style={{ ...tdStyle, fontWeight: 600 }}>{fmtMoney(tx.runningBalance, account.currency)}</td>
                        <td style={{ ...tdStyle, maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tx.description}</td>
                        <td style={tdStyle}>{tx.reference ?? '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <Pagination page={page} totalPages={totalPages} onChange={setPage} />
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button style={btnOutline} onClick={onClose}>Inchide</button>
            </div>
          </>
        )}

        {showAdd && (
          <AddTrustTransactionInline accountId={accountId}
            onDone={() => { setShowAdd(false); load(); }}
            onCancel={() => setShowAdd(false)} />
        )}
      </div>
    </div>
  );
}

function AddTrustTransactionInline({ accountId, onDone, onCancel }: { accountId: string; onDone: () => void; onCancel: () => void }) {
  const [form, setForm] = useState({ transactionType: 1, transactionDate: new Date().toISOString().slice(0, 10), amount: '', description: '', reference: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setSubmitting(true); setError('');
    try {
      await billingService.createTrustTransaction({
        trustAccountId: accountId, transactionType: form.transactionType,
        transactionDate: form.transactionDate, amount: parseFloat(form.amount),
        description: form.description, reference: form.reference || undefined,
      });
      onDone();
    } catch (e: any) { setError(e.message); }
    finally { setSubmitting(false); }
  };

  return (
    <div style={{ marginTop: '1rem', padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
      <h4 style={{ margin: '0 0 0.75rem', color: '#1a237e', fontSize: '0.9rem' }}>Tranzactie noua</h4>
      {error && <div style={{ color: '#c62828', marginBottom: '0.5rem', fontSize: '0.82rem' }}>{error}</div>}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <div><label style={labelStyle}>Tip</label>
          <select style={selectStyle} value={form.transactionType} onChange={e => setForm({ ...form, transactionType: +e.target.value })}>
            {Object.entries(TRUST_TX_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <div><label style={labelStyle}>Data</label><input type="date" style={inputStyle} value={form.transactionDate} onChange={e => setForm({ ...form, transactionDate: e.target.value })} /></div>
        <div><label style={labelStyle}>Suma</label><input type="number" step="0.01" style={inputStyle} value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} /></div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <div><label style={labelStyle}>Descriere</label><input style={inputStyle} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
        <div><label style={labelStyle}>Referinta</label><input style={inputStyle} value={form.reference} onChange={e => setForm({ ...form, reference: e.target.value })} /></div>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
        <button style={btnOutline} onClick={onCancel}>Anuleaza</button>
        <button style={btnStyle} onClick={handleSubmit} disabled={submitting || !form.amount || !form.description}>{submitting ? '...' : 'Salveaza'}</button>
      </div>
    </div>
  );
}

function CreateBillingRateModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ userId: '', clientId: '', caseId: '', rate: '', currency: 1, effectiveFrom: new Date().toISOString().slice(0, 10), effectiveTo: '', description: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setSubmitting(true); setError('');
    try {
      await billingService.createBillingRate({
        userId: form.userId || undefined, clientId: form.clientId || undefined,
        caseId: form.caseId || undefined, rate: parseFloat(form.rate),
        currency: form.currency, effectiveFrom: form.effectiveFrom,
        effectiveTo: form.effectiveTo || undefined, description: form.description || undefined,
      });
      onCreated(); onClose();
    } catch (e: any) { setError(e.message); }
    finally { setSubmitting(false); }
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={e => e.stopPropagation()}>
        <h2 style={{ margin: '0 0 1rem', color: '#1a237e', fontSize: '1.1rem' }}>Adauga tarif</h2>
        {error && <div style={{ color: '#c62828', marginBottom: '0.75rem', fontSize: '0.85rem' }}>{error}</div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div><label style={labelStyle}>ID Avocat (optional)</label><input style={inputStyle} value={form.userId} onChange={e => setForm({ ...form, userId: e.target.value })} placeholder="Gol = tarif implicit firma" /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div><label style={labelStyle}>ID Client (optional)</label><input style={inputStyle} value={form.clientId} onChange={e => setForm({ ...form, clientId: e.target.value })} /></div>
            <div><label style={labelStyle}>ID Dosar (optional)</label><input style={inputStyle} value={form.caseId} onChange={e => setForm({ ...form, caseId: e.target.value })} /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
            <div><label style={labelStyle}>Tarif/ora *</label><input type="number" step="0.01" style={inputStyle} value={form.rate} onChange={e => setForm({ ...form, rate: e.target.value })} /></div>
            <div><label style={labelStyle}>De la *</label><input type="date" style={inputStyle} value={form.effectiveFrom} onChange={e => setForm({ ...form, effectiveFrom: e.target.value })} /></div>
            <div><label style={labelStyle}>Pana la</label><input type="date" style={inputStyle} value={form.effectiveTo} onChange={e => setForm({ ...form, effectiveTo: e.target.value })} /></div>
          </div>
          <div><label style={labelStyle}>Descriere</label><input style={inputStyle} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem', justifyContent: 'flex-end' }}>
          <button style={btnOutline} onClick={onClose}>Anuleaza</button>
          <button style={btnStyle} onClick={handleSubmit} disabled={submitting || !form.rate}>{submitting ? 'Se salveaza...' : 'Salveaza tarif'}</button>
        </div>
      </div>
    </div>
  );
}

// =====================================================================
//  PAGINATION COMPONENT
// =====================================================================

function Pagination({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (p: number) => void }) {
  if (totalPages <= 1) return null;
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.35rem', padding: '0.75rem' }}>
      <button disabled={page <= 1} onClick={() => onChange(page - 1)}
        style={{ ...btnOutline, padding: '0.3rem 0.6rem', fontSize: '0.8rem', opacity: page <= 1 ? 0.4 : 1 }}>&laquo; Ant.</button>
      <span style={{ padding: '0.3rem 0.75rem', fontSize: '0.82rem', color: '#555' }}>Pagina {page} din {totalPages}</span>
      <button disabled={page >= totalPages} onClick={() => onChange(page + 1)}
        style={{ ...btnOutline, padding: '0.3rem 0.6rem', fontSize: '0.8rem', opacity: page >= totalPages ? 0.4 : 1 }}>Urm. &raquo;</button>
    </div>
  );
}
