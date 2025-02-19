import { Analytics } from '@marksoftbot/database';
import { Types } from 'mongoose';

export class AnalyticsService {
  // Track chat message
  async trackMessage(data: {
    userId: string;
    platform: 'twitch' | 'discord';
    channelId: string;
    messageAuthorId: string;
    messageAuthorName: string;
  }) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await Analytics.findOneAndUpdate(
      {
        userId: data.userId,
        platform: data.platform,
        channelId: data.channelId,
        'metrics.chatActivity.date': today,
      },
      {
        $inc: {
          'metrics.chatActivity.$.messages': 1,
          'metrics.userStats.$[user].messages': 1,
        },
        $set: {
          'metrics.userStats.$[user].lastActive': new Date(),
        },
      },
      {
        arrayFilters: [
          { 'user.userId': data.messageAuthorId },
        ],
        upsert: true,
        new: true,
      }
    );
  }

  // Track command usage
  async trackCommand(data: {
    userId: string;
    platform: 'twitch' | 'discord';
    channelId: string;
    command: string;
    executorId: string;
    executorName: string;
  }) {
    await Analytics.findOneAndUpdate(
      {
        userId: data.userId,
        platform: data.platform,
        channelId: data.channelId,
        'metrics.commandUsage.command': data.command,
      },
      {
        $inc: {
          'metrics.commandUsage.$.uses': 1,
          'metrics.userStats.$[user].commands': 1,
        },
        $set: {
          'metrics.commandUsage.$.lastUsed': new Date(),
          'metrics.userStats.$[user].lastActive': new Date(),
        },
      },
      {
        arrayFilters: [
          { 'user.userId': data.executorId },
        ],
        upsert: true,
      }
    );
  }

  // Update user growth metrics
  async updateGrowth(data: {
    userId: string;
    platform: 'twitch';
    channelId: string;
    followers: number;
    subscribers: number;
  }) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await Analytics.findOneAndUpdate(
      {
        userId: data.userId,
        platform: data.platform,
        channelId: data.channelId,
      },
      {
        $push: {
          'metrics.userGrowth': {
            date: today,
            followers: data.followers,
            subscribers: data.subscribers,
          },
        },
      },
      { upsert: true }
    );
  }

  // Get analytics data for dashboard
  async getAnalytics(data: {
    userId: string;
    platform?: 'twitch' | 'discord';
    startDate: Date;
    endDate: Date;
  }) {
    const query = {
      userId: data.userId,
      ...(data.platform && { platform: data.platform }),
      'metrics.chatActivity.date': {
        $gte: data.startDate,
        $lte: data.endDate,
      },
    };

    return Analytics.find(query);
  }
} 