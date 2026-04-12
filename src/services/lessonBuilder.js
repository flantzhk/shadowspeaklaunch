// src/services/lessonBuilder.js — Smart lesson generation

import { getDueForReview } from './srs';
import { getAllLibraryEntries } from './storage';
import { getAllPhrasesForLanguage } from './languageManager';
import { SECONDS_PER_PHRASE } from '../utils/constants';
import { logger } from '../utils/logger';

/**
 * Build today's lesson from user's library + SRS state.
 * Ensures no phrase is repeated — each phrase appears at most once.
 * @param {number} targetMinutes - 5, 10, 15, 20, or 30
 * @param {string} language - Current language ID
 * @returns {Promise<Object[]>} Ordered list of phrase objects for the session
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
    if (usedIds.has(entry.phraseId)) continue;
    lesson.push(entry);
    usedIds.add(entry.phraseId);
  }

  // Priority 2: Learning phrases not yet due (fill remaining)
  const remaining = targetPhrases - lesson.length;
  const notYetDue = learningEntries
    .filter(e => !usedIds.has(e.phraseId))
    .sort((a, b) => (a.lastPracticedAt || 0) - (b.lastPracticedAt || 0));

  for (const entry of notYetDue.slice(0, remaining)) {
    if (usedIds.has(entry.phraseId)) continue;
    lesson.push(entry);
    usedIds.add(entry.phraseId);
  }

  // Priority 3: Fill with new phrases from topics the user hasn't studied yet
  if (lesson.length < targetPhrases) {
    const newPhrases = await getStarterFallback(
      language,
      targetPhrases - lesson.length,
      usedIds
    );
    for (const entry of newPhrases) {
      if (usedIds.has(entry.phraseId || entry.id)) continue;
      lesson.push(entry);
      usedIds.add(entry.phraseId || entry.id);
    }
  }

  // Cap at target — never exceed
  const capped = lesson.slice(0, targetPhrases);

  logger.info(`Built lesson: ${capped.length} phrases (target: ${targetPhrases}, unique IDs: ${usedIds.size})`);
  return await resolvePhrasesForLesson(capped, language);
}

/**
 * Get fallback phrases from topic data when library is thin.
 * Shuffles to provide variety across sessions.
 * @param {string} language
 * @param {number} count
 * @param {Set} excludeIds
 * @returns {Promise<Object[]>}
 */
async function getStarterFallback(language, count, excludeIds) {
  const allPhrases = await loadAllPhrases(language);
  const available = allPhrases.filter(p => !excludeIds.has(p.id));
  // Shuffle so the user doesn't always get the same fallback order
  for (let i = available.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [available[i], available[j]] = [available[j], available[i]];
  }
  return available
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
 * Deduplicates by phrase ID to prevent repeats.
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

  const seen = new Set();
  return lessonEntries
    .map(entry => entry._phraseData || phraseMap[entry.phraseId])
    .filter(p => {
      if (!p) return false;
      if (seen.has(p.id)) return false;
      seen.add(p.id);
      return true;
    });
}

export { buildLesson, loadAllPhrases };
