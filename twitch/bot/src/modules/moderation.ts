import { Client } from 'tmi.js';
import { Logger } from '../utils/logger';
import { RedisService } from '../services/redis';
import { AIService } from '../services/ai';

interface ModerationConfig {
  maxCapsPercentage: number;
  maxMessageLength: number;
  spamThreshold: number;
  blacklistedWords: string[];
  blacklistedUrls: string[];
  toxicityThreshold: number;
}

export class ModerationModule {
  private client: Client;
  private logger: Logger;
  private redis: RedisService;
  private ai: AIService;
  private config: ModerationConfig;
  private userMessageCounts: Map<string, number>;
  private lastMessages: Map<string, string[]>;

  constructor(client: Client) {
    this.client = client;
    this.logger = new Logger('moderation');
    this.redis = new RedisService();
    this.ai = new AIService();
    this.userMessageCounts = new Map();
    this.lastMessages = new Map();

    // Default configuration
    this.config = {
      maxCapsPercentage: 70,
      maxMessageLength: 500,
      spamThreshold: 3,
      blacklistedWords: [],
      blacklistedUrls: [],
      toxicityThreshold: 0.8
    };

    this.loadConfig();
  }

  private async loadConfig(): Promise<void> {
    try {
      const config = await this.redis.get('moderation:config');
      if (config) {
        this.config = JSON.parse(config);
      }
    } catch (error) {
      this.logger.error('Failed to load moderation config:', error);
    }
  }

  public async handleMessage(channel: string, tags: any, message: string): Promise<void> {
    const username = tags['display-name'] || tags.username;
    
    // Check for excessive caps
    if (this.hasExcessiveCaps(message)) {
      await this.timeoutUser(channel, username, 300, 'Excessive caps');
      return;
    }

    // Check for spam
    if (this.isSpam(username, message)) {
      await this.timeoutUser(channel, username, 600, 'Spam detected');
      return;
    }

    // Check for blacklisted words
    if (this.containsBlacklistedWords(message)) {
      await this.timeoutUser(channel, username, 300, 'Blacklisted word detected');
      return;
    }

    // Check for blacklisted URLs
    if (this.containsBlacklistedUrls(message)) {
      await this.timeoutUser(channel, username, 300, 'Blacklisted URL detected');
      return;
    }

    // Check for toxicity using AI
    const toxicityResult = await this.ai.detectToxicity(message);
    if (toxicityResult.isToxic && toxicityResult.confidence >= this.config.toxicityThreshold) {
      const categories = Object.entries(toxicityResult.categories)
        .filter(([_, score]) => score >= this.config.toxicityThreshold)
        .map(([category]) => category)
        .join(', ');
      
      await this.timeoutUser(channel, username, 600, `Toxic content detected: ${categories}`);
      return;
    }

    // Update message history
    this.updateMessageHistory(username, message);
  }

  private hasExcessiveCaps(message: string): boolean {
    const capsCount = message.replace(/[^A-Z]/g, '').length;
    const totalChars = message.replace(/[^a-zA-Z]/g, '').length;
    if (totalChars === 0) return false;
    return (capsCount / totalChars) * 100 > this.config.maxCapsPercentage;
  }

  private isSpam(username: string, message: string): boolean {
    const messages = this.lastMessages.get(username) || [];
    const recentMessages = messages.slice(-this.config.spamThreshold);
    
    // Check for repeated messages
    if (recentMessages.length >= this.config.spamThreshold &&
        recentMessages.every(msg => msg === message)) {
      return true;
    }

    // Check message length
    if (message.length > this.config.maxMessageLength) {
      return true;
    }

    return false;
  }

  private containsBlacklistedWords(message: string): boolean {
    return this.config.blacklistedWords.some(word => 
      new RegExp(`\\b${word}\\b`, 'i').test(message)
    );
  }

  private containsBlacklistedUrls(message: string): boolean {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = message.match(urlRegex) || [];
    return urls.some(url => this.config.blacklistedUrls.includes(url));
  }

  private updateMessageHistory(username: string, message: string): void {
    const messages = this.lastMessages.get(username) || [];
    messages.push(message);
    if (messages.length > 10) {
      messages.shift();
    }
    this.lastMessages.set(username, messages);
  }

  private async timeoutUser(channel: string, username: string, duration: number, reason: string): Promise<void> {
    try {
      await this.client.timeout(channel, username, duration);
      this.logger.info(`Timed out ${username} for ${duration}s: ${reason}`);
    } catch (error) {
      this.logger.error(`Failed to timeout ${username}:`, error);
    }
  }
} 