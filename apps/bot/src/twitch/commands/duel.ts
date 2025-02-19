import { ChatUserstate } from 'tmi.js';
import { Redis } from 'ioredis';
import { LoyaltyService } from '@marksoftbot/core';
import { config } from '../../config';

const redis = new Redis(config.redis.url);

export const name = 'duel';
export const cooldown = 30;
export const userLevel = 'everyone';

interface DuelData {
  challenger: string;
  target: string;
  amount: number;
  expiresAt: number;
}

export async function execute(channel: string, userstate: ChatUserstate, args: string[]): Promise<void> {
  const channelName = channel.replace('#', '');
  const loyaltyService = new LoyaltyService();

  try {
    if (args.length < 2) {
      await this.client.say(channel, 'Usage: !duel <username> <amount>');
      return;
    }

    const target = args[0].replace('@', '').toLowerCase();
    const amount = parseInt(args[1]);

    // Validate target and amount
    if (target === userstate.username) {
      await this.client.say(channel, `@${userstate.username} You can't duel yourself!`);
      return;
    }

    if (isNaN(amount) || amount < 100) {
      await this.client.say(channel, `@${userstate.username} Minimum duel amount is 100 points.`);
      return;
    }

    // Check if user has an active duel
    const activeDuel = await redis.get(`duel:${channelName}:${userstate.username}`);
    if (activeDuel) {
      await this.client.say(channel, `@${userstate.username} You already have an active duel challenge.`);
      return;
    }

    // Check if target has an active duel
    const targetDuel = await redis.get(`duel:${channelName}:${target}`);
    if (targetDuel) {
      await this.client.say(channel, `@${userstate.username} That user already has an active duel.`);
      return;
    }

    // Check if challenger has enough points
    const points = await loyaltyService.getPoints({
      userId: channelName,
      channelId: channelName,
      targetUserId: userstate['user-id']!
    });

    if (points < amount) {
      await this.client.say(channel, 
        `@${userstate.username} You need ${amount} points to duel. You have ${points} points.`
      );
      return;
    }

    // Create duel challenge
    const duel: DuelData = {
      challenger: userstate.username!,
      target,
      amount,
      expiresAt: Date.now() + (60 * 1000) // 1 minute to accept
    };

    await redis.set(`duel:${channelName}:${userstate.username}`, JSON.stringify(duel), 'EX', 60);
    await this.client.say(channel, 
      `@${target} ${userstate.username} has challenged you to a duel for ${amount} points! ` +
      `Type !accept to fight or !decline to refuse. You have 60 seconds to respond.`
    );

    // Set timeout to auto-decline
    setTimeout(async () => {
      const duelData = await redis.get(`duel:${channelName}:${userstate.username}`);
      if (duelData) {
        await redis.del(`duel:${channelName}:${userstate.username}`);
        await this.client.say(channel, 
          `@${userstate.username} Your duel challenge to ${target} has expired.`
        );
      }
    }, 60000);

  } catch (error) {
    console.error('Error handling duel command:', error);
    throw error;
  }
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function handleAccept(channel: string, userstate: ChatUserstate): Promise<void> {
  const channelName = channel.replace('#', '');
  const loyaltyService = new LoyaltyService();

  // Find duel where this user is the target
  const duels = await redis.keys(`duel:${channelName}:*`);
  let targetDuel: DuelData | null = null;
  let duelKey: string | null = null;

  for (const key of duels) {
    const duelData = await redis.get(key);
    if (duelData) {
      const duel: DuelData = JSON.parse(duelData);
      if (duel.target === userstate.username) {
        targetDuel = duel;
        duelKey = key;
        break;
      }
    }
  }

  if (!targetDuel || !duelKey) {
    await this.client.say(channel, `@${userstate.username} You have no duel challenges to accept.`);
    return;
  }

  // Check if target has enough points
  const points = await loyaltyService.getPoints({
    userId: channelName,
    channelId: channelName,
    targetUserId: userstate['user-id']!
  });

  if (points < targetDuel.amount) {
    await this.client.say(channel, 
      `@${userstate.username} You need ${targetDuel.amount} points to accept this duel. You have ${points} points.`
    );
    await redis.del(duelKey);
    return;
  }

  // Remove points from both users
  await loyaltyService.removePoints({
    userId: channelName,
    channelId: channelName,
    targetUserId: userstate['user-id']!,
    points: targetDuel.amount,
    reason: 'duel_bet'
  });

  const challengerId = await redis.get(`userid:${channelName}:${targetDuel.challenger}`);
  await loyaltyService.removePoints({
    userId: channelName,
    channelId: channelName,
    targetUserId: challengerId!,
    points: targetDuel.amount,
    reason: 'duel_bet'
  });

  // Determine winner
  const roll1 = getRandomInt(1, 100);
  const roll2 = getRandomInt(1, 100);
  const winner = roll1 > roll2 ? targetDuel.challenger : userstate.username;
  const loser = winner === targetDuel.challenger ? userstate.username : targetDuel.challenger;
  const winnings = targetDuel.amount * 2;

  await this.client.say(channel, 
    `🎲 ${targetDuel.challenger} rolled ${roll1} | ${userstate.username} rolled ${roll2} | ` +
    `@${winner} wins ${winnings} points!`
  );

  // Award points to winner
  const winnerId = winner === targetDuel.challenger ? challengerId : userstate['user-id'];
  await loyaltyService.addPoints({
    userId: channelName,
    channelId: channelName,
    targetUserId: winnerId!,
    points: winnings,
    reason: 'duel_win'
  });

  await redis.del(duelKey);
}

export async function handleDecline(channel: string, userstate: ChatUserstate): Promise<void> {
  const channelName = channel.replace('#', '');

  // Find duel where this user is the target
  const duels = await redis.keys(`duel:${channelName}:*`);
  let targetDuel: DuelData | null = null;
  let duelKey: string | null = null;

  for (const key of duels) {
    const duelData = await redis.get(key);
    if (duelData) {
      const duel: DuelData = JSON.parse(duelData);
      if (duel.target === userstate.username) {
        targetDuel = duel;
        duelKey = key;
        break;
      }
    }
  }

  if (!targetDuel || !duelKey) {
    await this.client.say(channel, `@${userstate.username} You have no duel challenges to decline.`);
    return;
  }

  await redis.del(duelKey);
  await this.client.say(channel, 
    `@${targetDuel.challenger} ${userstate.username} has declined your duel challenge.`
  );
} 