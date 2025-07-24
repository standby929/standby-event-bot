import { DMChannel } from 'discord.js';
import { askQuestion } from '../utils/askQuestion';
import { StandbyEvent } from '../types/eventTypes';

export async function askEndTime(
  dm: DMChannel,
  userId: string,
  event: StandbyEvent
): Promise<void> {
  const input = await askQuestion(dm, userId, '🛑 Záró időpont (ÉÉÉÉ-HH-NN ÓÓ:PP):');
  const end = new Date((input ?? '').replace(' ', 'T'));
  const start = new Date(event.start);

  if (!input || isNaN(end.getTime()) || end <= start) {
    await dm.send('❌ Hibás záró dátum. Kiléptem.');
    throw new Error('invalid-end');
  }

  event.end = end.toISOString();
}
