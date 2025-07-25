import { DMChannel } from 'discord.js';
import { askQuestion } from '../utils/askQuestion';
import { StandbyEvent } from '../types/eventTypes';
import i18next from 'i18next';

export async function askStartTime(dm: DMChannel, userId: string, event: StandbyEvent): Promise<void> {
  const input = await askQuestion(dm, userId, i18next.t('askStartTime.prompt'));
  const date = new Date((input ?? '').replace(' ', 'T'));

  if (!input || isNaN(date.getTime())) {
    await dm.send(i18next.t('askStartTime.invalid'));
    throw new Error('invalid-start');
  }

  event.start = date.toISOString();
}
