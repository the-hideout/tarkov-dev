const { Channel, Command, ModerationRule, Timer, NotificationRule, ChannelPointReward, RaidSettings, StreamSettings, ChatSettings, EmoteSet } = require('../database/models');
const { publishConfigUpdate } = require('../utils/messageQueue');
const logger = require('../utils/logger');

// Twitch Channel Management
exports.createTwitchChannel = async (req, res) => {
  try {
    const channel = await Channel.create({
      ...req.body,
      platform: 'twitch'
    });
    await publishConfigUpdate('config.twitch.channel.created', channel);
    res.status(201).json(channel);
  } catch (error) {
    logger.error('Create Twitch channel error:', error);
    res.status(500).json({ error: 'Failed to create Twitch channel' });
  }
};

exports.getTwitchChannels = async (req, res) => {
  try {
    const channels = await Channel.findAll({
      where: { platform: 'twitch' }
    });
    res.json(channels);
  } catch (error) {
    logger.error('Get Twitch channels error:', error);
    res.status(500).json({ error: 'Failed to get Twitch channels' });
  }
};

// Twitch Command Management
exports.createTwitchCommand = async (req, res) => {
  try {
    const command = await Command.create({
      ...req.body,
      platform: 'twitch',
      ChannelId: req.params.channelId
    });
    await publishConfigUpdate('config.twitch.command.created', command);
    res.status(201).json(command);
  } catch (error) {
    logger.error('Create Twitch command error:', error);
    res.status(500).json({ error: 'Failed to create Twitch command' });
  }
};

exports.getTwitchCommands = async (req, res) => {
  try {
    const commands = await Command.findAll({
      where: {
        ChannelId: req.params.channelId,
        platform: 'twitch'
      }
    });
    res.json(commands);
  } catch (error) {
    logger.error('Get Twitch commands error:', error);
    res.status(500).json({ error: 'Failed to get Twitch commands' });
  }
};

// Twitch Moderation Management
exports.createTwitchModerationRule = async (req, res) => {
  try {
    const rule = await ModerationRule.create({
      ...req.body,
      platform: 'twitch',
      ChannelId: req.params.channelId
    });
    await publishConfigUpdate('config.twitch.moderation.created', rule);
    res.status(201).json(rule);
  } catch (error) {
    logger.error('Create Twitch moderation rule error:', error);
    res.status(500).json({ error: 'Failed to create Twitch moderation rule' });
  }
};

exports.getTwitchModerationRules = async (req, res) => {
  try {
    const rules = await ModerationRule.findAll({
      where: {
        ChannelId: req.params.channelId,
        platform: 'twitch'
      }
    });
    res.json(rules);
  } catch (error) {
    logger.error('Get Twitch moderation rules error:', error);
    res.status(500).json({ error: 'Failed to get Twitch moderation rules' });
  }
};

// Twitch Timer Management
exports.createTwitchTimer = async (req, res) => {
  try {
    const timer = await Timer.create({
      ...req.body,
      platform: 'twitch',
      ChannelId: req.params.channelId
    });
    await publishConfigUpdate('config.twitch.timer.created', timer);
    res.status(201).json(timer);
  } catch (error) {
    logger.error('Create Twitch timer error:', error);
    res.status(500).json({ error: 'Failed to create Twitch timer' });
  }
};

exports.getTwitchTimers = async (req, res) => {
  try {
    const timers = await Timer.findAll({
      where: {
        ChannelId: req.params.channelId,
        platform: 'twitch'
      }
    });
    res.json(timers);
  } catch (error) {
    logger.error('Get Twitch timers error:', error);
    res.status(500).json({ error: 'Failed to get Twitch timers' });
  }
};

// Twitch Notification Management
exports.createTwitchNotificationRule = async (req, res) => {
  try {
    const rule = await NotificationRule.create({
      ...req.body,
      platform: 'twitch',
      ChannelId: req.params.channelId
    });
    await publishConfigUpdate('config.twitch.notification.created', rule);
    res.status(201).json(rule);
  } catch (error) {
    logger.error('Create Twitch notification rule error:', error);
    res.status(500).json({ error: 'Failed to create Twitch notification rule' });
  }
};

exports.getTwitchNotificationRules = async (req, res) => {
  try {
    const rules = await NotificationRule.findAll({
      where: {
        ChannelId: req.params.channelId,
        platform: 'twitch'
      }
    });
    res.json(rules);
  } catch (error) {
    logger.error('Get Twitch notification rules error:', error);
    res.status(500).json({ error: 'Failed to get Twitch notification rules' });
  }
};

// Channel Point Rewards
class TwitchController {
  async createReward(req, res) {
    try {
      const reward = await ChannelPointReward.create({
        ...req.body,
        channelId: req.params.channelId
      });
      await publishConfigUpdate('twitch', 'reward', 'create', reward);
      res.status(201).json(reward);
    } catch (error) {
      logger.error('Error creating reward:', error);
      res.status(500).json({ error: 'Failed to create reward' });
    }
  }

  async getRewards(req, res) {
    try {
      const rewards = await ChannelPointReward.findAll({
        where: { channelId: req.params.channelId }
      });
      res.json(rewards);
    } catch (error) {
      logger.error('Error fetching rewards:', error);
      res.status(500).json({ error: 'Failed to fetch rewards' });
    }
  }

  // Raid Settings
  async updateRaidSettings(req, res) {
    try {
      const [settings] = await RaidSettings.findOrCreate({
        where: { channelId: req.params.channelId },
        defaults: req.body
      });

      if (!settings.isNewRecord) {
        await settings.update(req.body);
      }

      await publishConfigUpdate('twitch', 'raid', 'update', settings);
      res.json(settings);
    } catch (error) {
      logger.error('Error updating raid settings:', error);
      res.status(500).json({ error: 'Failed to update raid settings' });
    }
  }

  // Stream Settings
  async updateStreamSettings(req, res) {
    try {
      const [settings] = await StreamSettings.findOrCreate({
        where: { channelId: req.params.channelId },
        defaults: req.body
      });

      if (!settings.isNewRecord) {
        await settings.update(req.body);
      }

      await publishConfigUpdate('twitch', 'stream', 'update', settings);
      res.json(settings);
    } catch (error) {
      logger.error('Error updating stream settings:', error);
      res.status(500).json({ error: 'Failed to update stream settings' });
    }
  }

  // Chat Settings
  async updateChatSettings(req, res) {
    try {
      const [settings] = await ChatSettings.findOrCreate({
        where: { channelId: req.params.channelId },
        defaults: req.body
      });

      if (!settings.isNewRecord) {
        await settings.update(req.body);
      }

      await publishConfigUpdate('twitch', 'chat', 'update', settings);
      res.json(settings);
    } catch (error) {
      logger.error('Error updating chat settings:', error);
      res.status(500).json({ error: 'Failed to update chat settings' });
    }
  }

  // Emote Sets
  async createEmoteSet(req, res) {
    try {
      const emoteSet = await EmoteSet.create({
        ...req.body,
        channelId: req.params.channelId
      });
      await publishConfigUpdate('twitch', 'emote', 'create', emoteSet);
      res.status(201).json(emoteSet);
    } catch (error) {
      logger.error('Error creating emote set:', error);
      res.status(500).json({ error: 'Failed to create emote set' });
    }
  }

  async getEmoteSets(req, res) {
    try {
      const emoteSets = await EmoteSet.findAll({
        where: { channelId: req.params.channelId }
      });
      res.json(emoteSets);
    } catch (error) {
      logger.error('Error fetching emote sets:', error);
      res.status(500).json({ error: 'Failed to fetch emote sets' });
    }
  }
}

module.exports = new TwitchController(); 