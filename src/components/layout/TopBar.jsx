// src/components/layout/TopBar.jsx — Logo, streak, avatar

import styles from './TopBar.module.css';

/**
 * Top navigation bar with logo, streak counter, and avatar.
 * @param {{ streak: number, language: string, onSettingsTap: () => void, onStatsTap: () => void, userName: string }} props
 */
function TopBar({ streak = 0, language = 'cantonese', onSettingsTap, onStatsTap, userName = '' }) {
  const langLabel = language === 'cantonese' ? 'CANTONESE' : 'MANDARIN';
  const initial = userName ? userName.charAt(0).toUpperCase() : 'S';
  const streakPulse = streak >= 7;

  return (
    <header className={styles.topBar}>
      <div className={styles.logoGroup}>
        <div className={styles.logoText}>
          <span className={styles.logoShadow}>Shadow</span>
          <span className={styles.logoSpeak}>Speak</span>
        </div>
        <button className={styles.langHint} onClick={onSettingsTap} aria-label={`Current language: ${langLabel}. Tap to switch.`}>
          {langLabel} &rsaquo;
        </button>
      </div>

      <div className={styles.actions}>
        <button
          className={`${styles.streakChip} ${streakPulse ? styles.streakPulse : ''}`}
          onClick={onStatsTap}
          aria-label={`${streak} day streak — view stats`}
        >
          <span className={styles.flame}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill={streak === 0 ? '#CCCCCC' : 'var(--color-streak-orange)'}>
              <path d="M12 23c-4.97 0-9-3.58-9-8 0-3.07 2.25-5.89 3.76-7.38.73-.72 1.95-.17 1.83.82C8.3 11.12 9.94 13 12 13c1.5 0 2.68-.86 3.3-2.14.32-.66 1.22-.7 1.54-.03C18.22 13.49 21 16.05 21 19c0 2.21-1.79 4-4 4" />
            </svg>
          </span>
          <span className={styles.streakCount}>{streak}</span>
        </button>

        <button
          className={styles.avatar}
          onClick={onSettingsTap}
          aria-label="Settings"
        >
          {initial}
        </button>
      </div>
    </header>
  );
}

export { TopBar };
