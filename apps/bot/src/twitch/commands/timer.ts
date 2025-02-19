import { ChatUserstate, Client } from 'tmi.js';
import { LoyaltyService, TimerService } from '@marksoftbot/core';
import { Command } from '../Command';

interface Timer {
  name: string;
  interval: number;
  enabled: boolean;
  message: string;
}

export default class TimerCommand extends Command {
  public name = 'timer';
  public aliases = ['timers'];
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
            await this.client.say(channel, 'Usage: !timer add <name> <interval> <message>');
            return;
          }

          const name = args[1];
          const interval = parseInt(args[2]);
          const message = args.slice(3).join(' ');

          await this.timerService.createTimer({
            userId: channelName,
            channelId: channelName,
            name,
            interval,
            message,
            enabled: true
          });

          await this.client.say(channel, `Timer "${name}" has been created!`);
          break;

        case 'list':
          const timers = await this.timerService.getTimers({
            userId: channelName,
            channelId: channelName
          });

          if (timers.length === 0) {
            await this.client.say(channel, 'No timers found.');
            return;
          }

          const timerList = timers.map((timer: Timer) => 
            `${timer.name} (${timer.interval}m${timer.enabled ? '' : ' - Disabled'})`
          ).join(', ');

          await this.client.say(channel, `Timers: ${timerList}`);
          break;

        case 'remove':
          if (!args[1]) {
            await this.client.say(channel, 'Usage: !timer remove <name>');
            return;
          }

          await this.timerService.deleteTimer({
            userId: channelName,
            channelId: channelName,
            name: args[1]
          });

          await this.client.say(channel, `Timer "${args[1]}" has been removed!`);
          break;

        default:
          await this.client.say(channel, 
            'Timer commands: !timer add <name> <interval> <message>, !timer list, !timer remove <name>'
          );
      }
    } catch (error) {
      console.error('Error handling timer command:', error);
      throw error;
    }
  }
} 