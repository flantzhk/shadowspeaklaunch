// src/services/analytics.js — Firebase Analytics wrapper
//
// logEvent is a thin, fail-safe wrapper. It never throws and never blocks the
// caller — analytics should never affect app correctness.
//
// STREAK_MILESTONES and isStreakMilestone are pure helpers so the UI can
// decide whether a streak count warrants a milestone event.

import { fbAnalytics } from './firebase';

/** Streak counts that trigger a streak_milestone event. */
export const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100];

/**
 * Returns true if n is a recognised streak milestone.
 * @param {number} n
 * @returns {boolean}
 */
export function isStreakMilestone(n) {
  return STREAK_MILESTONES.includes(n);
}

/**
 * Log a Firebase Analytics event.
 * Silently no-ops when Analytics is unavailable (e.g. no measurementId, test env).
 *
 * @param {string} eventName
 * @param {Record<string, string|number|boolean>} [params]
 */
export function logEvent(eventName, params = {}) {
  try {
    if (fbAnalytics) {
      fbAnalytics.logEvent(eventName, params);
    }
  } catch (_) {
    // Non-fatal — analytics must never crash the app
  }
}
