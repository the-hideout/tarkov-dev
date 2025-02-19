import { ChatUserstate } from 'tmi.js';
import { Redis } from 'ioredis';
import { LoyaltyService } from '@marksoftbot/core';
import { config } from '../../config';

const redis = new Redis(config.redis.url);

export const name = 'join';
export const cooldown = 5;
export const userLevel = 'everyone';

export async function execute(channel: string, userstate: ChatUserstate): Promise<void> {
  const channelName = channel.replace('#', '');
  const loyaltyService = new LoyaltyService();

  try {
    const tournamentData = await redis.get(`tournament:${channelName}`);
    if (!tournamentData) {
      await this.client.say(channel, `@${userstate.username} There is no active tournament.`);
      return;
    }

    const tournament = JSON.parse(tournamentData);
    if (tournament.status !== 'recruiting') {
      await this.client.say(channel, `@${userstate.username} This tournament has already started.`);
      return;
    }

    if (tournament.participants.some(p => p.username === userstate.username)) {
      await this.client.say(channel, `@${userstate.username} You're already in this tournament.`);
      return;
    }

    if (tournament.participants.length >= tournament.maxParticipants) {
      await this.client.say(channel, `@${userstate.username} This tournament is full.`);
      return;
    }

    // Check if user has enough points
    const points = await loyaltyService.getPoints({
      userId: channelName,
      channelId: channelName,
      targetUserId: userstate['user-id']!
    });

    if (points < tournament.entryFee) {
      await this.client.say(channel, 
        `@${userstate.username} You need ${tournament.entryFee} points to join. You have ${points} points.`
      );
      return;
    }

    // Remove points and add to tournament
    await loyaltyService.removePoints({
      userId: channelName,
      channelId: channelName,
      targetUserId: userstate['user-id']!,
      points: tournament.entryFee,
      reason: 'tournament_entry'
    });

    tournament.participants.push({
      username: userstate.username!,
      seed: 0,
      eliminated: false
    });
    tournament.prizePool += tournament.entryFee;

    await redis.set(`tournament:${channelName}`, JSON.stringify(tournament));
    await this.client.say(channel, 
      `@${userstate.username} has joined the tournament! ` +
      `(${tournament.participants.length}/${tournament.maxParticipants} participants)`
    );

  } catch (error) {
    console.error('Error handling join command:', error);
    throw error;
  }
} 