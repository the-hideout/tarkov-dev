const { NotificationRule, NotificationTemplate, NotificationHistory } = require('../database/models');
const { publishNotification } = require('../utils/messageQueue');
const logger = require('../utils/logger');

// Process notification event
const processNotificationEvent = async (event) => {
  try {
    const { channelId, eventType, data } = event;

    // Find matching rules
    const rules = await NotificationRule.findAll({
      where: {
        channelId,
        eventType,
        isEnabled: true
      },
      include: [NotificationTemplate]
    });

    // Process each matching rule
    for (const rule of rules) {
      try {
        // Check conditions if any
        if (rule.conditions && !evaluateConditions(rule.conditions, data)) {
          continue;
        }

        // Create notification history entry
        const history = await NotificationHistory.create({
          channelId,
          ruleId: rule.id,
          eventType,
          platform: rule.template.type === 'both' ? 'both' : rule.template.type,
          content: {
            template: rule.template.content,
            data
          },
          status: 'pending'
        });

        // Send notification
        await sendNotification(history, rule.template, data);
      } catch (error) {
        logger.error(`Error processing rule ${rule.id}:`, error);
      }
    }
  } catch (error) {
    logger.error('Error processing notification event:', error);
  }
};

// Evaluate rule conditions
const evaluateConditions = (conditions, data) => {
  if (!conditions) return true;

  for (const [key, value] of Object.entries(conditions)) {
    if (data[key] !== value) {
      return false;
    }
  }

  return true;
};

// Send notification
const sendNotification = async (history, template, data) => {
  try {
    // Format message with variables
    const message = formatMessage(template.content, data);

    // Send to appropriate platforms
    if (template.type === 'twitch' || template.type === 'both') {
      await publishNotification({
        type: 'twitch',
        channelId: history.channelId,
        message
      });
    }

    if (template.type === 'discord' || template.type === 'both') {
      await publishNotification({
        type: 'discord',
        channelId: history.channelId,
        message
      });
    }

    // Update history
    await history.update({ status: 'sent' });
  } catch (error) {
    logger.error('Error sending notification:', error);
    await history.update({
      status: 'failed',
      error: error.message
    });
  }
};

// Format message with variables
const formatMessage = (content, data) => {
  let message = content.text;

  // Replace variables in message
  for (const [key, value] of Object.entries(data)) {
    const regex = new RegExp(`{${key}}`, 'g');
    message = message.replace(regex, value);
  }

  return message;
};

// Setup notification handlers
const setupNotificationHandlers = async () => {
  try {
    // Subscribe to notification events
    await setupMessageQueue();
    logger.info('Notification handlers setup complete');
  } catch (error) {
    logger.error('Failed to setup notification handlers:', error);
    throw error;
  }
};

module.exports = {
  processNotificationEvent,
  setupNotificationHandlers
}; 