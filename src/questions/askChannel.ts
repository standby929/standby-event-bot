import { ChannelType, DMChannel, Guild } from 'discord.js';
import { askQuestion } from '../utils/askQuestion';
import { StandbyEvent } from '../types/eventTypes';
import i18next from 'i18next';

export async function askChannel(dm: DMChannel, userId: string, guild: Guild, event: StandbyEvent): Promise<void> {
  const textChannels = guild.channels.cache
    .filter(c => c.isTextBased() && c.type === ChannelType.GuildText)
    .map(c => ({
      id: c.id,
      name: c.parent ? `${c.parent.name} / ${c.name}` : c.name,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const channelList = textChannels.map((ch, index) => `${index + 1}. ${ch.name}`).join('\n');

  const answer = await askQuestion(dm, userId, i18next.t('askChannel.prompt', { channels: channelList }));

  const index = parseInt(answer ?? '', 10);
  const selected = Array.from(textChannels.values())[index - 1];

  if (!selected || isNaN(index)) {
    await dm.send(i18next.t('askChannel.invalid'));
    throw new Error('invalid-channel');
  }

  event.channelId = selected.id;
}
