import { Client } from 'tmi.js';
import { CONFIG } from '@marksoftbot/config';
import { User } from '@marksoftbot/database';
import { CommandManager } from './commands';
import { TimerManager } from './timers';
import { EventManager } from './events';

export class TwitchBot {
  private client: Client;
  private commandManager: CommandManager;
  private timerManager: TimerManager;
  private eventManager: EventManager;

  constructor() {
    this.client = new Client({
      options: { debug: true },
      identity: {
        username: CONFIG.TWITCH.BOT_USERNAME,
        password: CONFIG.TWITCH.BOT_TOKEN
      },
      channels: [] // Will be populated dynamically
    });

    this.commandManager = new CommandManager(this.client);
    this.timerManager = new TimerManager(this.client);
    this.eventManager = new EventManager(this.client);

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.client.on('message', async (channel, tags, message, self) => {
      if (self) return;
      await this.commandManager.handleMessage(channel, tags, message);
    });

    this.client.on('connected', () => {
      console.log('Connected to Twitch');
    });
  }

  public async start() {
    try {
      // Load all channels from database
      const users = await User.find({ 'integrations.twitch.channels': { $exists: true } });
      const channels = users.flatMap(user => 
        user.integrations.twitch.channels.map(channel => channel.name)
      );

      await this.client.connect();
      console.log('Twitch bot started successfully');
    } catch (error) {
      console.error('Failed to start Twitch bot:', error);
    }
  }
} 