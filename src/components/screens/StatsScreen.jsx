// src/components/screens/StatsScreen.jsx — Progress dashboard

import { useState, useEffect } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { getAllLibraryEntries, getAllSessions } from '../../services/storage';
import { formatTime } from '../../utils/formatters';
import styles from './StatsScreen.module.css';

const MILESTONES = [
  { id: 'l1', threshold: 1, label: 'First lesson', field: 'sessions' },
  { id: 'l5', threshold: 5, label: '5 lessons', field: 'sessions' },
  { id: 'l10', threshold: 10, label: '10 lessons', field: 'sessions' },
  { id: 'l25', threshold: 25, label: '25 lessons', field: 'sessions' },
  { id: 'p10', threshold: 10, label: '10 phrases', field: 'phrases' },
  { id: 'p25', threshold: 25, label: '25 phrases', field: 'phrases' },
  { id: 'p50', threshold: 50, label: '50 phrases', field: 'phrases' },
  { id: 's3', threshold: 3, label: '3 day streak', field: 'streak' },
  { id: 's7', threshold: 7, label: '7 day streak', field: 'streak' },
  { id: 's14', threshold: 14, label: '14 day streak', field: 'streak' },
  { id: 's30', threshold: 30, label: '30 day streak', field: 'streak' },
];

/**
 * @param {{ onBack: Function }} props
 */
export default function StatsScreen({ onBack }) {
  const { settings } = useAppContext();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    (async () => {
      const entries = await getAllLibraryEntries();
      const sessions = await getAllSessions();
      const learningCount = entries.filter(e => e.status === 'learning').length;
      const masteredCount = entries.filter(e => e.status === 'mastered').length;
      const scores = entries.flatMap(e => (e.scoreHistory || []).map(s => s.score)).filter(Boolean);
      const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;
      const sessionDates = new Set(sessions.map(s => s.date));

      setStats({
        totalPhrases: entries.length, learningCount, masteredCount,
        totalSessions: sessions.length, avgScore, sessionDates,
        totalTime: settings.totalPracticeSeconds,
        streak: settings.streakCount,
      });
    })();
  }, [settings]);

  if (!stats) return null;

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

      <div className={styles.statGrid}>
        <StatCard value={stats.streak} label="Day streak" highlight />
        <StatCard value={formatTime(stats.totalTime)} label="Time practiced" />
        <StatCard value={stats.totalPhrases} label="Phrases saved" />
        <StatCard value={stats.masteredCount} label="Mastered" />
        <StatCard value={stats.totalSessions} label="Sessions" />
        <StatCard value={stats.avgScore !== null ? stats.avgScore : '-'} label="Avg score" />
      </div>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Streak Calendar</h2>
        <StreakCalendar sessionDates={stats.sessionDates} />
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Library</h2>
        <div className={styles.barContainer}>
          <div className={styles.barTrack}>
            <div className={styles.barMastered} style={{ width: stats.totalPhrases > 0 ? `${(stats.masteredCount / stats.totalPhrases) * 100}%` : '0%' }} />
          </div>
          <div className={styles.barLabels}>
            <span>{stats.learningCount} learning</span>
            <span>{stats.masteredCount} mastered</span>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Milestones</h2>
        <div className={styles.milestoneGrid}>
          {MILESTONES.map(m => {
            const val = m.field === 'sessions' ? stats.totalSessions
              : m.field === 'phrases' ? stats.totalPhrases
              : stats.streak;
            const unlocked = val >= m.threshold;
            return (
              <div key={m.id} className={`${styles.milestone} ${unlocked ? styles.unlocked : ''}`}>
                <span className={styles.milestoneIcon}>{unlocked ? '✓' : '○'}</span>
                <span className={styles.milestoneLabel}>{m.label}</span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function StatCard({ value, label, highlight }) {
  return (
    <div className={`${styles.statCard} ${highlight ? styles.highlighted : ''}`}>
      <span className={styles.statValue}>{value}</span>
      <span className={styles.statLabel}>{label}</span>
    </div>
  );
}

function StreakCalendar({ sessionDates }) {
  const today = new Date();
  const days = [];
  // 12 weeks = 84 days, aligned to 7-column grid
  for (let i = 83; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    days.push({ date: dateStr, active: sessionDates.has(dateStr), isToday: i === 0 });
  }

  return (
    <div className={styles.calendar} role="img" aria-label="Streak calendar showing last 90 days">
      {days.map(d => (
        <div key={d.date} className={`${styles.calDay} ${d.active ? styles.calActive : ''} ${d.isToday ? styles.calToday : ''}`}
          title={d.date} />
      ))}
    </div>
  );
}
