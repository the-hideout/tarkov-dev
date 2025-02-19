import { Loyalty } from '@marksoftbot/database';
import { Types } from 'mongoose';

export class LoyaltyService {
  // Add points to user
  async addPoints(data: {
    userId: string;
    channelId: string;
    targetUserId: string;
    targetUsername: string;
    points: number;
  }) {
    await Loyalty.findOneAndUpdate(
      {
        userId: data.userId,
        channelId: data.channelId,
        'userPoints.userId': data.targetUserId,
      },
      {
        $inc: {
          'userPoints.$.points': data.points,
        },
        $set: {
          'userPoints.$.lastUpdated': new Date(),
        },
      },
      {
        upsert: true,
        new: true,
      }
    );
  }

  // Redeem reward
  async redeemReward(data: {
    userId: string;
    channelId: string;
    rewardId: string;
    redeemerUserId: string;
    redeemerUsername: string;
  }) {
    const loyalty = await Loyalty.findOne({
      userId: data.userId,
      channelId: data.channelId,
    });

    if (!loyalty) {
      throw new Error('Loyalty system not found');
    }

    const reward = loyalty.rewards.find(r => r.id === data.rewardId);
    if (!reward) {
      throw new Error('Reward not found');
    }

    const userPoints = loyalty.userPoints.find(u => u.userId === data.redeemerUserId);
    if (!userPoints || userPoints.points < reward.cost) {
      throw new Error('Insufficient points');
    }

    // Check cooldown
    if (reward.cooldown > 0) {
      const lastRedemption = userPoints.redemptions
        .filter(r => r.rewardId === data.rewardId)
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];

      if (lastRedemption) {
        const cooldownEnds = new Date(lastRedemption.timestamp.getTime() + (reward.cooldown * 1000));
        if (cooldownEnds > new Date()) {
          throw new Error('Reward on cooldown');
        }
      }
    }

    // Update points and add redemption record
    await Loyalty.findOneAndUpdate(
      {
        userId: data.userId,
        channelId: data.channelId,
        'userPoints.userId': data.redeemerUserId,
      },
      {
        $inc: {
          'userPoints.$.points': -reward.cost,
        },
        $push: {
          'userPoints.$.redemptions': {
            rewardId: data.rewardId,
            timestamp: new Date(),
          },
        },
      }
    );

    return reward;
  }

  // Get user points
  async getUserPoints(data: {
    userId: string;
    channelId: string;
    targetUserId: string;
  }) {
    const loyalty = await Loyalty.findOne({
      userId: data.userId,
      channelId: data.channelId,
    });

    if (!loyalty) {
      return 0;
    }

    const userPoints = loyalty.userPoints.find(u => u.userId === data.targetUserId);
    return userPoints?.points || 0;
  }
} 