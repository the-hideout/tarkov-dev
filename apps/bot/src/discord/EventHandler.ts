import { 
  Client, 
  Message, 
  GuildMember,
  TextChannel 
} from 'discord.js';
import { EventLogService, ModerationService } from '@marksoftbot/core';

export class EventHandler {
  constructor(
    private client: Client,
    private moderationService: ModerationService,
    private eventLogService: EventLogService
  ) {}

  public async handleMessage(message: Message): Promise<void> {
    if (!message.guild) return;

    // Check message for moderation violations
    const result = await this.moderationService.checkMessage({
      userId: message.guild.ownerId,
      guildId: message.guild.id,
      content: message.content,
      authorId: message.author.id,
    });

    if (result.hasViolation) {
      await this.handleViolation(message, result);
    }

    // Log message events if enabled
    await this.eventLogService.logEvent({
      userId: message.guild.ownerId,
      guildId: message.guild.id,
      type: 'MESSAGE_CREATE',
      data: {
        content: message.content,
        channel: message.channel.id,
      },
      metadata: {
        channelId: message.channel.id,
        messageId: message.id,
        targetUserId: message.author.id,
      },
    });
  }

  private async handleViolation(message: Message, violation: { type: string; word?: string }) {
    try {
      // Delete the message
      await message.delete();

      // Notify the user
      const notificationContent = violation.type === 'BANNED_WORD'
        ? `Your message was removed for containing a banned word: ${violation.word}`
        : `Your message was removed for violating server rules: ${violation.type}`;

      await message.author.send(notificationContent);

      // Log the violation
      await this.eventLogService.logEvent({
        userId: message.guild!.ownerId,
        guildId: message.guild!.id,
        type: 'MODERATION_ACTION',
        data: {
          action: 'DELETE',
          reason: violation.type,
          content: message.content,
        },
        metadata: {
          channelId: message.channel.id,
          messageId: message.id,
          targetUserId: message.author.id,
        },
      });
    } catch (error) {
      console.error('Error handling message violation:', error);
    }
  }

  public async handleMemberJoin(member: GuildMember): Promise<void> {
    await this.eventLogService.logEvent({
      userId: member.guild.ownerId,
      guildId: member.guild.id,
      type: 'MEMBER_JOIN',
      data: {
        username: member.user.username,
        joinedAt: member.joinedAt,
      },
      metadata: {
        targetUserId: member.id,
      },
    });
  }

  public async handleMemberLeave(member: GuildMember): Promise<void> {
    await this.eventLogService.logEvent({
      userId: member.guild.ownerId,
      guildId: member.guild.id,
      type: 'MEMBER_LEAVE',
      data: {
        username: member.user.username,
        joinedAt: member.joinedAt,
        leftAt: new Date(),
      },
      metadata: {
        targetUserId: member.id,
      },
    });
  }
} 