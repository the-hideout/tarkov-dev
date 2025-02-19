import { Client, Message, GuildMember } from 'discord.js';
import { User } from '@marksoftbot/database';

export class ModHandler {
  private client: Client;

  constructor(client: Client) {
    this.client = client;
  }

  async handleMessage(message: Message) {
    if (!message.guild) return;

    const user = await User.findOne({
      'integrations.discord.guilds.id': message.guild.id
    });

    if (!user) return;

    const guildSettings = user.integrations.discord.guilds
      .find(g => g.id === message.guild?.id);

    if (!guildSettings?.settings.automod.enabled) return;

    // Check for banned words
    if (this.containsBannedWords(message.content, guildSettings.settings.automod.bannedWords)) {
      await this.handleViolation(message, 'banned_words');
      return;
    }

    // Check for excessive caps
    if (this.hasExcessiveCaps(message.content, guildSettings.settings.automod.capsLimit)) {
      await this.handleViolation(message, 'excessive_caps');
      return;
    }
  }

  private containsBannedWords(content: string, bannedWords: string[]): boolean {
    const lowerContent = content.toLowerCase();
    return bannedWords.some(word => lowerContent.includes(word.toLowerCase()));
  }

  private hasExcessiveCaps(content: string, limit: number): boolean {
    const capsCount = (content.match(/[A-Z]/g) || []).length;
    return (capsCount / content.length) * 100 > limit;
  }

  private async handleViolation(message: Message, type: string) {
    try {
      await message.delete();
      await message.channel.send(
        `${message.author}, your message was removed for violating our ${type} policy.`
      );
    } catch (error) {
      console.error('Error handling moderation violation:', error);
    }
  }
} 