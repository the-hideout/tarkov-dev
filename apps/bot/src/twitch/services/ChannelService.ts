import { Redis } from 'ioredis';
import { config } from '../../config';

interface ChannelSettings {
  id: string;
  name: string;
  displayName: string;
  pointsName: string;
  pointsPerMessage: number;
  pointsPerMinute: number;
  subscriberMultiplier: number;
  enabled: boolean;
  autoJoin: boolean;
  createdAt: number;
  updatedAt: number;
}

export class ChannelService {
  private redis: Redis;

  constructor() {
    this.redis = new Redis(config.redis.url);
  }

  public async addChannel(settings: Partial<ChannelSettings> & { name: string }): Promise<ChannelSettings> {
    const channel: ChannelSettings = {
      id: settings.name.toLowerCase(),
      name: settings.name.toLowerCase(),
      displayName: settings.displayName || settings.name,
      pointsName: settings.pointsName || 'points',
      pointsPerMessage: settings.pointsPerMessage || 1,
      pointsPerMinute: settings.pointsPerMinute || 1,
      subscriberMultiplier: settings.subscriberMultiplier || 1.5,
      enabled: settings.enabled ?? true,
      autoJoin: settings.autoJoin ?? true,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    await this.redis.hset(`channel:${channel.name}`, channel);
    await this.redis.sadd('active_channels', channel.name);

    return channel;
  }

  public async removeChannel(channelName: string): Promise<void> {
    await this.redis.del(`channel:${channelName}`);
    await this.redis.srem('active_channels', channelName);
  }

  public async getChannel(channelName: string): Promise<ChannelSettings | null> {
    const data = await this.redis.hgetall(`channel:${channelName}`);
    return Object.keys(data).length ? data as unknown as ChannelSettings : null;
  }

  public async updateChannel(channelName: string, settings: Partial<ChannelSettings>): Promise<ChannelSettings | null> {
    const channel = await this.getChannel(channelName);
    if (!channel) return null;

    const updatedChannel = {
      ...channel,
      ...settings,
      updatedAt: Date.now()
    };

    await this.redis.hset(`channel:${channelName}`, updatedChannel);
    return updatedChannel;
  }

  public async listChannels(): Promise<string[]> {
    return this.redis.smembers('active_channels');
  }

  public async getActiveChannels(): Promise<ChannelSettings[]> {
    const channels = await this.listChannels();
    const activeChannels = await Promise.all(
      channels.map(async (name) => {
        const channel = await this.getChannel(name);
        return channel;
      })
    );

    return activeChannels.filter((c): c is ChannelSettings => 
      c !== null && c.enabled && c.autoJoin
    );
  }

  public async toggleChannel(channelName: string, enabled?: boolean): Promise<boolean> {
    const channel = await this.getChannel(channelName);
    if (!channel) return false;

    const newState = enabled ?? !channel.enabled;
    await this.updateChannel(channelName, { enabled: newState });
    return newState;
  }

  public async getChannelPoints(channelName: string, username: string): Promise<number> {
    const points = await this.redis.hget(`points:${channelName}`, username);
    return points ? parseInt(points) : 0;
  }

  public async setChannelPoints(channelName: string, username: string, points: number): Promise<void> {
    await this.redis.hset(`points:${channelName}`, username, points.toString());
  }

  public async getTopPoints(channelName: string, limit: number = 10): Promise<Array<{ username: string; points: number }>> {
    const allPoints = await this.redis.hgetall(`points:${channelName}`);
    
    return Object.entries(allPoints)
      .map(([username, points]) => ({
        username,
        points: parseInt(points)
      }))
      .sort((a, b) => b.points - a.points)
      .slice(0, limit);
  }
} 