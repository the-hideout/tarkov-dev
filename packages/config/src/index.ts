export const CONFIG = {
  APP: {
    NAME: 'MarkSoftBot',
    VERSION: '1.0.0',
  },
  MONGODB: {
    URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/marksoftbot',
  },
  JWT: {
    SECRET: process.env.JWT_SECRET || 'your-secret-key',
    EXPIRES_IN: '7d',
  },
  TWITCH: {
    CLIENT_ID: process.env.TWITCH_CLIENT_ID,
    CLIENT_SECRET: process.env.TWITCH_CLIENT_SECRET,
    REDIRECT_URI: process.env.TWITCH_REDIRECT_URI,
  },
  DISCORD: {
    CLIENT_ID: process.env.DISCORD_CLIENT_ID,
    CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET,
    BOT_TOKEN: process.env.DISCORD_BOT_TOKEN,
    REDIRECT_URI: process.env.DISCORD_REDIRECT_URI,
  },
}; 