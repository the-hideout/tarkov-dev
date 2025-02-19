import mongoose, { Schema, Document } from 'mongoose';

interface ILoyalty extends Document {
  userId: string;
  channelId: string;
  settings: {
    enabled: boolean;
    pointsName: string;
    pointsPerMessage: number;
    pointsPerMinute: number;
    subscriberMultiplier: number;
  };
  rewards: {
    id: string;
    name: string;
    description: string;
    cost: number;
    enabled: boolean;
    cooldown: number;
    limit: number;
    createdAt: Date;
  }[];
  userPoints: {
    userId: string;
    username: string;
    points: number;
    lastUpdated: Date;
    redemptions: {
      rewardId: string;
      timestamp: Date;
    }[];
  }[];
  updatedAt: Date;
}

const LoyaltySchema = new Schema<ILoyalty>({
  userId: { type: String, required: true },
  channelId: { type: String, required: true },
  settings: {
    enabled: { type: Boolean, default: false },
    pointsName: { type: String, default: 'Points' },
    pointsPerMessage: { type: Number, default: 1 },
    pointsPerMinute: { type: Number, default: 1 },
    subscriberMultiplier: { type: Number, default: 2 },
  },
  rewards: [{
    id: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String },
    cost: { type: Number, required: true },
    enabled: { type: Boolean, default: true },
    cooldown: { type: Number, default: 0 }, // in seconds
    limit: { type: Number, default: 0 }, // 0 means unlimited
    createdAt: { type: Date, default: Date.now },
  }],
  userPoints: [{
    userId: { type: String, required: true },
    username: { type: String, required: true },
    points: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now },
    redemptions: [{
      rewardId: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
    }],
  }],
  updatedAt: { type: Date, default: Date.now },
});

// Indexes for efficient querying
LoyaltySchema.index({ userId: 1, channelId: 1 }, { unique: true });
LoyaltySchema.index({ 'userPoints.userId': 1 });
LoyaltySchema.index({ 'rewards.id': 1 });

export const Loyalty = mongoose.model<ILoyalty>('Loyalty', LoyaltySchema); 