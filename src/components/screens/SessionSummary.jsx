// src/components/screens/SessionSummary.jsx — End-of-session summary

import { formatTime } from '../../utils/formatters';
import styles from './SessionSummary.module.css';

/**
 * Session completion summary screen.
 * @param {{ summary: Object, onDone: () => void }} props
 */
export default function SessionSummary({ summary, onDone }) {
  if (!summary) return null;

  return (
    <div className={styles.screen}>
      <div className={styles.content}>
        <div className={styles.celebration}>
          <span className={styles.checkmark}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand-lime)" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </span>
          <h1 className={styles.title}>Session Complete</h1>
        </div>

        <div className={styles.stats}>
          <StatCard label="Phrases" value={summary.phrasesAttempted} />
          <StatCard label="Mastered" value={summary.phrasesMastered} />
          <StatCard label="Time" value={formatTime(summary.durationSeconds)} />
          <StatCard label="Streak" value={`${summary.streakCount} day${summary.streakCount !== 1 ? 's' : ''}`} />
        </div>

        {summary.averageScore !== null && (
          <div className={styles.scoreRow}>
            <span className={styles.scoreLabel}>Average Score</span>
            <span className={styles.scoreValue}>{Math.round(summary.averageScore)}</span>
          </div>
        )}

        <button className={styles.doneBtn} onClick={onDone}>
          Done
        </button>
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className={styles.statCard}>
      <span className={styles.statValue}>{value}</span>
      <span className={styles.statLabel}>{label}</span>
    </div>
  );
}
