const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { sequelize } = require('./database');
const routes = require('./routes');
const { setupMessageQueue } = require('./utils/messageQueue');
const logger = require('./utils/logger');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('combined'));

// Routes
app.use('/api/analytics', routes);

// Error handling
app.use((err, req, res, next) => {
  logger.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Initialize services
const startServices = async () => {
  try {
    // Connect to database
    await sequelize.authenticate();
    logger.info('Database connection established');

    // Setup message queue
    await setupMessageQueue();
    logger.info('Message queue setup complete');

    // Start server
    const PORT = process.env.PORT || 3003;
    app.listen(PORT, () => {
      logger.info(`Analytics Service running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start services:', error);
    process.exit(1);
  }
};

startServices();

module.exports = app; 