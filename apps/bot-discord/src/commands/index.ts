import { Client, Message } from 'discord.js';
import { User } from '@marksoftbot/database';

export class CommandHandler {
  private client: Client;
  private cooldowns: Map<string, number>;

  constructor(client: Client) {
    this.client = client;
    this.cooldowns = new Map();
  }

  async handleMessage(message: Message) {
    // Find guild settings in database
    const user = await User.findOne({
      'integrations.discord.guilds.id': message.guild?.id
    });

    if (!user) return;

    const guildSettings = user.integrations.discord.guilds
      .find(g => g.id === message.guild?.id);

    if (!guildSettings) return;

    const prefix = guildSettings.settings.prefix;

    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift()?.toLowerCase();

    if (!commandName) return;

    const command = guildSettings.settings.commands?.find(cmd => cmd.name === commandName);

    if (!command) return;

    // Check cooldown
    const cooldownKey = `${message.guild?.id}-${command.name}`;
    const now = Date.now();
    const cooldownTime = this.cooldowns.get(cooldownKey);

    if (cooldownTime && now < cooldownTime) {
      return;
    }

    try {
      await message.channel.send(command.response);
      this.cooldowns.set(cooldownKey, now + (command.cooldown * 1000));
    } catch (error) {
      console.error(`Error executing command ${command.name}:`, error);
    }
  }
} 