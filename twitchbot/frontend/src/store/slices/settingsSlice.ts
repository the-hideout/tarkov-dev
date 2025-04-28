import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { settingsService } from '../../services';

export interface Theme {
  mode: 'light' | 'dark';
  primaryColor: string;
  secondaryColor: string;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  discord: boolean;
  twitch: boolean;
}

interface SettingsState {
  theme: Theme;
  notifications: NotificationPreferences;
  language: string;
  loading: boolean;
  error: string | null;
  connectedAccounts: {
    twitch: boolean;
    discord: boolean;
  };
}

const initialState: SettingsState = {
  theme: {
    mode: 'dark',
    primaryColor: '#90caf9',
    secondaryColor: '#ce93d8',
  },
  notifications: {
    email: true,
    push: true,
    discord: true,
    twitch: true,
  },
  language: 'en',
  loading: false,
  error: null,
  connectedAccounts: {
    twitch: false,
    discord: false,
  },
};

// Async thunks
export const getUserSettings = createAsyncThunk('settings/getUserSettings', async () => {
  const response = await settingsService.getUserSettings();
  return response;
});

export const updateThemeSettings = createAsyncThunk(
  'settings/updateTheme',
  async (theme: Theme) => {
    const response = await settingsService.updateTheme(theme);
    return response;
  }
);

export const updateNotificationSettings = createAsyncThunk(
  'settings/updateNotifications',
  async (preferences: NotificationPreferences) => {
    const response = await settingsService.updateNotificationPreferences(preferences);
    return response;
  }
);

export const updateLanguageSettings = createAsyncThunk(
  'settings/updateLanguage',
  async (language: string) => {
    const response = await settingsService.updateLanguage(language);
    return response.language;
  }
);

export const getConnectedAccounts = createAsyncThunk(
  'settings/getConnectedAccounts',
  async () => {
    const response = await settingsService.getConnectedAccounts();
    return response;
  }
);

export const connectAccount = createAsyncThunk(
  'settings/connectAccount',
  async (platform: 'twitch' | 'discord') => {
    const response = await settingsService.connectAccount(platform);
    return { platform, url: response.url };
  }
);

export const disconnectAccount = createAsyncThunk(
  'settings/disconnectAccount',
  async (platform: 'twitch' | 'discord') => {
    await settingsService.disconnectAccount(platform);
    return platform;
  }
);

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<Theme>) => {
      state.theme = action.payload;
    },
    setLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload;
    },
    setNotificationPreferences: (state, action: PayloadAction<NotificationPreferences>) => {
      state.notifications = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Get User Settings
    builder
      .addCase(getUserSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserSettings.fulfilled, (state, action) => {
        state.theme = action.payload.theme;
        state.notifications = action.payload.notifications;
        state.language = action.payload.language;
        state.loading = false;
        state.error = null;
      })
      .addCase(getUserSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch settings';
      });

    // Update Theme
    builder
      .addCase(updateThemeSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateThemeSettings.fulfilled, (state, action) => {
        state.theme = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(updateThemeSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update theme';
      });

    // Update Notifications
    builder
      .addCase(updateNotificationSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateNotificationSettings.fulfilled, (state, action) => {
        state.notifications = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(updateNotificationSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update notifications';
      });

    // Update Language
    builder
      .addCase(updateLanguageSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateLanguageSettings.fulfilled, (state, action) => {
        state.language = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(updateLanguageSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update language';
      });

    // Get Connected Accounts
    builder
      .addCase(getConnectedAccounts.fulfilled, (state, action) => {
        state.connectedAccounts = {
          twitch: action.payload.some(
            (account) => account.platform === 'twitch' && account.connected
          ),
          discord: action.payload.some(
            (account) => account.platform === 'discord' && account.connected
          ),
        };
      });

    // Connect Account
    builder
      .addCase(connectAccount.fulfilled, (state, action) => {
        state.connectedAccounts[action.payload.platform] = true;
      });

    // Disconnect Account
    builder
      .addCase(disconnectAccount.fulfilled, (state, action) => {
        state.connectedAccounts[action.payload] = false;
      });
  },
});

export const { setTheme: updateTheme, setLanguage: updateLanguage, setNotificationPreferences: updateNotificationPreferences } = settingsSlice.actions;

export default settingsSlice.reducer; 