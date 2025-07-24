import { EmbedBuilder } from 'discord.js';
import { StandbyEvent } from '../types/eventTypes';

export function buildEventEmbed(event: StandbyEvent): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setTitle(`📅 ${event.title}`)
    .setDescription(event.description || '_Nincs leírás megadva_')
    .addFields(
      {
        name: '🕒 Időpont',
        value: `<t:${Math.floor(new Date(event.start).getTime() / 1000)}> – <t:${Math.floor(new Date(event.end).getTime() / 1000)}>`
      },
      ...event.options.map(opt => {
        const userCount = opt.users.length;
        const maxCount = opt.maxUsers ?? null;
        const countText = maxCount ? `(${userCount} / ${maxCount})` : `(${userCount})`;

        const userList = userCount > 0
          ? opt.users.map(u => u.name).join('\n')
          : '_Még senki_';

        return {
          name: `${opt.label} ${countText}`,
          value: userList,
          inline: true
        };
      })
    )
    .setColor(0x00bfff)
    .setFooter({ text: `Létrehozta: ${event.createdBy}` });

  return embed;
}
