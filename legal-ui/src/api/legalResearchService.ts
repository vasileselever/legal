import { apiClient } from './apiClient';

export interface LegalSource {
  title: string;
  type: string;
  reference?: string;
  url?: string;
  excerpt?: string;
  publishedDate?: string;
  relevance: number;
}

export interface LegalResearchResult {
  id: string;
  query: string;
  answer: string;
  sources: LegalSource[];
  confidenceScore: number;
  processingMs: number;
  modelUsed: string;
  practiceArea?: number;
  createdAt: string;
  isBookmarked: boolean;
  title?: string;
  relatedQuestions: string[];
}

export interface LegalResearchHistoryItem {
  id: string;
  query: string;
  title?: string;
  practiceArea?: number;
  confidenceScore: number;
  sourceCount: number;
  isBookmarked: boolean;
  createdAt: string;
}

export interface LegalResearchStats {
  totalSearches: number;
  bookmarkedSearches: number;
  averageConfidence: number;
  searchesByPracticeArea: Record<string, number>;
}

export interface ConversationTurn {
  question: string;
  answer: string;
}

export interface SearchQueryDto {
  query: string;
  practiceArea?: number;
  caseId?: string;
  saveToHistory?: boolean;
  history?: ConversationTurn[];
}

export const legalResearchService = {
  search: async (dto: SearchQueryDto): Promise<LegalResearchResult> => {
    const { data } = await apiClient.post('/legalresearch', { saveToHistory: true, ...dto });
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  getHistory: async (bookmarkedOnly = false, page = 1): Promise<LegalResearchHistoryItem[]> => {
    const { data } = await apiClient.get('/legalresearch', {
      params: { bookmarkedOnly, page, pageSize: 20 },
    });
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  getById: async (id: string): Promise<LegalResearchResult> => {
    const { data } = await apiClient.get(`/legalresearch/${id}`);
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  toggleBookmark: async (id: string, isBookmarked: boolean): Promise<void> => {
    const { data } = await apiClient.patch(`/legalresearch/${id}`, { isBookmarked });
    if (!data.success) throw new Error(data.message);
  },

  setTitle: async (id: string, title: string): Promise<void> => {
    const { data } = await apiClient.patch(`/legalresearch/${id}`, { title });
    if (!data.success) throw new Error(data.message);
  },

  delete: async (id: string): Promise<void> => {
    const { data } = await apiClient.delete(`/legalresearch/${id}`);
    if (!data.success) throw new Error(data.message);
  },

  getStats: async (): Promise<LegalResearchStats> => {
    const { data } = await apiClient.get('/legalresearch/stats');
    if (!data.success) throw new Error(data.message);
    return data.data;
  },
};