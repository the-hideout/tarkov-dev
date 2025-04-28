const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize(process.env.DATABASE_URL);

const Channel = sequelize.define('Channel', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  platform: {
    type: DataTypes.ENUM('twitch', 'discord'),
    allowNull: false
  },
  twitchId: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  discordId: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
});

const Command = sequelize.define('Command', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  platform: {
    type: DataTypes.ENUM('twitch', 'discord'),
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true
  },
  response: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  cooldown: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  cost: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
});

const ModerationRule = sequelize.define('ModerationRule', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  platform: {
    type: DataTypes.ENUM('twitch', 'discord'),
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('word', 'regex', 'caps', 'links', 'spam'),
    allowNull: false
  },
  pattern: {
    type: DataTypes.STRING,
    allowNull: false
  },
  action: {
    type: DataTypes.ENUM('warn', 'timeout', 'ban'),
    allowNull: false
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
});

const Timer = sequelize.define('Timer', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  platform: {
    type: DataTypes.ENUM('twitch', 'discord'),
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  interval: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
});

const NotificationRule = sequelize.define('NotificationRule', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  platform: {
    type: DataTypes.ENUM('twitch', 'discord'),
    allowNull: false
  },
  eventType: {
    type: DataTypes.ENUM('stream_online', 'stream_offline', 'follow', 'subscription', 'raid', 'host'),
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
});

// Twitch-specific models
const ChannelPointReward = sequelize.define('ChannelPointReward', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  platform: {
    type: DataTypes.ENUM('twitch', 'discord'),
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  cost: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  prompt: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  isEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  isPaused: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isInStock: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  maxPerStream: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  maxPerUserPerStream: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  globalCooldown: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
});

const RaidSettings = sequelize.define('RaidSettings', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  platform: {
    type: DataTypes.ENUM('twitch', 'discord'),
    allowNull: false
  },
  raidMessage: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  raidDelay: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  raidCooldown: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  raidMinViewers: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
});

const StreamSettings = sequelize.define('StreamSettings', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  platform: {
    type: DataTypes.ENUM('twitch', 'discord'),
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  game: {
    type: DataTypes.STRING,
    allowNull: false
  },
  language: {
    type: DataTypes.STRING,
    allowNull: false
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  isMature: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
});

const ChatSettings = sequelize.define('ChatSettings', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  platform: {
    type: DataTypes.ENUM('twitch', 'discord'),
    allowNull: false
  },
  slowMode: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  followerOnly: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  subscriberOnly: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  emoteOnly: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  uniqueChat: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
});

const EmoteSet = sequelize.define('EmoteSet', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  platform: {
    type: DataTypes.ENUM('twitch', 'discord'),
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  emotes: {
    type: DataTypes.JSONB,
    defaultValue: []
  }
});

// Discord-specific models
const Role = sequelize.define('Role', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  platform: {
    type: DataTypes.ENUM('twitch', 'discord'),
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  color: {
    type: DataTypes.STRING,
    allowNull: true
  },
  permissions: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  position: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  isMentionable: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isHoisted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
});

const ChannelCategory = sequelize.define('ChannelCategory', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  platform: {
    type: DataTypes.ENUM('twitch', 'discord'),
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  position: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  permissions: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
});

const ServerSettings = sequelize.define('ServerSettings', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  platform: {
    type: DataTypes.ENUM('twitch', 'discord'),
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  icon: {
    type: DataTypes.STRING,
    allowNull: true
  },
  banner: {
    type: DataTypes.STRING,
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  features: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  verificationLevel: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  explicitContentFilter: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
});

const AutoModRule = sequelize.define('AutoModRule', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  platform: {
    type: DataTypes.ENUM('twitch', 'discord'),
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  eventType: {
    type: DataTypes.ENUM('message_send', 'message_edit'),
    allowNull: false
  },
  triggerType: {
    type: DataTypes.ENUM('keyword', 'regex', 'mention_spam', 'spam'),
    allowNull: false
  },
  triggerMetadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  actions: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
});

const WelcomeSettings = sequelize.define('WelcomeSettings', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  platform: {
    type: DataTypes.ENUM('twitch', 'discord'),
    allowNull: false
  },
  enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  channelId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  embed: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  roles: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  }
});

// Associations
Channel.hasMany(Command);
Command.belongsTo(Channel);

Channel.hasMany(ModerationRule);
ModerationRule.belongsTo(Channel);

Channel.hasMany(Timer);
Timer.belongsTo(Channel);

Channel.hasMany(NotificationRule);
NotificationRule.belongsTo(Channel);

Channel.hasMany(ChannelPointReward);
ChannelPointReward.belongsTo(Channel);

Channel.hasOne(RaidSettings);
RaidSettings.belongsTo(Channel);

Channel.hasOne(StreamSettings);
StreamSettings.belongsTo(Channel);

Channel.hasOne(ChatSettings);
ChatSettings.belongsTo(Channel);

Channel.hasMany(EmoteSet);
EmoteSet.belongsTo(Channel);

Channel.hasMany(Role);
Role.belongsTo(Channel);

Channel.hasMany(ChannelCategory);
ChannelCategory.belongsTo(Channel);

Channel.hasOne(ServerSettings);
ServerSettings.belongsTo(Channel);

Channel.hasMany(AutoModRule);
AutoModRule.belongsTo(Channel);

Channel.hasOne(WelcomeSettings);
WelcomeSettings.belongsTo(Channel);

module.exports = {
  sequelize,
  Channel,
  Command,
  ModerationRule,
  Timer,
  NotificationRule,
  ChannelPointReward,
  RaidSettings,
  StreamSettings,
  ChatSettings,
  EmoteSet,
  Role,
  ChannelCategory,
  ServerSettings,
  AutoModRule,
  WelcomeSettings
}; 