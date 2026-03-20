import { apiClient } from './apiClient';

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  firmName: string;
  firmEmail?: string;
  firmPhone?: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface UserInfo {
  id: string;
  firmId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: number;
  fullName: string;
}

export interface AuthResponse {
  token: string;
  expiresAt: string;
  user: UserInfo;
}

export const authService = {
  login: async (dto: LoginDto): Promise<AuthResponse> => {
    const { data } = await apiClient.post('/auth/login', dto);
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  register: async (dto: RegisterDto): Promise<AuthResponse> => {
    const { data } = await apiClient.post('/auth/register', dto);
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  getMe: async (): Promise<UserInfo> => {
    const { data } = await apiClient.get('/auth/me');
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  getUsers: async (): Promise<UserInfo[]> => {
    const { data } = await apiClient.get('/auth/users');
    if (!data.success) throw new Error(data.message);
    return data.data;
  },
};
