import { Module } from '@nestjs/common';
import { TwitchService } from './twitch.service';
import { TwitchController } from './twitch.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [TwitchService],
  controllers: [TwitchController],
  exports: [TwitchService],
})
export class TwitchModule {} 