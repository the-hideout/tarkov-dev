import { ChatUserstate, Client } from 'tmi.js';
import { Redis } from 'ioredis';
import { LoyaltyService, TimerService } from '@marksoftbot/core';
import { Command } from '../Command';
import { config } from '../../config';

const redis = new Redis(config.redis.url);

interface GiveawayData {
  prize: string;
  endTime: number;
  entries: string[];
  pointsCost: number;
  createdBy: string;
}

export default class GiveawayCommand extends Command {
  public name = 'giveaway';
  public aliases = ['raffle'];
  public userLevel = 'moderator' as const;
  public cooldown = 30;

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
        case 'start':
          await this.handleStart(channel, channelName, userstate, args);
          break;

        case 'end':
          await this.handleEnd(channel, channelName);
          break;

        case 'cancel':
          await this.handleCancel(channel, channelName);
          break;

        default:
          await this.client.say(channel, 
            'Giveaway commands: !giveaway start <prize> <duration_minutes> <points_cost>, !giveaway end, !giveaway cancel'
          );
      }
    } catch (error) {
      console.error('Error handling giveaway command:', error);
      throw error;
    }
  }

  private async handleStart(channel: string, channelName: string, userstate: ChatUserstate, args: string[]): Promise<void> {
    if (args.length < 4) {
      await this.client.say(channel, 'Usage: !giveaway start <prize> <duration_minutes> <points_cost>');
      return;
    }

    const prize = args[1];
    const duration = parseInt(args[2]);
    const pointsCost = parseInt(args[3]);

    if (isNaN(duration) || isNaN(pointsCost) || duration < 1 || pointsCost < 0) {
      await this.client.say(channel, 'Invalid duration or points cost.');
      return;
    }

    const giveaway: GiveawayData = {
      prize,
      endTime: Date.now() + (duration * 60 * 1000),
      entries: [],
      pointsCost,
      createdBy: userstate.username!
    };

    await redis.set(`giveaway:${channelName}`, JSON.stringify(giveaway));
    await this.client.say(channel, 
      `Giveaway started for ${prize}! Type !join to enter (costs ${pointsCost} points). Ends in ${duration} minutes.`
    );

    // Set timer to end giveaway
    setTimeout(async () => {
      await this.handleEnd(channel, channelName);
    }, duration * 60 * 1000);
  }

  private async handleEnd(channel: string, channelName: string): Promise<void> {
    const giveawayData = await redis.get(`giveaway:${channelName}`);
    if (!giveawayData) {
      await this.client.say(channel, 'No active giveaway found.');
      return;
    }

    const giveaway: GiveawayData = JSON.parse(giveawayData);
    if (giveaway.entries.length === 0) {
      await this.client.say(channel, 'No entries found. Giveaway cancelled.');
      await redis.del(`giveaway:${channelName}`);
      return;
    }

    // Pick random winner
    const winner = giveaway.entries[Math.floor(Math.random() * giveaway.entries.length)];
    await this.client.say(channel, 
      `Giveaway ended! The winner of ${giveaway.prize} is @${winner}! Congratulations!`
    );

    await redis.del(`giveaway:${channelName}`);
  }

  private async handleCancel(channel: string, channelName: string): Promise<void> {
    await redis.del(`giveaway:${channelName}`);
    await this.client.say(channel, 'Giveaway cancelled.');
  }
} 