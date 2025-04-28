import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BotService } from './bot.service';
import { BotController } from './bot.controller';
import { ModerationModule } from './moderation/moderation.module';
import { CommandsModule } from './commands/commands.module';
import { EftModule } from './eft/eft.module';
import { GamesModule } from './games/games.module';
import { MusicModule } from './music/music.module';
import { AnalyticsModule } from './analytics/analytics.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ModerationModule,
    CommandsModule,
    EftModule,
    GamesModule,
    MusicModule,
    AnalyticsModule,
  ],
  controllers: [BotController],
  providers: [BotService],
  exports: [BotService],
})
export class BotModule {} 