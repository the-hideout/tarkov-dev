import { Timer } from '@marksoftbot/database';
import { Types } from 'mongoose';

export class TimerService {
  // Create a new timer
  async createTimer(data: {
    userId: string;
    channelId: string;
    name: string;
    message: string;
    interval: number;
    enabled?: boolean;
  }) {
    return Timer.create({
      userId: data.userId,
      channelId: data.channelId,
      name: data.name,
      message: data.message,
      interval: data.interval,
      enabled: data.enabled ?? true,
      lastRun: new Date(),
    });
  }

  // Update timer
  async updateTimer(data: {
    userId: string;
    channelId: string;
    timerId: string;
    updates: {
      name?: string;
      message?: string;
      interval?: number;
      enabled?: boolean;
    };
  }) {
    return Timer.findOneAndUpdate(
      {
        _id: new Types.ObjectId(data.timerId),
        userId: data.userId,
        channelId: data.channelId,
      },
      {
        $set: {
          ...data.updates,
          lastModified: new Date(),
        },
      },
      { new: true }
    );
  }

  // Delete timer
  async deleteTimer(data: {
    userId: string;
    channelId: string;
    timerId: string;
  }) {
    return Timer.findOneAndDelete({
      _id: new Types.ObjectId(data.timerId),
      userId: data.userId,
      channelId: data.channelId,
    });
  }

  // Get all timers for a channel
  async getTimers(data: {
    userId: string;
    channelId: string;
    enabled?: boolean;
  }) {
    return Timer.find({
      userId: data.userId,
      channelId: data.channelId,
      ...(typeof data.enabled === 'boolean' && { enabled: data.enabled }),
    }).sort({ lastRun: 1 });
  }

  // Get next timer to run
  async getNextTimer(data: {
    userId: string;
    channelId: string;
  }) {
    const now = new Date();
    return Timer.findOne({
      userId: data.userId,
      channelId: data.channelId,
      enabled: true,
      lastRun: {
        $lte: new Date(now.getTime() - data.interval * 1000),
      },
    }).sort({ lastRun: 1 });
  }

  // Mark timer as run
  async markTimerRun(data: {
    userId: string;
    channelId: string;
    timerId: string;
  }) {
    return Timer.findOneAndUpdate(
      {
        _id: new Types.ObjectId(data.timerId),
        userId: data.userId,
        channelId: data.channelId,
      },
      {
        $set: { lastRun: new Date() },
      },
      { new: true }
    );
  }
} 