import api from './api';
import { Theme, NotificationPreferences } from '../store/slices/settingsSlice';

interface UserSettings {
  theme: Theme;
  notifications: NotificationPreferences;
  language: string;
}

interface ConnectedAccount {
  platform: 'twitch' | 'discord';
  username: string;
  connected: boolean;
  lastSync: string;
}

const settingsService = {
  async getUserSettings(): Promise<UserSettings> {
    const response = await api.get<UserSettings>('/settings');
    return response.data;
  },

  async updateTheme(theme: Theme): Promise<Theme> {
    const response = await api.put<Theme>('/settings/theme', theme);
    return response.data;
  },

  async updateNotificationPreferences(
    preferences: NotificationPreferences
  ): Promise<NotificationPreferences> {
    const response = await api.put<NotificationPreferences>(
      '/settings/notifications',
      preferences
    );
    return response.data;
  },

  async updateLanguage(language: string): Promise<{ language: string }> {
    const response = await api.put<{ language: string }>('/settings/language', {
      language,
    });
    return response.data;
  },

  async getConnectedAccounts(): Promise<ConnectedAccount[]> {
    const response = await api.get<ConnectedAccount[]>('/settings/connected-accounts');
    return response.data;
  },

  async connectAccount(platform: 'twitch' | 'discord'): Promise<{ url: string }> {
    const response = await api.post<{ url: string }>(`/settings/connect/${platform}`);
    return response.data;
  },

  async disconnectAccount(platform: 'twitch' | 'discord'): Promise<void> {
    await api.delete(`/settings/connect/${platform}`);
  },

  async exportUserData(): Promise<Blob> {
    const response = await api.get('/settings/export', {
      responseType: 'blob',
    });
    return response.data;
  },

  async deleteAccount(password: string): Promise<void> {
    await api.delete('/settings/account', {
      data: { password },
    });
  },
};

export default settingsService; 