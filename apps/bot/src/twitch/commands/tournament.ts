import { ChatUserstate } from 'tmi.js';
import { Redis } from 'ioredis';
import { LoyaltyService } from '@marksoftbot/core';
import { config } from '../../config';

const redis = new Redis(config.redis.url);

export const name = 'tournament';
export const aliases = ['tourney'];
export const userLevel = 'moderator';

interface TournamentData {
  name: string;
  entryFee: number;
  maxParticipants: number;
  participants: {
    username: string;
    seed: number;
    eliminated: boolean;
  }[];
  matches: {
    round: number;
    player1: string;
    player2: string;
    winner?: string;
  }[];
  currentRound: number;
  status: 'recruiting' | 'active' | 'ended';
  prizePool: number;
  startTime: number;
}

export async function execute(channel: string, userstate: ChatUserstate, args: string[]): Promise<void> {
  const channelName = channel.replace('#', '');
  const subcommand = args[0]?.toLowerCase();
  const loyaltyService = new LoyaltyService();

  try {
    switch (subcommand) {
      case 'create':
        if (args.length < 4) {
          await this.client.say(channel, 
            'Usage: !tournament create <name> <entry_fee> <max_participants>'
          );
          return;
        }

        // Check if there's an active tournament
        const activeTournament = await redis.get(`tournament:${channelName}`);
        if (activeTournament) {
          await this.client.say(channel, 'There is already an active tournament.');
          return;
        }

        const name = args[1];
        const entryFee = parseInt(args[2]);
        const maxParticipants = parseInt(args[3]);

        if (isNaN(entryFee) || entryFee < 100) {
          await this.client.say(channel, 'Entry fee must be at least 100 points.');
          return;
        }

        if (isNaN(maxParticipants) || maxParticipants < 4 || maxParticipants > 32) {
          await this.client.say(channel, 'Participant limit must be between 4 and 32.');
          return;
        }

        const tournament: TournamentData = {
          name,
          entryFee,
          maxParticipants,
          participants: [],
          matches: [],
          currentRound: 0,
          status: 'recruiting',
          prizePool: 0,
          startTime: Date.now()
        };

        await redis.set(`tournament:${channelName}`, JSON.stringify(tournament));
        await this.client.say(channel, 
          `🏆 Tournament "${name}" created! Entry fee: ${entryFee} points | ` +
          `Max participants: ${maxParticipants} | Type !join to enter!`
        );
        break;

      case 'start':
        await startTournament(channel, channelName);
        break;

      case 'status':
        await showStatus(channel, channelName);
        break;

      case 'cancel':
        if (!userstate.mod && !userstate.badges?.broadcaster) {
          await this.client.say(channel, 'Only moderators can cancel tournaments.');
          return;
        }
        await cancelTournament(channel, channelName);
        break;

      default:
        await this.client.say(channel, 
          'Tournament commands: !tournament create/start/status/cancel'
        );
    }
  } catch (error) {
    console.error('Error handling tournament command:', error);
    throw error;
  }
}

async function startTournament(channel: string, channelName: string): Promise<void> {
  const tournamentData = await redis.get(`tournament:${channelName}`);
  if (!tournamentData) {
    await this.client.say(channel, 'No active tournament found.');
    return;
  }

  const tournament: TournamentData = JSON.parse(tournamentData);
  if (tournament.status !== 'recruiting') {
    await this.client.say(channel, 'Tournament has already started.');
    return;
  }

  if (tournament.participants.length < 4) {
    await this.client.say(channel, 'Need at least 4 participants to start tournament.');
    return;
  }

  // Shuffle and seed participants
  tournament.participants = tournament.participants
    .map(p => ({ ...p, seed: Math.random() }))
    .sort((a, b) => a.seed - b.seed);

  // Create first round matches
  const matches = [];
  for (let i = 0; i < tournament.participants.length; i += 2) {
    if (i + 1 < tournament.participants.length) {
      matches.push({
        round: 1,
        player1: tournament.participants[i].username,
        player2: tournament.participants[i + 1].username
      });
    }
  }

  tournament.matches = matches;
  tournament.currentRound = 1;
  tournament.status = 'active';

  await redis.set(`tournament:${channelName}`, JSON.stringify(tournament));

  // Announce first round matches
  await this.client.say(channel, 
    `Tournament "${tournament.name}" begins! Round 1 matches:`
  );

  for (const match of matches) {
    await this.client.say(channel, 
      `${match.player1} vs ${match.player2}`
    );
  }
}

async function showStatus(channel: string, channelName: string): Promise<void> {
  const tournamentData = await redis.get(`tournament:${channelName}`);
  if (!tournamentData) {
    await this.client.say(channel, 'No active tournament found.');
    return;
  }

  const tournament: TournamentData = JSON.parse(tournamentData);

  if (tournament.status === 'recruiting') {
    await this.client.say(channel, 
      `Tournament "${tournament.name}" | ` +
      `Participants: ${tournament.participants.length}/${tournament.maxParticipants} | ` +
      `Entry fee: ${tournament.entryFee} | Prize pool: ${tournament.prizePool}`
    );
    return;
  }

  const currentMatches = tournament.matches
    .filter(m => !m.winner && m.round === tournament.currentRound)
    .map(m => `${m.player1} vs ${m.player2}`)
    .join(' | ');

  await this.client.say(channel, 
    `Tournament "${tournament.name}" | Round ${tournament.currentRound} | ` +
    `Remaining matches: ${currentMatches || 'None'}`
  );
}

async function cancelTournament(channel: string, channelName: string): Promise<void> {
  const tournamentData = await redis.get(`tournament:${channelName}`);
  if (!tournamentData) {
    await this.client.say(channel, 'No active tournament found.');
    return;
  }

  const tournament: TournamentData = JSON.parse(tournamentData);
  const loyaltyService = new LoyaltyService();

  // Refund entry fees
  for (const participant of tournament.participants) {
    await loyaltyService.addPoints({
      userId: channelName,
      channelId: channelName,
      targetUserId: participant.username.toLowerCase(),
      points: tournament.entryFee,
      reason: 'tournament_refund'
    });
  }

  await redis.del(`tournament:${channelName}`);
  await this.client.say(channel, 
    `Tournament "${tournament.name}" has been cancelled. All entry fees have been refunded.`
  );
} 