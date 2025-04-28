const express = require('express');
const { validateRequest } = require('../middleware/validation');
const {
  getChannelAnalytics,
  getStreamAnalytics,
  getChatAnalytics,
  getCommandAnalytics
} = require('../controllers/analytics');

const router = express.Router();

// Channel Analytics Routes
router.get('/channels/:channelId', validateRequest, getChannelAnalytics);

// Stream Analytics Routes
router.get('/streams/:channelId', validateRequest, getStreamAnalytics);

// Chat Analytics Routes
router.get('/chat/:channelId', validateRequest, getChatAnalytics);

// Command Analytics Routes
router.get('/commands/:channelId', validateRequest, getCommandAnalytics);

module.exports = router; 