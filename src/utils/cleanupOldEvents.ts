import fs from 'fs';
import path from 'path';
import { StandbyEvent } from '../types/eventTypes';

const EVENTS_DIR = path.join(__dirname, '..', '..', 'data', 'events');

function getAllEventFiles(): string[] {
  return fs.readdirSync(EVENTS_DIR).filter(file => file.endsWith('.json'));
}

function loadEvent(filePath: string): StandbyEvent | null {
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return null;
  }
}

function deleteFile(filePath: string) {
  try {
    fs.unlinkSync(filePath);
    console.log(`🗑️ Törölve: ${path.basename(filePath)}`);
  } catch (err) {
    console.error(`❌ Nem sikerült törölni: ${filePath}`, err);
  }
}

export function cleanupOldEvents() {
  const now = new Date();
  const files = getAllEventFiles();

  files.forEach(file => {
    const fullPath = path.join(EVENTS_DIR, file);
    const event = loadEvent(fullPath);
    if (!event || !event.end) return;

    const endDate = new Date(event.end);
    if (endDate < now) {
      deleteFile(fullPath);
    }
  });

  console.log('✅ Takarítás kész.');
}
