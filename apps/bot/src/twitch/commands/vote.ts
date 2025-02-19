import { ChatUserstate } from 'tmi.js';
import { Redis } from 'ioredis';
import { LoyaltyService } from '@marksoftbot/core';
import { config } from '../../config';

const redis = new Redis(config.redis.url);

export const name = 'vote';
export const cooldown = 5;
export const userLevel = 'everyone';

export async function execute(channel: string, userstate: ChatUserstate, args: string[]): Promise<void> {
  const channelName = channel.replace('#', '');

  try {
    if (!args[0]) {
      await this.client.say(channel, 'Usage: !vote <letter>');
      return;
    }

    const pollData = await redis.get(`poll:${channelName}`);
    if (!pollData) {
      await this.client.say(channel, `@${userstate.username} There is no active poll.`);
      return;
    }

    const poll = JSON.parse(pollData);
    const vote = args[0].toUpperCase();

    if (!poll.options[vote]) {
      await this.client.say(channel, `@${userstate.username} Invalid option. Please vote with a letter (A, B, C, etc.).`);
      return;
    }

    // Check if user has already voted
    const hasVoted = Object.values(poll.votes).some(voters => 
      voters.includes(userstate.username!)
    );

    if (hasVoted && !poll.allowMultipleVotes) {
      await this.client.say(channel, `@${userstate.username} You have already voted in this poll.`);
      return;
    }

    // Handle points cost
    if (poll.pointsCost > 0) {
      const loyaltyService = new LoyaltyService();
      const points = await loyaltyService.getPoints({
        userId: channelName,
        channelId: channelName,
        targetUserId: userstate['user-id']!
      });

      if (points < poll.pointsCost) {
        await this.client.say(channel, 
          `@${userstate.username} You need ${poll.pointsCost} points to vote. You have ${points} points.`
        );
        return;
      }

      await loyaltyService.removePoints({
        userId: channelName,
        channelId: channelName,
        targetUserId: userstate['user-id']!,
        points: poll.pointsCost,
        reason: 'poll_vote'
      });
    }

    // Record vote
    if (!poll.votes[vote]) {
      poll.votes[vote] = [];
    }
    poll.votes[vote].push(userstate.username!);

    await redis.set(`poll:${channelName}`, JSON.stringify(poll));
    await this.client.say(channel, `@${userstate.username} Your vote has been recorded!`);

  } catch (error) {
    console.error('Error handling vote command:', error);
    throw error;
  }
} 