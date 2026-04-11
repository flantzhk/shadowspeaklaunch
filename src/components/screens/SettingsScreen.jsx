// src/components/screens/SettingsScreen.jsx

import { useAppContext } from '../../contexts/AppContext';
import { getAllLanguages } from '../../services/languageManager';
import { getCurrentUser, signOut } from '../../services/auth';
import { DAILY_GOAL_OPTIONS } from '../../utils/constants';
import styles from './SettingsScreen.module.css';

/**
 * @param {{ onBack: Function }} props
 */
export default function SettingsScreen({ onBack }) {
  const { settings, updateSettings } = useAppContext();
  const languages = getAllLanguages();

  return (
    <div className={styles.screen}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={onBack} aria-label="Go back">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 className={styles.title}>Settings</h1>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Language</h2>
        <div className={styles.langRow}>
          {languages.map(lang => (
            <button key={lang.id}
              className={`${styles.langPill} ${settings.currentLanguage === lang.id ? styles.langActive : ''}`}
              onClick={() => updateSettings({ currentLanguage: lang.id })}>
              <span className={styles.langName}>{lang.name}</span>
              <span className={styles.langNative}>{lang.nativeName}</span>
            </button>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Profile</h2>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Name</span>
          <input className={styles.input} type="text" value={settings.name}
            onChange={(e) => updateSettings({ name: e.target.value })} placeholder="Your name" />
        </label>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Daily Goal</h2>
        <div className={styles.goalRow}>
          {DAILY_GOAL_OPTIONS.map(mins => (
            <button key={mins}
              className={`${styles.goalPill} ${settings.dailyGoalMinutes === mins ? styles.goalActive : ''}`}
              onClick={() => updateSettings({ dailyGoalMinutes: mins })}>
              {mins} min
            </button>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Display</h2>
        <ToggleRow label="Show characters" checked={settings.showCharacters}
          onChange={(v) => updateSettings({ showCharacters: v })} />
        <ToggleRow label="Show English" checked={settings.showEnglish}
          onChange={(v) => updateSettings({ showEnglish: v })} />
        <ToggleRow label="Auto-advance" checked={settings.autoAdvance}
          onChange={(v) => updateSettings({ autoAdvance: v })} />
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Account</h2>
        <div className={styles.accountRow}>
          <span className={styles.accountLabel}>Name</span>
          <span className={styles.accountValue}>{settings.name || getCurrentUser()?.name || '—'}</span>
        </div>
        <div className={styles.accountRow}>
          <span className={styles.accountLabel}>Email</span>
          <span className={styles.accountValue}>{settings.email || getCurrentUser()?.email || '—'}</span>
        </div>
        <button className={styles.signOutBtn} onClick={signOut}>Sign out</button>
      </div>
    </div>
  );
}

function ToggleRow({ label, checked, onChange }) {
  return (
    <label className={styles.toggleRow}>
      <span className={styles.toggleLabel}>{label}</span>
      <button className={`${styles.toggle} ${checked ? styles.toggleOn : ''}`}
        onClick={() => onChange(!checked)} role="switch" aria-checked={checked}>
        <span className={styles.toggleKnob} />
      </button>
    </label>
  );
}
