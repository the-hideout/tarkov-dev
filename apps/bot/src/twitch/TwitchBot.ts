import { Client } from 'tmi.js';
import { TimerService, LoyaltyService } from '@marksoftbot/core';
import { CommandHandler } from './CommandHandler';
import { EventHandler } from './EventHandler';
import { config } from '../config';
import { SongService } from './services/SongService';

export class TwitchBot {
  private client: Client;
  private commandHandler: CommandHandler;
  private eventHandler: EventHandler;
  private timerService: TimerService;
  private loyaltyService: LoyaltyService;
  private songService: SongService;

  constructor() {
    this.client = new Client({
      options: { debug: true },
      connection: {
        secure: true,
        reconnect: true,
      },
      identity: {
        username: config.twitch.username,
        password: config.twitch.oauth,
      },
      channels: [], // Channels will be loaded from database
    });

    this.timerService = new TimerService();
    this.loyaltyService = new LoyaltyService();
    this.commandHandler = new CommandHandler(this.client, this.loyaltyService, this.timerService);
    this.eventHandler = new EventHandler(this.client, this.loyaltyService);

    this.songService = new SongService();
    this.setupSongService();

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.client.on('message', this.handleMessage.bind(this));
    this.client.on('connected', this.handleConnect.bind(this));
    this.client.on('join', this.handleJoin.bind(this));
    this.client.on('part', this.handlePart.bind(this));
  }

  private async handleMessage(channel: string, userstate: any, message: string, self: boolean): Promise<void> {
    if (self || !message.startsWith('!')) return;

    try {
      await this.commandHandler.handleCommand(channel, userstate, message);
    } catch (error) {
      console.error('Error handling message:', error);
    }
  }

  private handleConnect(): void {
    console.log('Connected to Twitch');
  }

  private handleJoin(channel: string, username: string): void {
    if (username === config.twitch.username) {
      console.log(`Joined channel: ${channel}`);
    }
  }

  private handlePart(channel: string, username: string): void {
    if (username === config.twitch.username) {
      console.log(`Left channel: ${channel}`);
    }
  }

  private setupSongService(): void {
    this.songService.on('songStart', (channel: string, song: any) => {
      this.client.say(channel, 
        `Now playing: "${song.title}" (requested by ${song.requestedBy})`
      );
    });

    this.songService.on('songEnd', async (channel: string) => {
      const nextSong = await this.redis.lindex(`songqueue:${channel}`, 0);
      if (nextSong) {
        const song = JSON.parse(nextSong);
        this.client.say(channel, 
          `Up next: "${song.title}" (requested by ${song.requestedBy})`
        );
      }
    });
  }

  public async start(): Promise<void> {
    try {
      // Load channels from database or config
      const channels = ['channel1', 'channel2']; // Replace with actual channel loading
      this.client.getOptions().channels = channels;

      await this.client.connect();
      await this.songService.start();
      console.log('Bot started successfully');
    } catch (error) {
      console.error('Failed to start bot:', error);
      throw error;
    }
  }

  public async stop(): Promise<void> {
    await this.songService.stop();
    await this.client.disconnect();
    console.log('Bot stopped successfully');
  }
} 