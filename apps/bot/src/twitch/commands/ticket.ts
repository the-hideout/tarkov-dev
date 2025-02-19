import { ChatUserstate } from 'tmi.js';
import { Redis } from 'ioredis';
import { LoyaltyService } from '@marksoftbot/core';
import { config } from '../../config';

const redis = new Redis(config.redis.url);

export const name = 'ticket';
export const cooldown = 5;
export const userLevel = 'everyone';

export async function execute(channel: string, userstate: ChatUserstate, args: string[]): Promise<void> {
  const channelName = channel.replace('#', '');
  const loyaltyService = new LoyaltyService();

  try {
    const raffleData = await redis.get(`raffle:${channelName}`);
    if (!raffleData) {
      await this.client.say(channel, `@${userstate.username} There is no active raffle.`);
      return;
    }

    const raffle = JSON.parse(raffleData);
    const amount = parseInt(args[0]) || 1;

    if (isNaN(amount) || amount < 1) {
      await this.client.say(channel, `@${userstate.username} Please enter a valid number of tickets.`);
      return;
    }

    // Check max tickets per user
    const existingEntry = raffle.entries.find(e => e.username === userstate.username);
    const currentTickets = existingEntry?.tickets || 0;
    
    if (raffle.maxTickets > 0 && currentTickets + amount > raffle.maxTickets) {
      await this.client.say(channel, 
        `@${userstate.username} You can only have ${raffle.maxTickets} tickets maximum. ` +
        `You currently have ${currentTickets} tickets.`
      );
      return;
    }

    // Check if user has enough points
    const totalCost = amount * raffle.ticketCost;
    const points = await loyaltyService.getPoints({
      userId: channelName,
      channelId: channelName,
      targetUserId: userstate['user-id']!
    });

    if (points < totalCost) {
      await this.client.say(channel, 
        `@${userstate.username} You need ${totalCost} points for ${amount} tickets. You have ${points} points.`
      );
      return;
    }

    // Deduct points and add tickets
    await loyaltyService.removePoints({
      userId: channelName,
      channelId: channelName,
      targetUserId: userstate['user-id']!,
      points: totalCost,
      reason: 'raffle_tickets'
    });

    if (existingEntry) {
      existingEntry.tickets += amount;
    } else {
      raffle.entries.push({
        username: userstate.username!,
        tickets: amount
      });
    }

    await redis.set(`raffle:${channelName}`, JSON.stringify(raffle));

    const totalTickets = existingEntry ? existingEntry.tickets + amount : amount;
    await this.client.say(channel, 
      `@${userstate.username} You bought ${amount} ticket(s)! You now have ${totalTickets} ticket(s) in total.`
    );

  } catch (error) {
    console.error('Error handling ticket command:', error);
    throw error;
  }
} 