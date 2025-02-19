import { DiscordBot } from './discord/DiscordBot';
import { TwitchBot } from './twitch/TwitchBot';
import mongoose from 'mongoose';
import { config } from './config';

async function main() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongodb.uri);
    console.log('Connected to MongoDB');

    // Start Discord bot
    const discordBot = new DiscordBot();
    await discordBot.start();
    console.log('Discord bot started');

    // Start Twitch bot
    const twitchBot = new TwitchBot();
    await twitchBot.start();
    console.log('Twitch bot started');

    // Handle graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('Received SIGTERM. Shutting down...');
      await discordBot.stop();
      await twitchBot.stop();
      await mongoose.disconnect();
      process.exit(0);
    });

  } catch (error) {
    console.error('Error starting bot:', error);
    process.exit(1);
  }
}

main(); 