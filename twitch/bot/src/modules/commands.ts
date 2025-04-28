import { Client } from 'tmi.js';
import { Logger } from '../utils/logger';
import { RedisService } from '../services/redis';

interface Command {
  trigger: string;
  response: string;
  permission: string;
  cooldown: number;
  lastUsed: number;
}

export class CommandModule {
  private client: Client;
  private logger: Logger;
  private redis: RedisService;
  private commands: Map<string, Command>;
  private userCooldowns: Map<string, Map<string, number>>;

  constructor(client: Client) {
    this.client = client;
    this.logger = new Logger('commands');
    this.redis = new RedisService();
    this.commands = new Map();
    this.userCooldowns = new Map();

    this.loadCommands();
    this.registerModerationCommands();
  }

  private async registerModerationCommands(): Promise<void> {
    // Moderation settings command
    await this.addCommand({
      trigger: 'modsettings',
      response: 'Current moderation settings: Caps: {caps}%, Max length: {length}, Spam threshold: {spam}, Toxicity threshold: {toxicity}',
      permission: 'mod',
      cooldown: 30,
      lastUsed: 0
    });

    // Set moderation setting command
    await this.addCommand({
      trigger: 'setmodsetting',
      response: 'Usage: !setmodsetting [setting] [value]. Available settings: caps, length, spam, toxicity',
      permission: 'mod',
      cooldown: 10,
      lastUsed: 0
    });

    // Blacklist management command
    await this.addCommand({
      trigger: 'blacklist',
      response: 'Usage: !blacklist [add/remove] [word/url] [value]',
      permission: 'mod',
      cooldown: 10,
      lastUsed: 0
    });

    // Moderation statistics command
    await this.addCommand({
      trigger: 'modstats',
      response: 'Moderation stats: Timeouts: {timeouts}, Messages checked: {messages}, Toxicity detected: {toxicity}',
      permission: 'mod',
      cooldown: 30,
      lastUsed: 0
    });

    // Timeout command
    await this.addCommand({
      trigger: 'timeout',
      response: 'Usage: !timeout [username] [duration] [reason]',
      permission: 'mod',
      cooldown: 5,
      lastUsed: 0
    });

    // Ban command
    await this.addCommand({
      trigger: 'ban',
      response: 'Usage: !ban [username] [reason]',
      permission: 'mod',
      cooldown: 5,
      lastUsed: 0
    });

    // Unban command
    await this.addCommand({
      trigger: 'unban',
      response: 'Usage: !unban [username]',
      permission: 'mod',
      cooldown: 5,
      lastUsed: 0
    });

    // Moderation log command
    await this.addCommand({
      trigger: 'modlog',
      response: 'Usage: !modlog [count]',
      permission: 'mod',
      cooldown: 10,
      lastUsed: 0
    });
  }

  private async loadCommands(): Promise<void> {
    try {
      const commands = await this.redis.get('commands');
      if (commands) {
        const parsedCommands = JSON.parse(commands);
        parsedCommands.forEach((cmd: Command) => {
          this.commands.set(cmd.trigger, { ...cmd, lastUsed: 0 });
        });
      }
    } catch (error) {
      this.logger.error('Failed to load commands:', error);
    }
  }

  public async handleMessage(channel: string, tags: any, message: string): Promise<void> {
    if (!message.startsWith('!')) return;

    const [trigger, ...args] = message.slice(1).split(' ');
    const command = this.commands.get(trigger.toLowerCase());

    if (!command) return;

    // Check permissions
    if (!this.hasPermission(tags, command.permission)) {
      await this.client.say(channel, 'You do not have permission to use this command.');
      return;
    }

    // Handle moderation commands
    if (trigger.toLowerCase() === 'modsettings') {
      await this.handleModSettings(channel);
      return;
    } else if (trigger.toLowerCase() === 'setmodsetting') {
      await this.handleSetModSetting(channel, args);
      return;
    } else if (trigger.toLowerCase() === 'blacklist') {
      await this.handleBlacklist(channel, args);
      return;
    } else if (trigger.toLowerCase() === 'modstats') {
      await this.handleModStats(channel);
      return;
    } else if (trigger.toLowerCase() === 'timeout') {
      await this.handleTimeout(channel, args);
      return;
    } else if (trigger.toLowerCase() === 'ban') {
      await this.handleBan(channel, args);
      return;
    } else if (trigger.toLowerCase() === 'unban') {
      await this.handleUnban(channel, args);
      return;
    } else if (trigger.toLowerCase() === 'modlog') {
      await this.handleModLog(channel, args);
      return;
    }

    // Check cooldown
    if (!this.checkCooldown(tags.username, command)) {
      const remaining = Math.ceil((command.lastUsed + command.cooldown * 1000 - Date.now()) / 1000);
      await this.client.say(channel, `Command is on cooldown. Please wait ${remaining} seconds.`);
      return;
    }

    // Execute command
    try {
      const response = this.formatResponse(command.response, {
        user: tags['display-name'] || tags.username,
        game: tags['game-name'] || 'Unknown Game',
        args: args.join(' ')
      });

      await this.client.say(channel, response);
      this.updateCooldown(tags.username, command);
    } catch (error) {
      this.logger.error(`Error executing command ${trigger}:`, error);
      await this.client.say(channel, 'Error executing command. Please try again later.');
    }
  }

  private hasPermission(tags: any, requiredPermission: string): boolean {
    const userPermissions = this.getUserPermissions(tags);
    return userPermissions.includes(requiredPermission) || requiredPermission === 'everyone';
  }

  private getUserPermissions(tags: any): string[] {
    const permissions: string[] = ['everyone'];

    if (tags.mod) permissions.push('mod');
    if (tags.subscriber) permissions.push('subscriber');
    if (tags.badges?.broadcaster) permissions.push('broadcaster');
    if (tags.badges?.vip) permissions.push('vip');

    return permissions;
  }

  private checkCooldown(username: string, command: Command): boolean {
    const now = Date.now();
    const userCooldowns = this.userCooldowns.get(username) || new Map();
    const lastUsed = userCooldowns.get(command.trigger) || 0;

    return now - lastUsed >= command.cooldown * 1000;
  }

  private updateCooldown(username: string, command: Command): void {
    const userCooldowns = this.userCooldowns.get(username) || new Map();
    userCooldowns.set(command.trigger, Date.now());
    this.userCooldowns.set(username, userCooldowns);
  }

  private formatResponse(response: string, variables: Record<string, string>): string {
    return response.replace(/\$\((\w+)\)/g, (match, key) => {
      return variables[key] || match;
    });
  }

  public async addCommand(command: Command): Promise<void> {
    try {
      this.commands.set(command.trigger.toLowerCase(), { ...command, lastUsed: 0 });
      await this.saveCommands();
    } catch (error) {
      this.logger.error('Failed to add command:', error);
      throw error;
    }
  }

  public async removeCommand(trigger: string): Promise<void> {
    try {
      this.commands.delete(trigger.toLowerCase());
      await this.saveCommands();
    } catch (error) {
      this.logger.error('Failed to remove command:', error);
      throw error;
    }
  }

  private async saveCommands(): Promise<void> {
    try {
      const commands = Array.from(this.commands.values()).map(({ lastUsed, ...cmd }) => cmd);
      await this.redis.set('commands', JSON.stringify(commands));
    } catch (error) {
      this.logger.error('Failed to save commands:', error);
      throw error;
    }
  }

  private async handleModSettings(channel: string): Promise<void> {
    try {
      const caps = await this.redis.get('moderation:max_caps_percentage') || '50';
      const length = await this.redis.get('moderation:max_message_length') || '500';
      const spam = await this.redis.get('moderation:spam_threshold') || '5';
      const toxicity = await this.redis.get('moderation:toxicity_threshold') || '0.7';

      await this.client.say(channel, `Current moderation settings: Caps: ${caps}%, Max length: ${length}, Spam threshold: ${spam}, Toxicity threshold: ${toxicity}`);
    } catch (error) {
      this.logger.error('Error getting moderation settings:', error);
      await this.client.say(channel, 'Error getting moderation settings. Please try again later.');
    }
  }

  private async handleSetModSetting(channel: string, args: string[]): Promise<void> {
    if (args.length !== 2) {
      await this.client.say(channel, 'Usage: !setmodsetting [setting] [value]. Available settings: caps, length, spam, toxicity');
      return;
    }

    const [setting, value] = args;
    const validSettings = ['caps', 'length', 'spam', 'toxicity'];
    
    if (!validSettings.includes(setting)) {
      await this.client.say(channel, 'Invalid setting. Available settings: caps, length, spam, toxicity');
      return;
    }

    try {
      await this.redis.set(`moderation:${setting}_threshold`, value);
      await this.client.say(channel, `Updated ${setting} threshold to ${value}`);
    } catch (error) {
      this.logger.error(`Error setting moderation setting ${setting}:`, error);
      await this.client.say(channel, 'Error updating setting. Please try again later.');
    }
  }

  private async handleBlacklist(channel: string, args: string[]): Promise<void> {
    if (args.length < 2) {
      await this.client.say(channel, 'Usage: !blacklist [add/remove] [word/url] [value]');
      return;
    }

    const [action, type, ...valueParts] = args;
    const value = valueParts.join(' ');

    if (!['add', 'remove'].includes(action) || !['word', 'url'].includes(type)) {
      await this.client.say(channel, 'Usage: !blacklist [add/remove] [word/url] [value]');
      return;
    }

    try {
      const key = `moderation:blacklisted_${type}s`;
      const currentList = await this.redis.get(key) || '[]';
      const list = JSON.parse(currentList);

      if (action === 'add') {
        if (!list.includes(value)) {
          list.push(value);
          await this.redis.set(key, JSON.stringify(list));
          await this.client.say(channel, `Added ${value} to ${type} blacklist`);
        } else {
          await this.client.say(channel, `${value} is already in the ${type} blacklist`);
        }
      } else {
        const index = list.indexOf(value);
        if (index !== -1) {
          list.splice(index, 1);
          await this.redis.set(key, JSON.stringify(list));
          await this.client.say(channel, `Removed ${value} from ${type} blacklist`);
        } else {
          await this.client.say(channel, `${value} is not in the ${type} blacklist`);
        }
      }
    } catch (error) {
      this.logger.error(`Error managing blacklist:`, error);
      await this.client.say(channel, 'Error managing blacklist. Please try again later.');
    }
  }

  private async handleModStats(channel: string): Promise<void> {
    try {
      const timeouts = await this.redis.get('moderation:timeout_count') || '0';
      const messages = await this.redis.get('moderation:message_count') || '0';
      const toxicity = await this.redis.get('moderation:toxicity_count') || '0';

      await this.client.say(channel, `Moderation stats: Timeouts: ${timeouts}, Messages checked: ${messages}, Toxicity detected: ${toxicity}`);
    } catch (error) {
      this.logger.error('Error getting moderation stats:', error);
      await this.client.say(channel, 'Error getting moderation stats. Please try again later.');
    }
  }

  private async handleTimeout(channel: string, args: string[]): Promise<void> {
    if (args.length < 2) {
      await this.client.say(channel, 'Usage: !timeout [username] [duration] [reason]');
      return;
    }

    const [username, duration, ...reasonParts] = args;
    const reason = reasonParts.join(' ') || 'No reason provided';
    const durationSeconds = parseInt(duration);

    if (isNaN(durationSeconds) || durationSeconds < 1 || durationSeconds > 1209600) {
      await this.client.say(channel, 'Invalid duration. Must be between 1 and 1209600 seconds (14 days).');
      return;
    }

    try {
      await this.client.timeout(channel, username, durationSeconds, reason);
      await this.logModAction('timeout', username, durationSeconds, reason);
      await this.client.say(channel, `${username} has been timed out for ${durationSeconds} seconds. Reason: ${reason}`);
    } catch (error) {
      this.logger.error(`Error timing out user ${username}:`, error);
      await this.client.say(channel, 'Error timing out user. Please try again later.');
    }
  }

  private async handleBan(channel: string, args: string[]): Promise<void> {
    if (args.length < 1) {
      await this.client.say(channel, 'Usage: !ban [username] [reason]');
      return;
    }

    const [username, ...reasonParts] = args;
    const reason = reasonParts.join(' ') || 'No reason provided';

    try {
      await this.client.ban(channel, username, reason);
      await this.logModAction('ban', username, 0, reason);
      await this.client.say(channel, `${username} has been banned. Reason: ${reason}`);
    } catch (error) {
      this.logger.error(`Error banning user ${username}:`, error);
      await this.client.say(channel, 'Error banning user. Please try again later.');
    }
  }

  private async handleUnban(channel: string, args: string[]): Promise<void> {
    if (args.length < 1) {
      await this.client.say(channel, 'Usage: !unban [username]');
      return;
    }

    const username = args[0];

    try {
      await this.client.unban(channel, username);
      await this.logModAction('unban', username, 0, '');
      await this.client.say(channel, `${username} has been unbanned.`);
    } catch (error) {
      this.logger.error(`Error unbanning user ${username}:`, error);
      await this.client.say(channel, 'Error unbanning user. Please try again later.');
    }
  }

  private async handleModLog(channel: string, args: string[]): Promise<void> {
    const count = args.length > 0 ? parseInt(args[0]) : 5;
    
    if (isNaN(count) || count < 1 || count > 20) {
      await this.client.say(channel, 'Invalid count. Must be between 1 and 20.');
      return;
    }

    try {
      const logKey = 'moderation:log';
      const log = await this.redis.get(logKey) || '[]';
      const actions = JSON.parse(log).slice(0, count);

      if (actions.length === 0) {
        await this.client.say(channel, 'No moderation actions found.');
        return;
      }

      const logMessages = actions.map((action: any) => {
        const timestamp = new Date(action.timestamp).toLocaleString();
        return `${timestamp} - ${action.type} ${action.username} ${action.duration ? `(${action.duration}s)` : ''} ${action.reason ? `- ${action.reason}` : ''}`;
      });

      await this.client.say(channel, `Recent moderation actions: ${logMessages.join(' | ')}`);
    } catch (error) {
      this.logger.error('Error getting moderation log:', error);
      await this.client.say(channel, 'Error getting moderation log. Please try again later.');
    }
  }

  private async logModAction(type: string, username: string, duration: number, reason: string): Promise<void> {
    try {
      const logKey = 'moderation:log';
      const log = await this.redis.get(logKey) || '[]';
      const actions = JSON.parse(log);

      actions.unshift({
        type,
        username,
        duration,
        reason,
        timestamp: Date.now()
      });

      // Keep only the last 100 actions
      if (actions.length > 100) {
        actions.pop();
      }

      await this.redis.set(logKey, JSON.stringify(actions));
    } catch (error) {
      this.logger.error('Error logging moderation action:', error);
    }
  }
} 