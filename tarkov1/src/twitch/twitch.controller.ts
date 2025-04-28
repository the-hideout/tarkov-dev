import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { TwitchService } from './twitch.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('twitch')
@UseGuards(JwtAuthGuard)
export class TwitchController {
  constructor(private readonly twitchService: TwitchService) {}

  @Get('channel')
  async getChannelInfo(@Req() req: any) {
    return this.twitchService.getChannelInfo(req.user.accessToken, req.user.twitchId);
  }

  @Get('stream')
  async getStreamInfo(@Req() req: any) {
    return this.twitchService.getStreamInfo(req.user.accessToken, req.user.twitchId);
  }

  @Get('followers')
  async getFollowers(@Req() req: any) {
    return this.twitchService.getFollowers(req.user.accessToken, req.user.twitchId);
  }

  @Get('subscribers')
  async getSubscribers(@Req() req: any) {
    return this.twitchService.getSubscribers(req.user.accessToken, req.user.twitchId);
  }
} 