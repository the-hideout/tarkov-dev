import { ChatUserstate } from 'tmi.js';
import { Redis } from 'ioredis';
import { LoyaltyService } from '@marksoftbot/core';
import { config } from '../../config';

const redis = new Redis(config.redis.url);

export const name = 'bet';
export const cooldown = 5;
export const userLevel = 'everyone';

export async function execute(channel: string, userstate: ChatUserstate, args: string[]): Promise<void> {
  const channelName = channel.replace('#', '');
  const loyaltyService = new LoyaltyService();

  try {
    if (args.length < 2) {
      await this.client.say(channel, 'Usage: !bet <option> <amount>');
      return;
    }

    const predictionData = await redis.get(`prediction:${channelName}`);
    if (!predictionData) {
      await this.client.say(channel, `@${userstate.username} There is no active prediction.`);
      return;
    }

    const prediction = JSON.parse(predictionData);
    if (prediction.status !== 'active') {
      await this.client.say(channel, `@${userstate.username} This prediction is ${prediction.status}.`);
      return;
    }

    const option = args[0].toUpperCase();
    const amount = parseInt(args[1]);

    if (!prediction.options[option]) {
      await this.client.say(channel, `@${userstate.username} Invalid option. Please bet with a letter (A, B, C, etc.).`);
      return;
    }

    if (isNaN(amount) || amount < 1) {
      await this.client.say(channel, `@${userstate.username} Please enter a valid amount to bet.`);
      return;
    }

    // Check if user has already bet on this option
    const existingBet = prediction.options[option].bets
      .find(b => b.username === userstate.username);
    
    if (existingBet) {
      await this.client.say(channel, `@${userstate.username} You have already bet on this option.`);
      return;
    }

    // Check if user has enough points
    const points = await loyaltyService.getPoints({
      userId: channelName,
      channelId: channelName,
      targetUserId: userstate['user-id']!
    });

    if (points < amount) {
      await this.client.say(channel, 
        `@${userstate.username} You need ${amount} points to bet. You have ${points} points.`
      );
      return;
    }

    // Deduct points and record bet
    await loyaltyService.removePoints({
      userId: channelName,
      channelId: channelName,
      targetUserId: userstate['user-id']!,
      points: amount,
      reason: 'prediction_bet'
    });

    prediction.options[option].bets.push({
      username: userstate.username!,
      amount
    });
    prediction.options[option].totalAmount += amount;

    await redis.set(`prediction:${channelName}`, JSON.stringify(prediction));

    const odds = Math.floor(
      (prediction.options[option].totalAmount / 
        Object.values(prediction.options)
          .reduce((sum, opt) => sum + opt.totalAmount, 0)
      ) * 100
    );

    await this.client.say(channel, 
      `@${userstate.username} Bet ${amount} points on ${option}) ${prediction.options[option].text} ` +
      `(Current odds: ${odds}%)`
    );

  } catch (error) {
    console.error('Error handling bet command:', error);
    throw error;
  }
} 