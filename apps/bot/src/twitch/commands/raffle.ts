import { ChatUserstate } from 'tmi.js';
import { Redis } from 'ioredis';
import { LoyaltyService } from '@marksoftbot/core';
import { config } from '../../config';

const redis = new Redis(config.redis.url);

export const name = 'raffle';
export const aliases = ['giveaway'];
export const userLevel = 'moderator';

interface RaffleData {
  prize: string;
  duration: number;
  endTime: number;
  entries: {
    username: string;
    tickets: number;
  }[];
  ticketCost: number;
  maxTickets: number;
  createdBy: string;
}

export async function execute(channel: string, userstate: ChatUserstate, args: string[]): Promise<void> {
  const channelName = channel.replace('#', '');
  const subcommand = args[0]?.toLowerCase();

  try {
    switch (subcommand) {
      case 'start':
        if (args.length < 4) {
          await this.client.say(channel, 
            'Usage: !raffle start <prize> <duration_minutes> <ticket_cost> [max_tickets]'
          );
          return;
        }

        // Check if there's already an active raffle
        const activeRaffle = await redis.get(`raffle:${channelName}`);
        if (activeRaffle) {
          await this.client.say(channel, 'There is already an active raffle. End it first with !raffle end');
          return;
        }

        const prize = args[1];
        const duration = parseInt(args[2]);
        const ticketCost = parseInt(args[3]);
        const maxTickets = parseInt(args[4]) || 0;

        if (isNaN(duration) || isNaN(ticketCost) || duration < 1 || ticketCost < 0) {
          await this.client.say(channel, 'Invalid duration or ticket cost.');
          return;
        }

        const raffle: RaffleData = {
          prize,
          duration,
          endTime: Date.now() + (duration * 60 * 1000),
          entries: [],
          ticketCost,
          maxTickets,
          createdBy: userstate.username!,
        };

        await redis.set(`raffle:${channelName}`, JSON.stringify(raffle));
        await this.client.say(channel, 
          `Raffle started for ${prize}! Type !ticket <amount> to enter. ` +
          `Each ticket costs ${ticketCost} points${maxTickets ? ` (max ${maxTickets} tickets per user)` : ''}. ` +
          `Ends in ${duration} minutes.`
        );

        // Set timer to end raffle
        setTimeout(async () => {
          await endRaffle(channel, channelName);
        }, duration * 60 * 1000);
        break;

      case 'end':
        await endRaffle(channel, channelName);
        break;

      case 'status':
        const currentRaffle = await redis.get(`raffle:${channelName}`);
        if (!currentRaffle) {
          await this.client.say(channel, 'No active raffle.');
          return;
        }

        const raffleData: RaffleData = JSON.parse(currentRaffle);
        const timeLeft = Math.ceil((raffleData.endTime - Date.now()) / 60000);
        const totalEntries = raffleData.entries.reduce((sum, entry) => sum + entry.tickets, 0);

        await this.client.say(channel, 
          `Current raffle: "${raffleData.prize}" | ${totalEntries} total tickets | ` +
          `${raffleData.entries.length} participants | ${timeLeft} minutes remaining`
        );
        break;

      default:
        await this.client.say(channel, 
          'Raffle commands: !raffle start <prize> <duration> <ticket_cost> [max_tickets], !raffle end, !raffle status'
        );
    }
  } catch (error) {
    console.error('Error handling raffle command:', error);
    throw error;
  }
}

async function endRaffle(channel: string, channelName: string): Promise<void> {
  const raffleData = await redis.get(`raffle:${channelName}`);
  if (!raffleData) {
    await this.client.say(channel, 'No active raffle to end.');
    return;
  }

  const raffle: RaffleData = JSON.parse(raffleData);
  if (raffle.entries.length === 0) {
    await this.client.say(channel, 'No entries found. Raffle cancelled.');
    await redis.del(`raffle:${channelName}`);
    return;
  }

  // Create weighted ticket pool
  const ticketPool: string[] = [];
  raffle.entries.forEach(entry => {
    for (let i = 0; i < entry.tickets; i++) {
      ticketPool.push(entry.username);
    }
  });

  // Pick random winner
  const winner = ticketPool[Math.floor(Math.random() * ticketPool.length)];
  const winnerEntry = raffle.entries.find(e => e.username === winner)!;

  await this.client.say(channel, 
    `Raffle ended! The winner of ${raffle.prize} is @${winner} ` +
    `(${winnerEntry.tickets} tickets)! Congratulations!`
  );

  await redis.del(`raffle:${channelName}`);
} 