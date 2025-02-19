import { Client } from 'tmi.js';
import { User } from '@marksoftbot/database';

export class CommandManager {
  private client: Client;
  private cooldowns: Map<string, number>;

  constructor(client: Client) {
    this.client = client;
    this.cooldowns = new Map();
  }

  async handleMessage(channel: string, tags: any, message: string) {
    const channelName = channel.replace('#', '');
    
    // Find channel settings in database
    const user = await User.findOne({
      'integrations.twitch.channels.name': channelName
    });

    if (!user) return;

    const channelSettings = user.integrations.twitch.channels
      .find(c => c.name === channelName);

    if (!channelSettings) return;

    // Check if message is a command
    const command = channelSettings.settings.commands
      .find(cmd => message.toLowerCase().startsWith(`!${cmd.name.toLowerCase()}`));

    if (!command) return;

    // Check cooldown
    const cooldownKey = `${channel}-${command.name}`;
    const now = Date.now();
    const cooldownTime = this.cooldowns.get(cooldownKey);

    if (cooldownTime && now < cooldownTime) {
      return;
    }

    // Execute command
    try {
      await this.client.say(channel, command.response);
      this.cooldowns.set(cooldownKey, now + (command.cooldown * 1000));
    } catch (error) {
      console.error(`Error executing command ${command.name}:`, error);
    }
  }
} 