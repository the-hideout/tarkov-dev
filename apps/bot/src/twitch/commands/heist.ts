import { ChatUserstate } from 'tmi.js';
import { Redis } from 'ioredis';
import { LoyaltyService } from '@marksoftbot/core';
import { config } from '../../config';

const redis = new Redis(config.redis.url);

export const name = 'heist';
export const cooldown = 300; // 5 minutes between heists
export const userLevel = 'everyone';

interface HeistData {
  leader: string;
  participants: {
    username: string;
    amount: number;
  }[];
  totalAmount: number;
  startTime: number;
  status: 'recruiting' | 'active' | 'ended';
}

const HEIST_SCENARIOS = [
  { name: 'Bank', minSuccess: 40, maxSuccess: 70, multiplierRange: [1.5, 2.0] },
  { name: 'Casino', minSuccess: 30, maxSuccess: 60, multiplierRange: [1.8, 2.5] },
  { name: 'Mansion', minSuccess: 50, maxSuccess: 80, multiplierRange: [1.3, 1.8] },
  { name: 'Train', minSuccess: 35, maxSuccess: 65, multiplierRange: [1.6, 2.2] },
];

const CREW_SIZE_BONUSES = new Map([
  [5, 5],   // +5% success rate with 5+ people
  [10, 10], // +10% success rate with 10+ people
  [15, 15], // +15% success rate with 15+ people
]);

export async function execute(channel: string, userstate: ChatUserstate, args: string[]): Promise<void> {
  const channelName = channel.replace('#', '');
  const loyaltyService = new LoyaltyService();

  try {
    const amount = parseInt(args[0]);

    // Check if there's an active heist
    const activeHeist = await redis.get(`heist:${channelName}`);
    if (activeHeist) {
      const heist: HeistData = JSON.parse(activeHeist);
      
      if (heist.status === 'recruiting') {
        // Join existing heist
        if (isNaN(amount) || amount < 100) {
          await this.client.say(channel, `@${userstate.username} Minimum heist entry is 100 points.`);
          return;
        }

        // Check if already joined
        if (heist.participants.some(p => p.username === userstate.username)) {
          await this.client.say(channel, `@${userstate.username} You're already in this heist!`);
          return;
        }

        // Check points
        const points = await loyaltyService.getPoints({
          userId: channelName,
          channelId: channelName,
          targetUserId: userstate['user-id']!
        });

        if (points < amount) {
          await this.client.say(channel, 
            `@${userstate.username} You need ${amount} points to join. You have ${points} points.`
          );
          return;
        }

        // Remove points and add to heist
        await loyaltyService.removePoints({
          userId: channelName,
          channelId: channelName,
          targetUserId: userstate['user-id']!,
          points: amount,
          reason: 'heist_entry'
        });

        heist.participants.push({
          username: userstate.username!,
          amount
        });
        heist.totalAmount += amount;

        await redis.set(`heist:${channelName}`, JSON.stringify(heist));
        await this.client.say(channel, 
          `@${userstate.username} joined the heist with ${amount} points! ` +
          `Total crew: ${heist.participants.length} | Total pot: ${heist.totalAmount}`
        );

        return;
      }

      await this.client.say(channel, `@${userstate.username} A heist is already in progress!`);
      return;
    }

    // Start new heist
    if (isNaN(amount) || amount < 100) {
      await this.client.say(channel, `@${userstate.username} Minimum heist amount is 100 points.`);
      return;
    }

    // Check points
    const points = await loyaltyService.getPoints({
      userId: channelName,
      channelId: channelName,
      targetUserId: userstate['user-id']!
    });

    if (points < amount) {
      await this.client.say(channel, 
        `@${userstate.username} You need ${amount} points to start a heist. You have ${points} points.`
      );
      return;
    }

    // Remove points and create heist
    await loyaltyService.removePoints({
      userId: channelName,
      channelId: channelName,
      targetUserId: userstate['user-id']!,
      points: amount,
      reason: 'heist_entry'
    });

    const heist: HeistData = {
      leader: userstate.username!,
      participants: [{
        username: userstate.username!,
        amount
      }],
      totalAmount: amount,
      startTime: Date.now(),
      status: 'recruiting'
    };

    await redis.set(`heist:${channelName}`, JSON.stringify(heist));
    await this.client.say(channel, 
      `🚨 ${userstate.username} is organizing a heist with ${amount} points! ` +
      `Type !heist <amount> to join in the next 60 seconds!`
    );

    // Start heist after recruitment period
    setTimeout(async () => {
      await startHeist(channel, channelName);
    }, 60000);

  } catch (error) {
    console.error('Error handling heist command:', error);
    throw error;
  }
}

async function startHeist(channel: string, channelName: string): Promise<void> {
  const heistData = await redis.get(`heist:${channelName}`);
  if (!heistData) return;

  const heist: HeistData = JSON.parse(heistData);
  if (heist.status !== 'recruiting') return;

  heist.status = 'active';
  await redis.set(`heist:${channelName}`, JSON.stringify(heist));

  const scenario = HEIST_SCENARIOS[Math.floor(Math.random() * HEIST_SCENARIOS.length)];
  await this.client.say(channel, 
    `The crew of ${heist.participants.length} heads to the ${scenario.name}! ` +
    `The heist will begin in 10 seconds...`
  );

  // Run heist after dramatic pause
  setTimeout(async () => {
    await runHeist(channel, channelName, scenario);
  }, 10000);
}

async function runHeist(
  channel: string, 
  channelName: string, 
  scenario: typeof HEIST_SCENARIOS[0]
): Promise<void> {
  const heistData = await redis.get(`heist:${channelName}`);
  if (!heistData) return;

  const heist: HeistData = JSON.parse(heistData);
  const loyaltyService = new LoyaltyService();

  // Calculate success chance
  let successChance = scenario.minSuccess + 
    Math.random() * (scenario.maxSuccess - scenario.minSuccess);

  // Add crew size bonus
  for (const [size, bonus] of CREW_SIZE_BONUSES) {
    if (heist.participants.length >= size) {
      successChance += bonus;
      break;
    }
  }

  // Determine individual results
  const results = await Promise.all(heist.participants.map(async participant => {
    const success = Math.random() * 100 < successChance;
    if (success) {
      const multiplier = scenario.multiplierRange[0] + 
        Math.random() * (scenario.multiplierRange[1] - scenario.multiplierRange[0]);
      const winnings = Math.floor(participant.amount * multiplier);

      await loyaltyService.addPoints({
        userId: channelName,
        channelId: channelName,
        targetUserId: participant.username.toLowerCase(),
        points: winnings,
        reason: 'heist_win'
      });

      return `@${participant.username} escaped with ${winnings} points!`;
    }

    return `@${participant.username} was caught!`;
  }));

  // Send results
  await this.client.say(channel, 
    `Heist Results: ${Math.round(successChance)}% success rate\n` +
    results.join(' | ')
  );

  heist.status = 'ended';
  await redis.del(`heist:${channelName}`);
} 