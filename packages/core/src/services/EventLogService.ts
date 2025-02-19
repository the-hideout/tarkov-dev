import { EventLog } from '@marksoftbot/database';
import { Types } from 'mongoose';

export class EventLogService {
  // Log a new event
  async logEvent(data: {
    userId: string;
    guildId: string;
    type: string;
    data: Record<string, any>;
    metadata?: {
      channelId?: string;
      messageId?: string;
      targetUserId?: string;
      moderatorId?: string;
    };
  }) {
    await EventLog.findOneAndUpdate(
      {
        userId: data.userId,
        guildId: data.guildId,
      },
      {
        $push: {
          events: {
            type: data.type,
            timestamp: new Date(),
            data: data.data,
            metadata: data.metadata || {},
          },
        },
      },
      { upsert: true }
    );
  }

  // Get events with filtering
  async getEvents(data: {
    userId: string;
    guildId: string;
    type?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }) {
    const eventLog = await EventLog.findOne({
      userId: data.userId,
      guildId: data.guildId,
    });

    if (!eventLog) {
      return [];
    }

    let events = eventLog.events;

    if (data.type) {
      events = events.filter(event => event.type === data.type);
    }
    if (data.startDate) {
      events = events.filter(event => event.timestamp >= data.startDate);
    }
    if (data.endDate) {
      events = events.filter(event => event.timestamp <= data.endDate);
    }

    // Sort by timestamp descending
    events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    if (data.limit) {
      events = events.slice(0, data.limit);
    }

    return events;
  }

  // Update logging settings
  async updateSettings(data: {
    userId: string;
    guildId: string;
    settings: {
      enabled: boolean;
      logChannel: string;
      webhookUrl?: string;
      eventTypes: {
        memberJoin: boolean;
        memberLeave: boolean;
        messageDelete: boolean;
        messageEdit: boolean;
        memberTimeout: boolean;
        memberBan: boolean;
        roleChanges: boolean;
        channelChanges: boolean;
      };
    };
  }) {
    return EventLog.findOneAndUpdate(
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
} 