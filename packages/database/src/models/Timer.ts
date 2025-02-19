import mongoose, { Schema, Document } from 'mongoose';

interface ITimer extends Document {
  userId: string;
  channelId: string;
  name: string;
  message: string;
  interval: number;
  enabled: boolean;
  lastRun: Date;
  lastModified: Date;
}

const TimerSchema = new Schema<ITimer>({
  userId: { type: String, required: true },
  channelId: { type: String, required: true },
  name: { type: String, required: true },
  message: { type: String, required: true },
  interval: { type: Number, required: true },
  enabled: { type: Boolean, default: true },
  lastRun: { type: Date, default: Date.now },
  lastModified: { type: Date, default: Date.now },
});

// Indexes for efficient querying
TimerSchema.index({ userId: 1, channelId: 1 });
TimerSchema.index({ enabled: 1, lastRun: 1 });

export const Timer = mongoose.model<ITimer>('Timer', TimerSchema); 