// src/services/lessonBuilder.js — Smart lesson generation

import { getDueForReview } from './srs';
import { getAllLibraryEntries } from './storage';
import { getAllPhrasesForLanguage } from './languageManager';
import { SECONDS_PER_PHRASE } from '../utils/constants';
import { logger } from '../utils/logger';

/**
 * Build today's lesson from user's library + SRS state.
 * @param {number} targetMinutes - 5, 10, 15, 20, or 30
 * @param {string} language - Current language ID
 * @returns {Promise<Object[]>} Ordered list of phrase IDs for the session
 */
async function buildLesson(targetMinutes, language) {
  const targetPhrases = Math.floor((targetMinutes * 60) / SECONDS_PER_PHRASE);
  const dueForReview = await getDueForReview();
  const libraryEntries = await getAllLibraryEntries();
  const learningEntries = libraryEntries.filter(e => e.status === 'learning');

  const lesson = [];
  const usedIds = new Set();

  // Priority 1: Phrases due for review (max 60% of lesson)
  const reviewSlots = Math.floor(targetPhrases * 0.6);
  for (const entry of dueForReview.slice(0, reviewSlots)) {
    lesson.push(entry);
    usedIds.add(entry.phraseId);
  }

  // Priority 2: Learning phrases not yet due (fill remaining)
  const remaining = targetPhrases - lesson.length;
  const notYetDue = learningEntries
    .filter(e => !usedIds.has(e.phraseId))
    .sort((a, b) => (a.lastPracticedAt || 0) - (b.lastPracticedAt || 0));

  for (const entry of notYetDue.slice(0, remaining)) {
    lesson.push(entry);
    usedIds.add(entry.phraseId);
  }

  // Priority 3: If library is thin, pull from starter content
  if (lesson.length < targetPhrases) {
    const starterPhrases = await getStarterFallback(
      language,
      targetPhrases - lesson.length,
      usedIds
    );
    lesson.push(...starterPhrases);
  }

  logger.info(`Built lesson: ${lesson.length} phrases (target: ${targetPhrases})`);
  return await resolvePhrasesForLesson(lesson, language);
}

/**
 * Get fallback phrases from topic data when library is thin.
 * @param {string} language
 * @param {number} count
 * @param {Set} excludeIds
 * @returns {Promise<Object[]>}
 */
async function getStarterFallback(language, count, excludeIds) {
  const allPhrases = await loadAllPhrases(language);
  return allPhrases
    .filter(p => !excludeIds.has(p.id))
    .slice(0, count)
    .map(p => ({ phraseId: p.id, _phraseData: p }));
}

/**
 * Load all phrases from topic data files.
 * @param {string} language
 * @returns {Promise<Object[]>}
 */
async function loadAllPhrases(language) {
  return getAllPhrasesForLanguage(language);
}

/**
 * Resolve library entries to full phrase objects.
 * @param {Object[]} lessonEntries
 * @param {string} language
 * @returns {Promise<Object[]>}
 */
async function resolvePhrasesForLesson(lessonEntries, language) {
  const allPhrases = await loadAllPhrases(language);
  const phraseMap = {};
  for (const p of allPhrases) {
    phraseMap[p.id] = p;
  }

  return lessonEntries
    .map(entry => entry._phraseData || phraseMap[entry.phraseId])
    .filter(Boolean);
}

export { buildLesson, loadAllPhrases };
