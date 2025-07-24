import { DMChannel } from 'discord.js';
import { askQuestion } from '../utils/askQuestion';
import { StandbyEvent } from '../types/eventTypes';

export async function askTitle(
  dm: DMChannel,
  userId: string,
  event: StandbyEvent
): Promise<void> {
  const title = await askQuestion(dm, userId, '📝 Mi az esemény címe? (max 50 karakter)');
  if (!title || title.length > 50) {
    await dm.send('❌ Hibás cím. Kiléptem.');
    throw new Error('invalid-title');
  }
  event.title = title;
}