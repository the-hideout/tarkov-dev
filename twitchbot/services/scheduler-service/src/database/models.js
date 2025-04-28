const { DataTypes } = require('sequelize');
const { sequelize } = require('./database');

// Scheduled Task Model
const ScheduledTask = sequelize.define('ScheduledTask', {
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
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('message', 'command', 'moderation', 'custom'),
    allowNull: false
  },
  schedule: {
    type: DataTypes.STRING,
    allowNull: false
  },
  action: {
    type: DataTypes.JSONB,
    allowNull: false
  },
  isEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  lastRun: {
    type: DataTypes.DATE,
    allowNull: true
  },
  nextRun: {
    type: DataTypes.DATE,
    allowNull: true
  }
});

// Task History Model
const TaskHistory = sequelize.define('TaskHistory', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  taskId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'ScheduledTasks',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('success', 'failed'),
    allowNull: false
  },
  result: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  error: {
    type: DataTypes.TEXT,
    allowNull: true
  }
});

// Define associations
ScheduledTask.belongsTo(sequelize.models.Channel, { foreignKey: 'channelId' });
TaskHistory.belongsTo(ScheduledTask, { foreignKey: 'taskId' });

module.exports = {
  ScheduledTask,
  TaskHistory
}; 