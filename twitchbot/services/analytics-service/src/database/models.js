const { DataTypes } = require('sequelize');
const { sequelize } = require('./database');

// Channel Analytics Model
const ChannelAnalytics = sequelize.define('ChannelAnalytics', {
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
  platform: {
    type: DataTypes.ENUM('twitch', 'discord'),
    allowNull: false
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  metrics: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {}
  }
});

// Stream Analytics Model
const StreamAnalytics = sequelize.define('StreamAnalytics', {
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
  streamId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  startTime: {
    type: DataTypes.DATE,
    allowNull: false
  },
  endTime: {
    type: DataTypes.DATE,
    allowNull: true
  },
  metrics: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {}
  }
});

// Chat Analytics Model
const ChatAnalytics = sequelize.define('ChatAnalytics', {
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
  platform: {
    type: DataTypes.ENUM('twitch', 'discord'),
    allowNull: false
  },
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false
  },
  messageCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  userCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  metrics: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {}
  }
});

// Command Analytics Model
const CommandAnalytics = sequelize.define('CommandAnalytics', {
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
  commandId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Commands',
      key: 'id'
    }
  },
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false
  },
  usageCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  metrics: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {}
  }
});

// Define associations
ChannelAnalytics.belongsTo(sequelize.models.Channel, { foreignKey: 'channelId' });
StreamAnalytics.belongsTo(sequelize.models.Channel, { foreignKey: 'channelId' });
ChatAnalytics.belongsTo(sequelize.models.Channel, { foreignKey: 'channelId' });
CommandAnalytics.belongsTo(sequelize.models.Channel, { foreignKey: 'channelId' });
CommandAnalytics.belongsTo(sequelize.models.Command, { foreignKey: 'commandId' });

module.exports = {
  ChannelAnalytics,
  StreamAnalytics,
  ChatAnalytics,
  CommandAnalytics
}; 