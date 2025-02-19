import mongoose, { Schema, Document } from 'mongoose';

interface IModerationSettings extends Document {
  userId: string;
  guildId: string;
  settings: {
    enabled: boolean;
    bannedWords: string[];
    capsLimit: number;
    spamThreshold: number;
    muteRole: string;
    logChannel: string;
    punishments: {
      warnings: {
        enabled: boolean;
        timeout: number; // Duration in minutes
      };
      mutes: {
        enabled: boolean;
        duration: number; // Duration in minutes
      };
      kicks: {
        enabled: boolean;
        afterWarnings: number;
      };
      bans: {
        enabled: boolean;
        afterWarnings: number;
      };
    };
  };
  updatedAt: Date;
}

const ModerationSettingsSchema = new Schema<IModerationSettings>({
  userId: { type: String, required: true },
  guildId: { type: String, required: true },
  settings: {
    enabled: { type: Boolean, default: false },
    bannedWords: [{ type: String }],
    capsLimit: { type: Number, default: 70 }, // Percentage
    spamThreshold: { type: Number, default: 5 }, // Messages per minute
    muteRole: { type: String },
    logChannel: { type: String },
    punishments: {
      warnings: {
        enabled: { type: Boolean, default: true },
        timeout: { type: Number, default: 0 }, // 0 means no timeout
      },
      mutes: {
        enabled: { type: Boolean, default: true },
        duration: { type: Number, default: 10 }, // 10 minutes default
      },
      kicks: {
        enabled: { type: Boolean, default: false },
        afterWarnings: { type: Number, default: 3 },
      },
      bans: {
        enabled: { type: Boolean, default: false },
        afterWarnings: { type: Number, default: 5 },
      },
    },
  },
  updatedAt: { type: Date, default: Date.now },
});

// Indexes for efficient querying
ModerationSettingsSchema.index({ userId: 1, guildId: 1 }, { unique: true });

export const ModerationSettings = mongoose.model<IModerationSettings>('ModerationSettings', ModerationSettingsSchema); 