import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../../redis/redis.service';

interface PriceData {
  name: string;
  avg24hPrice: number;
  changeLast48hPercent: number;
  traderPrices: {
    name: string;
    buyPrice: number;
    sellPrice: number;
  }[];
}

@Injectable()
export class EftService {
  private readonly API_URL = 'https://api.tarkov.dev/graphql';
  private readonly CACHE_TTL = 300; // 5 minutes

  constructor(
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {}

  async handlePriceCommand(command: string, itemName: string): Promise<string> {
    try {
      const cacheKey = `eft:${command}:${itemName.toLowerCase()}`;
      const cachedResult = await this.redisService.get(cacheKey);
      
      if (cachedResult) {
        return cachedResult;
      }

      let result: string;
      switch (command) {
        case 'price':
          result = await this.getMarketPrice(itemName);
          break;
        case 'traderprice':
          result = await this.getTraderPrices(itemName);
          break;
        case 'pricehistory':
          result = await this.getPriceHistory(itemName);
          break;
        case 'supply':
          result = await this.getSupplyStats(itemName);
          break;
        default:
          result = 'Unknown command. Use !price, !traderprice, !pricehistory, or !supply';
      }

      await this.redisService.set(cacheKey, result, this.CACHE_TTL);
      return result;
    } catch (error) {
      console.error('Error handling EFT command:', error);
      return 'Sorry, there was an error fetching the data. Please try again later.';
    }
  }

  private async getMarketPrice(itemName: string): Promise<string> {
    const query = `
      query ($name: String!) {
        itemsByName(name: $name) {
          name
          avg24hPrice
          changeLast48hPercent
        }
      }
    `;

    const response = await this.makeGraphQLRequest(query, { name: itemName });
    const item = response.data.itemsByName[0];

    if (!item) {
      return `No item found with name "${itemName}"`;
    }

    const price = this.formatPrice(item.avg24hPrice);
    const change = item.changeLast48hPercent.toFixed(2);
    const changeEmoji = item.changeLast48hPercent >= 0 ? '📈' : '📉';

    return `${item.name}: ${price} (${changeEmoji} ${change}% in 48h)`;
  }

  private async getTraderPrices(itemName: string): Promise<string> {
    const query = `
      query ($name: String!) {
        itemsByName(name: $name) {
          name
          traderPrices {
            name
            buyPrice
            sellPrice
          }
        }
      }
    `;

    const response = await this.makeGraphQLRequest(query, { name: itemName });
    const item = response.data.itemsByName[0];

    if (!item) {
      return `No item found with name "${itemName}"`;
    }

    const traderPrices = item.traderPrices
      .map(trader => {
        const buyPrice = this.formatPrice(trader.buyPrice);
        const sellPrice = this.formatPrice(trader.sellPrice);
        return `${trader.name}: Buy ${buyPrice} | Sell ${sellPrice}`;
      })
      .join('\n');

    return `${item.name} Trader Prices:\n${traderPrices}`;
  }

  private async getPriceHistory(itemName: string): Promise<string> {
    const query = `
      query ($name: String!) {
        itemsByName(name: $name) {
          name
          avg24hPrice
          changeLast48hPercent
          historicalPrices {
            price
            timestamp
          }
        }
      }
    `;

    const response = await this.makeGraphQLRequest(query, { name: itemName });
    const item = response.data.itemsByName[0];

    if (!item) {
      return `No item found with name "${itemName}"`;
    }

    const currentPrice = this.formatPrice(item.avg24hPrice);
    const weekAgoPrice = this.formatPrice(
      item.historicalPrices[item.historicalPrices.length - 1].price,
    );

    return `${item.name} Price History:\nCurrent: ${currentPrice}\nWeek Ago: ${weekAgoPrice}`;
  }

  private async getSupplyStats(itemName: string): Promise<string> {
    const query = `
      query ($name: String!) {
        itemsByName(name: $name) {
          name
          avg24hPrice
          listings {
            price
            quantity
          }
        }
      }
    `;

    const response = await this.makeGraphQLRequest(query, { name: itemName });
    const item = response.data.itemsByName[0];

    if (!item) {
      return `No item found with name "${itemName}"`;
    }

    const totalListings = item.listings.length;
    const avgStackSize = Math.round(
      item.listings.reduce((sum, listing) => sum + listing.quantity, 0) /
        totalListings,
    );

    return `${item.name} Supply Stats:\nListings: ${totalListings}\nAvg Stack Size: ${avgStackSize}`;
  }

  private async makeGraphQLRequest(query: string, variables: any) {
    const response = await fetch(this.API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    if (!response.ok) {
      throw new Error(`GraphQL request failed: ${response.statusText}`);
    }

    return response.json();
  }

  private formatPrice(price: number): string {
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(2)}M ₽`;
    } else if (price >= 1000) {
      return `${(price / 1000).toFixed(2)}K ₽`;
    }
    return `${price} ₽`;
  }
} 