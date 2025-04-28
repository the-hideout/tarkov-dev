import api from './api';

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

const botService = {
  // Twitch Bot
  async getTwitchBotSettings(): Promise<BotSettings> {
    const response = await api.get<BotSettings>('/bots/twitch/settings');
    return response.data;
  },

  async updateTwitchBotSettings(settings: BotSettings): Promise<BotSettings> {
    const response = await api.put<BotSettings>('/bots/twitch/settings', settings);
    return response.data;
  },

  async getTwitchChatSettings(): Promise<ChatSettings> {
    const response = await api.get<ChatSettings>('/bots/twitch/chat-settings');
    return response.data;
  },

  async updateTwitchChatSettings(settings: ChatSettings): Promise<ChatSettings> {
    const response = await api.put<ChatSettings>('/bots/twitch/chat-settings', settings);
    return response.data;
  },

  async getTwitchCommands(): Promise<Command[]> {
    const response = await api.get<Command[]>('/bots/twitch/commands');
    return response.data;
  },

  async createTwitchCommand(command: Omit<Command, 'id'>): Promise<Command> {
    const response = await api.post<Command>('/bots/twitch/commands', command);
    return response.data;
  },

  async updateTwitchCommand(name: string, command: Partial<Command>): Promise<Command> {
    const response = await api.put<Command>(`/bots/twitch/commands/${name}`, command);
    return response.data;
  },

  async deleteTwitchCommand(name: string): Promise<void> {
    await api.delete(`/bots/twitch/commands/${name}`);
  },

  // Discord Bot
  async getDiscordServerSettings(): Promise<ServerSettings> {
    const response = await api.get<ServerSettings>('/bots/discord/settings');
    return response.data;
  },

  async updateDiscordServerSettings(settings: ServerSettings): Promise<ServerSettings> {
    const response = await api.put<ServerSettings>('/bots/discord/settings', settings);
    return response.data;
  },

  async getDiscordCommands(): Promise<Command[]> {
    const response = await api.get<Command[]>('/bots/discord/commands');
    return response.data;
  },

  async createDiscordCommand(command: Omit<Command, 'id'>): Promise<Command> {
    const response = await api.post<Command>('/bots/discord/commands', command);
    return response.data;
  },

  async updateDiscordCommand(name: string, command: Partial<Command>): Promise<Command> {
    const response = await api.put<Command>(`/bots/discord/commands/${name}`, command);
    return response.data;
  },

  async deleteDiscordCommand(name: string): Promise<void> {
    await api.delete(`/bots/discord/commands/${name}`);
  },

  // Bot Status
  async startBot(platform: 'twitch' | 'discord'): Promise<void> {
    await api.post(`/bots/${platform}/start`);
  },

  async stopBot(platform: 'twitch' | 'discord'): Promise<void> {
    await api.post(`/bots/${platform}/stop`);
  },

  async getBotStatus(platform: 'twitch' | 'discord'): Promise<{
    status: 'online' | 'offline';
    uptime: string;
    commands: number;
    messages: number;
  }> {
    const response = await api.get(`/bots/${platform}/status`);
    return response.data;
  },
};

export default botService; 