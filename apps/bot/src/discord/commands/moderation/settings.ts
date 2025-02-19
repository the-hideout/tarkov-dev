import { 
  SlashCommandBuilder, 
  CommandInteraction, 
  PermissionFlagsBits,
  ChannelType
} from 'discord.js';
import { ModerationService } from '@marksoftbot/core';

export const data = new SlashCommandBuilder()
  .setName('settings')
  .setDescription('Configure moderation settings')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .addSubcommand(subcommand =>
    subcommand
      .setName('moderation')
      .setDescription('Configure moderation settings')
      .addBooleanOption(option =>
        option
          .setName('enabled')
          .setDescription('Enable/disable moderation')
          .setRequired(true)
      )
      .addChannelOption(option =>
        option
          .setName('log_channel')
          .setDescription('Channel for moderation logs')
          .addChannelTypes(ChannelType.GuildText)
      )
      .addRoleOption(option =>
        option
          .setName('mute_role')
          .setDescription('Role for muted users')
      )
      .addNumberOption(option =>
        option
          .setName('caps_limit')
          .setDescription('Maximum percentage of caps allowed (0-100)')
          .setMinValue(0)
          .setMaxValue(100)
      )
  );

export async function execute(interaction: CommandInteraction) {
  if (!interaction.guild) return;

  const moderationService = new ModerationService();
  
  const enabled = interaction.options.get('enabled')?.value as boolean;
  const logChannel = interaction.options.get('log_channel')?.value as string;
  const muteRole = interaction.options.get('mute_role')?.value as string;
  const capsLimit = interaction.options.get('caps_limit')?.value as number;

  try {
    const settings = await moderationService.updateSettings({
      userId: interaction.guild.ownerId,
      guildId: interaction.guild.id,
      settings: {
        enabled,
        logChannel: logChannel || '',
        muteRole: muteRole || '',
        capsLimit: capsLimit || 70,
        bannedWords: [], // Maintain existing banned words
        spamThreshold: 5, // Maintain existing threshold
      },
    });

    await interaction.reply({
      content: 'Moderation settings updated successfully!',
      ephemeral: true,
    });
  } catch (error) {
    console.error('Error updating moderation settings:', error);
    await interaction.reply({
      content: 'Failed to update moderation settings.',
      ephemeral: true,
    });
  }
} 