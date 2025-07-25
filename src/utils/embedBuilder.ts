import { EmbedBuilder } from 'discord.js';
import { StandbyEvent } from '../types/eventTypes';
import i18next from 'i18next';

export function buildEventEmbed(event: StandbyEvent): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setTitle(`📅 ${event.title}`)
    .setDescription(event.description || i18next.t('embed.noDescription'))
    .addFields(
      {
        name: i18next.t('embed.timeLabel'),
        value: `<t:${Math.floor(new Date(event.start).getTime() / 1000)}> – <t:${Math.floor(
          new Date(event.end).getTime() / 1000,
        )}>`,
      },
      ...event.options.map(opt => {
        const userCount = opt.users.length;
        const maxCount = opt.maxUsers ?? null;
        const countText = maxCount
          ? i18next.t('embed.countWithMax', { current: userCount, max: maxCount })
          : i18next.t('embed.countOnly', { current: userCount });

        const userList = userCount > 0 ? opt.users.map(u => u.name).join('\n') : i18next.t('embed.noOne');

        return {
          name: `${opt.label} ${countText}`,
          value: userList,
          inline: true,
        };
      }),
    )
    .setColor(0x00bfff)
    .setFooter({ text: i18next.t('embed.createdBy', { name: event.createdBy }) });

  return embed;
}
