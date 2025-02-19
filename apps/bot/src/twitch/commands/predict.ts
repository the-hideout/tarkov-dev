import { ChatUserstate, Client } from 'tmi.js';
import { Redis } from 'ioredis';
import { LoyaltyService, TimerService } from '@marksoftbot/core';
import { Command } from '../Command';
import { config } from '../../config';

interface PredictionOption {
  text: string;
  bets: Array<{ username: string; amount: number }>;
}

interface PredictionData {
  title: string;
  options: Record<string, PredictionOption>;
  endTime: number;
  status: 'active' | 'locked' | 'ended';
  createdBy: string;
  createdAt: number;
}

export default class PredictCommand extends Command {
  private redis: Redis;

  constructor(
    client: Client,
    loyaltyService: LoyaltyService,
    timerService: TimerService
  ) {
    super(client, loyaltyService, timerService);
    this.redis = new Redis(config.redis.url);
  }

  public name = 'predict';
  public aliases = ['prediction'];
  public userLevel = 'moderator' as const;
  public cooldown = 5;

  public async execute(channel: string, userstate: ChatUserstate, args: string[]): Promise<void> {
    const channelName = channel.replace('#', '');
    const subcommand = args[0]?.toLowerCase();

    try {
      switch (subcommand) {
        case 'start':
          await this.handleStart(channel, channelName, userstate, args);
          break;

        case 'end':
          await this.handleEnd(channel, channelName, args[1]);
          break;

        case 'cancel':
          await this.handleCancel(channel, channelName);
          break;

        case 'status':
          await this.handleStatus(channel, channelName);
          break;

        default:
          await this.client.say(channel, 
            'Prediction commands: !predict start "title" "option1,option2" duration, ' +
            '!predict end <winner>, !predict cancel, !predict status'
          );
      }
    } catch (error) {
      console.error('Error handling prediction command:', error);
      throw error;
    }
  }

  private async handleStart(channel: string, channelName: string, userstate: ChatUserstate, args: string[]): Promise<void> {
    if (args.length < 4) {
      await this.client.say(channel, 
        'Usage: !predict start "title" "option1,option2,..." <duration_minutes>'
      );
      return;
    }

    const activePrediction = await this.redis.get(`prediction:${channelName}`);
    if (activePrediction) {
      await this.client.say(channel, 'There is already an active prediction.');
      return;
    }

    const title = args[1];
    const optionsArray = args[2].split(',').map(o => o.trim());
    const duration = parseInt(args[3]);

    if (isNaN(duration) || duration < 1) {
      await this.client.say(channel, 'Duration must be a positive number of minutes.');
      return;
    }

    const options: Record<string, PredictionOption> = {};
    optionsArray.forEach((text, index) => {
      const letter = String.fromCharCode(65 + index); // A, B, C, etc.
      options[letter] = {
        text,
        bets: []
      };
    });

    const prediction: PredictionData = {
      title,
      options,
      endTime: Date.now() + (duration * 60 * 1000),
      status: 'active',
      createdBy: userstate.username!,
      createdAt: Date.now()
    };

    await this.redis.set(`prediction:${channelName}`, JSON.stringify(prediction));

    const optionsText = Object.entries(options)
      .map(([letter, option]) => `${letter}) ${option.text}`)
      .join(' | ');

    await this.client.say(channel, 
      `Prediction started: "${title}" | ${optionsText} | ` +
      `Use !bet <letter> <amount> to predict | Ends in ${duration} minutes`
    );

    // Set timer to lock predictions
    setTimeout(async () => {
      await this.lockPrediction(channel, channelName);
    }, duration * 60 * 1000);
  }

  private async handleEnd(channel: string, channelName: string, winner: string): Promise<void> {
    if (!winner) {
      await this.client.say(channel, 'Usage: !predict end <winning_option>');
      return;
    }

    await this.endPrediction(channel, channelName, winner.toUpperCase());
  }

  private async handleCancel(channel: string, channelName: string): Promise<void> {
    await this.cancelPrediction(channel, channelName);
  }

  private async handleStatus(channel: string, channelName: string): Promise<void> {
    const currentPrediction = await this.redis.get(`prediction:${channelName}`);
    if (!currentPrediction) {
      await this.client.say(channel, 'No active prediction.');
      return;
    }

    const predictionData: PredictionData = JSON.parse(currentPrediction);
    const timeLeft = Math.ceil((predictionData.endTime - Date.now()) / 60000);

    const stats = Object.entries(predictionData.options)
      .map(([letter, option]) => {
        const total = option.bets.reduce((sum, bet) => sum + bet.amount, 0);
        return `${letter}) ${option.text} (${total} points)`;
      })
      .join(' | ');

    await this.client.say(channel, 
      `Current prediction: "${predictionData.title}" | ${stats} | ` +
      `Status: ${predictionData.status}${timeLeft > 0 ? ` | ${timeLeft} minutes remaining` : ''}`
    );
  }

  private async lockPrediction(channel: string, channelName: string): Promise<void> {
    const predictionData = await this.redis.get(`prediction:${channelName}`);
    if (!predictionData) return;

    const prediction: PredictionData = JSON.parse(predictionData);
    prediction.status = 'locked';
    await this.redis.set(`prediction:${channelName}`, JSON.stringify(prediction));
    await this.client.say(channel, 'Prediction is now locked! No more bets can be placed.');
  }

  private async endPrediction(channel: string, channelName: string, winner: string): Promise<void> {
    const predictionData = await this.redis.get(`prediction:${channelName}`);
    if (!predictionData) {
      await this.client.say(channel, 'No active prediction to end.');
      return;
    }

    const prediction: PredictionData = JSON.parse(predictionData);
    if (prediction.status === 'ended') {
      await this.client.say(channel, 'This prediction has already ended.');
      return;
    }

    if (!prediction.options[winner]) {
      await this.client.say(channel, 'Invalid winning option.');
      return;
    }

    prediction.status = 'ended';
    const winningOption = prediction.options[winner];
    const totalPool = Object.values(prediction.options)
      .reduce((sum, option) => 
        sum + option.bets.reduce((total, bet) => total + bet.amount, 0)
      , 0);

    // Calculate and distribute winnings
    for (const bet of winningOption.bets) {
      const ratio = bet.amount / winningOption.bets
        .reduce((sum, b) => sum + b.amount, 0);
      const winnings = Math.floor(totalPool * ratio);

      await this.loyaltyService.addPoints({
        userId: channelName,
        channelId: channelName,
        targetUserId: bet.username,
        points: winnings,
        reason: 'prediction_win'
      });

      await this.client.say(channel, 
        `@${bet.username} won ${winnings} points! (${bet.amount} bet)`
      );
    }

    await this.redis.set(`prediction:${channelName}`, JSON.stringify(prediction));

    await this.client.say(channel, 
      `Prediction "${prediction.title}" ended! Option ${winner} (${winningOption.text}) won! ` +
      `Total pool: ${totalPool} points`
    );
  }

  private async cancelPrediction(channel: string, channelName: string): Promise<void> {
    const predictionData = await this.redis.get(`prediction:${channelName}`);
    if (!predictionData) {
      await this.client.say(channel, 'No active prediction to cancel.');
      return;
    }

    const prediction: PredictionData = JSON.parse(predictionData);

    // Refund all bets
    for (const option of Object.values(prediction.options)) {
      for (const bet of option.bets) {
        await this.loyaltyService.addPoints({
          userId: channelName,
          channelId: channelName,
          targetUserId: bet.username,
          points: bet.amount,
          reason: 'prediction_refund'
        });
      }
    }

    await this.redis.del(`prediction:${channelName}`);
    await this.client.say(channel, 'Prediction cancelled! All bets have been refunded.');
  }
} 