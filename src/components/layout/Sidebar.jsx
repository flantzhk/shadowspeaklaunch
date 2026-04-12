// src/components/layout/Sidebar.jsx — Desktop left-nav sidebar

import { useState, useEffect } from 'react';
import { getAllLibraryEntries, getAllSessions } from '../../services/storage';
import { getLevel, calcXP } from '../../utils/levels';
import { MiniPlayer } from './MiniPlayer';
import { ROUTES } from '../../utils/constants';
import styles from './Sidebar.module.css';

const NAV_ITEMS = [
  { id: ROUTES.HOME, label: 'Home', icon: 'home' },
  { id: ROUTES.LIBRARY, label: 'My Library', icon: 'library' },
  { id: ROUTES.PRACTICE, label: 'Practice', icon: 'practice' },
];

/**
 * Desktop left-nav sidebar.
 * Replaces TopBar + TabBar on screens ≥ 900px.
 */
function Sidebar({ activeTab, onTabChange, onMiniPlayerExpand, streak = 0, language = 'cantonese', userName = '', photoURL = '', onStatsTap, onProfileTap, onSettingsTap }) {
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
  }, [streak]);

  // Determine active section for non-tab routes
  const TAB_IDS = NAV_ITEMS.map(n => n.id);
  const activeNav = TAB_IDS.includes(activeTab) ? activeTab : null;

  return (
    <aside className={styles.sidebar}>
      {/* Logo + language */}
      <div className={styles.logoSection}>
        <div className={styles.logoText}>
          <span className={styles.logoShadow}>Shadow</span>
          <span className={styles.logoSpeak}>Speak</span>
        </div>
        <button className={styles.langHint} onClick={onSettingsTap} aria-label={`Current language: ${langLabel}. Tap to change.`}>
          {langLabel} &rsaquo;
        </button>
      </div>

      {/* Navigation */}
      <nav className={styles.nav} role="navigation" aria-label="Main navigation">
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            className={`${styles.navItem} ${activeNav === item.id ? styles.active : ''}`}
            onClick={() => onTabChange(item.id)}
            aria-current={activeNav === item.id ? 'page' : undefined}
          >
            <NavIcon name={item.icon} isActive={activeNav === item.id} />
            <span className={styles.navLabel}>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Bottom: player + level + profile */}
      <div className={styles.bottomSection}>
        <div className={styles.playerWrapper}>
          <MiniPlayer onExpand={onMiniPlayerExpand} />
        </div>

        <button className={styles.levelChip} onClick={onStatsTap} aria-label={level ? `Level ${level.level} ${level.title} — view progress` : 'View progress'}>
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

        <button className={styles.profileRow} onClick={onProfileTap} aria-label="Profile">
          <div className={styles.avatar}>
            {photoURL ? (
              <img src={photoURL} alt="" className={styles.avatarImg} referrerPolicy="no-referrer" />
            ) : (
              initial
            )}
          </div>
          <span className={styles.userName}>{userName || 'Profile'}</span>
        </button>
      </div>
    </aside>
  );
}

function NavIcon({ name, isActive }) {
  const color = isActive ? 'var(--color-brand-lime)' : 'var(--color-text-muted)';

  if (name === 'home') {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    );
  }

  if (name === 'library') {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    );
  }

  if (name === 'practice') {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="23" />
        <line x1="8" y1="23" x2="16" y2="23" />
      </svg>
    );
  }

  return null;
}

export { Sidebar };
