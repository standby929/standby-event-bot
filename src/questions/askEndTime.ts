import { DMChannel } from 'discord.js';
import { askQuestion } from '../utils/askQuestion';
import { StandbyEvent } from '../types/eventTypes';
import i18next from 'i18next';

export async function askEndTime(dm: DMChannel, userId: string, event: StandbyEvent): Promise<void> {
  const input = await askQuestion(dm, userId, i18next.t('askEndTime.prompt'));
  const end = new Date((input ?? '').replace(' ', 'T'));
  const start = new Date(event.start);

  if (!input || isNaN(end.getTime()) || end <= start) {
    await dm.send(i18next.t('askEndTime.invalid'));
    throw new Error('invalid-end');
  }

  event.end = end.toISOString();
}
