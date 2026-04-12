// src/components/screens/StatsScreen.jsx — Gamified progress dashboard

import { useState, useEffect } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { getAllLibraryEntries, getAllSessions } from '../../services/storage';
import { formatTime } from '../../utils/formatters';
import styles from './StatsScreen.module.css';

/* XP thresholds for each level */
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

function getLevel(totalXP) {
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

/* XP: 5 per phrase practiced + 10 per session + 2 per mastered phrase */
function calcXP(stats) {
  return (stats.totalSessions * 10) + (stats.totalPhrasesPracticed * 5) + (stats.masteredCount * 2);
}

const ACHIEVEMENTS = [
  { id: 'first-lesson', icon: '1', label: 'First Lesson', desc: 'Complete your first session', field: 'sessions', threshold: 1 },
  { id: '5-sessions', icon: '5', label: 'Getting Started', desc: '5 practice sessions', field: 'sessions', threshold: 5 },
  { id: '10-phrases', icon: '10', label: 'Word Collector', desc: 'Save 10 phrases', field: 'phrases', threshold: 10 },
  { id: '25-phrases', icon: '25', label: 'Phrase Hunter', desc: 'Save 25 phrases', field: 'phrases', threshold: 25 },
  { id: '50-phrases', icon: '50', label: 'Vocabulary Builder', desc: 'Save 50 phrases', field: 'phrases', threshold: 50 },
  { id: '3-streak', icon: '3', label: 'On a Roll', desc: '3 day streak', field: 'streak', threshold: 3 },
  { id: '7-streak', icon: '7', label: 'Week Warrior', desc: '7 day streak', field: 'streak', threshold: 7 },
  { id: '14-streak', icon: '14', label: 'Unstoppable', desc: '14 day streak', field: 'streak', threshold: 14 },
  { id: '30-streak', icon: '30', label: 'Legend', desc: '30 day streak', field: 'streak', threshold: 30 },
  { id: 'first-master', icon: 'M', label: 'First Mastery', desc: 'Master a phrase', field: 'mastered', threshold: 1 },
  { id: '25-sessions', icon: '25', label: 'Dedicated', desc: '25 practice sessions', field: 'sessions', threshold: 25 },
  { id: '10-mastered', icon: 'M', label: 'Sharp Memory', desc: 'Master 10 phrases', field: 'mastered', threshold: 10 },
];

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

/**
 * @param {{ onBack: Function, onNavigate?: Function }} props
 */
export default function StatsScreen({ onBack, onNavigate }) {
  const { settings } = useAppContext();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    (async () => {
      const entries = await getAllLibraryEntries();
      const sessions = await getAllSessions();
      const learningCount = entries.filter(e => e.status === 'learning').length;
      const masteredCount = entries.filter(e => e.status === 'mastered').length;
      const totalPhrasesPracticed = sessions.reduce((sum, s) => sum + (s.phrasesAttempted || 0), 0);
      const scores = sessions.filter(s => s.averageScore != null).map(s => s.averageScore);
      const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;
      const sessionDates = new Set(sessions.map(s => s.date));

      // Today's sessions
      const todayStr = new Date().toISOString().slice(0, 10);
      const todaySessions = sessions.filter(s => s.date === todayStr);
      const todayPhrases = todaySessions.reduce((sum, s) => sum + (s.phrasesAttempted || 0), 0);
      const todayTime = todaySessions.reduce((sum, s) => sum + (s.durationSeconds || 0), 0);

      // Best streak (calculate from session dates)
      const sortedDates = [...sessionDates].sort();
      let bestStreak = 0;
      let currentRun = 0;
      for (let i = 0; i < sortedDates.length; i++) {
        if (i === 0) { currentRun = 1; }
        else {
          const prev = new Date(sortedDates[i - 1]);
          const curr = new Date(sortedDates[i]);
          const diff = Math.round((curr - prev) / (1000 * 60 * 60 * 24));
          currentRun = diff === 1 ? currentRun + 1 : 1;
        }
        bestStreak = Math.max(bestStreak, currentRun);
      }

      setStats({
        totalPhrases: entries.length, learningCount, masteredCount,
        totalSessions: sessions.length, avgScore, sessionDates,
        totalTime: settings.totalPracticeSeconds,
        streak: settings.streakCount,
        bestStreak,
        totalPhrasesPracticed,
        todayPhrases, todayTime,
      });
    })();
  }, [settings]);

  if (!stats) return null;

  const xp = calcXP(stats);
  const level = getLevel(xp);

  // Build last 7 days for weekly view
  const today = new Date();
  const weekDays = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const dayIdx = (d.getDay() + 6) % 7; // Mon=0
    weekDays.push({ date: dateStr, label: DAY_LABELS[dayIdx], active: stats.sessionDates.has(dateStr), isToday: i === 0 });
  }
  const weekActive = weekDays.filter(d => d.active).length;

  // Achievement progress
  const getFieldVal = (field) => {
    if (field === 'sessions') return stats.totalSessions;
    if (field === 'phrases') return stats.totalPhrases;
    if (field === 'streak') return Math.max(stats.streak, stats.bestStreak);
    if (field === 'mastered') return stats.masteredCount;
    return 0;
  };
  const unlockedCount = ACHIEVEMENTS.filter(a => getFieldVal(a.field) >= a.threshold).length;

  // Daily goal: 5 phrases or 5 minutes (whichever user is closer to)
  const dailyGoalPhrases = Math.max(5, settings.dailyGoalMinutes || 5);
  const dailyPhraseProgress = Math.min(stats.todayPhrases / dailyGoalPhrases, 1);

  return (
    <div className={styles.screen}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={onBack} aria-label="Go back">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 className={styles.title}>Your Progress</h1>
      </div>

      {/* === Streak Hero === */}
      <div className={styles.streakHero}>
        <div className={styles.flameWrap}>
          <div className={styles.flame}>
            <svg width="40" height="48" viewBox="0 0 40 48" fill="none">
              <path d="M20 0C20 0 30 12 32 22C34 32 28 42 20 46C12 42 6 32 8 22C10 12 20 0 20 0Z" fill="#E8703A" />
              <path d="M20 14C20 14 26 22 27 28C28 34 24 40 20 42C16 40 12 34 13 28C14 22 20 14 20 14Z" fill="#FFCC4D" />
              <path d="M20 26C20 26 23 30 23 33C23 36 22 38 20 39C18 38 17 36 17 33C17 30 20 26 20 26Z" fill="#FFE8A0" />
            </svg>
          </div>
          <span className={styles.streakNum}>{stats.streak}</span>
        </div>
        <div className={styles.streakInfo}>
          <span className={styles.streakLabel}>
            {stats.streak === 0 ? 'Start your streak!' : stats.streak === 1 ? 'day streak' : 'day streak'}
          </span>
          {stats.bestStreak > stats.streak && (
            <span className={styles.bestStreak}>Best: {stats.bestStreak} days</span>
          )}
        </div>
      </div>

      {/* === This Week === */}
      <div className={styles.weekCard}>
        <div className={styles.weekHeader}>
          <span className={styles.weekTitle}>This week</span>
          <span className={styles.weekCount}>{weekActive}/7 days</span>
        </div>
        <div className={styles.weekRow}>
          {weekDays.map(d => (
            <div key={d.date} className={styles.weekDay}>
              <div className={`${styles.weekDot} ${d.active ? styles.weekDotActive : ''} ${d.isToday ? styles.weekDotToday : ''}`}>
                {d.active && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
              <span className={`${styles.weekLabel} ${d.isToday ? styles.weekLabelToday : ''}`}>{d.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* === Daily Challenge === */}
      <div className={styles.challengeCard}>
        <div className={styles.challengeHeader}>
          <span className={styles.challengeTitle}>Today's challenge</span>
          {dailyPhraseProgress >= 1 && <span className={styles.challengeDone}>Done!</span>}
        </div>
        <div className={styles.challengeContent}>
          <div className={styles.challengeRing}>
            <svg viewBox="0 0 72 72" className={styles.ringSvg}>
              <circle cx="36" cy="36" r="30" className={styles.ringTrack} />
              <circle cx="36" cy="36" r="30" className={styles.ringFill}
                style={{ strokeDasharray: `${2 * Math.PI * 30}`, strokeDashoffset: `${2 * Math.PI * 30 * (1 - dailyPhraseProgress)}` }} />
            </svg>
            <span className={styles.ringText}>{stats.todayPhrases}</span>
          </div>
          <div className={styles.challengeDetails}>
            <span className={styles.challengeGoal}>Practice {dailyGoalPhrases} phrases</span>
            <span className={styles.challengeSub}>{stats.todayPhrases}/{dailyGoalPhrases} completed</span>
            {stats.todayTime > 0 && (
              <span className={styles.challengeTime}>{formatTime(stats.todayTime)} practiced today</span>
            )}
          </div>
        </div>
      </div>

      {/* === Level / XP === */}
      <div className={styles.levelCard}>
        <div className={styles.levelHeader}>
          <div className={styles.levelBadge}>
            <span className={styles.levelNum}>{level.level}</span>
          </div>
          <div className={styles.levelInfo}>
            <span className={styles.levelTitle}>{level.title}</span>
            <span className={styles.xpText}>{xp} XP</span>
          </div>
          {level.next && (
            <span className={styles.levelNext}>Lvl {level.next.level}</span>
          )}
        </div>
        <div className={styles.xpBar}>
          <div className={styles.xpFill} style={{ width: `${Math.round(level.progress * 100)}%` }} />
        </div>
        {level.next && (
          <span className={styles.xpRemaining}>{level.next.xp - xp} XP to {level.next.title}</span>
        )}
      </div>

      {/* === Quick Stats === */}
      <div className={styles.quickStats}>
        <div className={styles.qStat}>
          <span className={styles.qNum}>{stats.totalSessions}</span>
          <span className={styles.qLabel}>Sessions</span>
        </div>
        <div className={styles.qDivider} />
        <div className={styles.qStat}>
          <span className={styles.qNum}>{stats.totalPhrases}</span>
          <span className={styles.qLabel}>Phrases</span>
        </div>
        <div className={styles.qDivider} />
        <div className={styles.qStat}>
          <span className={styles.qNum}>{stats.masteredCount}</span>
          <span className={styles.qLabel}>Mastered</span>
        </div>
        <div className={styles.qDivider} />
        <div className={styles.qStat}>
          <span className={styles.qNum}>{stats.avgScore ?? '-'}</span>
          <span className={styles.qLabel}>Avg Score</span>
        </div>
      </div>

      {/* === Achievements === */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Achievements</h2>
          <span className={styles.sectionCount}>{unlockedCount}/{ACHIEVEMENTS.length}</span>
        </div>
        <div className={styles.achieveGrid}>
          {ACHIEVEMENTS.map(a => {
            const val = getFieldVal(a.field);
            const unlocked = val >= a.threshold;
            const progress = Math.min(val / a.threshold, 1);
            return (
              <div key={a.id} className={`${styles.achieveCard} ${unlocked ? styles.achieveUnlocked : ''}`}>
                <div className={styles.achieveIcon}>
                  <svg viewBox="0 0 44 44" className={styles.achieveRing}>
                    <circle cx="22" cy="22" r="18" className={styles.achieveTrack} />
                    {!unlocked && (
                      <circle cx="22" cy="22" r="18" className={styles.achieveProgress}
                        style={{ strokeDasharray: `${2 * Math.PI * 18}`, strokeDashoffset: `${2 * Math.PI * 18 * (1 - progress)}` }} />
                    )}
                  </svg>
                  <span className={styles.achieveEmoji}>{unlocked ? a.icon : a.icon}</span>
                </div>
                <span className={styles.achieveLabel}>{a.label}</span>
                <span className={styles.achieveDesc}>{unlocked ? a.desc : `${val}/${a.threshold}`}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* === Library Progress === */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Library</h2>
        <div className={styles.libraryCard}>
          <div className={styles.libRow}>
            <span className={styles.libDot} style={{ background: 'var(--color-brand-lime)' }} />
            <span className={styles.libLabel}>Learning</span>
            <span className={styles.libVal}>{stats.learningCount}</span>
          </div>
          <div className={styles.libRow}>
            <span className={styles.libDot} style={{ background: 'var(--color-brand-green)' }} />
            <span className={styles.libLabel}>Mastered</span>
            <span className={styles.libVal}>{stats.masteredCount}</span>
          </div>
          <div className={styles.libBar}>
            <div className={styles.libBarMastered} style={{ width: stats.totalPhrases > 0 ? `${(stats.masteredCount / stats.totalPhrases) * 100}%` : '0%' }} />
            <div className={styles.libBarLearning} style={{ width: stats.totalPhrases > 0 ? `${(stats.learningCount / stats.totalPhrases) * 100}%` : '0%' }} />
          </div>
        </div>
      </section>

      {/* === Total Time === */}
      <div className={styles.totalTimeCard}>
        <span className={styles.totalTimeLabel}>Total time practiced</span>
        <span className={styles.totalTimeVal}>{formatTime(stats.totalTime)}</span>
      </div>
    </div>
  );
}
