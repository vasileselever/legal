import { apiClient } from './apiClient';

export interface TestNotificationRequest {
  to: string;
  name: string;
  /** Local datetime string as typed in the picker: "2026-04-02T17:50"
   *  No UTC conversion — already Romania local time. */
  scheduledAt?: string;
}

export interface TestNotificationResult {
  message: string;
}

export const notificationService = {
  testEmail: async (req: TestNotificationRequest): Promise<TestNotificationResult> => {
    const { data } = await apiClient.post<TestNotificationResult>('/test/notifications/email', req);
    return data;
  },

  testSms: async (req: TestNotificationRequest): Promise<TestNotificationResult> => {
    const { data } = await apiClient.post<TestNotificationResult>('/test/notifications/sms', req);
    return data;
  },

  testConsultationReminder: async (req: TestNotificationRequest): Promise<TestNotificationResult> => {
    const { data } = await apiClient.post<TestNotificationResult>('/test/notifications/consultation-reminder', req);
    return data;
  },
};
