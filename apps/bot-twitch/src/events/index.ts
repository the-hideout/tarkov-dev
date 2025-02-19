import { Client } from 'tmi.js';
import { WebSocket } from 'ws';
import { CONFIG } from '@marksoftbot/config';

export class EventManager {
  private client: Client;
  private ws: WebSocket;

  constructor(client: Client) {
    this.client = client;
    this.setupWebSocket();
    this.setupEventListeners();
  }

  private setupWebSocket() {
    this.ws = new WebSocket(CONFIG.WS_URL);
    
    this.ws.on('open', () => {
      console.log('WebSocket connected');
    });

    this.ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  }

  private setupEventListeners() {
    // Handle follows
    this.client.on('follow', (channel, username) => {
      this.handleFollow(channel, username);
    });

    // Handle subscriptions
    this.client.on('subscription', (channel, username, method, message, userstate) => {
      this.handleSubscription(channel, username, method, message);
    });

    // Handle raids
    this.client.on('raided', (channel, username, viewers) => {
      this.handleRaid(channel, username, viewers);
    });
  }

  private async handleFollow(channel: string, username: string) {
    try {
      // Send follow event to WebSocket for real-time updates
      this.ws.send(JSON.stringify({
        type: 'FOLLOW',
        data: { channel, username }
      }));

      // Send message to chat
      await this.client.say(channel, `Thanks for following, ${username}! 🎉`);
    } catch (error) {
      console.error('Error handling follow:', error);
    }
  }

  private async handleSubscription(channel: string, username: string, method: any, message: string) {
    try {
      this.ws.send(JSON.stringify({
        type: 'SUBSCRIPTION',
        data: { channel, username, method, message }
      }));

      await this.client.say(channel, `Thank you for subscribing, ${username}! 💜`);
    } catch (error) {
      console.error('Error handling subscription:', error);
    }
  }

  private async handleRaid(channel: string, username: string, viewers: number) {
    try {
      this.ws.send(JSON.stringify({
        type: 'RAID',
        data: { channel, username, viewers }
      }));

      await this.client.say(channel, `Thanks for the raid, ${username} with ${viewers} viewers! 🎉`);
    } catch (error) {
      console.error('Error handling raid:', error);
    }
  }
} 