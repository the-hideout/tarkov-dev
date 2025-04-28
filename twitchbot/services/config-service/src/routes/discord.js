const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();
const discordController = require('../controllers/discord');
const validateRequest = require('../middleware/validateRequest');

// Validation middleware
const channelValidation = [
  body('name').isString().notEmpty(),
  body('discordId').isString().notEmpty(),
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

// Role validation
const roleValidation = [
  body('name').isString().trim().notEmpty().withMessage('Name is required'),
  body('color').isString().trim().notEmpty().withMessage('Color is required'),
  body('permissions').isString().trim().notEmpty().withMessage('Permissions are required'),
  body('position').isInt({ min: 0 }).withMessage('Position must be a positive integer'),
  body('isMentionable').isBoolean().withMessage('isMentionable must be a boolean'),
  body('isHoisted').isBoolean().withMessage('isHoisted must be a boolean')
];

// Channel Category validation
const categoryValidation = [
  body('name').isString().trim().notEmpty().withMessage('Name is required'),
  body('position').isInt({ min: 0 }).withMessage('Position must be a positive integer'),
  body('permissions').isObject().withMessage('Permissions must be an object')
];

// Server Settings validation
const serverSettingsValidation = [
  body('name').isString().trim().notEmpty().withMessage('Name is required'),
  body('icon').isString().trim().notEmpty().withMessage('Icon is required'),
  body('banner').isString().trim().notEmpty().withMessage('Banner is required'),
  body('description').isString().trim().notEmpty().withMessage('Description is required'),
  body('features').isArray().withMessage('Features must be an array'),
  body('verificationLevel').isInt({ min: 0, max: 4 }).withMessage('Verification level must be between 0 and 4'),
  body('explicitContentFilter').isInt({ min: 0, max: 2 }).withMessage('Explicit content filter must be between 0 and 2')
];

// AutoMod Rule validation
const autoModRuleValidation = [
  body('name').isString().trim().notEmpty().withMessage('Name is required'),
  body('eventType').isString().trim().notEmpty().withMessage('Event type is required'),
  body('triggerType').isString().trim().notEmpty().withMessage('Trigger type is required'),
  body('triggerMetadata').isObject().withMessage('Trigger metadata must be an object'),
  body('actions').isArray().withMessage('Actions must be an array'),
  body('enabled').isBoolean().withMessage('enabled must be a boolean')
];

// Welcome Settings validation
const welcomeSettingsValidation = [
  body('channelId').isString().trim().notEmpty().withMessage('Channel ID is required'),
  body('message').isString().trim().notEmpty().withMessage('Message is required'),
  body('embed').isObject().withMessage('Embed must be an object'),
  body('roles').isArray().withMessage('Roles must be an array')
];

// Discord Channel routes
router.post('/channels', channelValidation, discordController.createDiscordChannel);
router.get('/channels', discordController.getDiscordChannels);

// Discord Command routes
router.post('/channels/:channelId/commands', commandValidation, discordController.createDiscordCommand);
router.get('/channels/:channelId/commands', discordController.getDiscordCommands);

// Discord Moderation routes
router.post('/channels/:channelId/moderation-rules', moderationRuleValidation, discordController.createDiscordModerationRule);
router.get('/channels/:channelId/moderation-rules', discordController.getDiscordModerationRules);

// Discord Timer routes
router.post('/channels/:channelId/timers', timerValidation, discordController.createDiscordTimer);
router.get('/channels/:channelId/timers', discordController.getDiscordTimers);

// Discord Notification routes
router.post('/channels/:channelId/notification-rules', notificationRuleValidation, discordController.createDiscordNotificationRule);
router.get('/channels/:channelId/notification-rules', discordController.getDiscordNotificationRules);

// Role routes
router.post('/channels/:channelId/roles', [
  param('channelId').isUUID().withMessage('Invalid channel ID'),
  ...roleValidation
], discordController.createRole);

router.get('/channels/:channelId/roles', [
  param('channelId').isUUID().withMessage('Invalid channel ID')
], discordController.getRoles);

// Channel Category routes
router.post('/channels/:channelId/categories', [
  param('channelId').isUUID().withMessage('Invalid channel ID'),
  ...categoryValidation
], discordController.createChannelCategory);

router.get('/channels/:channelId/categories', [
  param('channelId').isUUID().withMessage('Invalid channel ID')
], discordController.getChannelCategories);

// Server Settings routes
router.put('/channels/:channelId/server-settings', [
  param('channelId').isUUID().withMessage('Invalid channel ID'),
  ...serverSettingsValidation
], discordController.updateServerSettings);

// AutoMod Rule routes
router.post('/channels/:channelId/automod-rules', [
  param('channelId').isUUID().withMessage('Invalid channel ID'),
  ...autoModRuleValidation
], discordController.createAutoModRule);

router.get('/channels/:channelId/automod-rules', [
  param('channelId').isUUID().withMessage('Invalid channel ID')
], discordController.getAutoModRules);

// Welcome Settings routes
router.put('/channels/:channelId/welcome-settings', [
  param('channelId').isUUID().withMessage('Invalid channel ID'),
  ...welcomeSettingsValidation
], discordController.updateWelcomeSettings);

module.exports = router; 