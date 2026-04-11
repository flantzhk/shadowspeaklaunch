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

      </div>
    </header>
  );
}

export { TopBar };
