import { apiClient } from './apiClient';

// ── Types ────────────────────────────────────────────────────────────

export interface DocumentTemplateListItem {
  id: string;
  name: string;
  description?: string;
  category: number;
  practiceArea: number;
  language: number;
  version: number;
  isSystemTemplate: boolean;
  isActive: boolean;
  estimatedMinutes: number;
  fieldCount: number;
  tags?: string;
  createdAt: string;
}

export interface DocumentTemplateField {
  id: string;
  fieldKey: string;
  label: string;
  labelEn?: string;
  helpText?: string;
  fieldType: number;
  sortOrder: number;
  section?: string;
  isRequired: boolean;
  defaultValue?: string;
  optionsJson?: string;
  conditionJson?: string;
  validationPattern?: string;
  validationMessage?: string;
}

export interface TemplateClauseMapping {
  id: string;
  clauseId: string;
  clauseTitle: string;
  clauseRiskLevel: number;
  sortOrder: number;
  isRequired: boolean;
  conditionJson?: string;
}

export interface DocumentTemplateDetail {
  id: string;
  firmId?: string;
  name: string;
  description?: string;
  category: number;
  practiceArea: number;
  language: number;
  bodyTemplate: string;
  bodyTemplateEn?: string;
  version: number;
  isSystemTemplate: boolean;
  isActive: boolean;
  estimatedMinutes: number;
  tags?: string;
  createdAt: string;
  fields: DocumentTemplateField[];
  clauseMappings: TemplateClauseMapping[];
}

export interface CreateDocumentTemplateDto {
  name: string;
  description?: string;
  category: number;
  practiceArea: number;
  language?: number;
  bodyTemplate: string;
  bodyTemplateEn?: string;
  estimatedMinutes: number;
  tags?: string;
  fields: Omit<DocumentTemplateField, 'id'>[];
}

export interface ClauseLibraryItem {
  id: string;
  title: string;
  content: string;
  contentEn?: string;
  category: number;
  practiceArea: number;
  riskLevel: number;
  commentary?: string;
  legalReferences?: string;
  applicableLaw?: string;
  isMandatory: boolean;
  tags?: string;
  createdAt: string;
}

export interface CreateClauseDto {
  title: string;
  content: string;
  contentEn?: string;
  category: number;
  practiceArea: number;
  riskLevel?: number;
  commentary?: string;
  legalReferences?: string;
  applicableLaw?: string;
  isMandatory?: boolean;
  tags?: string;
}

export interface SessionListItem {
  id: string;
  templateId: string;
  templateName: string;
  category: number;
  status: number;
  progressPercent: number;
  title?: string;
  caseId?: string;
  clientId?: string;
  createdAt: string;
  completedAt?: string;
}

export interface SessionAnswer {
  id: string;
  fieldId: string;
  fieldKey: string;
  value: string;
}

export interface SessionDetail {
  id: string;
  templateId: string;
  templateName: string;
  category: number;
  language: number;
  status: number;
  currentFieldIndex: number;
  progressPercent: number;
  title?: string;
  notes?: string;
  caseId?: string;
  clientId?: string;
  createdAt: string;
  completedAt?: string;
  fields: DocumentTemplateField[];
  answers: SessionAnswer[];
}

export interface StartSessionDto {
  templateId: string;
  language?: number;
  caseId?: string;
  clientId?: string;
  title?: string;
}

export interface SubmitAnswersDto {
  answers: { fieldId: string; value: string }[];
}

export interface GeneratedDocumentListItem {
  id: string;
  sessionId: string;
  title: string;
  category: number;
  language: number;
  version: number;
  readabilityScore?: number;
  exportedFilePath?: string;
  createdAt: string;
  linkedLeads: { leadId: string; leadName: string }[];
}

export interface GeneratedDocumentDetail {
  id: string;
  sessionId: string;
  title: string;
  contentHtml: string;
  contentHtmlEn?: string;
  category: number;
  language: number;
  version: number;
  readabilityScore?: number;
  qualityCheckResultsJson?: string;
  fieldValuesJson: string;
  exportedFilePath?: string;
  createdAt: string;
}

export interface QualityCheckResult {
  passed: boolean;
  readabilityScore: number;
  issues: { severity: string; message: string; field?: string }[];
}

export interface DocAutomationStats {
  totalTemplates: number;
  totalSessions: number;
  completedSessions: number;
  totalGeneratedDocuments: number;
  totalClauses: number;
  documentsByCategory: Record<string, number>;
  averageCompletionPercent: number;
}

// ── Helpers ──────────────────────────────────────────────────────────

interface ApiResponse<T> { success: boolean; data?: T; message?: string }
function unwrap<T>(r: { data: ApiResponse<T> }): T { return r.data.data!; }

// ── Template APIs ────────────────────────────────────────────────────

export const getTemplates = (params?: { category?: number; practiceArea?: number; search?: string }) =>
  apiClient.get<ApiResponse<DocumentTemplateListItem[]>>('/documentautomation/templates', { params }).then(unwrap);

export const getTemplate = (id: string) =>
  apiClient.get<ApiResponse<DocumentTemplateDetail>>(`/documentautomation/templates/${id}`).then(unwrap);

export const createTemplate = (dto: CreateDocumentTemplateDto) =>
  apiClient.post<ApiResponse<DocumentTemplateDetail>>('/documentautomation/templates', dto).then(unwrap);

export const updateTemplate = (id: string, dto: Record<string, unknown>) =>
  apiClient.patch<ApiResponse<DocumentTemplateDetail>>(`/documentautomation/templates/${id}`, dto).then(unwrap);

export const deleteTemplate = (id: string) =>
  apiClient.delete<ApiResponse<boolean>>(`/documentautomation/templates/${id}`).then(unwrap);

// ── Clause APIs ──────────────────────────────────────────────────────

export const getClauses = (params?: { category?: number; practiceArea?: number; riskLevel?: number; search?: string }) =>
  apiClient.get<ApiResponse<ClauseLibraryItem[]>>('/documentautomation/clauses', { params }).then(unwrap);

export const getClause = (id: string) =>
  apiClient.get<ApiResponse<ClauseLibraryItem>>(`/documentautomation/clauses/${id}`).then(unwrap);

export const createClause = (dto: CreateClauseDto) =>
  apiClient.post<ApiResponse<ClauseLibraryItem>>('/documentautomation/clauses', dto).then(unwrap);

export const deleteClause = (id: string) =>
  apiClient.delete<ApiResponse<boolean>>(`/documentautomation/clauses/${id}`).then(unwrap);

// ── Session APIs ─────────────────────────────────────────────────────

export const getSessions = (params?: { status?: number }) =>
  apiClient.get<ApiResponse<SessionListItem[]>>('/documentautomation/sessions', { params }).then(unwrap);

export const getSession = (id: string) =>
  apiClient.get<ApiResponse<SessionDetail>>(`/documentautomation/sessions/${id}`).then(unwrap);

export const startSession = (dto: StartSessionDto) =>
  apiClient.post<ApiResponse<SessionDetail>>('/documentautomation/sessions', dto).then(unwrap);

export const submitAnswers = (id: string, dto: SubmitAnswersDto) =>
  apiClient.post<ApiResponse<SessionDetail>>(`/documentautomation/sessions/${id}/answers`, dto).then(unwrap);

export const abandonSession = (id: string) =>
  apiClient.post<ApiResponse<boolean>>(`/documentautomation/sessions/${id}/abandon`).then(unwrap);

// ── Generated Document APIs ──────────────────────────────────────────

export const generateDocument = (sessionId: string) =>
  apiClient.post<ApiResponse<GeneratedDocumentDetail>>(`/documentautomation/sessions/${sessionId}/generate`).then(unwrap);

export const getGeneratedDocuments = (params?: { sessionId?: string }) =>
  apiClient.get<ApiResponse<GeneratedDocumentListItem[]>>('/documentautomation/documents', { params }).then(unwrap);

export const getGeneratedDocument = (id: string) =>
  apiClient.get<ApiResponse<GeneratedDocumentDetail>>(`/documentautomation/documents/${id}`).then(unwrap);

export const deleteGeneratedDocument = (id: string) =>
  apiClient.delete<ApiResponse<boolean>>(`/documentautomation/documents/${id}`).then(unwrap);

// ── Quality Check ────────────────────────────────────────────────────

export const runQualityCheck = (documentId: string) =>
  apiClient.post<ApiResponse<QualityCheckResult>>(`/documentautomation/documents/${documentId}/quality-check`).then(unwrap);

// ── Save generated document as a Lead attachment ─────────────────────

export const saveGeneratedToLead = (leadId: string, generatedDocId: string) =>
  apiClient.post(`/leads/${leadId}/documents/from-generated/${generatedDocId}`)
    .then(r => { if (!r.data.success) throw new Error(r.data.message); return r.data.data; });

// ── Stats ────────────────────────────────────────────────────────────

export const getDocAutomationStats = () =>
  apiClient.get<ApiResponse<DocAutomationStats>>('/documentautomation/stats').then(unwrap);

// ── Lookup maps ──────────────────────────────────────────────────────

export const DOCUMENT_CATEGORIES: Record<number, string> = {
  1: 'Contract vânzare-cumpărare', 2: 'Contract prestări servicii', 3: 'Contract de muncă (CIM)',
  4: 'Acord de confidențialitate (NDA)', 5: 'Contract de închiriere', 6: 'Contract de împrumut',
  7: 'Contract de parteneriat', 8: 'Contract de franciză',
  20: 'Cerere de chemare în judecată', 21: 'Cereri și petiții', 22: 'Apel', 23: 'Întâmpinare', 24: 'Listă probe',
  40: 'Act constitutiv', 41: 'Acord asociați', 42: 'Hotărâre CA/AGA', 43: 'Document GDPR',
  44: 'Politică de confidențialitate', 45: 'Termeni și condiții',
  60: 'Procură', 61: 'Testament', 62: 'Somație', 63: 'Acord de tranzacție', 99: 'Altele',
};

export const PRACTICE_AREAS: Record<number, string> = {
  1: 'Civil', 2: 'Comercial', 3: 'Penal', 4: 'Familie',
  5: 'Imobiliar', 6: 'Muncă', 7: 'Corporativ', 8: 'Administrativ', 9: 'Altele',
};

export const FIELD_TYPES: Record<number, string> = {
  1: 'Text', 2: 'Text lung', 3: 'Număr', 4: 'Sumă', 5: 'Dată',
  6: 'Da/Nu', 7: 'Alegere unică', 8: 'Alegere multiplă',
  9: 'Email', 10: 'Telefon', 11: 'CNP', 12: 'CUI', 13: 'Adresă',
};

export const RISK_LEVELS: Record<number, { label: string; color: string }> = {
  1: { label: 'Favorabilă', color: '#2e7d32' },
  2: { label: 'Neutră', color: '#f57c00' },
  3: { label: 'Nefavorabilă', color: '#c62828' },
};

export const SESSION_STATUSES: Record<number, { label: string; color: string }> = {
  1: { label: 'În progres', color: '#1976d2' },
  2: { label: 'Completată', color: '#2e7d32' },
  3: { label: 'Abandonată', color: '#9e9e9e' },
};

export const LANGUAGES: Record<number, string> = { 1: 'Română', 2: 'Engleză', 3: 'Bilingv' };
