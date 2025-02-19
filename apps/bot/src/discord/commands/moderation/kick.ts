import { 
  SlashCommandBuilder, 
  CommandInteraction, 
  PermissionFlagsBits,
  GuildMember
} from 'discord.js';
import { EventLogService } from '@marksoftbot/core';

export const data = new SlashCommandBuilder()
  .setName('kick')
  .setDescription('Kick a user from the server')
  .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
  .addUserOption(option =>
    option
      .setName('user')
      .setDescription('The user to kick')
      .setRequired(true)
  )
  .addStringOption(option =>
    option
      .setName('reason')
      .setDescription('Reason for the kick')
      .setRequired(false)
  );

export async function execute(interaction: CommandInteraction) {
  if (!interaction.guild) return;

  const targetUser = interaction.options.getUser('user');
  const reason = interaction.options.get('reason')?.value as string || 'No reason provided';

  if (!targetUser) {
    await interaction.reply({ content: 'User not found.', ephemeral: true });
    return;
  }

  const member = interaction.guild.members.cache.get(targetUser.id);
  if (!member) {
    await interaction.reply({ content: 'User is not in this server.', ephemeral: true });
    return;
  }

  // Check if the bot can kick the user
  if (!member.kickable) {
    await interaction.reply({ 
      content: 'I cannot kick this user. They may have higher permissions than me.',
      ephemeral: true 
    });
    return;
  }

  // Check if the command user has higher role than the target
  const executor = interaction.member as GuildMember;
  if (member.roles.highest.position >= executor.roles.highest.position) {
    await interaction.reply({ 
      content: 'You cannot kick this user as they have equal or higher roles than you.',
      ephemeral: true 
    });
    return;
  }

  try {
    await member.kick(reason);

    // Log the kick
    const eventLogService = new EventLogService();
    await eventLogService.logEvent({
      userId: interaction.guild.ownerId,
      guildId: interaction.guild.id,
      type: 'MEMBER_KICK',
      data: {
        username: targetUser.username,
        reason,
      },
      metadata: {
        targetUserId: targetUser.id,
        moderatorId: interaction.user.id,
      },
    });

    await interaction.reply({
      content: `Successfully kicked ${targetUser.tag}\nReason: ${reason}`,
      ephemeral: true,
    });
  } catch (error) {
    console.error('Error kicking user:', error);
    await interaction.reply({
      content: 'Failed to kick user.',
      ephemeral: true,
    });
  }
} 