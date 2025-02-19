import { ChatUserstate, Client } from 'tmi.js';
import { Redis } from 'ioredis';
import { LoyaltyService, TimerService } from '@marksoftbot/core';
import { Command } from '../Command';
import { config } from '../../config';
import { YouTube } from 'youtube-sr';

const redis = new Redis(config.redis.url);

interface SongRequest {
  videoId: string;
  title: string;
  duration: number;
  requestedBy: string;
  requestedAt: number;
}

export default class SongCommand extends Command {
  public name = 'song';
  public aliases = ['sr', 'songs'];
  public userLevel = 'everyone' as const;
  public cooldown = 5;

  constructor(
    client: Client,
    loyaltyService: LoyaltyService,
    timerService: TimerService
  ) {
    super(client, loyaltyService, timerService);
  }

  public async execute(channel: string, userstate: ChatUserstate, args: string[]): Promise<void> {
    const channelName = channel.replace('#', '');
    const subcommand = args[0]?.toLowerCase();

    try {
      switch (subcommand) {
        case 'request':
        case 'add':
          if (args.length < 2) {
            await this.client.say(channel, 'Usage: !song request <song name or YouTube URL>');
            return;
          }

          const query = args.slice(1).join(' ');
          const video = await YouTube.searchOne(query);
          
          if (!video || !video.id || !video.title) {
            await this.client.say(channel, `@${userstate.username} No valid song found.`);
            return;
          }

          // Check if song is too long (>10 minutes)
          if (video.duration > 600000) {
            await this.client.say(channel, `@${userstate.username} Song is too long (max 10 minutes).`);
            return;
          }

          const request: SongRequest = {
            videoId: video.id,
            title: video.title,
            duration: video.duration || 0,
            requestedBy: userstate.username!,
            requestedAt: Date.now()
          };

          await redis.rpush(`songqueue:${channelName}`, JSON.stringify(request));
          await this.client.say(channel, 
            `@${userstate.username} Added "${video.title}" to the queue! Duration: ${this.formatDuration(video.duration)}`
          );
          break;

        case 'current':
        case 'np':
          const current = await redis.get(`currentsong:${channelName}`);
          if (!current) {
            await this.client.say(channel, 'No song is currently playing.');
            return;
          }

          const currentSong: SongRequest = JSON.parse(current);
          await this.client.say(channel, 
            `Current song: "${currentSong.title}" (requested by ${currentSong.requestedBy})`
          );
          break;

        case 'queue':
        case 'list':
          const queueLength = await redis.llen(`songqueue:${channelName}`);
          if (queueLength === 0) {
            await this.client.say(channel, 'The song queue is empty.');
            return;
          }

          const queue = await redis.lrange(`songqueue:${channelName}`, 0, 4);
          const queueList = queue
            .map((item, index) => {
              const song: SongRequest = JSON.parse(item);
              return `${index + 1}) ${song.title} (${this.formatDuration(song.duration)})`;
            })
            .join(' | ');

          await this.client.say(channel, 
            `Next ${queue.length} songs: ${queueList}${queueLength > 5 ? ` | +${queueLength - 5} more` : ''}`
          );
          break;

        case 'skip':
          if (userstate.mod || userstate.badges?.broadcaster) {
            await redis.del(`currentsong:${channelName}`);
            await this.client.say(channel, 'Current song has been skipped.');
          }
          break;

        case 'clear':
          if (userstate.mod || userstate.badges?.broadcaster) {
            await redis.del(`songqueue:${channelName}`);
            await this.client.say(channel, 'Song queue has been cleared.');
          }
          break;

        default:
          await this.client.say(channel, 
            'Song commands: !song request <song>, !song current, !song queue, !song skip (mod), !song clear (mod)'
          );
      }
    } catch (error) {
      console.error('Error handling song command:', error);
      throw error;
    }
  }

  private formatDuration(ms: number): string {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
} 