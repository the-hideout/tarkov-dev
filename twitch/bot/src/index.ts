import { Client, ChatUserstate } from 'tmi.js';
import dotenv from 'dotenv';
import { Logger } from './utils/logger';
import { ModerationModule } from './modules/moderation';
import { EFTModule } from './modules/eft';
import { CommandModule } from './modules/commands';
import { WebServer } from './core/webserver';

// Load environment variables
dotenv.config();

// Initialize logger
const logger = new Logger('main');

// Bot configuration
const client = new Client({
  options: { debug: true },
  identity: {
    username: process.env.TWITCH_BOT_USERNAME,
    password: process.env.TWITCH_BOT_OAUTH
  },
  channels: [process.env.TWITCH_CHANNEL || '']
});

// Initialize modules
const moderation = new ModerationModule(client);
const eft = new EFTModule(client);
const commands = new CommandModule(client);

// Initialize web server
const webServer = new WebServer();

// Connect to Twitch
client.connect().catch((error: Error) => {
  logger.error('Error connecting to Twitch:', error);
  process.exit(1);
});

// Handle connection
client.on('connected', (address: string, port: number) => {
  logger.info(`Connected to ${address}:${port}`);
});

// Handle chat messages
client.on('message', async (channel: string, tags: ChatUserstate, message: string, self: boolean) => {
  if (self) return; // Ignore messages from the bot

  try {
    // Process moderation
    await moderation.handleMessage(channel, tags, message);
    
    // Process commands
    await commands.handleMessage(channel, tags, message);
    
    // Process EFT commands if enabled
    if (process.env.ENABLE_EFT_INTEGRATION === 'true') {
      await eft.handleMessage(channel, tags, message);
    }
  } catch (error) {
    logger.error('Error processing message:', error);
  }
});

// Handle errors
client.on('error', (error: any) => {
  logger.error('Error:', error);
});

// Handle disconnection
client.on('disconnected', (reason: string) => {
  logger.warn('Disconnected:', reason);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Shutting down...');
  await client.disconnect();
  await webServer.close();
  process.exit(0);
}); 