import { DMChannel } from 'discord.js';
import { askQuestion } from '../utils/askQuestion';
import { StandbyEvent } from '../types/eventTypes';

export async function askDescription(
  dm: DMChannel,
  userId: string,
  event: StandbyEvent
): Promise<void> {
  const input = await askQuestion(dm, userId, '💬 Rövid leírás (max 300 karakter), vagy `-` ha nincs:');

  if (!input) {
    await dm.send('❌ Nem érkezett válasz. Kiléptem.');
    throw new Error('no-description');
  }

  if (input === '-' || input.toLowerCase() === 'nincs') {
    event.description = null;
  } else if (input.length > 300) {
    await dm.send('❌ A leírás túl hosszú. Kiléptem.');
    throw new Error('description-too-long');
  } else {
    event.description = input;
  }
}
