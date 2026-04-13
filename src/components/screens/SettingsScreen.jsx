// src/components/screens/SettingsScreen.jsx

import { useState, useEffect } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { getAllLanguages } from '../../services/languageManager';
import { getCurrentUser, signOut } from '../../services/auth';
import { DAILY_GOAL_OPTIONS, ROUTES, APP_VERSION } from '../../utils/constants';
import {
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
  getNotificationPermission,
  isPushSubscribed,
  showTestNotification,
} from '../../services/notifications';
import { ConfirmModal } from '../shared/ConfirmModal';
import { BottomSheet } from '../shared/BottomSheet';
import DownloadAllModal from '../shared/DownloadAllModal';
import styles from './SettingsScreen.module.css';

/**
 * @param {{ onBack: Function, onNavigate?: Function }} props
 */
export default function SettingsScreen({ onBack, onNavigate }) {
  const { settings, updateSettings } = useAppContext();
  const languages = getAllLanguages();
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [showSpeedPicker, setShowSpeedPicker] = useState(false);
  const [showReminderPicker, setShowReminderPicker] = useState(false);
  const [reminderTime, setReminderTime] = useState(settings.reminderTime || '09:00');
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloadInBackground, setDownloadInBackground] = useState(false);
  const [pushSubscribed, setPushSubscribed] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);
  const [pushStatus, setPushStatus] = useState(''); // feedback message

  useEffect(() => {
    isPushSubscribed().then(setPushSubscribed);
  }, []);

  const handleTogglePush = async () => {
    setPushLoading(true);
    setPushStatus('');
    if (pushSubscribed) {
      const ok = await unsubscribeFromPushNotifications();
      if (ok) { setPushSubscribed(false); setPushStatus('Reminders turned off.'); }
      else setPushStatus('Could not unsubscribe. Try again.');
    } else {
      const result = await subscribeToPushNotifications(settings.reminderTime || null);
      if (result === 'granted') { setPushSubscribed(true); setPushStatus('Reminders on! You can send a test below.'); }
      else if (result === 'denied') setPushStatus('Permission denied. Enable notifications in your browser settings.');
      else if (result === 'unsupported') setPushStatus('Your browser does not support push notifications.');
      else setPushStatus('Could not subscribe. Try again.');
    }
    setPushLoading(false);
  };

  const handleSignOut = async () => {
    await signOut();
    window.location.hash = `#${ROUTES.LOGIN}`;
  };

  const handleDownloadClose = (mode) => {
    if (mode === 'background') setDownloadInBackground(true);
    setShowDownloadModal(false);
  };

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
        <h2 className={styles.sectionTitle}>Playback</h2>
        <button className={styles.settingsRow} onClick={() => setShowSpeedPicker(true)}>
          <span className={styles.rowLabel}>Default speed</span>
          <span className={styles.rowValue}>{settings.defaultSpeed === 'slower' ? 'Slower' : 'Natural'} ›</span>
        </button>
        <button className={styles.settingsRow} onClick={() => setShowReminderPicker(true)}>
          <span className={styles.rowLabel}>Daily reminder time</span>
          <span className={styles.rowValue}>{settings.reminderTime ? settings.reminderTime : 'Off'} ›</span>
        </button>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Notifications</h2>
        <p className={styles.hint}>
          {pushSubscribed
            ? 'Push reminders are on. We\'ll ping you at your reminder time.'
            : 'Get a daily push reminder to keep your streak alive.'}
        </p>
        <button
          className={pushSubscribed ? styles.downloadBtn : styles.primaryActionBtn}
          onClick={handleTogglePush}
          disabled={pushLoading}
          style={{ marginBottom: 8 }}
        >
          {pushLoading ? 'Working...' : pushSubscribed ? 'Turn off reminders' : 'Turn on reminders'}
        </button>
        {pushSubscribed && (
          <button className={styles.settingsRow} onClick={() => showTestNotification()}>
            <span className={styles.rowLabel}>Send a test notification</span>
            <span className={styles.rowValue}>›</span>
          </button>
        )}
        {pushStatus ? <p className={styles.hint} style={{ color: 'var(--color-brand-dark)', fontWeight: 600 }}>{pushStatus}</p> : null}
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Offline</h2>
        <p className={styles.hint}>Download all audio so lessons work without internet.</p>
        {downloadInBackground && (
          <p className={styles.hint} style={{ color: 'var(--color-brand-dark)', fontWeight: 600 }}>Downloading in background…</p>
        )}
        <button className={styles.downloadBtn} onClick={() => setShowDownloadModal(true)}>
          Download all audio
        </button>
      </div>

      {showDownloadModal && (
        <DownloadAllModal language={settings.currentLanguage} onClose={handleDownloadClose} />
      )}

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Account</h2>
        <div className={styles.accountRow}>
          <span className={styles.accountLabel}>Name</span>
          <span className={styles.accountValue}>{settings.name || getCurrentUser()?.displayName || '—'}</span>
        </div>
        <div className={styles.accountRow}>
          <span className={styles.accountLabel}>Email</span>
          <span className={styles.accountValue}>{getCurrentUser()?.email || settings.email || '—'}</span>
        </div>
        {onNavigate && (
          <button className={styles.navLink} onClick={() => onNavigate(ROUTES.PROFILE)}>View full profile</button>
        )}
        <button className={styles.signOutBtn} onClick={() => setShowSignOutConfirm(true)}>Sign out</button>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>App</h2>
        {onNavigate && (
          <>
            <button className={styles.appRow} onClick={() => onNavigate(ROUTES.ABOUT)}>
              <span>About ShadowSpeak</span><span className={styles.appChevron}>›</span>
            </button>
            <button className={styles.appRow} onClick={() => onNavigate(ROUTES.FAQ)}>
              <span>FAQ</span><span className={styles.appChevron}>›</span>
            </button>
            <button className={styles.appRow} onClick={() => onNavigate(ROUTES.CONTACT)}>
              <span>Contact / Support</span><span className={styles.appChevron}>›</span>
            </button>
          </>
        )}
        <p className={styles.versionLabel}>v{APP_VERSION}</p>
      </div>

      {showSignOutConfirm && (
        <ConfirmModal
          title="Sign out of ShadowSpeak?"
          body="Your progress is saved. You can sign back in anytime."
          confirmLabel="Sign out"
          destructive
          onConfirm={handleSignOut}
          onCancel={() => setShowSignOutConfirm(false)}
        />
      )}

      {showSpeedPicker && (
        <BottomSheet title="Default speed" onClose={() => setShowSpeedPicker(false)}>
          <p className={styles.pickerHint}>Which speed should new lessons start with?</p>
          {[
            { id: 'slower', label: 'Slower', desc: 'Native speaker, slowed down. Better for beginners.' },
            { id: 'natural', label: 'Natural (recommended)', desc: 'Native speaker at normal conversation speed.' },
          ].map(opt => (
            <button
              key={opt.id}
              className={`${styles.pickerOption} ${settings.defaultSpeed === opt.id ? styles.pickerSelected : ''}`}
              onClick={() => { updateSettings({ defaultSpeed: opt.id }); setShowSpeedPicker(false); }}
            >
              <span className={styles.pickerRadio}>{settings.defaultSpeed === opt.id ? '◉' : '○'}</span>
              <div className={styles.pickerText}>
                <span className={styles.pickerLabel}>{opt.label}</span>
                <span className={styles.pickerDesc}>{opt.desc}</span>
              </div>
            </button>
          ))}
        </BottomSheet>
      )}

      {showReminderPicker && (
        <BottomSheet
          title="Reminder time"
          onClose={() => setShowReminderPicker(false)}
          showConfirm
          confirmLabel="Save"
          onConfirm={async () => {
            updateSettings({ reminderTime });
            setShowReminderPicker(false);
            // If already subscribed, re-register with the new reminder time
            if (pushSubscribed) {
              await subscribeToPushNotifications(reminderTime);
            }
          }}
        >
          <p className={styles.pickerHint}>When should we remind you to practice?</p>
          <input
            type="time"
            className={styles.timeInput}
            value={reminderTime}
            onChange={e => setReminderTime(e.target.value)}
          />
          <p className={styles.reminderPreview}>
            {reminderTime ? `Reminder at ${reminderTime}` : 'No reminder set'}
          </p>
        </BottomSheet>
      )}
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
