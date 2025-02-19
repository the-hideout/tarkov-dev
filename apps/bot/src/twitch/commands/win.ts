import { ChatUserstate } from 'tmi.js';
import { Redis } from 'ioredis';
import { LoyaltyService } from '@marksoftbot/core';
import { config } from '../../config';

const redis = new Redis(config.redis.url);

export const name = 'win';
export const cooldown = 5;
export const userLevel = 'moderator';

export async function execute(channel: string, userstate: ChatUserstate, args: string[]): Promise<void> {
  const channelName = channel.replace('#', '');

  try {
    if (args.length < 1) {
      await this.client.say(channel, 'Usage: !win <username>');
      return;
    }

    const winner = args[0].replace('@', '').toLowerCase();
    const tournamentData = await redis.get(`tournament:${channelName}`);
    
    if (!tournamentData) {
      await this.client.say(channel, 'No active tournament found.');
      return;
    }

    const tournament = JSON.parse(tournamentData);
    if (tournament.status !== 'active') {
      await this.client.say(channel, 'Tournament is not in progress.');
      return;
    }

    // Find current match with winner
    const match = tournament.matches.find(m => 
      !m.winner && 
      m.round === tournament.currentRound && 
      (m.player1.toLowerCase() === winner || m.player2.toLowerCase() === winner)
    );

    if (!match) {
      await this.client.say(channel, `No active match found with ${winner}.`);
      return;
    }

    match.winner = winner;
    const loser = match.player1.toLowerCase() === winner ? match.player2 : match.player1;

    // Mark loser as eliminated
    const loserParticipant = tournament.participants.find(p => 
      p.username.toLowerCase() === loser.toLowerCase()
    );
    if (loserParticipant) {
      loserParticipant.eliminated = true;
    }

    // Check if round is complete
    const roundComplete = tournament.matches.every(m => 
      m.round !== tournament.currentRound || m.winner
    );

    if (roundComplete) {
      // Create next round matches
      const winners = tournament.matches
        .filter(m => m.round === tournament.currentRound)
        .map(m => m.winner!);

      if (winners.length === 1) {
        // Tournament complete
        await endTournament(channel, channelName, winners[0]);
      } else {
        // Create next round
        const nextRound = tournament.currentRound + 1;
        const newMatches = [];

        for (let i = 0; i < winners.length; i += 2) {
          if (i + 1 < winners.length) {
            newMatches.push({
              round: nextRound,
              player1: winners[i],
              player2: winners[i + 1]
            });
          }
        }

        tournament.matches.push(...newMatches);
        tournament.currentRound = nextRound;

        await redis.set(`tournament:${channelName}`, JSON.stringify(tournament));

        // Announce next round
        await this.client.say(channel, 
          `Round ${tournament.currentRound - 1} complete! Round ${nextRound} matches:`
        );

        for (const match of newMatches) {
          await this.client.say(channel, 
            `${match.player1} vs ${match.player2}`
          );
        }
      }
    } else {
      await redis.set(`tournament:${channelName}`, JSON.stringify(tournament));
      await this.client.say(channel, 
        `${winner} has won their match against ${loser}!`
      );
    }

  } catch (error) {
    console.error('Error handling win command:', error);
    throw error;
  }
}

async function endTournament(channel: string, channelName: string, winner: string): Promise<void> {
  const tournamentData = await redis.get(`tournament:${channelName}`);
  if (!tournamentData) return;

  const tournament = JSON.parse(tournamentData);
  const loyaltyService = new LoyaltyService();

  // Calculate prizes
  const firstPlace = Math.floor(tournament.prizePool * 0.6); // 60% to winner
  const secondPlace = Math.floor(tournament.prizePool * 0.3); // 30% to runner-up
  const thirdPlace = tournament.prizePool - firstPlace - secondPlace; // Remainder to third

  // Find runner-up and third place
  const finalMatch = tournament.matches.find(m => 
    m.round === tournament.currentRound && m.winner === winner
  )!;
  const runnerUp = finalMatch.player1 === winner ? finalMatch.player2 : finalMatch.player1;

  const semiFinals = tournament.matches.filter(m => 
    m.round === tournament.currentRound - 1 && m.winner !== winner && m.winner !== runnerUp
  );
  const thirdPlaceWinner = semiFinals[0]?.winner;

  // Award prizes
  await loyaltyService.addPoints({
    userId: channelName,
    channelId: channelName,
    targetUserId: winner.toLowerCase(),
    points: firstPlace,
    reason: 'tournament_win'
  });

  await loyaltyService.addPoints({
    userId: channelName,
    channelId: channelName,
    targetUserId: runnerUp.toLowerCase(),
    points: secondPlace,
    reason: 'tournament_second'
  });

  if (thirdPlaceWinner) {
    await loyaltyService.addPoints({
      userId: channelName,
      channelId: channelName,
      targetUserId: thirdPlaceWinner.toLowerCase(),
      points: thirdPlace,
      reason: 'tournament_third'
    });
  }

  // Announce results
  await this.client.say(channel, 
    `🏆 Tournament "${tournament.name}" has ended!\n` +
    `1st Place: ${winner} (${firstPlace} points)\n` +
    `2nd Place: ${runnerUp} (${secondPlace} points)` +
    (thirdPlaceWinner ? `\n3rd Place: ${thirdPlaceWinner} (${thirdPlace} points)` : '')
  );

  tournament.status = 'ended';
  await redis.del(`tournament:${channelName}`);
} 