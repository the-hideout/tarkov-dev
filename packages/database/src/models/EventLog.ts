import mongoose, { Schema, Document } from 'mongoose';

interface IEventLog extends Document {
  userId: string;
  guildId: string;
  events: {
    type: string;
    timestamp: Date;
    data: Record<string, any>;
    metadata: {
      channelId?: string;
      messageId?: string;
      targetUserId?: string;
      moderatorId?: string;
    };
  }[];
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
  updatedAt: Date;
}

const EventLogSchema = new Schema<IEventLog>({
  userId: { type: String, required: true },
  guildId: { type: String, required: true },
  events: [{
    type: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    data: { type: Schema.Types.Mixed },
    metadata: {
      channelId: String,
      messageId: String,
      targetUserId: String,
      moderatorId: String,
    },
  }],
  settings: {
    enabled: { type: Boolean, default: false },
    logChannel: { type: String },
    webhookUrl: { type: String },
    eventTypes: {
      memberJoin: { type: Boolean, default: true },
      memberLeave: { type: Boolean, default: true },
      messageDelete: { type: Boolean, default: true },
      messageEdit: { type: Boolean, default: true },
      memberTimeout: { type: Boolean, default: true },
      memberBan: { type: Boolean, default: true },
      roleChanges: { type: Boolean, default: true },
      channelChanges: { type: Boolean, default: true },
    },
  },
  updatedAt: { type: Date, default: Date.now },
});

// Indexes for efficient querying
EventLogSchema.index({ userId: 1, guildId: 1 }, { unique: true });
EventLogSchema.index({ 'events.timestamp': 1 });
EventLogSchema.index({ 'events.type': 1 });

export const EventLog = mongoose.model<IEventLog>('EventLog', EventLogSchema); 