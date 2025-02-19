import { Client, GatewayIntentBits, Events } from 'discord.js';
import { CONFIG } from '@marksoftbot/config';
import { CommandHandler } from './commands';
import { EventHandler } from './events';
import { ModHandler } from './moderation';

export class DiscordBot {
  private client: Client;
  private commandHandler: CommandHandler;
  private eventHandler: EventHandler;
  private modHandler: ModHandler;

  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildModeration,
      ]
    });

    this.commandHandler = new CommandHandler(this.client);
    this.eventHandler = new EventHandler(this.client);
    this.modHandler = new ModHandler(this.client);

    this.setupEventListeners();
  }

  private setupEventListeners() {
    this.client.on(Events.ClientReady, () => {
      console.log(`Logged in as ${this.client.user?.tag}`);
    });

    this.client.on(Events.MessageCreate, async (message) => {
      if (message.author.bot) return;
      await this.commandHandler.handleMessage(message);
      await this.modHandler.handleMessage(message);
    });

    this.client.on(Events.GuildMemberAdd, async (member) => {
      await this.eventHandler.handleMemberJoin(member);
    });
  }

  public async start() {
    try {
      await this.client.login(CONFIG.DISCORD.BOT_TOKEN);
      console.log('Discord bot started successfully');
    } catch (error) {
      console.error('Failed to start Discord bot:', error);
    }
  }
} 