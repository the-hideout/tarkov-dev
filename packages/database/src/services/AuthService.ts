import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { CONFIG } from '@marksoftbot/config';

export class AuthService {
  static async createToken(userId: string): Promise<string> {
    return jwt.sign({ userId }, CONFIG.JWT.SECRET, {
      expiresIn: CONFIG.JWT.EXPIRES_IN,
    });
  }

  static async verifyToken(token: string): Promise<string | null> {
    try {
      const decoded = jwt.verify(token, CONFIG.JWT.SECRET) as { userId: string };
      return decoded.userId;
    } catch (error) {
      return null;
    }
  }

  static async handleTwitchAuth(code: string) {
    try {
      // Exchange code for access token
      const tokenResponse = await fetch('https://id.twitch.tv/oauth2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: CONFIG.TWITCH.CLIENT_ID,
          client_secret: CONFIG.TWITCH.CLIENT_SECRET,
          code,
          grant_type: 'authorization_code',
          redirect_uri: CONFIG.TWITCH.REDIRECT_URI,
        }),
      });

      const tokens = await tokenResponse.json();

      // Get user info
      const userResponse = await fetch('https://api.twitch.tv/helix/users', {
        headers: {
          'Authorization': `Bearer ${tokens.access_token}`,
          'Client-Id': CONFIG.TWITCH.CLIENT_ID,
        },
      });

      const { data: [twitchUser] } = await userResponse.json();

      // Find or create user
      let user = await User.findOne({ twitchId: twitchUser.id });

      if (!user) {
        user = new User({
          username: twitchUser.login,
          twitchId: twitchUser.id,
          integrations: {
            twitch: {
              accessToken: tokens.access_token,
              refreshToken: tokens.refresh_token,
              scope: tokens.scope,
            },
          },
        });
      } else {
        user.integrations.twitch = {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          scope: tokens.scope,
        };
      }

      await user.save();
      return await this.createToken(user._id);

    } catch (error) {
      console.error('Twitch auth error:', error);
      throw error;
    }
  }

  static async handleDiscordAuth(code: string) {
    try {
      // Exchange code for access token
      const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: CONFIG.DISCORD.CLIENT_ID,
          client_secret: CONFIG.DISCORD.CLIENT_SECRET,
          code,
          grant_type: 'authorization_code',
          redirect_uri: CONFIG.DISCORD.REDIRECT_URI,
        }),
      });

      const tokens = await tokenResponse.json();

      // Get user info
      const userResponse = await fetch('https://discord.com/api/users/@me', {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
        },
      });

      const discordUser = await userResponse.json();

      // Find or create user
      let user = await User.findOne({ discordId: discordUser.id });

      if (!user) {
        user = new User({
          username: discordUser.username,
          discordId: discordUser.id,
          integrations: {
            discord: {
              accessToken: tokens.access_token,
              refreshToken: tokens.refresh_token,
              scope: tokens.scope,
            },
          },
        });
      } else {
        user.integrations.discord = {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          scope: tokens.scope,
        };
      }

      await user.save();
      return await this.createToken(user._id);

    } catch (error) {
      console.error('Discord auth error:', error);
      throw error;
    }
  }
} 