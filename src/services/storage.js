// src/services/storage.js — IndexedDB wrapper using idb

import { openDB } from 'idb';
import { DB_NAME, DB_VERSION } from '../utils/constants';
import { logger } from '../utils/logger';

/** @type {import('idb').IDBPDatabase|null} */
let dbInstance = null;

/**
 * Get or create the IndexedDB database.
 * @returns {Promise<import('idb').IDBPDatabase>}
 */
async function getDB() {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // User settings (single row)
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'id' });
      }

      // Library entries
      if (!db.objectStoreNames.contains('library')) {
        const library = db.createObjectStore('library', { keyPath: 'phraseId' });
        library.createIndex('by-status', 'status');
        library.createIndex('by-next-review', 'nextReviewAt');
        library.createIndex('by-type', 'type');
      }

      // Session records
      if (!db.objectStoreNames.contains('sessions')) {
        const sessions = db.createObjectStore('sessions', { keyPath: 'id' });
        sessions.createIndex('by-date', 'date');
      }

      // Offline queue (pending API calls)
      if (!db.objectStoreNames.contains('queue')) {
        db.createObjectStore('queue', { keyPath: 'id', autoIncrement: true });
      }

      // Cached phrase metadata
      if (!db.objectStoreNames.contains('phrases')) {
        db.createObjectStore('phrases', { keyPath: 'id' });
      }

      // Cached topic metadata
      if (!db.objectStoreNames.contains('topics')) {
        db.createObjectStore('topics', { keyPath: 'id' });
      }
    },
  });

  return dbInstance;
}

/** Helper: run a DB operation with error handling. */
async function dbOp(label, fn, fallback) {
  try {
    const db = await getDB();
    return await fn(db);
  } catch (error) {
    logger.error(label, error);
    if (fallback !== undefined) return fallback;
    throw error;
  }
}

// === Settings ===

/** @returns {Promise<Object|undefined>} */
async function getSettings() {
  return dbOp('Failed to get settings', (db) => db.get('settings', 'user'), undefined);
}

/** @param {Object} settings */
async function saveSettings(settings) {
  return dbOp('Failed to save settings', (db) => db.put('settings', { ...settings, id: 'user' }));
}

// === Library ===

/** @returns {Promise<Array>} */
async function getAllLibraryEntries() {
  return dbOp('Failed to get library', (db) => db.getAll('library'), []);
}

/** @param {string} phraseId @returns {Promise<Object|undefined>} */
async function getLibraryEntry(phraseId) {
  return dbOp('Failed to get entry', (db) => db.get('library', phraseId), undefined);
}

/** @param {Object} entry */
async function saveLibraryEntry(entry) {
  return dbOp('Failed to save entry', (db) => db.put('library', entry));
}

/** @param {string} phraseId */
async function deleteLibraryEntry(phraseId) {
  return dbOp('Failed to delete entry', (db) => db.delete('library', phraseId));
}

/** @returns {Promise<Array>} */
async function getDueEntries() {
  return dbOp('Failed to get due entries', async (db) => {
    const now = Date.now();
    const all = await db.getAllFromIndex('library', 'by-next-review');
    // Only return phrases that have been practiced at least once.
    // New (never-practiced) phrases show as "New" in the library and go into
    // regular lessons — they don't count as "due for review" yet.
    return all.filter(entry => {
      const count = entry.practiceCount ?? 0;
      const reviewAt = typeof entry.nextReviewAt === 'number' ? entry.nextReviewAt : NaN;
      return count > 0 && reviewAt <= now;
    });
  }, []);
}

// === Sessions ===

/** @param {Object} session */
async function saveSession(session) {
  return dbOp('Failed to save session', (db) => db.put('sessions', session));
}

/** @param {string} date - YYYY-MM-DD @returns {Promise<Array>} */
async function getSessionsByDate(date) {
  return dbOp('Failed to get sessions', (db) => db.getAllFromIndex('sessions', 'by-date', date), []);
}

/** @returns {Promise<Array>} */
async function getAllSessions() {
  return dbOp('Failed to get sessions', (db) => db.getAll('sessions'), []);
}

// === Offline Queue ===

/** @param {string} action @param {Object} data */
async function addToQueue(action, data) {
  return dbOp('Failed to add to queue', (db) =>
    db.add('queue', { action, data, createdAt: Date.now(), attempts: 0 })
  );
}

/** @returns {Promise<Array>} */
async function getQueueItems() {
  return dbOp('Failed to get queue', (db) => db.getAll('queue'), []);
}

/** @param {number} id */
async function deleteQueueItem(id) {
  return dbOp('Failed to delete queue item', (db) => db.delete('queue', id));
}

/** @param {Object} item */
async function updateQueueItem(item) {
  return dbOp('Failed to update queue item', (db) => db.put('queue', item));
}

// === Phrases & Topics Cache ===

/** @param {Object} phrase */
async function cachePhrase(phrase) {
  return dbOp('Failed to cache phrase', (db) => db.put('phrases', phrase));
}

/** @param {string} id @returns {Promise<Object|undefined>} */
async function getCachedPhrase(id) {
  return dbOp('Failed to get phrase', (db) => db.get('phrases', id), undefined);
}

/** @param {Object} topic */
async function cacheTopic(topic) {
  return dbOp('Failed to cache topic', (db) => db.put('topics', topic));
}

export {
  getDB,
  getSettings,
  saveSettings,
  getAllLibraryEntries,
  getLibraryEntry,
  saveLibraryEntry,
  deleteLibraryEntry,
  getDueEntries,
  saveSession,
  getSessionsByDate,
  getAllSessions,
  addToQueue,
  getQueueItems,
  deleteQueueItem,
  updateQueueItem,
  cachePhrase,
  getCachedPhrase,
  cacheTopic,
};
