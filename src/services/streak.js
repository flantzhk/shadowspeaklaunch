// src/services/streak.js — Streak tracking with freeze logic

import { getSettings, saveSettings } from './storage';
import { logger } from '../utils/logger';

/**
 * Get today's date as YYYY-MM-DD string.
 * @returns {string}
 */
function getTodayString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Get the start of the current week (Monday) as YYYY-MM-DD.
 * @returns {string}
 */
function getWeekStart() {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  return `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}`;
}

/**
 * Update streak after completing a session.
 * Supports 1 free streak freeze per week.
 * @returns {Promise<number>}
 */
async function updateStreak() {
  const settings = await getSettings();
  if (!settings) return 0;

  const today = getTodayString();

  if (settings.streakLastDate === today) {
    return settings.streakCount;
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

  let newStreak;
  let freezeUsedThisWeek = settings.streakFreezeUsedWeek || '';

  if (settings.streakLastDate === yesterdayStr) {
    newStreak = settings.streakCount + 1;
  } else if (settings.streakLastDate === null) {
    newStreak = 1;
  } else {
    // Missed a day — check if streak freeze is available
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    const twoDaysAgoStr = `${twoDaysAgo.getFullYear()}-${String(twoDaysAgo.getMonth() + 1).padStart(2, '0')}-${String(twoDaysAgo.getDate()).padStart(2, '0')}`;
    const currentWeek = getWeekStart();

    if (settings.streakLastDate === twoDaysAgoStr && freezeUsedThisWeek !== currentWeek) {
      // Use streak freeze — missed exactly 1 day, haven't used freeze this week
      newStreak = settings.streakCount + 1;
      freezeUsedThisWeek = currentWeek;
      logger.info('Streak freeze used');
    } else {
      newStreak = 1;
      logger.info('Streak reset — missed a day');
    }
  }

  await saveSettings({
    ...settings,
    streakCount: newStreak,
    streakLastDate: today,
    streakFreezeUsedWeek: freezeUsedThisWeek,
  });

  return newStreak;
}

/**
 * Check if user has already practiced today.
 * @returns {Promise<boolean>}
 */
async function hasPracticedToday() {
  const settings = await getSettings();
  if (!settings) return false;
  return settings.streakLastDate === getTodayString();
}

/**
 * Check if streak freeze is available this week.
 * @returns {Promise<boolean>}
 */
async function isStreakFreezeAvailable() {
  const settings = await getSettings();
  if (!settings) return true;
  return (settings.streakFreezeUsedWeek || '') !== getWeekStart();
}

export { updateStreak, hasPracticedToday, isStreakFreezeAvailable, getTodayString };
