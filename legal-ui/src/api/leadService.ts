import { apiClient } from './apiClient';

export interface LeadStats {
  totalLeads: number; newLeads: number; qualifiedLeads: number;
  consultationsScheduled: number; convertedLeads: number; lostLeads: number;
  conversionRate: number; averageScore: number;
  leadsBySource: Record<string, number>;
  leadsByPracticeArea: Record<string, number>;
}

export interface LeadItem {
  id: string; name: string; email: string; phone: string;
  source: number; status: number; score: number; practiceArea: number;
  urgency: number; assignedToName?: string; assignedTo?: string;
  createdAt: string; unreadMessages: number; nextConsultation?: string;
}

export interface LeadDetailItem extends LeadItem {
  description: string; budgetRange?: string; lastActivityAt?: string;
  consultations?: any[]; activities?: any[];
  consentToMarketing: boolean; consentToDataProcessing: boolean;
}

export interface ConversationItem {
  id: string; leadId: string; channel: number; message: string;
  sender?: string; isFromLead: boolean; messageTimestamp: string;
  attachmentUrl?: string; isRead: boolean;
}

export interface CreateLeadDto {
  name: string; email: string; phone: string; source: number;
  practiceArea: number; description: string; urgency: number;
  budgetRange?: string; preferredContactMethod?: string;
  assignedTo?: string;
  consentToMarketing: boolean; consentToDataProcessing: boolean;
}

export interface ActivityItem {
  id: string;
  activityType: string;
  description: string;
  userName?: string;
  createdAt: string;
}

export interface PriorLead {
  id: string;
  practiceArea: number;
  status: number;
  createdAt: string;
  assignedToName?: string;
  isConverted: boolean;
}

export interface CreateLeadResult {
  leadId: string;
  priorLeads: PriorLead[];
  hasPriorLeads: boolean;
}

export const PRACTICE_AREAS = [
  { value: 1, label: 'Drept Civil',         badge: 'CV', color: '#1976d2', link: '/servicii/drept-civil',         desc: 'Asistenta juridica in litigii civile, contracte si recuperari de creante' },
  { value: 2, label: 'Drept Comercial',     badge: 'CO', color: '#1565c0', link: '/servicii/drept-comercial',     desc: 'Consultanta juridica specializata pentru companii si antreprenori' },
  { value: 3, label: 'Drept Penal',         badge: 'PN', color: '#c62828', link: '/servicii/drept-penal',         desc: 'Aparare penala profesionista in orice faza a procesului' },
  { value: 4, label: 'Dreptul Familiei',    badge: 'FA', color: '#6a1b9a', link: '/servicii/dreptul-familiei',    desc: 'Divort, partaj, custodie copii si pensie alimentara' },
  { value: 5, label: 'Drept Imobiliar',     badge: 'IM', color: '#2e7d32', link: '/servicii/drept-imobiliar',     desc: 'Tranzactii imobiliare sigure si fara riscuri juridice' },
  { value: 6, label: 'Dreptul Muncii',      badge: 'MU', color: '#e65100', link: '/servicii/dreptul-muncii',      desc: 'Contestatie concediere, recuperare salarii si drepturi' },
  { value: 7, label: 'Drept Corporativ',    badge: 'CR', color: '#00695c', link: '/servicii/drept-corporativ',    desc: 'Constituire societati, guvernanta corporativa si fuziuni' },
  { value: 8, label: 'Drept Administrativ', badge: 'AD', color: '#4527a0', link: '/servicii/drept-administrativ', desc: 'Contestarea actelor administrative si litigii cu autoritatile publice' },
  { value: 9, label: 'Altul',               badge: '?',  color: '#546e7a', link: '/servicii/alte-servicii',       desc: 'Drept fiscal, GDPR, drept medical, mediu si alte domenii de nisa' },
];

export const LEAD_SOURCES = [
  { value: 1, label: 'Website' },   { value: 2, label: 'WhatsApp' },
  { value: 3, label: 'Facebook' },  { value: 5, label: 'Telefon' },
  { value: 6, label: 'Email' },     { value: 7, label: 'Recomandare' },
  { value: 9, label: 'Google Ads' },{ value: 11, label: 'Altul' },
];

export const LEAD_STATUS_LABELS: Record<number, string> = {
  1: 'Nou', 2: 'Contactat', 3: 'Calificat',
  4: 'Consultatie Programata', 5: 'Consultatie Finalizata',
  6: 'Propunere Trimisa', 7: 'Convertit', 8: 'Pierdut', 9: 'Descalificat',
};

export const LEAD_STATUS_COLORS: Record<number, string> = {
  1: '#1976d2', 2: '#7b1fa2', 3: '#2e7d32', 4: '#f57c00',
  5: '#00838f', 6: '#5d4037', 7: '#388e3c', 8: '#c62828', 9: '#757575',
};

export const URGENCY_LABELS: Record<number, string> = {
  1: 'Scazuta', 2: 'Medie', 3: 'Ridicata', 4: 'Urgenta',
};

export const leadService = {
  getStats: async (): Promise<LeadStats> => {
    const { data } = await apiClient.get('/leads/statistics');
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  getLeads: async (params?: {
    status?: number; source?: number; practiceArea?: number;
    assignedTo?: string; minScore?: number; search?: string;
    page?: number; pageSize?: number;
  }) => {
    const { data } = await apiClient.get('/leads', { params });
    return {
      data: data.data as LeadItem[],
      pagination: data.pagination as { totalCount: number; totalPages: number; page: number },
    };
  },

  getLead: async (id: string): Promise<LeadDetailItem> => {
    const { data } = await apiClient.get('/leads/' + id);
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  createLead: async (dto: CreateLeadDto): Promise<CreateLeadResult> => {
    const { data } = await apiClient.post('/leads', dto);
    if (!data.success) throw new Error(data.message);
    return data.data as CreateLeadResult;
  },

  updateLead: async (id: string, patch: {
    status?: number; name?: string; email?: string; phone?: string;
    practiceArea?: number; urgency?: number; assignedTo?: string;
    description?: string; budgetRange?: string; score?: number;
  }): Promise<void> => {
    const { data } = await apiClient.put('/leads/' + id, patch);
    if (!data.success) throw new Error(data.message);
  },

  deleteLead: async (id: string): Promise<void> => {
    const { data } = await apiClient.delete('/leads/' + id);
    if (!data.success) throw new Error(data.message);
  },

  getConversations: async (id: string): Promise<ConversationItem[]> => {
    const { data } = await apiClient.get('/leads/' + id + '/conversations');
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  sendMessage: async (id: string, message: string, channel = 1): Promise<string> => {
    const { data } = await apiClient.post('/leads/' + id + '/conversations', {
      leadId: id, channel, message,
    });
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  convertToClient: async (id: string, clientName: string, notes?: string): Promise<string> => {
    const { data } = await apiClient.post('/leads/' + id + '/convert', { clientName, notes });
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  getHistory: async (id: string, page = 1, pageSize = 25): Promise<{ data: ActivityItem[]; pagination: { totalCount: number; totalPages: number; page: number } }> => {
    const { data } = await apiClient.get('/leads/' + id + '/history', { params: { page, pageSize } });
    if (!data.success && data.data === undefined) throw new Error(data.message);
    return { data: data.data, pagination: data.pagination };
  },

  /** Look up existing leads for a contact by email and/or phone.
   *  Used to warn staff that this person already has open/past leads. */
  lookupByContact: async (params: { email?: string; phone?: string }): Promise<PriorLead[]> => {
    if (!params.email && !params.phone) return [];
    const { data } = await apiClient.get('/leads/lookup', { params });
    if (!data.success) return [];
    return data.data as PriorLead[];
  },
};
