import { ModerationSettings } from '@marksoftbot/database';
import { Types } from 'mongoose';

export class ModerationService {
  // Update moderation settings
  async updateSettings(data: {
    userId: string;
    guildId: string;
    settings: {
      enabled: boolean;
      bannedWords: string[];
      capsLimit: number;
      spamThreshold: number;
      muteRole: string;
      logChannel: string;
    };
  }) {
    return ModerationSettings.findOneAndUpdate(
      {
        userId: data.userId,
        guildId: data.guildId,
      },
      {
        $set: { settings: data.settings },
      },
      { upsert: true, new: true }
    );
  }

  // Check message for violations
  async checkMessage(data: {
    userId: string;
    guildId: string;
    content: string;
    authorId: string;
  }): Promise<{
    hasViolation: boolean;
    type?: 'CAPS' | 'SPAM' | 'BANNED_WORD';
    word?: string;
  }> {
    const settings = await ModerationSettings.findOne({
      userId: data.userId,
      guildId: data.guildId,
    });

    if (!settings?.settings.enabled) {
      return { hasViolation: false };
    }

    // Check for banned words
    const bannedWord = settings.settings.bannedWords.find(word => 
      data.content.toLowerCase().includes(word.toLowerCase())
    );
    if (bannedWord) {
      return { hasViolation: true, type: 'BANNED_WORD', word: bannedWord };
    }

    // Check for excessive caps
    if (settings.settings.capsLimit > 0) {
      const capsCount = (data.content.match(/[A-Z]/g) || []).length;
      const capsPercentage = (capsCount / data.content.length) * 100;
      if (capsPercentage > settings.settings.capsLimit) {
        return { hasViolation: true, type: 'CAPS' };
      }
    }

    // Check for spam (implement rate limiting logic)
    // This would typically involve checking message frequency in Redis
    // For now, we'll return a placeholder
    return { hasViolation: false };
  }

  // Get moderation settings
  async getSettings(data: {
    userId: string;
    guildId: string;
  }) {
    const settings = await ModerationSettings.findOne({
      userId: data.userId,
      guildId: data.guildId,
    });

    return settings?.settings || {
      enabled: false,
      bannedWords: [],
      capsLimit: 70,
      spamThreshold: 5,
      muteRole: '',
      logChannel: '',
    };
  }
} 