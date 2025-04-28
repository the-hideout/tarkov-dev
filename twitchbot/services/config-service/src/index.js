const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const winston = require('winston');
const { sequelize } = require('./database/models');
const configRoutes = require('./routes/config');
const twitchRoutes = require('./routes/twitch');
const discordRoutes = require('./routes/discord');
const messageQueue = require('./utils/messageQueue');

// Initialize express app
const app = express();
const port = process.env.PORT || 4002;

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('combined'));

// Routes
app.use('/config', configRoutes);
app.use('/twitch', twitchRoutes);
app.use('/discord', discordRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Database connection and server start
sequelize.authenticate()
  .then(() => {
    logger.info('Database connection established successfully');
    return sequelize.sync();
  })
  .then(() => {
    // Initialize message queue connection
    return messageQueue.connect();
  })
  .then(() => {
    app.listen(port, () => {
      logger.info(`Config service running on port ${port}`);
    });
  })
  .catch(err => {
    logger.error('Service initialization failed:', err);
    process.exit(1);
  }); 