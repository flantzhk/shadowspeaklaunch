// src/utils/levels.js — XP leveling system

const LEVELS = [
  { level: 1, xp: 0, title: 'Beginner' },
  { level: 2, xp: 50, title: 'Explorer' },
  { level: 3, xp: 150, title: 'Speaker' },
  { level: 4, xp: 350, title: 'Conversant' },
  { level: 5, xp: 600, title: 'Confident' },
  { level: 6, xp: 1000, title: 'Fluent' },
  { level: 7, xp: 1500, title: 'Master' },
  { level: 8, xp: 2500, title: 'Legend' },
];

export function getLevel(totalXP) {
  let current = LEVELS[0];
  for (const l of LEVELS) {
    if (totalXP >= l.xp) current = l;
    else break;
  }
  const next = LEVELS.find(l => l.xp > totalXP) || null;
  const progress = next
    ? (totalXP - current.xp) / (next.xp - current.xp)
    : 1;
  return { ...current, next, progress, totalXP };
}

/** XP: 10 per session + 5 per phrase practiced + 2 per mastered phrase */
export function calcXP({ totalSessions, totalPhrasesPracticed, masteredCount }) {
  return (totalSessions * 10) + (totalPhrasesPracticed * 5) + (masteredCount * 2);
}

export { LEVELS };
