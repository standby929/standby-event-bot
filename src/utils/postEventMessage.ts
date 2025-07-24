import {
  DMChannel,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Guild,
} from 'discord.js';
import { EventOption, StandbyEvent } from '../types/eventTypes';
import { saveEventToFile } from './persistence';

export async function postEventMessage(
  dm: DMChannel,
  guild: Guild,
  username: string,
  event: StandbyEvent,
  activeEvents: Map<string, StandbyEvent>
): Promise<void> {
  const targetChannel = await guild.channels.fetch(event.channelId);
  if (!targetChannel?.isTextBased()) {
    await dm.send('❌ Nem sikerült megtalálni a kiválasztott csatornát.');
    return;
  }

  const embed = new EmbedBuilder()
    .setTitle(`📅 ${event.title}`)
    .setDescription(event.description || '_Nincs leírás megadva_')
    .addFields(
      {
        name: '🕒 Időpont',
        value: `<t:${Math.floor(new Date(event.start).getTime() / 1000)}> – <t:${Math.floor(new Date(event.end).getTime() / 1000)}>`,
      },
      ...event.options.map(opt => ({
        name: opt.label,
        value: opt.users.length > 0 ? opt.users.join('\n') : '_Még senki_',
        inline: true
      }))
    )
    .setColor(0x00bfff)
    .setFooter({ text: `Létrehozta: ${username}` });

  const row = new ActionRowBuilder<ButtonBuilder>();

  const buttonStyles: ButtonStyle[] = [
    ButtonStyle.Success, // zöld
    ButtonStyle.Danger,  // piros
    ButtonStyle.Primary, // kék
    ButtonStyle.Secondary // szürke
  ];

  event.options.forEach((option: EventOption, index: number) => {
    const style = index < buttonStyles.length ? buttonStyles[index] : buttonStyles[Math.floor(Math.random() * buttonStyles.length)];
    row.addComponents(
      new ButtonBuilder()
        .setCustomId(`opt_${index}`)
        .setLabel(option.label)
        .setStyle(style)
    );
  });

  const message = await (targetChannel as any).send({ embeds: [embed], components: [row] });
  event.messageId = message.id;
  activeEvents.set(message.id, event);

  await saveEventToFile(event);
  await dm.send(`✅ Az esemény sikeresen közzétéve a **#${(targetChannel as any).name}** csatornába!`);
}
