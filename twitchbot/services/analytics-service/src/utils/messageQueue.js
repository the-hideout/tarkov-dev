const amqp = require('amqplib');
const { processAnalyticsEvent } = require('../controllers/analytics');
const logger = require('./logger');

let channel = null;
const QUEUE_NAME = 'analytics_events';

const setupMessageQueue = async () => {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    channel = await connection.createChannel();

    // Assert the queue
    await channel.assertQueue(QUEUE_NAME, {
      durable: true
    });

    // Set up consumer
    channel.consume(QUEUE_NAME, async (msg) => {
      if (msg) {
        try {
          const event = JSON.parse(msg.content.toString());
          await processAnalyticsEvent(event);
          channel.ack(msg);
        } catch (error) {
          logger.error('Error processing message:', error);
          channel.nack(msg);
        }
      }
    });

    logger.info('Message queue setup complete');
  } catch (error) {
    logger.error('Failed to setup message queue:', error);
    throw error;
  }
};

const publishAnalyticsEvent = async (event) => {
  if (!channel) {
    throw new Error('Message queue channel not initialized');
  }

  try {
    await channel.sendToQueue(
      QUEUE_NAME,
      Buffer.from(JSON.stringify(event)),
      { persistent: true }
    );
  } catch (error) {
    logger.error('Error publishing analytics event:', error);
    throw error;
  }
};

module.exports = {
  setupMessageQueue,
  publishAnalyticsEvent
}; 