import { Client, GuildMember, TextChannel } from 'discord.js';
import { User } from '@marksoftbot/database';
import { WebSocket } from 'ws';
import { CONFIG } from '@marksoftbot/config';

export class EventHandler {
  private client: Client;
  private ws: WebSocket;

  constructor(client: Client) {
    this.client = client;
    this.setupWebSocket();
  }

  private setupWebSocket() {
    this.ws = new WebSocket(CONFIG.WS_URL);
    
    this.ws.on('open', () => {
      console.log('Discord WebSocket connected');
    });

    this.ws.on('error', (error) => {
      console.error('Discord WebSocket error:', error);
    });
  }

  async handleMemberJoin(member: GuildMember) {
    try {
      const user = await User.findOne({
        'integrations.discord.guilds.id': member.guild.id
      });

      if (!user) return;

      const guildSettings = user.integrations.discord.guilds
        .find(g => g.id === member.guild.id);

      if (!guildSettings) return;

      // Auto-role assignment
      if (guildSettings.settings.autoRole) {
        const role = member.guild.roles.cache.get(guildSettings.settings.autoRole);
        if (role) {
          await member.roles.add(role);
        }
      }

      // Welcome message
      if (guildSettings.settings.welcome?.enabled) {
        const channel = member.guild.channels.cache.get(guildSettings.settings.welcome.channelId);
        if (channel && channel instanceof TextChannel) {
          await channel.send(
            guildSettings.settings.welcome.message
              .replace('{user}', member.toString())
              .replace('{server}', member.guild.name)
          );
        }
      }

      // Send event to WebSocket for real-time updates
      this.ws.send(JSON.stringify({
        type: 'DISCORD_MEMBER_JOIN',
        data: {
          guildId: member.guild.id,
          userId: member.id,
          username: member.user.username
        }
      }));
    } catch (error) {
      console.error('Error handling member join:', error);
    }
  }
} 