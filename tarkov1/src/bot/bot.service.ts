import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import tmi from 'tmi.js';
import { ModerationService } from './moderation/moderation.service';
import { CommandsService } from './commands/commands.service';
import { EftService } from './eft/eft.service';
import { GamesService } from './games/games.service';
import { MusicService } from './music/music.service';
import { AnalyticsService } from './analytics/analytics.service';

@Injectable()
export class BotService implements OnModuleInit, OnModuleDestroy {
  private client: tmi.Client;
  private channels: string[] = [];

  constructor(
    private readonly configService: ConfigService,
    private readonly moderationService: ModerationService,
    private readonly commandsService: CommandsService,
    private readonly eftService: EftService,
    private readonly gamesService: GamesService,
    private readonly musicService: MusicService,
    private readonly analyticsService: AnalyticsService,
  ) {}

  async onModuleInit() {
    this.client = new tmi.Client({
      options: { debug: true },
      identity: {
        username: this.configService.get('TWITCH_BOT_USERNAME'),
        password: this.configService.get('TWITCH_OAUTH_TOKEN'),
      },
      channels: this.channels,
    });

    this.setupEventHandlers();
    await this.client.connect();
  }

  async onModuleDestroy() {
    await this.client.disconnect();
  }

  private setupEventHandlers() {
    // Message handler
    this.client.on('message', async (channel, tags, message, self) => {
      if (self) return;

      const username = tags['display-name'] || tags.username;
      const userId = tags['user-id'];
      const isMod = tags.mod;
      const isSubscriber = tags.subscriber;

      // Track message for analytics
      await this.analyticsService.trackMessage(channel, username, message);

      // Check moderation
      const moderationResult = await this.moderationService.checkMessage(
        message,
        username,
        isMod,
      );

      if (moderationResult.shouldDelete) {
        this.client.deletemessage(channel, tags.id);
        if (moderationResult.response) {
          this.client.say(channel, moderationResult.response);
        }
        return;
      }

      // Check for commands
      if (message.startsWith('!')) {
        const command = message.split(' ')[0].slice(1);
        const args = message.split(' ').slice(1);
        
        // Handle EFT commands
        if (command.startsWith('price') || command.startsWith('traderprice')) {
          const itemName = args.join(' ');
          const result = await this.eftService.handlePriceCommand(command, itemName);
          this.client.say(channel, result);
          return;
        }

        // Handle other commands
        const commandResult = await this.commandsService.handleCommand(
          command,
          args,
          { username, userId, isMod, isSubscriber },
        );
        if (commandResult) {
          this.client.say(channel, commandResult);
        }
      }

      // Check for game triggers
      await this.gamesService.checkGameTriggers(channel, username, message);

      // Check for song requests
      if (message.startsWith('!sr')) {
        const songRequest = message.slice(4).trim();
        const result = await this.musicService.handleSongRequest(
          channel,
          username,
          songRequest,
        );
        if (result) {
          this.client.say(channel, result);
        }
      }
    });

    // Subscriber handler
    this.client.on('subscription', (channel, username, method, message, userstate) => {
      this.analyticsService.trackSubscription(channel, username);
      // Handle subscription alerts and rewards
    });

    // Bits handler
    this.client.on('cheer', (channel, userstate, message) => {
      const username = userstate['display-name'];
      const bits = userstate.bits;
      this.analyticsService.trackBits(channel, username, bits);
      // Handle bits alerts and rewards
    });
  }

  async joinChannel(channel: string) {
    if (!this.channels.includes(channel)) {
      this.channels.push(channel);
      await this.client.join(channel);
    }
  }

  async leaveChannel(channel: string) {
    const index = this.channels.indexOf(channel);
    if (index > -1) {
      this.channels.splice(index, 1);
      await this.client.part(channel);
    }
  }

  async sendMessage(channel: string, message: string) {
    await this.client.say(channel, message);
  }
} 