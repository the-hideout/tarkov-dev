import { ChatUserstate } from 'tmi.js';
import { LoyaltyService } from '@marksoftbot/core';

export const name = 'points';
export const aliases = ['balance', 'bp'];
export const cooldown = 30;
export const userLevel = 'everyone';

export async function execute(channel: string, userstate: ChatUserstate, args: string[]): Promise<void> {
  const channelName = channel.replace('#', '');
  const loyaltyService = new LoyaltyService();

  try {
    const points = await loyaltyService.getPoints({
      userId: channelName,
      channelId: channelName,
      targetUserId: userstate['user-id']!
    });

    await this.client.say(channel, 
      `@${userstate.username} You have ${points.toLocaleString()} points!`
    );
  } catch (error) {
    console.error('Error fetching points:', error);
    throw error;
  }
} 