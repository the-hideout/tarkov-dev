import { 
  Client, 
  CommandInteraction, 
  SlashCommandBuilder,
  Collection 
} from 'discord.js';
import { readdirSync } from 'fs';
import { join } from 'path';

interface Command {
  data: SlashCommandBuilder;
  execute: (interaction: CommandInteraction) => Promise<void>;
}

export class CommandHandler {
  private commands: Collection<string, Command>;
  private client: Client;

  constructor(client: Client) {
    this.client = client;
    this.commands = new Collection();
    this.loadCommands();
  }

  private async loadCommands(): Promise<void> {
    const commandsPath = join(__dirname, 'commands');
    const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.ts'));

    for (const file of commandFiles) {
      const command = require(join(commandsPath, file));
      if ('data' in command && 'execute' in command) {
        this.commands.set(command.data.name, command);
      }
    }
  }

  public async handleCommand(interaction: CommandInteraction): Promise<void> {
    const command = this.commands.get(interaction.commandName);

    if (!command) {
      console.error(`No command matching ${interaction.commandName} was found.`);
      return;
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: 'There was an error while executing this command!',
        ephemeral: true,
      });
    }
  }

  public async registerCommands(): Promise<void> {
    try {
      console.log('Started refreshing application (/) commands.');

      const commands = this.commands.map(command => command.data.toJSON());
      
      // Register commands globally
      await this.client.application?.commands.set(commands);

      console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
      console.error('Error registering commands:', error);
    }
  }
} 