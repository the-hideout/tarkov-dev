const { Channel, Command, ModerationRule, Timer, NotificationRule } = require('../database/models');
const { publishConfigUpdate } = require('../utils/messageQueue');
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' })
  ]
});

// Channel controllers
exports.createChannel = async (req, res) => {
  try {
    const channel = await Channel.create(req.body);
    await publishConfigUpdate('config.channel.created', channel);
    res.status(201).json(channel);
  } catch (error) {
    logger.error('Create channel error:', error);
    res.status(500).json({ error: 'Failed to create channel' });
  }
};

exports.getChannels = async (req, res) => {
  try {
    const channels = await Channel.findAll();
    res.json(channels);
  } catch (error) {
    logger.error('Get channels error:', error);
    res.status(500).json({ error: 'Failed to get channels' });
  }
};

exports.getChannel = async (req, res) => {
  try {
    const channel = await Channel.findByPk(req.params.id);
    if (!channel) {
      return res.status(404).json({ error: 'Channel not found' });
    }
    res.json(channel);
  } catch (error) {
    logger.error('Get channel error:', error);
    res.status(500).json({ error: 'Failed to get channel' });
  }
};

exports.updateChannel = async (req, res) => {
  try {
    const channel = await Channel.findByPk(req.params.id);
    if (!channel) {
      return res.status(404).json({ error: 'Channel not found' });
    }
    await channel.update(req.body);
    await publishConfigUpdate('config.channel.updated', channel);
    res.json(channel);
  } catch (error) {
    logger.error('Update channel error:', error);
    res.status(500).json({ error: 'Failed to update channel' });
  }
};

exports.deleteChannel = async (req, res) => {
  try {
    const channel = await Channel.findByPk(req.params.id);
    if (!channel) {
      return res.status(404).json({ error: 'Channel not found' });
    }
    await channel.destroy();
    await publishConfigUpdate('config.channel.deleted', { id: req.params.id });
    res.json({ message: 'Channel deleted successfully' });
  } catch (error) {
    logger.error('Delete channel error:', error);
    res.status(500).json({ error: 'Failed to delete channel' });
  }
};

// Command controllers
exports.createCommand = async (req, res) => {
  try {
    const command = await Command.create({
      ...req.body,
      ChannelId: req.params.channelId
    });
    await publishConfigUpdate('config.command.created', command);
    res.status(201).json(command);
  } catch (error) {
    logger.error('Create command error:', error);
    res.status(500).json({ error: 'Failed to create command' });
  }
};

exports.getCommands = async (req, res) => {
  try {
    const commands = await Command.findAll({
      where: { ChannelId: req.params.channelId }
    });
    res.json(commands);
  } catch (error) {
    logger.error('Get commands error:', error);
    res.status(500).json({ error: 'Failed to get commands' });
  }
};

exports.getCommand = async (req, res) => {
  try {
    const command = await Command.findOne({
      where: {
        id: req.params.id,
        ChannelId: req.params.channelId
      }
    });
    if (!command) {
      return res.status(404).json({ error: 'Command not found' });
    }
    res.json(command);
  } catch (error) {
    logger.error('Get command error:', error);
    res.status(500).json({ error: 'Failed to get command' });
  }
};

exports.updateCommand = async (req, res) => {
  try {
    const command = await Command.findOne({
      where: {
        id: req.params.id,
        ChannelId: req.params.channelId
      }
    });
    if (!command) {
      return res.status(404).json({ error: 'Command not found' });
    }
    await command.update(req.body);
    await publishConfigUpdate('config.command.updated', command);
    res.json(command);
  } catch (error) {
    logger.error('Update command error:', error);
    res.status(500).json({ error: 'Failed to update command' });
  }
};

exports.deleteCommand = async (req, res) => {
  try {
    const command = await Command.findOne({
      where: {
        id: req.params.id,
        ChannelId: req.params.channelId
      }
    });
    if (!command) {
      return res.status(404).json({ error: 'Command not found' });
    }
    await command.destroy();
    await publishConfigUpdate('config.command.deleted', { id: req.params.id });
    res.json({ message: 'Command deleted successfully' });
  } catch (error) {
    logger.error('Delete command error:', error);
    res.status(500).json({ error: 'Failed to delete command' });
  }
};

// Similar implementations for ModerationRule, Timer, and NotificationRule controllers
// ... (omitted for brevity, but follow the same pattern as above) 