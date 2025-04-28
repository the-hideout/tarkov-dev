const express = require('express');
const supertest = require('supertest');
const { sequelize } = require('../database/config');
const { Channel, Role, ChannelCategory, ServerSettings, AutoModRule, WelcomeSettings } = require('../database/models');
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
const discordRoutes = require('../routes/discord');
app.use('/api/config/discord', discordRoutes);

describe('Discord Controller', () => {
  let channelId;

  beforeAll(async () => {
    // Sync database
    await sequelize.sync({ force: true });
    
    // Create test channel
    const channel = await Channel.create({
      platform: 'discord',
      name: 'test_server',
      isEnabled: true
    });
    channelId = channel.id;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('Role Management', () => {
    it('should create a role', async () => {
      const roleData = {
        name: 'Test Role',
        color: '#FF0000',
        permissions: ['SEND_MESSAGES', 'VIEW_CHANNEL'],
        position: 1,
        isMentionable: true,
        isHoisted: false
      };

      const response = await supertest(app)
        .post(`/api/config/discord/channels/${channelId}/roles`)
        .send(roleData)
        .expect(201);

      expect(response.body.name).toBe(roleData.name);
      expect(publishConfigUpdate).toHaveBeenCalled();
    });

    it('should get roles', async () => {
      const response = await supertest(app)
        .get(`/api/config/discord/channels/${channelId}/roles`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('Channel Categories', () => {
    it('should create a channel category', async () => {
      const categoryData = {
        name: 'Test Category',
        position: 1,
        permissions: {
          everyone: ['VIEW_CHANNEL'],
          roles: {
            '123456789': ['SEND_MESSAGES']
          }
        }
      };

      const response = await supertest(app)
        .post(`/api/config/discord/channels/${channelId}/categories`)
        .send(categoryData)
        .expect(201);

      expect(response.body.name).toBe(categoryData.name);
      expect(publishConfigUpdate).toHaveBeenCalled();
    });

    it('should get channel categories', async () => {
      const response = await supertest(app)
        .get(`/api/config/discord/channels/${channelId}/categories`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('Server Settings', () => {
    it('should update server settings', async () => {
      const settingsData = {
        name: 'Test Server',
        icon: 'https://example.com/icon.png',
        banner: 'https://example.com/banner.png',
        description: 'Test server description',
        features: ['COMMUNITY', 'NEWS'],
        verificationLevel: 'MEDIUM',
        explicitContentFilter: 'ALL_MEMBERS'
      };

      const response = await supertest(app)
        .put(`/api/config/discord/channels/${channelId}/server-settings`)
        .send(settingsData)
        .expect(200);

      expect(response.body.name).toBe(settingsData.name);
      expect(publishConfigUpdate).toHaveBeenCalled();
    });
  });

  describe('AutoMod Rules', () => {
    it('should create an auto-mod rule', async () => {
      const ruleData = {
        name: 'Test Rule',
        eventType: 'MESSAGE_SEND',
        triggerType: 'KEYWORD',
        triggerMetadata: {
          keywordFilter: ['badword1', 'badword2']
        },
        actions: [
          {
            type: 'BLOCK_MESSAGE',
            metadata: {
              customMessage: 'Message blocked'
            }
          }
        ],
        enabled: true
      };

      const response = await supertest(app)
        .post(`/api/config/discord/channels/${channelId}/auto-mod-rules`)
        .send(ruleData)
        .expect(201);

      expect(response.body.name).toBe(ruleData.name);
      expect(publishConfigUpdate).toHaveBeenCalled();
    });

    it('should get auto-mod rules', async () => {
      const response = await supertest(app)
        .get(`/api/config/discord/channels/${channelId}/auto-mod-rules`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('Welcome Settings', () => {
    it('should update welcome settings', async () => {
      const welcomeData = {
        channelId: '123456789',
        message: 'Welcome to the server!',
        embed: {
          title: 'Welcome',
          description: 'We are glad to have you here!',
          color: '#00FF00'
        },
        roles: ['987654321']
      };

      const response = await supertest(app)
        .put(`/api/config/discord/channels/${channelId}/welcome-settings`)
        .send(welcomeData)
        .expect(200);

      expect(response.body.message).toBe(welcomeData.message);
      expect(publishConfigUpdate).toHaveBeenCalled();
    });
  });
}); 