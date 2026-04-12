// src/components/layout/TopBar.jsx — Logo, level badge, avatar

import { useState, useEffect } from 'react';
import { getAllLibraryEntries, getAllSessions } from '../../services/storage';
import { getLevel, calcXP } from '../../utils/levels';
import styles from './TopBar.module.css';

/**
 * Top navigation bar with logo, level indicator, and avatar.
 */
function TopBar({ streak = 0, language = 'cantonese', onSettingsTap, onStatsTap, onProfileTap, userName = '', photoURL = '' }) {
  const langLabel = language === 'cantonese' ? 'CANTONESE' : 'MANDARIN';
  const initial = userName ? userName.charAt(0).toUpperCase() : '?';
  const [level, setLevel] = useState(null);

  useEffect(() => {
    (async () => {
      const entries = await getAllLibraryEntries();
      const sessions = await getAllSessions();
      const masteredCount = entries.filter(e => e.status === 'mastered').length;
      const totalPhrasesPracticed = sessions.reduce((sum, s) => sum + (s.phrasesAttempted || 0), 0);
      const xp = calcXP({ totalSessions: sessions.length, totalPhrasesPracticed, masteredCount });
      setLevel(getLevel(xp));
    })();
  }, [streak]); // recalc when streak changes (proxy for "user just practiced")

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
          className={styles.levelChip}
          onClick={onStatsTap}
          aria-label={level ? `Level ${level.level} ${level.title} — view progress` : 'View progress'}
        >
          <div className={styles.levelBadge}>
            <span className={styles.levelNum}>{level?.level ?? '-'}</span>
          </div>
          <div className={styles.levelText}>
            <span className={styles.levelTitle}>{level?.title ?? '...'}</span>
            {level?.next && (
              <div className={styles.miniBar}>
                <div className={styles.miniFill} style={{ width: `${Math.round(level.progress * 100)}%` }} />
              </div>
            )}
          </div>
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
