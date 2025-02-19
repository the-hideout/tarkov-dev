import { Client, GatewayIntentBits, Events } from 'discord.js';
import { EventLogService, ModerationService } from '@marksoftbot/core';
import { CommandHandler } from './CommandHandler';
import { EventHandler } from './EventHandler';
import { config } from '../config';

export class DiscordBot {
  private client: Client;
  private commandHandler: CommandHandler;
  private eventHandler: EventHandler;
  private moderationService: ModerationService;
  private eventLogService: EventLogService;

  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
      ],
    });

    this.moderationService = new ModerationService();
    this.eventLogService = new EventLogService();
    this.commandHandler = new CommandHandler(this.client);
    this.eventHandler = new EventHandler(this.client, this.moderationService, this.eventLogService);

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.client.once(Events.ClientReady, () => {
      console.log(`Discord bot logged in as ${this.client.user?.tag}`);
    });

    // Handle commands
    this.client.on(Events.InteractionCreate, async (interaction) => {
      if (!interaction.isCommand()) return;
      await this.commandHandler.handleCommand(interaction);
    });

    // Handle messages for moderation
    this.client.on(Events.MessageCreate, async (message) => {
      if (message.author.bot) return;
      await this.eventHandler.handleMessage(message);
    });

    // Handle member events
    this.client.on(Events.GuildMemberAdd, async (member) => {
      await this.eventHandler.handleMemberJoin(member);
    });

    this.client.on(Events.GuildMemberRemove, async (member) => {
      await this.eventHandler.handleMemberLeave(member);
    });
  }

  public async start(): Promise<void> {
    try {
      await this.client.login(config.discord.token);
    } catch (error) {
      console.error('Failed to start Discord bot:', error);
      throw error;
    }
  }

  public async stop(): Promise<void> {
    this.client.destroy();
  }
} 