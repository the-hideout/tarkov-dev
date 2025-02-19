import { Client, ChatUserstate } from 'tmi.js';
import { LoyaltyService } from '@marksoftbot/core';

interface SubMethods {
  prime: boolean;
  plan: string;
  planName: string;
}

export class EventHandler {
  constructor(
    private client: Client,
    private loyaltyService: LoyaltyService
  ) {}

  public async handleMessage(channel: string, userstate: ChatUserstate, message: string): Promise<void> {
    const channelName = channel.replace('#', '');
    
    try {
      // Award points for chatting
      await this.loyaltyService.addPoints({
        userId: channelName,
        channelId: channelName,
        targetUserId: userstate.username!,
        points: 1,
        reason: 'chat_message'
      });

      // Handle bits if present
      if (userstate.bits) {
        await this.handleBits(channel, userstate, parseInt(userstate.bits));
      }
    } catch (error) {
      console.error('Error handling chat message:', error);
    }
  }

  public async handleJoin(channel: string, username: string): Promise<void> {
    const channelName = channel.replace('#', '');
    
    try {
      // Award points for watching
      await this.loyaltyService.addPoints({
        userId: channelName,
        channelId: channelName,
        targetUserId: username.toLowerCase(),
        points: 1,
        reason: 'channel_join'
      });
    } catch (error) {
      console.error('Error handling channel join:', error);
    }
  }

  public async handleRaid(channel: string, username: string, viewers: number): Promise<void> {
    const channelName = channel.replace('#', '');
    const pointsToAward = Math.min(viewers * 10, 5000); // Cap at 5000 points
    
    try {
      // Award points for raiding
      await this.loyaltyService.addPoints({
        userId: channelName,
        channelId: channelName,
        targetUserId: username.toLowerCase(),
        points: pointsToAward,
        reason: 'raid'
      });

      await this.client.say(channel, 
        `Thanks for the raid @${username} with ${viewers} viewers! You've earned ${pointsToAward} points!`
      );
    } catch (error) {
      console.error('Error handling raid:', error);
    }
  }

  public async handleBits(channel: string, userstate: ChatUserstate, bits: number): Promise<void> {
    const channelName = channel.replace('#', '');
    const pointsToAward = bits * 5; // 5 points per bit
    
    try {
      await this.loyaltyService.addPoints({
        userId: channelName,
        channelId: channelName,
        targetUserId: userstate.username!,
        points: pointsToAward,
        reason: 'bits'
      });

      await this.client.say(channel, 
        `Thanks for the ${bits} bits @${userstate.username}! You've earned ${pointsToAward} points!`
      );
    } catch (error) {
      console.error('Error handling bits:', error);
    }
  }

  public async handleSubscription(
    channel: string, 
    username: string, 
    methods: SubMethods, 
    message: string, 
    userstate: ChatUserstate
  ): Promise<void> {
    const channelName = channel.replace('#', '');
    const months = ~~userstate['msg-param-cumulative-months'] || 1;
    let points = 500; // Base points for sub
    
    try {
      // Bonus points for higher tiers
      if (methods.plan === '3000') points = 1500; // Tier 3
      else if (methods.plan === '2000') points = 1000; // Tier 2
      
      // Multiply by months for resubs
      const totalPoints = points * months;

      await this.loyaltyService.addPoints({
        userId: channelName,
        channelId: channelName,
        targetUserId: username.toLowerCase(),
        points: totalPoints,
        reason: 'subscription'
      });

      const tierName = methods.prime ? 'Prime' : `Tier ${methods.plan.charAt(0)}`;
      await this.client.say(channel, 
        `Thanks for the ${months} month${months > 1 ? 's' : ''} ${tierName} sub @${username}! ` +
        `You've earned ${totalPoints} points!`
      );
    } catch (error) {
      console.error('Error handling subscription:', error);
    }
  }

  public async handleGiftSub(
    channel: string,
    username: string,
    numbOfSubs: number,
    methods: SubMethods,
    userstate: ChatUserstate
  ): Promise<void> {
    const channelName = channel.replace('#', '');
    let pointsPerGift = 250; // Base points per gift
    
    try {
      // Bonus points for higher tiers
      if (methods.plan === '3000') pointsPerGift = 750;
      else if (methods.plan === '2000') pointsPerGift = 500;
      
      const totalPoints = pointsPerGift * numbOfSubs;

      await this.loyaltyService.addPoints({
        userId: channelName,
        channelId: channelName,
        targetUserId: username.toLowerCase(),
        points: totalPoints,
        reason: 'gift_sub'
      });

      await this.client.say(channel, 
        `Thanks for gifting ${numbOfSubs} ${methods.planName} subs @${username}! ` +
        `You've earned ${totalPoints} points!`
      );
    } catch (error) {
      console.error('Error handling gift sub:', error);
    }
  }

  public async handleFollow(channel: string, username: string): Promise<void> {
    const channelName = channel.replace('#', '');
    const pointsToAward = 100; // Points for following
    
    try {
      await this.loyaltyService.addPoints({
        userId: channelName,
        channelId: channelName,
        targetUserId: username.toLowerCase(),
        points: pointsToAward,
        reason: 'follow'
      });

      await this.client.say(channel, 
        `Thanks for the follow @${username}! You've earned ${pointsToAward} points!`
      );
    } catch (error) {
      console.error('Error handling follow:', error);
    }
  }

  public async handleHost(channel: string, username: string, viewers: number): Promise<void> {
    const channelName = channel.replace('#', '');
    const pointsToAward = Math.min(viewers * 5, 2500); // Cap at 2500 points
    
    try {
      await this.loyaltyService.addPoints({
        userId: channelName,
        channelId: channelName,
        targetUserId: username.toLowerCase(),
        points: pointsToAward,
        reason: 'host'
      });

      await this.client.say(channel, 
        `Thanks for the host @${username} with ${viewers} viewers! You've earned ${pointsToAward} points!`
      );
    } catch (error) {
      console.error('Error handling host:', error);
    }
  }
} 