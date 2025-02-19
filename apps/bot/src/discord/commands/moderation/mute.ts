import { 
  SlashCommandBuilder, 
  CommandInteraction, 
  PermissionFlagsBits,
  GuildMember
} from 'discord.js';
import { EventLogService, ModerationService } from '@marksoftbot/core';

export const data = new SlashCommandBuilder()
  .setName('mute')
  .setDescription('Timeout a user')
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
  .addUserOption(option =>
    option
      .setName('user')
      .setDescription('The user to timeout')
      .setRequired(true)
  )
  .addNumberOption(option =>
    option
      .setName('duration')
      .setDescription('Duration in minutes')
      .setRequired(true)
      .setMinValue(1)
      .setMaxValue(40320) // 4 weeks
  )
  .addStringOption(option =>
    option
      .setName('reason')
      .setDescription('Reason for the timeout')
      .setRequired(false)
  );

export async function execute(interaction: CommandInteraction) {
  if (!interaction.guild) return;

  const targetUser = interaction.options.getUser('user');
  const duration = interaction.options.get('duration')?.value as number;
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

  // Check if the bot can timeout the user
  if (!member.moderatable) {
    await interaction.reply({ 
      content: 'I cannot timeout this user. They may have higher permissions than me.',
      ephemeral: true 
    });
    return;
  }

  // Check if the command user has higher role than the target
  const executor = interaction.member as GuildMember;
  if (member.roles.highest.position >= executor.roles.highest.position) {
    await interaction.reply({ 
      content: 'You cannot timeout this user as they have equal or higher roles than you.',
      ephemeral: true 
    });
    return;
  }

  try {
    // Convert minutes to milliseconds
    const durationMs = duration * 60 * 1000;
    await member.timeout(durationMs, reason);

    // Get moderation settings to check if we should assign mute role
    const moderationService = new ModerationService();
    const settings = await moderationService.getSettings({
      userId: interaction.guild.ownerId,
      guildId: interaction.guild.id,
    });

    // If mute role is configured, assign it
    if (settings.muteRole) {
      try {
        const muteRole = interaction.guild.roles.cache.get(settings.muteRole);
        if (muteRole) {
          await member.roles.add(muteRole);
        }
      } catch (error) {
        console.error('Error assigning mute role:', error);
      }
    }

    // Log the timeout
    const eventLogService = new EventLogService();
    await eventLogService.logEvent({
      userId: interaction.guild.ownerId,
      guildId: interaction.guild.id,
      type: 'MEMBER_TIMEOUT',
      data: {
        username: targetUser.username,
        reason,
        duration: duration,
        expiresAt: new Date(Date.now() + durationMs),
      },
      metadata: {
        targetUserId: targetUser.id,
        moderatorId: interaction.user.id,
      },
    });

    await interaction.reply({
      content: `Successfully timed out ${targetUser.tag} for ${duration} minutes\nReason: ${reason}`,
      ephemeral: true,
    });
  } catch (error) {
    console.error('Error timing out user:', error);
    await interaction.reply({
      content: 'Failed to timeout user.',
      ephemeral: true,
    });
  }
} 