import { Redis } from 'ioredis';
import { config } from '../../config';
import { EventEmitter } from 'events';

interface SongRequest {
  videoId: string;
  title: string;
  duration: number;
  requestedBy: string;
  requestedAt: number;
}

export class SongService extends EventEmitter {
  private redis: Redis;
  private isRunning: boolean = false;
  private currentInterval: NodeJS.Timeout | null = null;

  constructor() {
    super();
    this.redis = new Redis(config.redis.url);
  }

  public async start(): Promise<void> {
    this.isRunning = true;
    await this.checkQueue();
  }

  public async stop(): Promise<void> {
    this.isRunning = false;
    if (this.currentInterval) {
      clearTimeout(this.currentInterval);
    }
  }

  private async checkQueue(): Promise<void> {
    if (!this.isRunning) return;

    try {
      // Check all channels
      const channels = await this.redis.smembers('active_channels');
      
      for (const channel of channels) {
        const currentSong = await this.redis.get(`currentsong:${channel}`);
        
        if (!currentSong) {
          // No song playing, check queue
          const nextSong = await this.redis.lpop(`songqueue:${channel}`);
          
          if (nextSong) {
            const song: SongRequest = JSON.parse(nextSong);
            await this.redis.set(`currentsong:${channel}`, nextSong);
            
            // Emit song start event
            this.emit('songStart', `#${channel}`, song);
            
            // Set timeout for song end
            this.currentInterval = setTimeout(async () => {
              await this.redis.del(`currentsong:${channel}`);
              this.emit('songEnd', `#${channel}`);
              await this.checkQueue();
            }, song.duration);
          }
        }
      }
    } catch (error) {
      console.error('Error checking song queue:', error);
    }

    // Check again in 1 second
    setTimeout(() => this.checkQueue(), 1000);
  }
} 