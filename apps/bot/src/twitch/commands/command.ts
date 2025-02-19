import { ChatUserstate, Client } from 'tmi.js';
import { Redis } from 'ioredis';
import { LoyaltyService, TimerService } from '@marksoftbot/core';
import { Command } from '../Command';
import { config } from '../../config';

const redis = new Redis(config.redis.url);

interface CustomCommand {
  name: string;
  response: string;
  userLevel: 'everyone' | 'subscriber' | 'vip' | 'moderator' | 'broadcaster';
  cooldown: number;
  enabled: boolean;
  createdBy: string;
  createdAt: number;
}

export default class CustomCommandHandler extends Command {
  public name = 'command';
  public aliases = ['cmd'];
  public userLevel = 'moderator' as const;
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
        case 'add':
          if (args.length < 3) {
            await this.client.say(channel, 'Usage: !command add <name> <response> [userLevel] [cooldown]');
            return;
          }

          const name = args[1].toLowerCase();
          if (name.startsWith('!')) {
            await this.client.say(channel, 'Command name should not include !');
            return;
          }

          const response = args.slice(2).join(' ');
          const userLevel = args[3] || 'everyone';
          const cooldown = parseInt(args[4]) || 30;

          const command: CustomCommand = {
            name,
            response,
            userLevel: userLevel as CustomCommand['userLevel'],
            cooldown,
            enabled: true,
            createdBy: userstate.username!,
            createdAt: Date.now(),
          };

          await redis.hset(`commands:${channelName}`, name, JSON.stringify(command));
          await this.client.say(channel, `Command !${name} has been added!`);
          break;

        case 'edit':
          if (args.length < 3) {
            await this.client.say(channel, 'Usage: !command edit <name> <new_response>');
            return;
          }

          const cmdName = args[1].toLowerCase();
          const cmdData = await redis.hget(`commands:${channelName}`, cmdName);

          if (!cmdData) {
            await this.client.say(channel, `Command !${cmdName} not found.`);
            return;
          }

          const existingCmd: CustomCommand = JSON.parse(cmdData);
          existingCmd.response = args.slice(2).join(' ');

          await redis.hset(`commands:${channelName}`, cmdName, JSON.stringify(existingCmd));
          await this.client.say(channel, `Command !${cmdName} has been updated!`);
          break;

        case 'delete':
          if (!args[1]) {
            await this.client.say(channel, 'Usage: !command delete <name>');
            return;
          }

          const delName = args[1].toLowerCase();
          const deleted = await redis.hdel(`commands:${channelName}`, delName);

          if (deleted === 0) {
            await this.client.say(channel, `Command !${delName} not found.`);
            return;
          }

          await this.client.say(channel, `Command !${delName} has been deleted!`);
          break;

        case 'list':
          const commands = await redis.hgetall(`commands:${channelName}`);
          if (!commands || Object.keys(commands).length === 0) {
            await this.client.say(channel, 'No custom commands found.');
            return;
          }

          const commandList = Object.keys(commands)
            .map(cmd => {
              const cmdData: CustomCommand = JSON.parse(commands[cmd]);
              return `!${cmd}${cmdData.enabled ? '' : ' (disabled)'}`;
            })
            .join(', ');

          await this.client.say(channel, `Custom commands: ${commandList}`);
          break;

        case 'toggle':
          if (!args[1]) {
            await this.client.say(channel, 'Usage: !command toggle <name>');
            return;
          }

          const toggleName = args[1].toLowerCase();
          const toggleData = await redis.hget(`commands:${channelName}`, toggleName);

          if (!toggleData) {
            await this.client.say(channel, `Command !${toggleName} not found.`);
            return;
          }

          const toggleCmd: CustomCommand = JSON.parse(toggleData);
          toggleCmd.enabled = !toggleCmd.enabled;

          await redis.hset(`commands:${channelName}`, toggleName, JSON.stringify(toggleCmd));
          await this.client.say(channel, 
            `Command !${toggleName} has been ${toggleCmd.enabled ? 'enabled' : 'disabled'}!`
          );
          break;

        default:
          await this.client.say(channel, 
            'Command usage: !command add/edit/delete/list/toggle'
          );
      }
    } catch (error) {
      console.error('Error handling command:', error);
      throw error;
    }
  }
} 