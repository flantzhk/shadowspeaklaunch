// src/services/notifications.js — Phrase-of-the-day and reminder notifications

import { getAllLibraryEntries } from './storage';
import { logger } from '../utils/logger';

/**
 * Schedule a phrase-of-the-day notification.
 * Uses the Notification API for PWA; Capacitor LocalNotifications for native.
 * @param {string} reminderTime - "HH:MM" format or null
 */
async function schedulePhraseOfTheDay(reminderTime) {
  if (!reminderTime) return;
  if (!('Notification' in window)) return;

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      logger.info('Notification permission denied');
      return;
    }

    const entries = await getAllLibraryEntries();
    if (entries.length === 0) return;

    const randomEntry = entries[Math.floor(Math.random() * entries.length)];
    const phraseId = randomEntry.phraseId;

    logger.info(`Phrase of the day: ${phraseId}`);

    // For PWA: use service worker to schedule
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SCHEDULE_NOTIFICATION',
        payload: { phraseId, time: reminderTime },
      });
    }
  } catch (error) {
    logger.error('Failed to schedule notification', error);
  }
}

/**
 * Show an immediate notification (for testing).
 * @param {string} title
 * @param {string} body
 */
async function showNotification(title, body) {
  if (!('Notification' in window)) return;

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return;

    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready;
      await reg.showNotification(title, {
        body,
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-192.png',
        tag: 'shadowspeak-potd',
      });
    } else {
      new Notification(title, { body, icon: '/icons/icon-192.png' });
    }
  } catch (error) {
    logger.error('Failed to show notification', error);
  }
}

/**
 * Initialize notification system.
 * @param {string|null} reminderTime
 */
function initNotifications(reminderTime) {
  if (reminderTime) {
    schedulePhraseOfTheDay(reminderTime);
  }
}

export { schedulePhraseOfTheDay, showNotification, initNotifications };
