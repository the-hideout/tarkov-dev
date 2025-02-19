import { ChatUserstate } from 'tmi.js';
import { Redis } from 'ioredis';
import { config } from '../../config';

const redis = new Redis(config.redis.url);

export const name = 'poll';
export const aliases = ['vote'];
export const userLevel = 'moderator';

interface PollData {
  question: string;
  options: { [key: string]: string };
  votes: { [key: string]: string[] };
  duration: number;
  endTime: number;
  createdBy: string;
  pointsCost: number;
  allowMultipleVotes: boolean;
}

export async function execute(channel: string, userstate: ChatUserstate, args: string[]): Promise<void> {
  const channelName = channel.replace('#', '');
  const subcommand = args[0]?.toLowerCase();

  try {
    switch (subcommand) {
      case 'create':
      case 'start':
        if (args.length < 4) {
          await this.client.say(channel, 
            'Usage: !poll create "question" "option1,option2,..." <duration_minutes> [points_cost] [allow_multiple]'
          );
          return;
        }

        // Check if there's already an active poll
        const activePoll = await redis.get(`poll:${channelName}`);
        if (activePoll) {
          await this.client.say(channel, 'There is already an active poll. End it first with !poll end');
          return;
        }

        const question = args[1].replace(/^"|"$/g, '');
        const optionsArray = args[2].replace(/^"|"$/g, '').split(',');
        const duration = parseInt(args[3]);
        const pointsCost = parseInt(args[4]) || 0;
        const allowMultipleVotes = args[5]?.toLowerCase() === 'true';

        if (isNaN(duration) || duration < 1) {
          await this.client.say(channel, 'Duration must be a positive number of minutes.');
          return;
        }

        const options: { [key: string]: string } = {};
        optionsArray.forEach((opt, i) => {
          options[String.fromCharCode(65 + i)] = opt.trim(); // A, B, C, etc.
        });

        const poll: PollData = {
          question,
          options,
          votes: {},
          duration,
          endTime: Date.now() + (duration * 60 * 1000),
          createdBy: userstate.username!,
          pointsCost,
          allowMultipleVotes,
        };

        await redis.set(`poll:${channelName}`, JSON.stringify(poll));

        // Format poll message
        const optionsText = Object.entries(options)
          .map(([key, value]) => `${key}) ${value}`)
          .join(' | ');

        await this.client.say(channel, 
          `Poll started: "${question}" | ${optionsText} | Vote with !vote <letter> ` +
          `| Duration: ${duration}min${pointsCost > 0 ? ` | Cost: ${pointsCost} points` : ''}`
        );

        // Set timer to end poll
        setTimeout(async () => {
          await endPoll(channel, channelName);
        }, duration * 60 * 1000);
        break;

      case 'end':
        await endPoll(channel, channelName);
        break;

      case 'status':
        const currentPoll = await redis.get(`poll:${channelName}`);
        if (!currentPoll) {
          await this.client.say(channel, 'No active poll.');
          return;
        }

        const pollData: PollData = JSON.parse(currentPoll);
        const timeLeft = Math.ceil((pollData.endTime - Date.now()) / 60000);
        const results = getResults(pollData);

        await this.client.say(channel, 
          `Current poll: "${pollData.question}" | ${results} | ${timeLeft} minutes remaining`
        );
        break;

      default:
        await this.client.say(channel, 
          'Poll commands: !poll create/start "question" "options" duration [points_cost] [allow_multiple], !poll end, !poll status'
        );
    }
  } catch (error) {
    console.error('Error handling poll command:', error);
    throw error;
  }
}

function getResults(poll: PollData): string {
  return Object.entries(poll.options)
    .map(([key, value]) => {
      const votes = (poll.votes[key] || []).length;
      const total = Object.values(poll.votes).flat().length;
      const percentage = total > 0 ? Math.round((votes / total) * 100) : 0;
      return `${key}) ${value}: ${votes} (${percentage}%)`;
    })
    .join(' | ');
}

async function endPoll(channel: string, channelName: string): Promise<void> {
  const pollData = await redis.get(`poll:${channelName}`);
  if (!pollData) {
    await this.client.say(channel, 'No active poll to end.');
    return;
  }

  const poll: PollData = JSON.parse(pollData);
  const results = getResults(poll);

  await this.client.say(channel, 
    `Poll ended: "${poll.question}" | Results: ${results}`
  );

  await redis.del(`poll:${channelName}`);
} 