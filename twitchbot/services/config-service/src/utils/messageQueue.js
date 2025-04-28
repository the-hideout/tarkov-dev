const amqp = require('amqplib');
const logger = require('./logger');

let channel = null;

const connect = async () => {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
    channel = await connection.createChannel();
    
    // Declare the exchange
    await channel.assertExchange('config_updates', 'fanout', { durable: false });
    
    logger.info('Connected to RabbitMQ');
  } catch (error) {
    logger.error('Failed to connect to RabbitMQ:', error);
    throw error;
  }
};

const publishConfigUpdate = async (message) => {
  if (!channel) {
    await connect();
  }
  
  try {
    await channel.publish('config_updates', '', Buffer.from(JSON.stringify(message)));
    logger.info('Published config update:', message);
  } catch (error) {
    logger.error('Failed to publish config update:', error);
    throw error;
  }
};

module.exports = {
  connect,
  publishConfigUpdate
}; 