import { 
  SlashCommandBuilder, 
  CommandInteraction, 
  PermissionFlagsBits,
  GuildMember
} from 'discord.js';
import { EventLogService } from '@marksoftbot/core';

export const data = new SlashCommandBuilder()
  .setName('ban')
  .setDescription('Ban a user from the server')
  .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
  .addUserOption(option =>
    option
      .setName('user')
      .setDescription('The user to ban')
      .setRequired(true)
  )
  .addStringOption(option =>
    option
      .setName('reason')
      .setDescription('Reason for the ban')
      .setRequired(false)
  )
  .addNumberOption(option =>
    option
      .setName('days')
      .setDescription('Number of days of messages to delete')
      .setMinValue(0)
      .setMaxValue(7)
  );

export async function execute(interaction: CommandInteraction) {
  if (!interaction.guild) return;

  const targetUser = interaction.options.getUser('user');
  const reason = interaction.options.get('reason')?.value as string || 'No reason provided';
  const days = interaction.options.get('days')?.value as number || 0;

  if (!targetUser) {
    await interaction.reply({ content: 'User not found.', ephemeral: true });
    return;
  }

  const member = interaction.guild.members.cache.get(targetUser.id);
  if (!member) {
    await interaction.reply({ content: 'User is not in this server.', ephemeral: true });
    return;
  }

  // Check if the bot can ban the user
  if (!member.bannable) {
    await interaction.reply({ 
      content: 'I cannot ban this user. They may have higher permissions than me.',
      ephemeral: true 
    });
    return;
  }

  // Check if the command user has higher role than the target
  const executor = interaction.member as GuildMember;
  if (member.roles.highest.position >= executor.roles.highest.position) {
    await interaction.reply({ 
      content: 'You cannot ban this user as they have equal or higher roles than you.',
      ephemeral: true 
    });
    return;
  }

  try {
    await member.ban({ deleteMessageDays: days, reason });

    // Log the ban
    const eventLogService = new EventLogService();
    await eventLogService.logEvent({
      userId: interaction.guild.ownerId,
      guildId: interaction.guild.id,
      type: 'MEMBER_BAN',
      data: {
        username: targetUser.username,
        reason,
        messagesPurged: days,
      },
      metadata: {
        targetUserId: targetUser.id,
        moderatorId: interaction.user.id,
      },
    });

    await interaction.reply({
      content: `Successfully banned ${targetUser.tag}\nReason: ${reason}`,
      ephemeral: true,
    });
  } catch (error) {
    console.error('Error banning user:', error);
    await interaction.reply({
      content: 'Failed to ban user.',
      ephemeral: true,
    });
  }
} 