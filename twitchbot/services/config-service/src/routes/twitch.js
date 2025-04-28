const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();
const twitchController = require('../controllers/twitch');
const validateRequest = require('../middleware/validateRequest');

// Validation middleware
const channelValidation = [
  body('name').isString().notEmpty(),
  body('twitchId').isString().notEmpty(),
  body('enabled').optional().isBoolean()
];

const commandValidation = [
  body('name').isString().notEmpty(),
  body('description').optional().isString(),
  body('response').isString().notEmpty(),
  body('cooldown').isInt({ min: 0 }),
  body('cost').isInt({ min: 0 }),
  body('enabled').optional().isBoolean()
];

const moderationRuleValidation = [
  body('type').isIn(['word', 'regex', 'caps', 'links', 'spam']),
  body('pattern').isString().notEmpty(),
  body('action').isIn(['warn', 'timeout', 'ban']),
  body('duration').optional().isInt({ min: 1 }),
  body('enabled').optional().isBoolean()
];

const timerValidation = [
  body('name').isString().notEmpty(),
  body('message').isString().notEmpty(),
  body('interval').isInt({ min: 1 }),
  body('enabled').optional().isBoolean()
];

const notificationRuleValidation = [
  body('eventType').isIn(['stream_online', 'stream_offline', 'follow', 'subscription', 'raid', 'host']),
  body('message').isString().notEmpty(),
  body('enabled').optional().isBoolean()
];

// Channel Point Reward validation
const rewardValidation = [
  body('title').isString().trim().notEmpty().withMessage('Title is required'),
  body('cost').isInt({ min: 0 }).withMessage('Cost must be a positive integer'),
  body('prompt').isString().trim().notEmpty().withMessage('Prompt is required'),
  body('isEnabled').isBoolean().withMessage('isEnabled must be a boolean'),
  body('isPaused').isBoolean().withMessage('isPaused must be a boolean'),
  body('isInStock').isBoolean().withMessage('isInStock must be a boolean'),
  body('maxPerStream').isInt({ min: -1 }).withMessage('maxPerStream must be -1 or greater'),
  body('maxPerUserPerStream').isInt({ min: -1 }).withMessage('maxPerUserPerStream must be -1 or greater'),
  body('globalCooldown').isInt({ min: 0 }).withMessage('globalCooldown must be a positive integer')
];

// Raid Settings validation
const raidSettingsValidation = [
  body('raidMessage').isString().trim().notEmpty().withMessage('Raid message is required'),
  body('raidDelay').isInt({ min: 0 }).withMessage('Raid delay must be a positive integer'),
  body('raidCooldown').isInt({ min: 0 }).withMessage('Raid cooldown must be a positive integer'),
  body('raidMinViewers').isInt({ min: 0 }).withMessage('Minimum viewers must be a positive integer')
];

// Stream Settings validation
const streamSettingsValidation = [
  body('title').isString().trim().notEmpty().withMessage('Title is required'),
  body('game').isString().trim().notEmpty().withMessage('Game is required'),
  body('language').isString().trim().notEmpty().withMessage('Language is required'),
  body('tags').isArray().withMessage('Tags must be an array'),
  body('isMature').isBoolean().withMessage('isMature must be a boolean')
];

// Chat Settings validation
const chatSettingsValidation = [
  body('slowMode').isInt({ min: 0 }).withMessage('Slow mode must be a positive integer'),
  body('followerOnly').isInt({ min: 0 }).withMessage('Follower only must be a positive integer'),
  body('subscriberOnly').isBoolean().withMessage('subscriberOnly must be a boolean'),
  body('emoteOnly').isBoolean().withMessage('emoteOnly must be a boolean'),
  body('uniqueChat').isBoolean().withMessage('uniqueChat must be a boolean')
];

// Emote Set validation
const emoteSetValidation = [
  body('name').isString().trim().notEmpty().withMessage('Name is required'),
  body('emotes').isArray().withMessage('Emotes must be an array')
];

// Twitch Channel routes
router.post('/channels', channelValidation, twitchController.createTwitchChannel);
router.get('/channels', twitchController.getTwitchChannels);

// Twitch Command routes
router.post('/channels/:channelId/commands', commandValidation, twitchController.createTwitchCommand);
router.get('/channels/:channelId/commands', twitchController.getTwitchCommands);

// Twitch Moderation routes
router.post('/channels/:channelId/moderation-rules', moderationRuleValidation, twitchController.createTwitchModerationRule);
router.get('/channels/:channelId/moderation-rules', twitchController.getTwitchModerationRules);

// Twitch Timer routes
router.post('/channels/:channelId/timers', timerValidation, twitchController.createTwitchTimer);
router.get('/channels/:channelId/timers', twitchController.getTwitchTimers);

// Twitch Notification routes
router.post('/channels/:channelId/notification-rules', notificationRuleValidation, twitchController.createTwitchNotificationRule);
router.get('/channels/:channelId/notification-rules', twitchController.getTwitchNotificationRules);

// Channel Point Reward routes
router.post('/channels/:channelId/rewards', [
  param('channelId').isUUID().withMessage('Invalid channel ID'),
  ...rewardValidation
], twitchController.createReward);

router.get('/channels/:channelId/rewards', [
  param('channelId').isUUID().withMessage('Invalid channel ID')
], twitchController.getRewards);

// Raid Settings routes
router.put('/channels/:channelId/raid-settings', [
  param('channelId').isUUID().withMessage('Invalid channel ID'),
  ...raidSettingsValidation
], twitchController.updateRaidSettings);

// Stream Settings routes
router.put('/channels/:channelId/stream-settings', [
  param('channelId').isUUID().withMessage('Invalid channel ID'),
  ...streamSettingsValidation
], twitchController.updateStreamSettings);

// Chat Settings routes
router.put('/channels/:channelId/chat-settings', [
  param('channelId').isUUID().withMessage('Invalid channel ID'),
  ...chatSettingsValidation
], twitchController.updateChatSettings);

// Emote Set routes
router.post('/channels/:channelId/emote-sets', [
  param('channelId').isUUID().withMessage('Invalid channel ID'),
  ...emoteSetValidation
], twitchController.createEmoteSet);

router.get('/channels/:channelId/emote-sets', [
  param('channelId').isUUID().withMessage('Invalid channel ID')
], twitchController.getEmoteSets);

module.exports = router; 