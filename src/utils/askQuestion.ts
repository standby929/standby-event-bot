import { DMChannel, Message } from 'discord.js';

/**
 * Egyszerű kérdés-válasz logika privát csatornán.
 */
export async function askQuestion(
  dm: DMChannel,
  userId: string,
  question: string,
  timeoutMs = 60000
): Promise<string | null> {
  await dm.send(question);
  try {
    const collected = await dm.awaitMessages({
      filter: (m: Message) => m.author.id === userId,
      max: 1,
      time: timeoutMs,
      errors: ['time']
    });
    return collected.first()?.content?.trim() ?? null;
  } catch {
    return null;
  }
}
