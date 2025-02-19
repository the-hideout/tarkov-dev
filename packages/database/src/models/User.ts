import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  username: { type: String, required: true },
  twitchId: { type: String, sparse: true },
  discordId: { type: String, sparse: true },
  integrations: {
    twitch: {
      accessToken: String,
      refreshToken: String,
      scope: [String],
      channels: [{
        id: String,
        name: String,
        settings: {
          commands: [{
            name: String,
            response: String,
            cooldown: Number,
          }],
          timers: [{
            name: String,
            message: String,
            interval: Number,
            enabled: Boolean,
          }],
        },
      }],
    },
    discord: {
      accessToken: String,
      refreshToken: String,
      scope: [String],
      guilds: [{
        id: String,
        name: String,
        settings: {
          prefix: { type: String, default: '!' },
          automod: {
            enabled: Boolean,
            bannedWords: [String],
            capsLimit: Number,
          },
          logging: {
            enabled: Boolean,
            channelId: String,
            events: [String],
          },
        },
      }],
    },
  },
}, {
  timestamps: true,
});

export const User = mongoose.model('User', UserSchema); 