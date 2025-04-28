const express = require('express');
const taskRoutes = require('./tasks');

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Mount task routes
router.use('/tasks', taskRoutes);

module.exports = router; 