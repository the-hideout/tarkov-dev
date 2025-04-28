const { Channel, Command, ModerationRule, Timer, NotificationRule, Role, ChannelCategory, ServerSettings, AutoModRule, WelcomeSettings } = require('../database/models');
const { publishConfigUpdate } = require('../utils/messageQueue');
const logger = require('../utils/logger');

// Discord Channel Management
exports.createDiscordChannel = async (req, res) => {
  try {
    const channel = await Channel.create({
      ...req.body,
      platform: 'discord'
    });
    await publishConfigUpdate('config.discord.channel.created', channel);
    res.status(201).json(channel);
  } catch (error) {
    logger.error('Create Discord channel error:', error);
    res.status(500).json({ error: 'Failed to create Discord channel' });
  }
};

exports.getDiscordChannels = async (req, res) => {
  try {
    const channels = await Channel.findAll({
      where: { platform: 'discord' }
    });
    res.json(channels);
  } catch (error) {
    logger.error('Get Discord channels error:', error);
    res.status(500).json({ error: 'Failed to get Discord channels' });
  }
};

// Discord Command Management
exports.createDiscordCommand = async (req, res) => {
  try {
    const command = await Command.create({
      ...req.body,
      platform: 'discord',
      ChannelId: req.params.channelId
    });
    await publishConfigUpdate('config.discord.command.created', command);
    res.status(201).json(command);
  } catch (error) {
    logger.error('Create Discord command error:', error);
    res.status(500).json({ error: 'Failed to create Discord command' });
  }
};

exports.getDiscordCommands = async (req, res) => {
  try {
    const commands = await Command.findAll({
      where: {
        ChannelId: req.params.channelId,
        platform: 'discord'
      }
    });
    res.json(commands);
  } catch (error) {
    logger.error('Get Discord commands error:', error);
    res.status(500).json({ error: 'Failed to get Discord commands' });
  }
};

// Discord Moderation Management
exports.createDiscordModerationRule = async (req, res) => {
  try {
    const rule = await ModerationRule.create({
      ...req.body,
      platform: 'discord',
      ChannelId: req.params.channelId
    });
    await publishConfigUpdate('config.discord.moderation.created', rule);
    res.status(201).json(rule);
  } catch (error) {
    logger.error('Create Discord moderation rule error:', error);
    res.status(500).json({ error: 'Failed to create Discord moderation rule' });
  }
};

exports.getDiscordModerationRules = async (req, res) => {
  try {
    const rules = await ModerationRule.findAll({
      where: {
        ChannelId: req.params.channelId,
        platform: 'discord'
      }
    });
    res.json(rules);
  } catch (error) {
    logger.error('Get Discord moderation rules error:', error);
    res.status(500).json({ error: 'Failed to get Discord moderation rules' });
  }
};

// Discord Timer Management
exports.createDiscordTimer = async (req, res) => {
  try {
    const timer = await Timer.create({
      ...req.body,
      platform: 'discord',
      ChannelId: req.params.channelId
    });
    await publishConfigUpdate('config.discord.timer.created', timer);
    res.status(201).json(timer);
  } catch (error) {
    logger.error('Create Discord timer error:', error);
    res.status(500).json({ error: 'Failed to create Discord timer' });
  }
};

exports.getDiscordTimers = async (req, res) => {
  try {
    const timers = await Timer.findAll({
      where: {
        ChannelId: req.params.channelId,
        platform: 'discord'
      }
    });
    res.json(timers);
  } catch (error) {
    logger.error('Get Discord timers error:', error);
    res.status(500).json({ error: 'Failed to get Discord timers' });
  }
};

// Discord Notification Management
exports.createDiscordNotificationRule = async (req, res) => {
  try {
    const rule = await NotificationRule.create({
      ...req.body,
      platform: 'discord',
      ChannelId: req.params.channelId
    });
    await publishConfigUpdate('config.discord.notification.created', rule);
    res.status(201).json(rule);
  } catch (error) {
    logger.error('Create Discord notification rule error:', error);
    res.status(500).json({ error: 'Failed to create Discord notification rule' });
  }
};

exports.getDiscordNotificationRules = async (req, res) => {
  try {
    const rules = await NotificationRule.findAll({
      where: {
        ChannelId: req.params.channelId,
        platform: 'discord'
      }
    });
    res.json(rules);
  } catch (error) {
    logger.error('Get Discord notification rules error:', error);
    res.status(500).json({ error: 'Failed to get Discord notification rules' });
  }
};

// Discord Role Management
exports.createRole = async (req, res) => {
  try {
    const role = await Role.create({
      ...req.body,
      channelId: req.params.channelId
    });
    await publishConfigUpdate('discord', 'role', 'create', role);
    res.status(201).json(role);
  } catch (error) {
    logger.error('Error creating role:', error);
    res.status(500).json({ error: 'Failed to create role' });
  }
};

exports.getRoles = async (req, res) => {
  try {
    const roles = await Role.findAll({
      where: { channelId: req.params.channelId }
    });
    res.json(roles);
  } catch (error) {
    logger.error('Error fetching roles:', error);
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
};

// Discord Channel Category Management
exports.createChannelCategory = async (req, res) => {
  try {
    const category = await ChannelCategory.create({
      ...req.body,
      channelId: req.params.channelId
    });
    await publishConfigUpdate('discord', 'category', 'create', category);
    res.status(201).json(category);
  } catch (error) {
    logger.error('Error creating channel category:', error);
    res.status(500).json({ error: 'Failed to create channel category' });
  }
};

exports.getChannelCategories = async (req, res) => {
  try {
    const categories = await ChannelCategory.findAll({
      where: { channelId: req.params.channelId }
    });
    res.json(categories);
  } catch (error) {
    logger.error('Error fetching channel categories:', error);
    res.status(500).json({ error: 'Failed to fetch channel categories' });
  }
};

// Discord Server Settings
exports.updateServerSettings = async (req, res) => {
  try {
    const [settings] = await ServerSettings.findOrCreate({
      where: { channelId: req.params.channelId },
      defaults: req.body
    });

    if (!settings.isNewRecord) {
      await settings.update(req.body);
    }

    await publishConfigUpdate('discord', 'server', 'update', settings);
    res.json(settings);
  } catch (error) {
    logger.error('Error updating server settings:', error);
    res.status(500).json({ error: 'Failed to update server settings' });
  }
};

// Discord AutoMod Rules
exports.createAutoModRule = async (req, res) => {
  try {
    const rule = await AutoModRule.create({
      ...req.body,
      channelId: req.params.channelId
    });
    await publishConfigUpdate('discord', 'automod', 'create', rule);
    res.status(201).json(rule);
  } catch (error) {
    logger.error('Error creating auto-moderation rule:', error);
    res.status(500).json({ error: 'Failed to create auto-moderation rule' });
  }
};

exports.getAutoModRules = async (req, res) => {
  try {
    const rules = await AutoModRule.findAll({
      where: { channelId: req.params.channelId }
    });
    res.json(rules);
  } catch (error) {
    logger.error('Error fetching auto-moderation rules:', error);
    res.status(500).json({ error: 'Failed to fetch auto-moderation rules' });
  }
};

// Discord Welcome Settings
exports.updateWelcomeSettings = async (req, res) => {
  try {
    const [settings] = await WelcomeSettings.findOrCreate({
      where: { channelId: req.params.channelId },
      defaults: req.body
    });

    if (!settings.isNewRecord) {
      await settings.update(req.body);
    }

    await publishConfigUpdate('discord', 'welcome', 'update', settings);
    res.json(settings);
  } catch (error) {
    logger.error('Error updating welcome settings:', error);
    res.status(500).json({ error: 'Failed to update welcome settings' });
  }
}; 