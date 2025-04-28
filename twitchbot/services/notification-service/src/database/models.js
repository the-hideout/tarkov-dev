const { DataTypes } = require('sequelize');
const { sequelize } = require('./database');

// Notification Template Model
const NotificationTemplate = sequelize.define('NotificationTemplate', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('twitch', 'discord', 'both'),
    allowNull: false
  },
  content: {
    type: DataTypes.JSONB,
    allowNull: false
  },
  variables: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true
  },
  isEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
});

// Notification Rule Model
const NotificationRule = sequelize.define('NotificationRule', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  channelId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Channels',
      key: 'id'
    }
  },
  eventType: {
    type: DataTypes.STRING,
    allowNull: false
  },
  templateId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'NotificationTemplates',
      key: 'id'
    }
  },
  conditions: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  isEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
});

// Notification History Model
const NotificationHistory = sequelize.define('NotificationHistory', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  channelId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Channels',
      key: 'id'
    }
  },
  ruleId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'NotificationRules',
      key: 'id'
    }
  },
  eventType: {
    type: DataTypes.STRING,
    allowNull: false
  },
  platform: {
    type: DataTypes.ENUM('twitch', 'discord'),
    allowNull: false
  },
  content: {
    type: DataTypes.JSONB,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'sent', 'failed'),
    defaultValue: 'pending'
  },
  error: {
    type: DataTypes.TEXT,
    allowNull: true
  }
});

// Define associations
NotificationRule.belongsTo(sequelize.models.Channel, { foreignKey: 'channelId' });
NotificationRule.belongsTo(NotificationTemplate, { foreignKey: 'templateId' });
NotificationHistory.belongsTo(sequelize.models.Channel, { foreignKey: 'channelId' });
NotificationHistory.belongsTo(NotificationRule, { foreignKey: 'ruleId' });

module.exports = {
  NotificationTemplate,
  NotificationRule,
  NotificationHistory
}; 