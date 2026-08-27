import Dexie, { Table } from 'dexie';

export interface LocalMessage {
  id?: string;
  msgId: string;
  sessionId: string;
  text: string;
  sender: 'user' | 'bot' | 'system';
  timestamp: string;
  sentiment?: string;
  confidence?: number;
  synced: boolean;
}

export interface PendingSync {
  id?: number;
  text: string;
  sessionId: string;
  timestamp: number;
}

export class SentiBotDatabase extends Dexie {
  messages!: Table<LocalMessage, string>;
  pendingSync!: Table<PendingSync, number>;

  constructor() {
    super('SentiBotOfflineDB');
    this.version(1).stores({
      messages: 'msgId, sessionId, sender, timestamp, synced',
      pendingSync: '++id, sessionId, timestamp',
    });
  }
}

export const db = new SentiBotDatabase();

export async function saveMessageLocal(
  msg: { id: string; text: string; sender: 'user' | 'bot' | 'system'; timestamp: string; sentiment?: string; confidence?: number },
  sessionId: string,
  isSynced: boolean = true
) {
  try {
    await db.messages.put({
      msgId: msg.id,
      sessionId,
      text: msg.text,
      sender: msg.sender,
      timestamp: msg.timestamp,
      sentiment: msg.sentiment,
      confidence: msg.confidence,
      synced: isSynced,
    });

    if (!isSynced && msg.sender === 'user') {
      await db.pendingSync.add({
        text: msg.text,
        sessionId,
        timestamp: Date.now(),
      });
    }
  } catch (err) {
    console.error('Dexie save error:', err);
  }
}

export async function getLocalMessages(sessionId: string): Promise<LocalMessage[]> {
  try {
    return await db.messages.where('sessionId').equals(sessionId).toArray();
  } catch (err) {
    console.error('Dexie read error:', err);
    return [];
  }
}

export async function getPendingSyncMessages(): Promise<PendingSync[]> {
  try {
    return await db.pendingSync.toArray();
  } catch (err) {
    console.error('Dexie pending read error:', err);
    return [];
  }
}

export async function clearLocalMessages() {
  try {
    await db.messages.clear();
    await db.pendingSync.clear();
  } catch (err) {
    console.error('Dexie clear error:', err);
  }
}
