import { Client, ChatUserstate } from 'tmi.js';
import { Collection } from '@discordjs/collection';
import { readdirSync } from 'fs';
import { join } from 'path';
import { Command } from './Command';
import { LoyaltyService, TimerService } from '@marksoftbot/core';

export class CommandHandler {
  private commands: Collection<string, Command>;
  private aliases: Collection<string, string>;
  private cooldowns: Collection<string, Collection<string, number>>;

  constructor(
    private client: Client,
    private loyaltyService: LoyaltyService,
    private timerService: TimerService
  ) {
    this.commands = new Collection();
    this.aliases = new Collection();
    this.cooldowns = new Collection();
    this.loadCommands();
  }

  private async loadCommands(): Promise<void> {
    const commandFiles = readdirSync(join(__dirname, 'commands'))
      .filter(file => file.endsWith('.ts') || file.endsWith('.js'));

    for (const file of commandFiles) {
      const CommandClass = (await import(join(__dirname, 'commands', file))).default;
      const command = new CommandClass(this.client, this.loyaltyService, this.timerService);
      
      this.commands.set(command.name, command);
      
      if (command.aliases) {
        command.aliases.forEach(alias => this.aliases.set(alias, command.name));
      }
    }
  }

  public async handleCommand(channel: string, userstate: ChatUserstate, message: string): Promise<void> {
    const args = message.slice(1).split(/\s+/);
    const commandName = args.shift()?.toLowerCase();

    if (!commandName) return;

    const command = this.commands.get(commandName) || 
      this.commands.get(this.aliases.get(commandName) || '');

    if (!command) return;

    // Check user level
    if (!this.checkUserLevel(userstate, command.userLevel)) {
      return;
    }

    // Check cooldown
    if (!this.checkCooldown(channel, userstate, command)) {
      return;
    }

    try {
      await command.execute(channel, userstate, args);
    } catch (error) {
      console.error(`Error executing command ${commandName}:`, error);
    }
  }

  private checkUserLevel(userstate: ChatUserstate, requiredLevel: string): boolean {
    switch (requiredLevel) {
      case 'broadcaster':
        return !!userstate.badges?.broadcaster;
      case 'moderator':
        return !!userstate.mod || !!userstate.badges?.broadcaster;
      case 'vip':
        return !!userstate.badges?.vip || !!userstate.mod || !!userstate.badges?.broadcaster;
      case 'subscriber':
        return !!userstate.subscriber || !!userstate.mod || !!userstate.badges?.broadcaster;
      case 'everyone':
        return true;
      default:
        return false;
    }
  }

  private checkCooldown(channel: string, userstate: ChatUserstate, command: Command): boolean {
    if (!command.cooldown) return true;

    const key = `${channel}:${command.name}`;
    const now = Date.now();
    const cooldownAmount = command.cooldown * 1000;

    if (!this.cooldowns.has(key)) {
      this.cooldowns.set(key, new Collection());
    }

    const timestamps = this.cooldowns.get(key)!;
    const userCooldown = timestamps.get(userstate.username!);

    if (userCooldown) {
      const expirationTime = userCooldown + cooldownAmount;

      if (now < expirationTime) {
        return false;
      }
    }

    timestamps.set(userstate.username!, now);
    setTimeout(() => timestamps.delete(userstate.username!), cooldownAmount);

    return true;
  }
} 