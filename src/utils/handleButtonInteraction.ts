import {
  ButtonInteraction,
  GuildMember,
} from 'discord.js';
import { StandbyEvent } from '../types/eventTypes';
import { deleteEventFile, saveEventToFile } from './persistence';
import { buildEventEmbed } from './embedBuilder';

export async function handleButtonInteraction(
  interaction: ButtonInteraction,
  activeEvents: Map<string, StandbyEvent>
): Promise<void> {
  const messageId = interaction.message.id;
  const event = activeEvents.get(messageId);

  // Lejárt eseményre már nem lehet jelentkezni
  const now = new Date();
  const eventStart = new Date(event?.start || '');
  const isExpired = eventStart < now;

  if (interaction.customId === 'delete') {
    const member = interaction.member as GuildMember;
    const isAdmin = member.roles.cache.some(role => role.name.toLowerCase() === 'admin');

    if (!isAdmin) {
      await interaction.reply({
        content: '❌ Csak admin törölhet eseményt.',
        ephemeral: true
      });
      return;
    }

    if (event) {
      activeEvents.delete(messageId);
      await deleteEventFile(messageId);
    }

    await interaction.message.delete();
    return;
  }

  if (isExpired) {
    await interaction.reply({
      content: '⏰ Ez az esemény már elkezdődött. Nem lehet rá jelentkezni.',
      ephemeral: true
    });
    return;
  }

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

  const isAlreadyInThisOption = currentIndex === optionIndex;

  if (isAlreadyInThisOption) {
    // ugyanarra kattintott → törlés
    option.users = option.users.filter(u => u !== username);
  } else {
    // ha az új opció max kapacitáson van, és nem mi vagyunk benne → nem lehet jelentkezni
    if (option.maxUsers && option.users.length >= option.maxUsers) {
      await interaction.reply({
        content: `❌ Ez az opció elérte a maximális (${option.maxUsers}) főt.`,
        ephemeral: true,
      });
      return;
    }

    // máshol van már → onnan törlés
    if (currentIndex !== -1) {
      event.options[currentIndex].users = event.options[currentIndex].users.filter(u => u !== username);
    }

    // új helyre hozzáadás
    option.users.push(username);
  }

  // Build updated embed
  const embed = buildEventEmbed(event);

  await interaction.update({ embeds: [embed] });
  await saveEventToFile(event);
}
