import { Client, ChatUserstate } from 'tmi.js';
import { LoyaltyService, TimerService } from '@marksoftbot/core';

export abstract class Command {
  public abstract name: string;
  public abstract aliases?: string[];
  public abstract userLevel: 'everyone' | 'subscriber' | 'vip' | 'moderator' | 'broadcaster';
  public abstract cooldown?: number;

  protected client: Client;
  protected loyaltyService: LoyaltyService;
  protected timerService: TimerService;

  constructor(
    client: Client,
    loyaltyService: LoyaltyService,
    timerService: TimerService
  ) {
    this.client = client;
    this.loyaltyService = loyaltyService;
    this.timerService = timerService;
  }

  abstract execute(channel: string, userstate: ChatUserstate, args: string[]): Promise<void>;
} 