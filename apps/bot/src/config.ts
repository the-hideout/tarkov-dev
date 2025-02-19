interface Config {
  discord: {
    token: string;
  };
  twitch: {
    clientId: string;
    clientSecret: string;
    username: string;
    oauth: string;
  };
  mongodb: {
    uri: string;
  };
  redis: {
    url: string;
  };
  services: {
    core: {
      url: string;
    }
  }
}

export const config: Config = {
  discord: {
    token: process.env.DISCORD_TOKEN || '',
  },
  twitch: {
    clientId: process.env.TWITCH_CLIENT_ID || '',
    clientSecret: process.env.TWITCH_CLIENT_SECRET || '',
    username: process.env.TWITCH_BOT_USERNAME || '',
    oauth: process.env.TWITCH_BOT_OAUTH || '',
  },
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/marksoftbot',
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
  services: {
    core: {
      url: process.env.CORE_SERVICE_URL || 'http://localhost:3001',
    }
  }
};

// Validate required environment variables
const requiredEnvVars = [
  'DISCORD_TOKEN',
  'TWITCH_CLIENT_ID',
  'TWITCH_CLIENT_SECRET',
  'TWITCH_BOT_USERNAME',
  'TWITCH_BOT_OAUTH',
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
} 