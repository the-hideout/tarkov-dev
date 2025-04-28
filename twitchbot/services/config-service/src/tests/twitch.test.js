const express = require('express');
const supertest = require('supertest');
const { sequelize } = require('../database/config');
const { Channel, ChannelPointReward, RaidSettings, StreamSettings, ChatSettings, EmoteSet } = require('../database/models');
const { publishConfigUpdate } = require('../utils/messageQueue');
const logger = require('../utils/logger');

// Mock message queue
jest.mock('../utils/messageQueue', () => ({
  publishConfigUpdate: jest.fn()
}));

// Mock logger
jest.mock('../utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn()
}));

const app = express();
app.use(express.json());

// Import and use routes
const twitchRoutes = require('../routes/twitch');
app.use('/api/config/twitch', twitchRoutes);

describe('Twitch Controller', () => {
  let channelId;

  beforeAll(async () => {
    // Sync database
    await sequelize.sync({ force: true });
    
    // Create test channel
    const channel = await Channel.create({
      platform: 'twitch',
      name: 'test_channel',
      isEnabled: true
    });
    channelId = channel.id;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('Channel Point Rewards', () => {
    it('should create a channel point reward', async () => {
      const rewardData = {
        title: 'Test Reward',
        cost: 100,
        prompt: 'Test prompt',
        isEnabled: true,
        isPaused: false,
        isInStock: true,
        maxPerStream: 10,
        maxPerUserPerStream: 1,
        globalCooldown: 300
      };

      const response = await supertest(app)
        .post(`/api/config/twitch/channels/${channelId}/rewards`)
        .send(rewardData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe(rewardData.title);
      expect(publishConfigUpdate).toHaveBeenCalled();
    });

    it('should get channel point rewards', async () => {
      const response = await supertest(app)
        .get(`/api/config/twitch/channels/${channelId}/rewards`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('Raid Settings', () => {
    it('should update raid settings', async () => {
      const raidSettings = {
        raidMessage: 'Test raid message',
        raidDelay: 30,
        raidCooldown: 3600,
        raidMinViewers: 5
      };

      const response = await supertest(app)
        .put(`/api/config/twitch/channels/${channelId}/raid-settings`)
        .send(raidSettings)
        .expect(200);

      expect(response.body.raidMessage).toBe(raidSettings.raidMessage);
      expect(publishConfigUpdate).toHaveBeenCalled();
    });
  });

  describe('Stream Settings', () => {
    it('should update stream settings', async () => {
      const streamSettings = {
        title: 'Test Stream',
        game: 'Just Chatting',
        language: 'en',
        tags: ['test', 'stream'],
        isMature: false
      };

      const response = await supertest(app)
        .put(`/api/config/twitch/channels/${channelId}/stream-settings`)
        .send(streamSettings)
        .expect(200);

      expect(response.body.title).toBe(streamSettings.title);
      expect(publishConfigUpdate).toHaveBeenCalled();
    });
  });

  describe('Chat Settings', () => {
    it('should update chat settings', async () => {
      const chatSettings = {
        slowMode: 5,
        followerOnly: true,
        subscriberOnly: false,
        emoteOnly: false,
        uniqueChat: true
      };

      const response = await supertest(app)
        .put(`/api/config/twitch/channels/${channelId}/chat-settings`)
        .send(chatSettings)
        .expect(200);

      expect(response.body.slowMode).toBe(chatSettings.slowMode);
      expect(publishConfigUpdate).toHaveBeenCalled();
    });
  });

  describe('Emote Sets', () => {
    it('should create an emote set', async () => {
      const emoteSet = {
        name: 'Test Emotes',
        emotes: ['Kappa', 'PogChamp']
      };

      const response = await supertest(app)
        .post(`/api/config/twitch/channels/${channelId}/emote-sets`)
        .send(emoteSet)
        .expect(201);

      expect(response.body.name).toBe(emoteSet.name);
      expect(publishConfigUpdate).toHaveBeenCalled();
    });

    it('should get emote sets', async () => {
      const response = await supertest(app)
        .get(`/api/config/twitch/channels/${channelId}/emote-sets`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });
}); 