import { DMChannel } from 'discord.js';
import { askQuestion } from '../utils/askQuestion';
import { StandbyEvent } from '../types/eventTypes';
import i18next from 'i18next';

export async function askTitle(dm: DMChannel, userId: string, event: StandbyEvent): Promise<void> {
  const title = await askQuestion(dm, userId, i18next.t('askTitle.prompt'));
  if (!title || title.length > 50) {
    await dm.send(i18next.t('askTitle.invalid'));
    throw new Error('invalid-title');
  }
  event.title = title;
}
