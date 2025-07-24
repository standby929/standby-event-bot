// src/utils/persistence.ts
import fs from 'fs/promises';
import path from 'path';
import { StandbyEvent } from '../types/eventTypes';

const EVENTS_DIR = path.join(__dirname, '../../data/events');

// Egyszerű fájlírási sor (írási ütközések ellen)
const writeQueue: Map<string, Promise<void>> = new Map();

export async function saveEventToFile(event: StandbyEvent): Promise<void> {
  if (!event.messageId) return;
  const filename = path.join(EVENTS_DIR, `${event.messageId}.json`);
  const json = JSON.stringify(event, null, 2);

  const lastWrite = writeQueue.get(filename) || Promise.resolve();

  const newWrite = lastWrite.then(() =>
    fs.mkdir(EVENTS_DIR, { recursive: true })
      .then(() => fs.writeFile(filename, json))
      .catch(err => console.error('❌ Nem sikerült menteni a fájlt:', err))
  );

  writeQueue.set(filename, newWrite);
}

export async function loadEventsFromFiles(): Promise<Map<string, StandbyEvent>> {
  const events = new Map<string, StandbyEvent>();
  try {
    await fs.mkdir(EVENTS_DIR, { recursive: true });
    const files = await fs.readdir(EVENTS_DIR);
    for (const file of files) {
      if (!file.endsWith('.json')) continue;
      const data = await fs.readFile(path.join(EVENTS_DIR, file), 'utf-8');
      const event = JSON.parse(data) as StandbyEvent;
      if (event.messageId) {
        events.set(event.messageId, event);
      }
    }
  } catch (err) {
    console.error('❌ Hiba a fájlok beolvasásakor:', err);
  }
  return events;
}

export async function deleteEventFile(messageId: string): Promise<void> {
  const filename = path.join(EVENTS_DIR, `${messageId}.json`);
  try {
    await fs.unlink(filename);
  } catch (err) {
    console.error('❌ Nem sikerült törölni a fájlt:', err);
  }
}
