import { DMChannel, Guild } from 'discord.js';
import { askQuestion } from '../utils/askQuestion';
import { StandbyEvent } from '../types/eventTypes';

export async function askChannel(
  dm: DMChannel,
  userId: string,
  guild: Guild,
  event: StandbyEvent
): Promise<void> {
  const channels = await guild.channels.fetch();
  const textChannels = channels.filter((ch): ch is any => ch?.type === 0);
  const channelList = Array.from(textChannels.values())
    .map((ch, index) => `${index + 1}. ${ch.name}`)
    .join('\n');

  const answer = await askQuestion(
    dm,
    userId,
    `📢 Melyik csatornába posztoljuk az eseményt?\n${channelList}`
  );

  const index = parseInt(answer ?? '', 10);
  const selected = Array.from(textChannels.values())[index - 1];

  if (!selected || isNaN(index)) {
    await dm.send('❌ Érvénytelen szám. Kiléptem.');
    throw new Error('invalid-channel');
  }

  event.channelId = selected.id;
}