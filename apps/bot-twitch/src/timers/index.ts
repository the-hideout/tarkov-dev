import { Client } from 'tmi.js';
import { User } from '@marksoftbot/database';

export class TimerManager {
  private client: Client;
  private timers: Map<string, NodeJS.Timeout>;

  constructor(client: Client) {
    this.client = client;
    this.timers = new Map();
    this.initializeTimers();
  }

  private async initializeTimers() {
    try {
      const users = await User.find({ 'integrations.twitch.channels': { $exists: true } });
      
      for (const user of users) {
        for (const channel of user.integrations.twitch.channels) {
          for (const timer of channel.settings.timers) {
            if (timer.enabled) {
              this.startTimer(channel.name, timer);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error initializing timers:', error);
    }
  }

  private startTimer(channel: string, timer: any) {
    const timerKey = `${channel}-${timer.name}`;
    
    if (this.timers.has(timerKey)) {
      clearInterval(this.timers.get(timerKey));
    }

    const interval = setInterval(async () => {
      try {
        await this.client.say(`#${channel}`, timer.message);
      } catch (error) {
        console.error(`Error sending timer message for ${timerKey}:`, error);
      }
    }, timer.interval * 1000);

    this.timers.set(timerKey, interval);
  }

  public stopTimer(channel: string, timerName: string) {
    const timerKey = `${channel}-${timerName}`;
    if (this.timers.has(timerKey)) {
      clearInterval(this.timers.get(timerKey));
      this.timers.delete(timerKey);
    }
  }
} 