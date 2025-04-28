const { ChannelAnalytics, StreamAnalytics, ChatAnalytics, CommandAnalytics } = require('../database/models');
const logger = require('../utils/logger');

// Channel Analytics Controller
const getChannelAnalytics = async (req, res) => {
  try {
    const { channelId, startDate, endDate, platform } = req.query;
    
    const where = { channelId };
    if (platform) where.platform = platform;
    if (startDate && endDate) {
      where.date = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const analytics = await ChannelAnalytics.findAll({
      where,
      order: [['date', 'ASC']]
    });

    res.json(analytics);
  } catch (error) {
    logger.error('Error fetching channel analytics:', error);
    res.status(500).json({ error: 'Failed to fetch channel analytics' });
  }
};

// Stream Analytics Controller
const getStreamAnalytics = async (req, res) => {
  try {
    const { channelId, startDate, endDate } = req.query;
    
    const where = { channelId };
    if (startDate && endDate) {
      where.startTime = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const analytics = await StreamAnalytics.findAll({
      where,
      order: [['startTime', 'ASC']]
    });

    res.json(analytics);
  } catch (error) {
    logger.error('Error fetching stream analytics:', error);
    res.status(500).json({ error: 'Failed to fetch stream analytics' });
  }
};

// Chat Analytics Controller
const getChatAnalytics = async (req, res) => {
  try {
    const { channelId, startDate, endDate, platform } = req.query;
    
    const where = { channelId };
    if (platform) where.platform = platform;
    if (startDate && endDate) {
      where.timestamp = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const analytics = await ChatAnalytics.findAll({
      where,
      order: [['timestamp', 'ASC']]
    });

    res.json(analytics);
  } catch (error) {
    logger.error('Error fetching chat analytics:', error);
    res.status(500).json({ error: 'Failed to fetch chat analytics' });
  }
};

// Command Analytics Controller
const getCommandAnalytics = async (req, res) => {
  try {
    const { channelId, commandId, startDate, endDate } = req.query;
    
    const where = { channelId };
    if (commandId) where.commandId = commandId;
    if (startDate && endDate) {
      where.timestamp = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const analytics = await CommandAnalytics.findAll({
      where,
      order: [['timestamp', 'ASC']]
    });

    res.json(analytics);
  } catch (error) {
    logger.error('Error fetching command analytics:', error);
    res.status(500).json({ error: 'Failed to fetch command analytics' });
  }
};

// Process Analytics Events
const processAnalyticsEvent = async (event) => {
  try {
    const { type, data } = event;

    switch (type) {
      case 'channel_metrics':
        await ChannelAnalytics.create({
          channelId: data.channelId,
          platform: data.platform,
          date: new Date(),
          metrics: data.metrics
        });
        break;

      case 'stream_metrics':
        await StreamAnalytics.create({
          channelId: data.channelId,
          streamId: data.streamId,
          startTime: data.startTime,
          endTime: data.endTime,
          metrics: data.metrics
        });
        break;

      case 'chat_metrics':
        await ChatAnalytics.create({
          channelId: data.channelId,
          platform: data.platform,
          timestamp: new Date(),
          messageCount: data.messageCount,
          userCount: data.userCount,
          metrics: data.metrics
        });
        break;

      case 'command_metrics':
        await CommandAnalytics.create({
          channelId: data.channelId,
          commandId: data.commandId,
          timestamp: new Date(),
          usageCount: data.usageCount,
          metrics: data.metrics
        });
        break;

      default:
        logger.warn(`Unknown analytics event type: ${type}`);
    }
  } catch (error) {
    logger.error('Error processing analytics event:', error);
  }
};

module.exports = {
  getChannelAnalytics,
  getStreamAnalytics,
  getChatAnalytics,
  getCommandAnalytics,
  processAnalyticsEvent
}; 