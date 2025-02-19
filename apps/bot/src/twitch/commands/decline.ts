import { ChatUserstate } from 'tmi.js';
import { handleDecline } from './duel';

export const name = 'decline';
export const cooldown = 5;
export const userLevel = 'everyone';

export async function execute(channel: string, userstate: ChatUserstate): Promise<void> {
  await handleDecline(channel, userstate);
} 