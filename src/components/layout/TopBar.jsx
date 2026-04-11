// src/components/layout/TopBar.jsx — Logo, streak, avatar

import styles from './TopBar.module.css';

/**
 * Top navigation bar with logo, streak counter, and avatar.
 * @param {{ streak: number, language: string, onSettingsTap: () => void, onStatsTap: () => void, userName: string, photoURL: string }} props
 */
function TopBar({ streak = 0, language = 'cantonese', onSettingsTap, onStatsTap, onProfileTap, userName = '', photoURL = '' }) {
  const langLabel = language === 'cantonese' ? 'CANTONESE' : 'MANDARIN';
  const initial = userName ? userName.charAt(0).toUpperCase() : '?';
  const streakPulse = streak >= 7;
  const streakHot = streak >= 30;

  const flameClass = [
    styles.flame,
    streak === 0 ? styles.flameGray : '',
    streakHot ? styles.flameHot : '',
  ].filter(Boolean).join(' ');

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
          className={`${styles.streakChip} ${streak === 0 ? styles.streakInactive : ''} ${streakPulse ? styles.streakPulse : ''} ${streakHot ? styles.streakHot : ''}`}
          onClick={onStatsTap}
          aria-label={`${streak} day streak — view stats`}
        >
          <span className={flameClass} />
          <span className={styles.streakCount}>{streak}</span>
          <span className={styles.streakLabel}>days</span>
        </button>

        <button
          className={styles.avatar}
          onClick={onProfileTap || onSettingsTap}
          aria-label="Profile"
        >
          {photoURL ? (
            <img src={photoURL} alt="" className={styles.avatarImg} referrerPolicy="no-referrer" />
          ) : (
            initial
          )}
        </button>

        <button className={styles.gearBtn} onClick={onSettingsTap} aria-label="Settings">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
      </div>
    </header>
  );
}

export { TopBar };
