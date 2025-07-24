import {
  ButtonInteraction,
  EmbedBuilder,
  GuildMember,
} from 'discord.js';
import { StandbyEvent } from '../types/eventTypes';
import { saveEventToFile } from './persistence';

export async function handleButtonInteraction(
  interaction: ButtonInteraction,
  activeEvents: Map<string, StandbyEvent>
): Promise<void> {
  const messageId = interaction.message.id;
  const event = activeEvents.get(messageId);
  if (!event) return;

  const optionIndex = parseInt(interaction.customId.replace('opt_', ''), 10);
  const option = event.options[optionIndex];
  if (!option) return;

  const member = interaction.member as GuildMember;
  const hasRole = option.roleId
    ? member.roles.cache.has(option.roleId)
    : true;

  if (!hasRole) {
    await interaction.reply({
      content: '❌ Ehhez az opcióhoz nem rendelkezel megfelelő szerepkörrel.',
      ephemeral: true,
    });
    return;
  }

  const username = interaction.user.username;
  const currentIndex = event.options.findIndex(opt => opt.users.includes(username));

  if (currentIndex === optionIndex) {
    // ugyanarra kattintott, mint amiben már benne van → törlés
    option.users = option.users.filter(u => u !== username);
  } else {
    // máshol van már → onnan törlés
    if (currentIndex !== -1) {
      event.options[currentIndex].users = event.options[currentIndex].users.filter(u => u !== username);
    }
    // új helyre hozzáadás
    option.users.push(username);
  }

  // Build updated embed
  const embed = new EmbedBuilder()
    .setTitle(`📅 ${event.title}`)
    .setDescription(event.description || '_Nincs leírás megadva_')
    .addFields(
      {
        name: '🕒 Időpont',
        value: `<t:${Math.floor(new Date(event.start).getTime() / 1000)}> – <t:${Math.floor(new Date(event.end).getTime() / 1000)}>`
      },
      ...event.options.map(opt => ({
        name: opt.label,
        value: opt.users.length > 0 ? opt.users.join(', ') : '_Még senki_',
        inline: true
      }))
    )
    .setColor(0x00bfff)
    .setFooter({ text: `Létrehozta: ${interaction.message.interaction?.user.username || 'ismeretlen'}` });

  await interaction.update({ embeds: [embed] });
  await saveEventToFile(event);
}
