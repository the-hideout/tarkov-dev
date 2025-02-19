import { ChatUserstate } from 'tmi.js';
import { handleAccept } from './duel';

export const name = 'accept';
export const cooldown = 5;
export const userLevel = 'everyone';

export async function execute(channel: string, userstate: ChatUserstate): Promise<void> {
  await handleAccept(channel, userstate);
} 