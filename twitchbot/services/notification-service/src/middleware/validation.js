const { validationResult } = require('express-validator');
const logger = require('../utils/logger');

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn('Validation errors:', errors.array());
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const templateValidation = [
  check('name').notEmpty().withMessage('Name is required'),
  check('type').isIn(['twitch', 'discord', 'both']).withMessage('Invalid type'),
  check('content').isObject().withMessage('Content must be an object'),
  check('variables').optional().isArray().withMessage('Variables must be an array'),
  check('isEnabled').optional().isBoolean().withMessage('isEnabled must be a boolean')
];

const ruleValidation = [
  check('channelId').isUUID().withMessage('Invalid channel ID'),
  check('eventType').notEmpty().withMessage('Event type is required'),
  check('templateId').isUUID().withMessage('Invalid template ID'),
  check('conditions').optional().isObject().withMessage('Conditions must be an object'),
  check('isEnabled').optional().isBoolean().withMessage('isEnabled must be a boolean')
];

const testNotificationValidation = [
  check('channelId').isUUID().withMessage('Invalid channel ID'),
  check('templateId').isUUID().withMessage('Invalid template ID'),
  check('data').isObject().withMessage('Data must be an object')
];

module.exports = {
  validateRequest,
  templateValidation,
  ruleValidation,
  testNotificationValidation
}; 