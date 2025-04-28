const express = require('express');
const twitchRoutes = require('./twitch');
const discordRoutes = require('./discord');
const configRoutes = require('./config');

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Mount platform-specific routes
router.use('/twitch', twitchRoutes);
router.use('/discord', discordRoutes);
router.use('/config', configRoutes);

module.exports = router; 