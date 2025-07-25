import { DMChannel } from 'discord.js';
import { askQuestion } from '../utils/askQuestion';
import { StandbyEvent } from '../types/eventTypes';
import i18next from 'i18next';

export async function askDescription(dm: DMChannel, userId: string, event: StandbyEvent): Promise<void> {
  const input = await askQuestion(dm, userId, i18next.t('askDescription.prompt'));

  if (!input) {
    await dm.send(i18next.t('error.noResponse'));
    throw new Error('no-description');
  }

  if (input === '-' || input.toLowerCase() === i18next.t('common.none')) {
    event.description = null;
  } else if (input.length > 300) {
    await dm.send(i18next.t('askDescription.tooLong'));
    throw new Error('description-too-long');
  } else {
    event.description = input;
  }
}
