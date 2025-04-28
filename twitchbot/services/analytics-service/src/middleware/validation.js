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

const analyticsQueryValidation = [
  check('channelId').isUUID().withMessage('Invalid channel ID'),
  check('startDate').optional().isISO8601().withMessage('Invalid start date'),
  check('endDate').optional().isISO8601().withMessage('Invalid end date'),
  check('platform').optional().isIn(['twitch', 'discord']).withMessage('Invalid platform'),
  check('commandId').optional().isUUID().withMessage('Invalid command ID')
];

module.exports = {
  validateRequest,
  analyticsQueryValidation
}; 