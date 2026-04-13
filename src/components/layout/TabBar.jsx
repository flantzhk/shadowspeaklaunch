// src/components/layout/TabBar.jsx — Bottom tab navigation

import styles from './TabBar.module.css';
import { ROUTES } from '../../utils/constants';

const TABS = [
  { id: ROUTES.HOME, label: 'Home', icon: 'home' },
  { id: ROUTES.LIBRARY, label: 'My Library', icon: 'library' },
  { id: ROUTES.PRACTICE, label: 'Practice', icon: 'practice' },
];

/**
 * Bottom tab navigation bar.
 * @param {{ activeTab: string, onTabChange: (tab: string) => void }} props
 */
function TabBar({ activeTab, onTabChange }) {
  return (
    <nav className={styles.tabBar} role="tablist" aria-label="Main navigation">
      {TABS.map(tab => (
        <button
          key={tab.id}
          className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
          onClick={() => onTabChange(tab.id)}
          role="tab"
          aria-selected={activeTab === tab.id}
          aria-label={tab.label}
        >
          <TabIcon name={tab.icon} isActive={activeTab === tab.id} />
          <span className={styles.label}>{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}

/**
 * SVG tab icons.
 * @param {{ name: string, isActive: boolean }} props
 */
function TabIcon({ name, isActive }) {
  // Active icons use primary ink (not lime) — lime fails contrast on cream background
  const color = isActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)';

  if (name === 'home') {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    );
  }

  if (name === 'library') {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    );
  }

  if (name === 'practice') {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="23" />
        <line x1="8" y1="23" x2="16" y2="23" />
      </svg>
    );
  }

  return null;
}

export { TabBar };
