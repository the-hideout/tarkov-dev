import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { botService } from '../../services';

interface Command {
  name: string;
  description: string;
  enabled: boolean;
  cooldown: number;
  userLevel: string;
}

interface BotSettings {
  username: string;
  channel: string;
  autoModeration: boolean;
}

interface ChatSettings {
  slowMode: boolean;
  slowModeDelay: number;
  subscriberOnly: boolean;
  emoteOnly: boolean;
}

interface ServerSettings {
  serverId: string;
  permissions: {
    manageMessages: boolean;
    manageRoles: boolean;
    kickMembers: boolean;
    banMembers: boolean;
  };
}

interface BotStatus {
  status: 'online' | 'offline';
  uptime: string;
  commands: number;
  messages: number;
}

interface BotState {
  twitch: {
    settings: BotSettings | null;
    chatSettings: ChatSettings | null;
    commands: Command[];
    status: BotStatus | null;
  };
  discord: {
    settings: ServerSettings | null;
    commands: Command[];
    status: BotStatus | null;
  };
  loading: boolean;
  error: string | null;
}

const initialState: BotState = {
  twitch: {
    settings: null,
    chatSettings: null,
    commands: [],
    status: null,
  },
  discord: {
    settings: null,
    commands: [],
    status: null,
  },
  loading: false,
  error: null,
};

// Async thunks
export const getTwitchBotSettings = createAsyncThunk(
  'bot/getTwitchSettings',
  async () => {
    const response = await botService.getTwitchBotSettings();
    return response;
  }
);

export const updateTwitchBotSettings = createAsyncThunk(
  'bot/updateTwitchSettings',
  async (settings: BotSettings) => {
    const response = await botService.updateTwitchBotSettings(settings);
    return response;
  }
);

export const getTwitchChatSettings = createAsyncThunk(
  'bot/getTwitchChatSettings',
  async () => {
    const response = await botService.getTwitchChatSettings();
    return response;
  }
);

export const updateTwitchChatSettings = createAsyncThunk(
  'bot/updateTwitchChatSettings',
  async (settings: ChatSettings) => {
    const response = await botService.updateTwitchChatSettings(settings);
    return response;
  }
);

export const getTwitchCommands = createAsyncThunk(
  'bot/getTwitchCommands',
  async () => {
    const response = await botService.getTwitchCommands();
    return response;
  }
);

export const getDiscordServerSettings = createAsyncThunk(
  'bot/getDiscordSettings',
  async () => {
    const response = await botService.getDiscordServerSettings();
    return response;
  }
);

export const updateDiscordServerSettings = createAsyncThunk(
  'bot/updateDiscordSettings',
  async (settings: ServerSettings) => {
    const response = await botService.updateDiscordServerSettings(settings);
    return response;
  }
);

export const getDiscordCommands = createAsyncThunk(
  'bot/getDiscordCommands',
  async () => {
    const response = await botService.getDiscordCommands();
    return response;
  }
);

export const getBotStatus = createAsyncThunk(
  'bot/getStatus',
  async (platform: 'twitch' | 'discord') => {
    const response = await botService.getBotStatus(platform);
    return { platform, status: response };
  }
);

export const startBot = createAsyncThunk(
  'bot/start',
  async (platform: 'twitch' | 'discord') => {
    await botService.startBot(platform);
    return platform;
  }
);

export const stopBot = createAsyncThunk(
  'bot/stop',
  async (platform: 'twitch' | 'discord') => {
    await botService.stopBot(platform);
    return platform;
  }
);

const botSlice = createSlice({
  name: 'bot',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Twitch Settings
    builder
      .addCase(getTwitchBotSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTwitchBotSettings.fulfilled, (state, action) => {
        state.twitch.settings = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(getTwitchBotSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch Twitch bot settings';
      });

    // Twitch Chat Settings
    builder
      .addCase(getTwitchChatSettings.fulfilled, (state, action) => {
        state.twitch.chatSettings = action.payload;
      })
      .addCase(updateTwitchChatSettings.fulfilled, (state, action) => {
        state.twitch.chatSettings = action.payload;
      });

    // Twitch Commands
    builder
      .addCase(getTwitchCommands.fulfilled, (state, action) => {
        state.twitch.commands = action.payload;
      });

    // Discord Settings
    builder
      .addCase(getDiscordServerSettings.fulfilled, (state, action) => {
        state.discord.settings = action.payload;
      })
      .addCase(updateDiscordServerSettings.fulfilled, (state, action) => {
        state.discord.settings = action.payload;
      });

    // Discord Commands
    builder
      .addCase(getDiscordCommands.fulfilled, (state, action) => {
        state.discord.commands = action.payload;
      });

    // Bot Status
    builder
      .addCase(getBotStatus.fulfilled, (state, action) => {
        if (action.payload.platform === 'twitch') {
          state.twitch.status = action.payload.status;
        } else {
          state.discord.status = action.payload.status;
        }
      })
      .addCase(startBot.fulfilled, (state, action) => {
        const platform = action.payload;
        if (platform === 'twitch' && state.twitch.status) {
          state.twitch.status.status = 'online';
        } else if (platform === 'discord' && state.discord.status) {
          state.discord.status.status = 'online';
        }
      })
      .addCase(stopBot.fulfilled, (state, action) => {
        const platform = action.payload;
        if (platform === 'twitch' && state.twitch.status) {
          state.twitch.status.status = 'offline';
        } else if (platform === 'discord' && state.discord.status) {
          state.discord.status.status = 'offline';
        }
      });
  },
});

export default botSlice.reducer; 