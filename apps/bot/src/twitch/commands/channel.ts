import { ChatUserstate, Client } from 'tmi.js';
import { LoyaltyService, TimerService } from '@marksoftbot/core';
import { Command } from '../Command';
import { ChannelService } from '../services/ChannelService';

export default class ChannelCommand extends Command {
  public name = 'channel';
  public aliases = ['ch'];
  public userLevel = 'moderator' as const;
  public cooldown = 5;

  private channelService: ChannelService;

  constructor(
    client: Client,
    loyaltyService: LoyaltyService,
    timerService: TimerService
  ) {
    super(client, loyaltyService, timerService);
    this.channelService = new ChannelService();
  }

  public async execute(channel: string, userstate: ChatUserstate, args: string[]): Promise<void> {
    const channelName = channel.replace('#', '');
    const subcommand = args[0]?.toLowerCase();

    try {
      switch (subcommand) {
        case 'settings':
          await this.handleSettings(channel, channelName);
          break;

        case 'points':
          if (args.length < 3) {
            await this.client.say(channel, 'Usage: !channel points <name/multiplier> <value>');
            return;
          }
          await this.handlePointsSettings(channel, channelName, args[1], args[2]);
          break;

        case 'enable':
        case 'disable':
          await this.handleToggle(channel, channelName, subcommand === 'enable');
          break;

        case 'autojoin':
          if (args.length < 2) {
            await this.client.say(channel, 'Usage: !channel autojoin <on/off>');
            return;
          }
          await this.handleAutoJoin(channel, channelName, args[1].toLowerCase() === 'on');
          break;

        default:
          await this.client.say(channel, 
            'Channel commands: !channel settings, !channel points <name/multiplier> <value>, ' +
            '!channel enable/disable, !channel autojoin <on/off>'
          );
      }
    } catch (error) {
      console.error('Error handling channel command:', error);
      throw error;
    }
  }

  private async handleSettings(channel: string, channelName: string): Promise<void> {
    const settings = await this.channelService.getChannel(channelName);
    if (!settings) {
      await this.client.say(channel, 'Channel settings not found.');
      return;
    }

    await this.client.say(channel, 
      `Channel settings: Points name: ${settings.pointsName}, ` +
      `Points per message: ${settings.pointsPerMessage}, ` +
      `Points per minute: ${settings.pointsPerMinute}, ` +
      `Subscriber multiplier: ${settings.subscriberMultiplier}x, ` +
      `Status: ${settings.enabled ? 'Enabled' : 'Disabled'}, ` +
      `Auto-join: ${settings.autoJoin ? 'On' : 'Off'}`
    );
  }

  private async handlePointsSettings(
    channel: string, 
    channelName: string, 
    setting: string, 
    value: string
  ): Promise<void> {
    const settings = await this.channelService.getChannel(channelName);
    if (!settings) {
      await this.client.say(channel, 'Channel settings not found.');
      return;
    }

    switch (setting) {
      case 'name':
        await this.channelService.updateChannel(channelName, { pointsName: value });
        await this.client.say(channel, `Points name updated to "${value}"`);
        break;

      case 'multiplier':
        const multiplier = parseFloat(value);
        if (isNaN(multiplier) || multiplier < 0) {
          await this.client.say(channel, 'Invalid multiplier value.');
          return;
        }
        await this.channelService.updateChannel(channelName, { subscriberMultiplier: multiplier });
        await this.client.say(channel, `Subscriber multiplier updated to ${multiplier}x`);
        break;

      default:
        await this.client.say(channel, 'Invalid points setting. Use "name" or "multiplier".');
    }
  }

  private async handleToggle(channel: string, channelName: string, enabled: boolean): Promise<void> {
    const success = await this.channelService.toggleChannel(channelName, enabled);
    if (success) {
      await this.client.say(channel, `Channel has been ${enabled ? 'enabled' : 'disabled'}.`);
    } else {
      await this.client.say(channel, 'Failed to update channel status.');
    }
  }

  private async handleAutoJoin(channel: string, channelName: string, autoJoin: boolean): Promise<void> {
    const updated = await this.channelService.updateChannel(channelName, { autoJoin });
    if (updated) {
      await this.client.say(channel, `Auto-join has been turned ${autoJoin ? 'on' : 'off'}.`);
    } else {
      await this.client.say(channel, 'Failed to update auto-join setting.');
    }
  }
} 