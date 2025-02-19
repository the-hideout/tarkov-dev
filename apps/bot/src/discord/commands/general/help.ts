import { SlashCommandBuilder, CommandInteraction, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('help')
  .setDescription('Shows list of available commands')
  .addStringOption(option =>
    option
      .setName('category')
      .setDescription('Command category')
      .setRequired(false)
      .addChoices(
        { name: 'General', value: 'general' },
        { name: 'Moderation', value: 'moderation' },
        { name: 'Logging', value: 'logging' }
      )
  );

export async function execute(interaction: CommandInteraction) {
  const category = interaction.options.get('category')?.value as string | undefined;
  
  const embed = new EmbedBuilder()
    .setColor('#0099ff')
    .setTitle('Bot Commands')
    .setTimestamp();

  if (!category || category === 'general') {
    embed.addFields([
      { name: '/help', value: 'Shows this help message' },
      { name: '/ping', value: 'Check bot latency' }
    ]);
  }

  if (!category || category === 'moderation') {
    embed.addFields([
      { name: '/ban', value: 'Ban a user' },
      { name: '/kick', value: 'Kick a user' },
      { name: '/mute', value: 'Timeout a user' },
      { name: '/settings moderation', value: 'Configure moderation settings' }
    ]);
  }

  if (!category || category === 'logging') {
    embed.addFields([
      { name: '/logging setup', value: 'Set up event logging' },
      { name: '/logging view', value: 'View recent logs' }
    ]);
  }

  await interaction.reply({ embeds: [embed], ephemeral: true });
} 