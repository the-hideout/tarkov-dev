const { NotificationTemplate, NotificationRule, NotificationHistory } = require('../database/models');
const logger = require('../utils/logger');

// Template Management
const createTemplate = async (req, res) => {
  try {
    const template = await NotificationTemplate.create(req.body);
    res.status(201).json(template);
  } catch (error) {
    logger.error('Error creating template:', error);
    res.status(500).json({ error: 'Failed to create template' });
  }
};

const getTemplates = async (req, res) => {
  try {
    const templates = await NotificationTemplate.findAll();
    res.json(templates);
  } catch (error) {
    logger.error('Error fetching templates:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
};

const updateTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const template = await NotificationTemplate.findByPk(id);
    
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    await template.update(req.body);
    res.json(template);
  } catch (error) {
    logger.error('Error updating template:', error);
    res.status(500).json({ error: 'Failed to update template' });
  }
};

// Rule Management
const createRule = async (req, res) => {
  try {
    const rule = await NotificationRule.create(req.body);
    res.status(201).json(rule);
  } catch (error) {
    logger.error('Error creating rule:', error);
    res.status(500).json({ error: 'Failed to create rule' });
  }
};

const getRules = async (req, res) => {
  try {
    const { channelId } = req.query;
    const where = channelId ? { channelId } : {};
    
    const rules = await NotificationRule.findAll({
      where,
      include: [NotificationTemplate]
    });
    
    res.json(rules);
  } catch (error) {
    logger.error('Error fetching rules:', error);
    res.status(500).json({ error: 'Failed to fetch rules' });
  }
};

const updateRule = async (req, res) => {
  try {
    const { id } = req.params;
    const rule = await NotificationRule.findByPk(id);
    
    if (!rule) {
      return res.status(404).json({ error: 'Rule not found' });
    }

    await rule.update(req.body);
    res.json(rule);
  } catch (error) {
    logger.error('Error updating rule:', error);
    res.status(500).json({ error: 'Failed to update rule' });
  }
};

// History Management
const getHistory = async (req, res) => {
  try {
    const { channelId, startDate, endDate, status } = req.query;
    
    const where = {};
    if (channelId) where.channelId = channelId;
    if (status) where.status = status;
    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const history = await NotificationHistory.findAll({
      where,
      include: [NotificationRule],
      order: [['createdAt', 'DESC']]
    });

    res.json(history);
  } catch (error) {
    logger.error('Error fetching history:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
};

// Test Notification
const testNotification = async (req, res) => {
  try {
    const { channelId, templateId, data } = req.body;
    
    const template = await NotificationTemplate.findByPk(templateId);
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    const history = await NotificationHistory.create({
      channelId,
      ruleId: null,
      eventType: 'test',
      platform: template.type,
      content: {
        template: template.content,
        data
      },
      status: 'pending'
    });

    await sendNotification(history, template, data);
    res.json(history);
  } catch (error) {
    logger.error('Error testing notification:', error);
    res.status(500).json({ error: 'Failed to test notification' });
  }
};

module.exports = {
  createTemplate,
  getTemplates,
  updateTemplate,
  createRule,
  getRules,
  updateRule,
  getHistory,
  testNotification
}; 