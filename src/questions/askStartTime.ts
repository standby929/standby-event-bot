import { DMChannel } from 'discord.js';
import { askQuestion } from '../utils/askQuestion';
import { StandbyEvent } from '../types/eventTypes';

export async function askStartTime(
  dm: DMChannel,
  userId: string,
  event: StandbyEvent
): Promise<void> {
  const input = await askQuestion(dm, userId, '⏰ Kezdési időpont (ÉÉÉÉ-HH-NN ÓÓ:PP):');
  const date = new Date((input ?? '').replace(' ', 'T'));
  if (!input || isNaN(date.getTime())) {
    await dm.send('❌ Hibás kezdési dátum. Kiléptem.');
    throw new Error('invalid-start');
  }
  event.start = date.toISOString();
}