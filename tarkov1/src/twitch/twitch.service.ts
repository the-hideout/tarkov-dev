import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class TwitchService {
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly redirectUri: string;

  constructor(private readonly configService: ConfigService) {
    this.clientId = this.configService.get('TWITCH_CLIENT_ID');
    this.clientSecret = this.configService.get('TWITCH_CLIENT_SECRET');
    this.redirectUri = this.configService.get('TWITCH_REDIRECT_URI');
  }

  async getAccessToken(code: string) {
    const response = await axios.post('https://id.twitch.tv/oauth2/token', null, {
      params: {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: this.redirectUri,
      },
    });
    return response.data;
  }

  async getUserData(accessToken: string) {
    const response = await axios.get('https://api.twitch.tv/helix/users', {
      headers: {
        'Client-ID': this.clientId,
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    return response.data.data[0];
  }

  async getChannelInfo(accessToken: string, broadcasterId: string) {
    const response = await axios.get(`https://api.twitch.tv/helix/channels?broadcaster_id=${broadcasterId}`, {
      headers: {
        'Client-ID': this.clientId,
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    return response.data.data[0];
  }

  async getStreamInfo(accessToken: string, broadcasterId: string) {
    const response = await axios.get(`https://api.twitch.tv/helix/streams?user_id=${broadcasterId}`, {
      headers: {
        'Client-ID': this.clientId,
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    return response.data.data[0];
  }

  async getFollowers(accessToken: string, broadcasterId: string) {
    const response = await axios.get(`https://api.twitch.tv/helix/users/follows?to_id=${broadcasterId}`, {
      headers: {
        'Client-ID': this.clientId,
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    return response.data;
  }

  async getSubscribers(accessToken: string, broadcasterId: string) {
    const response = await axios.get(`https://api.twitch.tv/helix/subscriptions?broadcaster_id=${broadcasterId}`, {
      headers: {
        'Client-ID': this.clientId,
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    return response.data;
  }
} 