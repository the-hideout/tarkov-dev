import { Test, TestingModule } from '@nestjs/testing';
import { EftService } from './eft.service';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../../redis/redis.service';

describe('EftService', () => {
  let service: EftService;
  let configService: ConfigService;
  let redisService: RedisService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EftService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: RedisService,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<EftService>(EftService);
    configService = module.get<ConfigService>(ConfigService);
    redisService = module.get<RedisService>(RedisService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('handlePriceCommand', () => {
    it('should return cached result if available', async () => {
      const cachedResult = 'Cached price: 100,000 ₽';
      jest.spyOn(redisService, 'get').mockResolvedValue(cachedResult);

      const result = await service.handlePriceCommand('price', 'bitcoin');
      expect(result).toBe(cachedResult);
    });

    it('should handle market price command', async () => {
      jest.spyOn(redisService, 'get').mockResolvedValue(null);
      jest.spyOn(redisService, 'set').mockResolvedValue(undefined);

      const mockResponse = {
        data: {
          itemsByName: [{
            name: 'Bitcoin',
            avg24hPrice: 100000,
            changeLast48hPercent: 5.5,
          }],
        },
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await service.handlePriceCommand('price', 'bitcoin');
      expect(result).toContain('Bitcoin');
      expect(result).toContain('100K ₽');
      expect(result).toContain('📈');
    });

    it('should handle trader price command', async () => {
      jest.spyOn(redisService, 'get').mockResolvedValue(null);
      jest.spyOn(redisService, 'set').mockResolvedValue(undefined);

      const mockResponse = {
        data: {
          itemsByName: [{
            name: 'Bitcoin',
            traderPrices: [
              {
                name: 'Therapist',
                buyPrice: 90000,
                sellPrice: 110000,
              },
            ],
          }],
        },
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await service.handlePriceCommand('traderprice', 'bitcoin');
      expect(result).toContain('Bitcoin');
      expect(result).toContain('Therapist');
      expect(result).toContain('90K ₽');
      expect(result).toContain('110K ₽');
    });

    it('should handle errors gracefully', async () => {
      jest.spyOn(redisService, 'get').mockResolvedValue(null);
      global.fetch = jest.fn().mockRejectedValue(new Error('API Error'));

      const result = await service.handlePriceCommand('price', 'bitcoin');
      expect(result).toContain('error');
    });
  });
}); 