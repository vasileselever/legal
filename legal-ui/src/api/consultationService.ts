import { apiClient } from './apiClient';

export interface ConsultationItem {
  id: string; 
  leadId: string; 
  leadName?: string;  // ? ADDED: Lead name
  leadEmail?: string;  // Lead email for notification
  lawyerId: string; 
  lawyerName: string;
  scheduledAt: string; 
  durationMinutes: number;
  type: number; 
  status: number;
  videoMeetingLink?: string; 
  location?: string;
  isConfirmed: boolean; 
  consultationNotes?: string;
}
export interface CreateConsultationDto {
  leadId: string; lawyerId: string; scheduledAt: string;
  durationMinutes: number; type: number;
  location?: string; preparationNotes?: string;
  sendNotification?: boolean;
}

export interface UpdateConsultationDto {
  lawyerId: string;
  scheduledAt: string;
  durationMinutes: number;
  type: number;
  location?: string;
  preparationNotes?: string;
  sendNotification?: boolean;  // backend sends the email when true
}

export const CONSULTATION_TYPE_LABELS: Record<number, string> = { 1: 'Fizic', 2: 'Telefon', 3: 'Video' };
export const CONSULTATION_TYPE_COLORS: Record<number, string> = { 1: '#e65100', 2: '#7b1fa2', 3: '#1976d2' };
export const CONSULTATION_STATUS_LABELS: Record<number, string> = {
  1: 'Programata', 2: 'Confirmata', 3: 'Finalizata', 4: 'Absent', 5: 'Anulata', 6: 'Reprogramata',
};
export const CONSULTATION_STATUS_COLORS: Record<number, string> = {
  1: '#1976d2', 2: '#2e7d32', 3: '#00838f', 4: '#757575', 5: '#c62828', 6: '#f57c00',
};
export const DURATION_OPTIONS = [15, 30, 45, 60, 90, 120];

export const consultationService = {
  getAll: async (params?: { lawyerId?: string; status?: number; startDate?: string; endDate?: string }) => {
    const { data } = await apiClient.get('/consultations', { params });
    if (!data.success) throw new Error(data.message);
    return data.data as ConsultationItem[];
  },

  getById: async (id: string): Promise<ConsultationItem> => {
    const { data } = await apiClient.get('/consultations/' + id);
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  create: async (dto: CreateConsultationDto): Promise<string> => {
    const { data } = await apiClient.post('/consultations', dto);
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  update: async (id: string, dto: UpdateConsultationDto): Promise<void> => {
    const { data } = await apiClient.put('/consultations/' + id, dto);
    if (!data.success) throw new Error(data.message);
  },

  delete: async (id: string): Promise<void> => {
    const { data } = await apiClient.delete('/consultations/' + id);
    if (!data.success) throw new Error(data.message);
  },

  // API uses PATCH /consultations/{id}/status with body = bare number
  updateStatus: async (id: string, status: number, notes?: string): Promise<void> => {
    await apiClient.patch('/consultations/' + id + '/status', status, {
      headers: { 'Content-Type': 'application/json' },
    });
    // If notes provided, save them separately via update
    if (notes !== undefined) {
      await apiClient.patch('/consultations/' + id + '/notes', { consultationNotes: notes }, {
        headers: { 'Content-Type': 'application/json' },
      }).catch(() => { /* notes endpoint optional */ });
    }
  },

  confirm: async (id: string): Promise<void> => {
    const { data } = await apiClient.post('/consultations/' + id + '/confirm');
    if (!data.success) throw new Error(data.message);
  },

  getAvailability: async (lawyerId: string, startDate: string, endDate: string, durationMinutes = 30): Promise<string[]> => {
    const { data } = await apiClient.get('/consultations/availability/' + lawyerId, {
      params: { startDate, endDate, durationMinutes },
    });
    if (!data.success) throw new Error(data.message);
    return data.data as string[];
  },
};
