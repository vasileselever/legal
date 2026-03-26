import { apiClient } from './apiClient';

export interface UserInfo {
  id: string;
  firmId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: number;
  profilePictureUrl?: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: number;
  profilePictureUrl?: string;
  isActive?: boolean;
}

export interface UserStats {
  userId: string;
  casesResponsible: number;
  casesAssigned: number;
  tasksAssigned: number;
  documentsUploaded: number;
  lastActivity?: string;
}

export const userService = {
  getAll: async (includeInactive = false): Promise<UserInfo[]> => {
    const { data } = await apiClient.get('/users', { params: { includeInactive } });
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  getById: async (id: string): Promise<UserInfo> => {
    const { data } = await apiClient.get(`/users/${id}`);
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  getStats: async (id: string): Promise<UserStats> => {
    const { data } = await apiClient.get(`/users/${id}/stats`);
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  update: async (id: string, dto: UpdateUserDto): Promise<UserInfo> => {
    const { data } = await apiClient.put(`/users/${id}`, dto);
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  activate: async (id: string): Promise<void> => {
    const { data } = await apiClient.post(`/users/${id}/activate`);
    if (!data.success) throw new Error(data.message);
  },

  deactivate: async (id: string): Promise<void> => {
    const { data } = await apiClient.post(`/users/${id}/deactivate`);
    if (!data.success) throw new Error(data.message);
  },

  resetPassword: async (id: string): Promise<string> => {
    const { data } = await apiClient.post(`/users/${id}/reset-password`);
    if (!data.success) throw new Error(data.message);
    return data.data; // Returns temporary password
  },

  delete: async (id: string): Promise<void> => {
    const { data } = await apiClient.delete(`/users/${id}`);
    if (!data.success) throw new Error(data.message);
  },
};
