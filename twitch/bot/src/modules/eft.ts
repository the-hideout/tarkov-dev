import { Client } from 'tmi.js';
import { Logger } from '../utils/logger';
import { RedisService } from '../services/redis';
import { GraphQLClient } from 'graphql-request';

interface EFTItem {
  name: string;
  avg24hPrice: number;
  changeLast48hPercent: number;
  lastLowPrice: number;
  traderPrices: {
    name: string;
    price: number;
    currency: string;
  }[];
}

export class EFTModule {
  private client: Client;
  private logger: Logger;
  private redis: RedisService;
  private graphqlClient: GraphQLClient;

  constructor(client: Client) {
    this.client = client;
    this.logger = new Logger('eft');
    this.redis = new RedisService();
    this.graphqlClient = new GraphQLClient(process.env.TARKOV_API_URL || 'https://api.tarkov.dev/graphql');
  }

  public async handleMessage(channel: string, tags: any, message: string): Promise<void> {
    if (!message.startsWith('!')) return;

    const [command, ...args] = message.slice(1).split(' ');
    const itemName = args.join(' ');

    switch (command.toLowerCase()) {
      case 'price':
        await this.handlePriceQuery(channel, itemName);
        break;
      case 'traderprice':
        await this.handleTraderPriceQuery(channel, itemName);
        break;
      case 'pricehistory':
        await this.handlePriceHistoryQuery(channel, itemName);
        break;
      case 'supply':
        await this.handleSupplyQuery(channel, itemName);
        break;
    }
  }

  private async handlePriceQuery(channel: string, itemName: string): Promise<void> {
    try {
      const item = await this.getCachedItem(itemName);
      if (!item) {
        await this.client.say(channel, `Item "${itemName}" not found.`);
        return;
      }

      const response = `Current price for ${item.name}: ${this.formatPrice(item.avg24hPrice)} ₽ (${item.changeLast48hPercent > 0 ? '+' : ''}${item.changeLast48hPercent.toFixed(2)}% change in 48h)`;
      await this.client.say(channel, response);
    } catch (error) {
      this.logger.error('Error handling price query:', error);
      await this.client.say(channel, 'Error fetching price data. Please try again later.');
    }
  }

  private async handleTraderPriceQuery(channel: string, itemName: string): Promise<void> {
    try {
      const item = await this.getCachedItem(itemName);
      if (!item) {
        await this.client.say(channel, `Item "${itemName}" not found.`);
        return;
      }

      const traderPrices = item.traderPrices
        .map(tp => `${tp.name}: ${this.formatPrice(tp.price)} ${tp.currency}`)
        .join(' | ');

      const response = `Trader prices for ${item.name}: ${traderPrices}`;
      await this.client.say(channel, response);
    } catch (error) {
      this.logger.error('Error handling trader price query:', error);
      await this.client.say(channel, 'Error fetching trader price data. Please try again later.');
    }
  }

  private async handlePriceHistoryQuery(channel: string, itemName: string): Promise<void> {
    try {
      const item = await this.getCachedItem(itemName);
      if (!item) {
        await this.client.say(channel, `Item "${itemName}" not found.`);
        return;
      }

      const response = `Price history for ${item.name}: Current: ${this.formatPrice(item.avg24hPrice)} ₽ | 48h Change: ${item.changeLast48hPercent > 0 ? '+' : ''}${item.changeLast48hPercent.toFixed(2)}%`;
      await this.client.say(channel, response);
    } catch (error) {
      this.logger.error('Error handling price history query:', error);
      await this.client.say(channel, 'Error fetching price history. Please try again later.');
    }
  }

  private async handleSupplyQuery(channel: string, itemName: string): Promise<void> {
    try {
      const item = await this.getCachedItem(itemName);
      if (!item) {
        await this.client.say(channel, `Item "${itemName}" not found.`);
        return;
      }

      const response = `Supply info for ${item.name}: Current price: ${this.formatPrice(item.avg24hPrice)} ₽ | Last low price: ${this.formatPrice(item.lastLowPrice)} ₽`;
      await this.client.say(channel, response);
    } catch (error) {
      this.logger.error('Error handling supply query:', error);
      await this.client.say(channel, 'Error fetching supply data. Please try again later.');
    }
  }

  private async getCachedItem(itemName: string): Promise<EFTItem | null> {
    const cacheKey = `eft:item:${itemName.toLowerCase()}`;
    
    // Try to get from cache first
    const cachedItem = await this.redis.get(cacheKey);
    if (cachedItem) {
      return JSON.parse(cachedItem);
    }

    // If not in cache, fetch from API
    const query = `
      query ($itemName: String!) {
        itemsByName(name: $itemName) {
          name
          avg24hPrice
          changeLast48hPercent
          lastLowPrice
          traderPrices {
            name
            price
            currency
          }
        }
      }
    `;

    const data = await this.graphqlClient.request(query, { itemName });
    const item = data.itemsByName[0];

    if (item) {
      // Cache the result for 5 minutes
      await this.redis.set(cacheKey, JSON.stringify(item), 300);
    }

    return item || null;
  }

  private formatPrice(price: number): string {
    return new Intl.NumberFormat('ru-RU').format(Math.round(price));
  }
} 