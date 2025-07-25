import { DMChannel, ActionRowBuilder, ButtonBuilder, ButtonStyle, Guild } from 'discord.js';
import { EventOption, StandbyEvent } from '../types/eventTypes';
import { saveEventToFile } from './persistence';
import { buildEventEmbed } from './embedBuilder';
import i18next from 'i18next';

export async function postEventMessage(
  dm: DMChannel,
  guild: Guild,
  username: string,
  event: StandbyEvent,
  activeEvents: Map<string, StandbyEvent>,
): Promise<void> {
  const targetChannel = await guild.channels.fetch(event.channelId);
  if (!targetChannel?.isTextBased()) {
    await dm.send(i18next.t('error.invalidChannel'));
    return;
  }

  const embed = buildEventEmbed(event);

  const row = new ActionRowBuilder<ButtonBuilder>();

  const buttonStyles: ButtonStyle[] = [
    ButtonStyle.Success,
    ButtonStyle.Danger,
    ButtonStyle.Primary,
    ButtonStyle.Secondary,
  ];

  event.options.forEach((option: EventOption, index: number) => {
    const style =
      index < buttonStyles.length ? buttonStyles[index] : buttonStyles[Math.floor(Math.random() * buttonStyles.length)];
    row.addComponents(new ButtonBuilder().setCustomId(`opt_${index}`).setLabel(option.label).setStyle(style));
  });

  row.addComponents(
    new ButtonBuilder().setCustomId(`delete`).setLabel(i18next.t('post.deleteButton')).setStyle(ButtonStyle.Danger),
  );

  const message = await (targetChannel as any).send({
    embeds: [embed],
    components: [row],
  });
  event.messageId = message.id;
  event.createdBy = username;
  activeEvents.set(message.id, event);

  await saveEventToFile(event);

  await dm.send(
    i18next.t('post.success', {
      channel: (targetChannel as any).name,
    }),
  );
}
