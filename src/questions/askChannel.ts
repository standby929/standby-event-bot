import { ChannelType, DMChannel, Guild, GuildMember, PermissionsBitField } from 'discord.js';
import { askQuestion } from '../utils/askQuestion';
import { StandbyEvent } from '../types/eventTypes';
import i18next from 'i18next';

export async function askChannel(
  dm: DMChannel,
  userId: string,
  guild: Guild,
  botMember: GuildMember,
  event: StandbyEvent,
): Promise<void> {
  const textChannels = guild.channels.cache
    .filter(
      c =>
        c.isTextBased() &&
        c.type === ChannelType.GuildText &&
        c.viewable &&
        botMember.permissionsIn(c).has([PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages]),
    )
    .map(c => ({
      id: c.id,
      name: c.parent ? `${c.parent.name} / ${c.name}` : c.name,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  if (textChannels.length === 0) {
    await dm.send(i18next.t('askChannel.noChannels'));
    throw new Error('no-valid-channels');
  }

  const channelList = textChannels.map((ch, index) => `${index + 1}. ${ch.name}`).join('\n');
  const answer = await askQuestion(dm, userId, i18next.t('askChannel.prompt', { channels: channelList }));

  const index = parseInt(answer ?? '', 10);
  const selected = textChannels[index - 1];

  if (!selected || isNaN(index)) {
    await dm.send(i18next.t('askChannel.invalid'));
    throw new Error('invalid-channel');
  }

  event.channelId = selected.id;
}
