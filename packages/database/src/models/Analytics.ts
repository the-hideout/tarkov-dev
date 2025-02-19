import mongoose, { Schema, Document } from 'mongoose';

interface IAnalytics extends Document {
  userId: string;
  platform: 'twitch' | 'discord';
  channelId: string;
  metrics: {
    chatActivity: {
      date: Date;
      messages: number;
      users: number;
    }[];
    commandUsage: {
      command: string;
      uses: number;
      lastUsed: Date;
    }[];
    userGrowth: {
      date: Date;
      followers: number;
      subscribers: number;
    }[];
    userStats: {
      userId: string;
      username: string;
      messages: number;
      commands: number;
      lastActive: Date;
    }[];
  };
  updatedAt: Date;
}

const AnalyticsSchema = new Schema<IAnalytics>({
  userId: { type: String, required: true },
  platform: { type: String, required: true, enum: ['twitch', 'discord'] },
  channelId: { type: String, required: true },
  metrics: {
    chatActivity: [{
      date: { type: Date, required: true },
      messages: { type: Number, default: 0 },
      users: { type: Number, default: 0 },
    }],
    commandUsage: [{
      command: { type: String, required: true },
      uses: { type: Number, default: 0 },
      lastUsed: { type: Date, required: true },
    }],
    userGrowth: [{
      date: { type: Date, required: true },
      followers: { type: Number, default: 0 },
      subscribers: { type: Number, default: 0 },
    }],
    userStats: [{
      userId: { type: String, required: true },
      username: { type: String, required: true },
      messages: { type: Number, default: 0 },
      commands: { type: Number, default: 0 },
      lastActive: { type: Date, required: true },
    }],
  },
  updatedAt: { type: Date, default: Date.now },
});

// Indexes for efficient querying
AnalyticsSchema.index({ userId: 1, platform: 1, channelId: 1 });
AnalyticsSchema.index({ 'metrics.userStats.userId': 1 });
AnalyticsSchema.index({ updatedAt: 1 });

export const Analytics = mongoose.model<IAnalytics>('Analytics', AnalyticsSchema); 