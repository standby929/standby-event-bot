import fs from 'fs/promises';
import path from 'path';
import { StandbyEvent } from '../types/eventTypes';
import i18next from 'i18next';

const EVENTS_DIR = path.join(__dirname, '../../data/events');

// Simple file write (against write conflicts)
const writeQueue: Map<string, Promise<void>> = new Map();

export async function saveEventToFile(event: StandbyEvent): Promise<void> {
  if (!event.messageId) return;
  const filename = path.join(EVENTS_DIR, `${event.messageId}.json`);
  const json = JSON.stringify(event, null, 2);

  const lastWrite = writeQueue.get(filename) || Promise.resolve();

  const newWrite = lastWrite.then(() =>
    fs
      .mkdir(EVENTS_DIR, { recursive: true })
      .then(() => fs.writeFile(filename, json))
      .catch(err => console.error(i18next.t('console.saveError'), err)),
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
    console.error(i18next.t('console.loadError'), err);
  }
  return events;
}

export async function deleteEventFile(messageId: string): Promise<void> {
  const filePath = path.join(__dirname, '..', 'data', 'events', `${messageId}.json`);
  try {
    await fs.unlink(filePath);
    console.log(i18next.t('console.fileDeleted', { filePath }));
  } catch (err) {
    console.warn(i18next.t('console.fileDeleteFailed', { filePath }), err);
  }
}
