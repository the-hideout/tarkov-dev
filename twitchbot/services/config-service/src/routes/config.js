const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const configController = require('../controllers/config');

// Validation middleware
const channelValidation = [
  body('name').isString().notEmpty(),
  body('twitchId').optional().isString(),
  body('discordId').optional().isString(),
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
  body('platform').isIn(['twitch', 'discord']),
  body('targetPlatform').isIn(['twitch', 'discord']),
  body('message').isString().notEmpty(),
  body('enabled').optional().isBoolean()
];

// Channel routes
router.post('/channels', channelValidation, configController.createChannel);
router.get('/channels', configController.getChannels);
router.get('/channels/:id', configController.getChannel);
router.put('/channels/:id', channelValidation, configController.updateChannel);
router.delete('/channels/:id', configController.deleteChannel);

// Command routes
router.post('/channels/:channelId/commands', commandValidation, configController.createCommand);
router.get('/channels/:channelId/commands', configController.getCommands);
router.get('/channels/:channelId/commands/:id', configController.getCommand);
router.put('/channels/:channelId/commands/:id', commandValidation, configController.updateCommand);
router.delete('/channels/:channelId/commands/:id', configController.deleteCommand);

// Moderation rule routes
router.post('/channels/:channelId/moderation-rules', moderationRuleValidation, configController.createModerationRule);
router.get('/channels/:channelId/moderation-rules', configController.getModerationRules);
router.get('/channels/:channelId/moderation-rules/:id', configController.getModerationRule);
router.put('/channels/:channelId/moderation-rules/:id', moderationRuleValidation, configController.updateModerationRule);
router.delete('/channels/:channelId/moderation-rules/:id', configController.deleteModerationRule);

// Timer routes
router.post('/channels/:channelId/timers', timerValidation, configController.createTimer);
router.get('/channels/:channelId/timers', configController.getTimers);
router.get('/channels/:channelId/timers/:id', configController.getTimer);
router.put('/channels/:channelId/timers/:id', timerValidation, configController.updateTimer);
router.delete('/channels/:channelId/timers/:id', configController.deleteTimer);

// Notification rule routes
router.post('/channels/:channelId/notification-rules', notificationRuleValidation, configController.createNotificationRule);
router.get('/channels/:channelId/notification-rules', configController.getNotificationRules);
router.get('/channels/:channelId/notification-rules/:id', configController.getNotificationRule);
router.put('/channels/:channelId/notification-rules/:id', notificationRuleValidation, configController.updateNotificationRule);
router.delete('/channels/:channelId/notification-rules/:id', configController.deleteNotificationRule);

module.exports = router; 