import { apiClient } from './apiClient';
import axios from 'axios';

// -- Enums / Labels ---------------------------------------------------

export const TIME_ENTRY_STATUS: Record<number, string> = {
  1: 'Ciorna', 2: 'Trimis', 3: 'Aprobat', 4: 'Facturat', 5: 'Anulat',
};
export const TIME_ENTRY_STATUS_COLORS: Record<number, string> = {
  1: '#757575', 2: '#f57c00', 3: '#2e7d32', 4: '#6a1b9a', 5: '#c62828',
};

export const EXPENSE_STATUS: Record<number, string> = {
  1: 'In asteptare', 2: 'Aprobat', 3: 'Facturat', 4: 'Respins', 5: 'Anulat',
};
export const EXPENSE_STATUS_COLORS: Record<number, string> = {
  1: '#f57c00', 2: '#2e7d32', 3: '#6a1b9a', 4: '#c62828', 5: '#757575',
};

export const EXPENSE_CATEGORIES: { value: number; label: string }[] = [
  { value: 1, label: 'Taxe judiciare' },
  { value: 2, label: 'Costuri inregistrare' },
  { value: 3, label: 'Deplasare - Km' },
  { value: 4, label: 'Deplasare - Cazare' },
  { value: 5, label: 'Deplasare - Masa' },
  { value: 6, label: 'Posta' },
  { value: 7, label: 'Copiere' },
  { value: 8, label: 'Curierat' },
  { value: 9, label: 'Expert judiciar' },
  { value: 10, label: 'Servicii proces' },
  { value: 11, label: 'Traducere/Notarizare' },
  { value: 12, label: 'Baze date cercetare' },
  { value: 99, label: 'Altele' },
];

export const INVOICE_STATUS: Record<number, string> = {
  1: 'Ciorna', 2: 'Trimisa', 3: 'Vizualizata', 4: 'Plata partiala',
  5: 'Platita', 6: 'Restanta', 7: 'Anulata', 8: 'Stornata',
};
export const INVOICE_STATUS_COLORS: Record<number, string> = {
  1: '#757575', 2: '#1976d2', 3: '#00838f', 4: '#f57c00',
  5: '#2e7d32', 6: '#c62828', 7: '#9e9e9e', 8: '#795548',
};

export const CURRENCY_LABELS: Record<number, string> = { 1: 'RON', 2: 'EUR', 3: 'USD' };

export const PAYMENT_METHODS: Record<number, string> = {
  1: 'Transfer bancar',
  2: 'Card de credit',
  3: 'Numerar',
  4: 'Online (Stripe/PayU)',
  5: 'Transfer cont client',
  6: 'Cec',
};

export const TRUST_TX_TYPES: Record<number, string> = {
  1: 'Depunere', 2: 'Retragere', 3: 'Transfer', 4: 'Dobanda', 5: 'Comision bancar', 6: 'Rambursare client',
};

// ?? Types ????????????????????????????????????????????????????????????

export interface TimeEntryDto {
  id: string; caseId?: string; caseNumber?: string; caseTitle?: string;
  leadId?: string; leadName?: string;
  userId: string; userFullName?: string;
  workDate: string; durationHours: number; description: string;
  activityCode?: string; isBillable: boolean;
  hourlyRate: number; currency: number; totalAmount: number;
  status: number; rejectionReason?: string;
  timerStart?: string; timerStop?: string;
  createdAt: string;
}

export interface ExpenseDto {
  id: string; caseId: string; caseNumber?: string; caseTitle?: string;
  leadId?: string; leadName?: string;
  userId: string; userFullName?: string;
  expenseDate: string; category: number; description: string;
  amount: number; currency: number; markupPercent: number;
  billableAmount: number; isBillable: boolean; status: number;
  receiptFilePath?: string; vendor?: string; createdAt: string;
}

export interface InvoiceListItemDto {
  id: string; invoiceNumber: string; clientName?: string; caseNumber?: string;
  invoiceDate: string; dueDate: string; status: number; currency: number;
  totalAmount: number; balanceDue: number;
}

export interface InvoiceDto extends InvoiceListItemDto {
  clientId: string; caseId?: string;
  subTotal: number; vatPercent: number; vatAmount: number;
  paidAmount: number; writeOffAmount: number;
  periodStart?: string; periodEnd?: string; notes?: string;
  eFacturaId?: string; sentAt?: string;
  lineItems: InvoiceLineItemDto[];
  payments: PaymentSummaryDto[];
  createdAt: string;
}

export interface InvoiceLineItemDto {
  id: string; lineNumber: number; description: string;
  quantity: number; unitPrice: number; amount: number;
  lineType: string; timeEntryId?: string; expenseId?: string;
}

export interface PaymentSummaryDto {
  id: string; paymentDate: string; amount: number; method: number;
}

export interface PaymentDto {
  id: string; invoiceId: string; invoiceNumber?: string;
  clientId: string; clientName?: string;
  paymentDate: string; amount: number; currency: number;
  method: number; transactionReference?: string; notes?: string;
  createdAt: string;
}

export interface TrustAccountDto {
  id: string; clientId: string; clientName?: string;
  accountReference: string; currency: number;
  balance: number; minimumBalance: number;
  isActive: boolean; notes?: string; createdAt: string;
}

export interface TrustTransactionDto {
  id: string; trustAccountId: string; transactionType: number;
  transactionDate: string; amount: number; runningBalance: number;
  description: string; reference?: string; performedByName?: string;
  createdAt: string;
}

export interface BillingRateDto {
  id: string; userId?: string; userFullName?: string;
  clientId?: string; clientName?: string;
  caseId?: string; caseNumber?: string;
  rate: number; currency: number;
  effectiveFrom: string; effectiveTo?: string;
  description?: string;
}

export interface BillingSummaryDto {
  totalWip: number; totalBilled: number; totalCollected: number;
  totalOutstanding: number; realizationRate: number; collectionRate: number;
  overdueInvoiceCount: number; trustAccountsBalance: number;
}

export interface LawyerProductivityDto {
  userId: string; fullName: string; totalHours: number;
  billableHours: number; nonBillableHours: number;
  utilizationRate: number; billedAmount: number; collectedAmount: number;
}

export interface ArAgingDto {
  current: number; thirtyDays: number; sixtyDays: number;
  ninetyPlusDays: number; total: number;
}

// Lightweight case item for dropdowns
export interface CaseItem {
  id: string;
  clientId: string;
  caseNumber: string;
  title: string;
  clientName: string;
}

export interface LeadDropdownItem {
  id: string;
  name: string;
  practiceArea: number;
}

export interface PagedResponse<T> {
  data: T[];
  pagination: { page: number; pageSize: number; totalCount: number; totalPages: number };
}

// ?? Service ??????????????????????????????????????????????????????????

const B = '/v1/billing';

export const billingService = {
  // Cases (for dropdowns) — uses a standalone axios call so a 401 from
  // CasesController does NOT trigger the global auth:unauthorized redirect.
  getCases: async (): Promise<CaseItem[]> => {
    const token = localStorage.getItem('jwt_token');
    const baseURL = (apiClient.defaults.baseURL || '/api');
    const { data } = await axios.get(`${baseURL}/v1/cases`, {
      params: { pageSize: 500 },
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    // CasesController returns PagedResponse<CaseListItem>
    return (data.data ?? data).map((c: any) => ({
      id: c.id,
      clientId: c.clientId,
      caseNumber: c.caseNumber,
      title: c.title,
      clientName: c.clientName ?? '',
    }));
  },

  getLeadsForDropdown: async (): Promise<LeadDropdownItem[]> => {
    const { data } = await apiClient.get('/leads', { params: { pageSize: 500 } });
    return (data.data ?? []).map((l: any) => ({
      id: l.id,
      name: l.name,
      practiceArea: l.practiceArea,
    }));
  },

  // Time Entries
  getTimeEntries: async (params?: Record<string, any>): Promise<PagedResponse<TimeEntryDto>> => {
    const { data } = await apiClient.get(`${B}/time-entries`, { params });
    return data;
  },
  getTimeEntry: async (id: string): Promise<TimeEntryDto> => {
    const { data } = await apiClient.get(`${B}/time-entries/${id}`);
    return data;
  },
  createTimeEntry: async (dto: any): Promise<TimeEntryDto> => {
    const { data } = await apiClient.post(`${B}/time-entries`, dto);
    return data;
  },
  updateTimeEntry: async (id: string, dto: any): Promise<TimeEntryDto> => {
    const { data } = await apiClient.put(`${B}/time-entries/${id}`, dto);
    return data;
  },
  deleteTimeEntry: async (id: string): Promise<void> => {
    await apiClient.delete(`${B}/time-entries/${id}`);
  },
  startTimer: async (dto: { caseId: string; description?: string; activityCode?: string; isBillable?: boolean }): Promise<TimeEntryDto> => {
    const { data } = await apiClient.post(`${B}/time-entries/start-timer`, dto);
    return data;
  },
  stopTimer: async (id: string, dto?: { description?: string }): Promise<TimeEntryDto> => {
    const { data } = await apiClient.post(`${B}/time-entries/${id}/stop-timer`, dto ?? {});
    return data;
  },
  submitTimeEntries: async (ids: string[]): Promise<void> => {
    await apiClient.post(`${B}/time-entries/submit`, ids);
  },
  approveTimeEntries: async (ids: string[]): Promise<void> => {
    await apiClient.post(`${B}/time-entries/approve`, ids);
  },
  rejectTimeEntries: async (ids: string[], reason: string): Promise<void> => {
    await apiClient.post(`${B}/time-entries/reject`, { ids, reason });
  },

  // Expenses
  getExpenses: async (params?: Record<string, any>): Promise<PagedResponse<ExpenseDto>> => {
    const { data } = await apiClient.get(`${B}/expenses`, { params });
    return data;
  },
  createExpense: async (dto: any): Promise<ExpenseDto> => {
    const { data } = await apiClient.post(`${B}/expenses`, dto);
    return data;
  },
  updateExpense: async (id: string, dto: any): Promise<ExpenseDto> => {
    const { data } = await apiClient.put(`${B}/expenses/${id}`, dto);
    return data;
  },
  deleteExpense: async (id: string): Promise<void> => {
    await apiClient.delete(`${B}/expenses/${id}`);
  },
  approveExpenses: async (ids: string[]): Promise<void> => {
    await apiClient.post(`${B}/expenses/approve`, ids);
  },

  // Clients
  getClients: async (): Promise<{ id: string; name: string }[]> => {
    const { data } = await apiClient.get('/v1/clients');
    return (data as any[]).map(c => ({ id: c.id, name: c.name }));
  },
  getInvoices: async (params?: Record<string, any>): Promise<PagedResponse<InvoiceListItemDto>> => {
    const { data } = await apiClient.get(`${B}/invoices`, { params });
    return data;
  },
  getInvoice: async (id: string): Promise<InvoiceDto> => {
    const { data } = await apiClient.get(`${B}/invoices/${id}`);
    return data;
  },
  createInvoice: async (dto: any): Promise<InvoiceDto> => {
    const { data } = await apiClient.post(`${B}/invoices`, dto);
    return data;
  },
  sendInvoice: async (id: string): Promise<InvoiceDto> => {
    const { data } = await apiClient.post(`${B}/invoices/${id}/send`);
    return data;
  },
  cancelInvoice: async (id: string): Promise<InvoiceDto> => {
    const { data } = await apiClient.post(`${B}/invoices/${id}/cancel`);
    return data;
  },

  // Payments
  getPayments: async (params?: Record<string, any>): Promise<PagedResponse<PaymentDto>> => {
    const { data } = await apiClient.get(`${B}/payments`, { params });
    return data;
  },
  recordPayment: async (dto: any): Promise<PaymentDto> => {
    const { data } = await apiClient.post(`${B}/payments`, dto);
    return data;
  },

  // Trust Accounts
  getTrustAccounts: async (params?: Record<string, any>): Promise<TrustAccountDto[]> => {
    const { data } = await apiClient.get(`${B}/trust-accounts`, { params });
    return data;
  },
  getTrustAccount: async (id: string): Promise<TrustAccountDto> => {
    const { data } = await apiClient.get(`${B}/trust-accounts/${id}`);
    return data;
  },
  createTrustAccount: async (dto: any): Promise<TrustAccountDto> => {
    const { data } = await apiClient.post(`${B}/trust-accounts`, dto);
    return data;
  },
  getTrustTransactions: async (id: string, params?: Record<string, any>): Promise<PagedResponse<TrustTransactionDto>> => {
    const { data } = await apiClient.get(`${B}/trust-accounts/${id}/transactions`, { params });
    return data;
  },
  createTrustTransaction: async (dto: any): Promise<TrustTransactionDto> => {
    const { data } = await apiClient.post(`${B}/trust-accounts/transactions`, dto);
    return data;
  },

  // Billing Rates
  getBillingRates: async (params?: Record<string, any>): Promise<BillingRateDto[]> => {
    const { data } = await apiClient.get(`${B}/rates`, { params });
    return data;
  },
  createBillingRate: async (dto: any): Promise<BillingRateDto> => {
    const { data } = await apiClient.post(`${B}/rates`, dto);
    return data;
  },
  deleteBillingRate: async (id: string): Promise<void> => {
    await apiClient.delete(`${B}/rates/${id}`);
  },

  // Reports
  getBillingSummary: async (params?: Record<string, any>): Promise<BillingSummaryDto> => {
    const { data } = await apiClient.get(`${B}/reports/summary`, { params });
    return data;
  },
  getLawyerProductivity: async (params?: Record<string, any>): Promise<LawyerProductivityDto[]> => {
    const { data } = await apiClient.get(`${B}/reports/lawyer-productivity`, { params });
    return data;
  },
  getArAging: async (): Promise<ArAgingDto> => {
    const { data } = await apiClient.get(`${B}/reports/ar-aging`);
    return data;
  },
};
