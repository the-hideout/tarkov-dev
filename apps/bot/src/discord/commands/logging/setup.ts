import { 
  SlashCommandBuilder, 
  CommandInteraction, 
  PermissionFlagsBits,
  ChannelType,
  TextChannel,
  EmbedBuilder
} from 'discord.js';
import { EventLogService } from '@marksoftbot/core';

export const data = new SlashCommandBuilder()
  .setName('logging')
  .setDescription('Configure event logging')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .addSubcommand(subcommand =>
    subcommand
      .setName('setup')
      .setDescription('Set up event logging')
      .addChannelOption(option =>
        option
          .setName('channel')
          .setDescription('Channel for logging events')
          .addChannelTypes(ChannelType.GuildText)
          .setRequired(true)
      )
      .addBooleanOption(option =>
        option
          .setName('member_events')
          .setDescription('Log member join/leave events')
          .setRequired(false)
      )
      .addBooleanOption(option =>
        option
          .setName('message_events')
          .setDescription('Log message edits/deletes')
          .setRequired(false)
      )
      .addBooleanOption(option =>
        option
          .setName('mod_actions')
          .setDescription('Log moderation actions')
          .setRequired(false)
      )
  );

export async function execute(interaction: CommandInteraction) {
  if (!interaction.guild) return;

  const channel = interaction.options.getChannel('channel') as TextChannel;
  const memberEvents = interaction.options.get('member_events')?.value as boolean ?? true;
  const messageEvents = interaction.options.get('message_events')?.value as boolean ?? true;
  const modActions = interaction.options.get('mod_actions')?.value as boolean ?? true;

  try {
    // Test webhook permissions
    const testEmbed = new EmbedBuilder()
      .setTitle('Logging Setup Test')
      .setDescription('Testing logging channel permissions...')
      .setColor('#00ff00')
      .setTimestamp();

    await channel.send({ embeds: [testEmbed] });

    // Save logging settings
    const eventLogService = new EventLogService();
    await eventLogService.updateSettings({
      userId: interaction.guild.ownerId,
      guildId: interaction.guild.id,
      settings: {
        enabled: true,
        logChannel: channel.id,
        events: {
          memberEvents,
          messageEvents,
          modActions,
        },
      },
    });

    // Log the setup
    await eventLogService.logEvent({
      userId: interaction.guild.ownerId,
      guildId: interaction.guild.id,
      type: 'LOGGING_SETUP',
      data: {
        channel: channel.id,
        settings: {
          memberEvents,
          messageEvents,
          modActions,
        },
      },
      metadata: {
        moderatorId: interaction.user.id,
      },
    });

    const embed = new EmbedBuilder()
      .setTitle('Logging Setup Complete')
      .setDescription(`Event logging has been configured for this server.
        
        **Channel:** ${channel}
        **Member Events:** ${memberEvents ? '✅' : '❌'}
        **Message Events:** ${messageEvents ? '✅' : '❌'}
        **Moderation Actions:** ${modActions ? '✅' : '❌'}`)
      .setColor('#00ff00')
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  } catch (error) {
    console.error('Error setting up logging:', error);
    await interaction.reply({
      content: 'Failed to set up logging. Make sure I have permission to send messages in the specified channel.',
      ephemeral: true,
    });
  }
} 