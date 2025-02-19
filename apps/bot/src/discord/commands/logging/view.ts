import { 
  SlashCommandBuilder, 
  CommandInteraction, 
  PermissionFlagsBits,
  EmbedBuilder
} from 'discord.js';
import { EventLogService } from '@marksoftbot/core';

export const data = new SlashCommandBuilder()
  .setName('logs')
  .setDescription('View recent logs')
  .setDefaultMemberPermissions(PermissionFlagsBits.ViewAuditLog)
  .addStringOption(option =>
    option
      .setName('type')
      .setDescription('Type of logs to view')
      .setRequired(false)
      .addChoices(
        { name: 'All', value: 'all' },
        { name: 'Moderation', value: 'mod' },
        { name: 'Members', value: 'member' },
        { name: 'Messages', value: 'message' }
      )
  )
  .addNumberOption(option =>
    option
      .setName('limit')
      .setDescription('Number of logs to show (max 25)')
      .setRequired(false)
      .setMinValue(1)
      .setMaxValue(25)
  );

export async function execute(interaction: CommandInteraction) {
  if (!interaction.guild) return;

  const type = interaction.options.get('type')?.value as string || 'all';
  const limit = interaction.options.get('limit')?.value as number || 10;

  try {
    const eventLogService = new EventLogService();
    const logs = await eventLogService.getEvents({
      userId: interaction.guild.ownerId,
      guildId: interaction.guild.id,
      type: type === 'all' ? undefined : type,
      limit,
    });

    if (!logs.length) {
      await interaction.reply({
        content: 'No logs found for the specified criteria.',
        ephemeral: true,
      });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle('Recent Logs')
      .setColor('#0099ff')
      .setTimestamp();

    for (const log of logs) {
      let fieldValue = '';
      
      switch (log.type) {
        case 'MEMBER_BAN':
        case 'MEMBER_KICK':
        case 'MEMBER_TIMEOUT':
          fieldValue = `**User:** ${log.data.username}\n**Reason:** ${log.data.reason}\n**Moderator:** <@${log.metadata.moderatorId}>`;
          break;
        case 'MEMBER_JOIN':
        case 'MEMBER_LEAVE':
          fieldValue = `**User:** ${log.data.username}\n**Time:** <t:${Math.floor(log.timestamp.getTime() / 1000)}:R>`;
          break;
        case 'MESSAGE_DELETE':
          fieldValue = `**Channel:** <#${log.metadata.channelId}>\n**Author:** <@${log.metadata.targetUserId}>\n**Content:** ${log.data.content}`;
          break;
        default:
          fieldValue = JSON.stringify(log.data, null, 2);
      }

      embed.addFields({
        name: `${log.type} - <t:${Math.floor(log.timestamp.getTime() / 1000)}:R>`,
        value: fieldValue,
      });
    }

    await interaction.reply({ embeds: [embed], ephemeral: true });
  } catch (error) {
    console.error('Error fetching logs:', error);
    await interaction.reply({
      content: 'Failed to fetch logs.',
      ephemeral: true,
    });
  }
} 