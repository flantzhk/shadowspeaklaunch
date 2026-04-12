// src/components/screens/ProfileScreen.jsx — Combined Profile + Settings

import { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { getAllLanguages } from '../../services/languageManager';
import { getCurrentUser, signOut, deleteAccount } from '../../services/auth';
import { DAILY_GOAL_OPTIONS, ROUTES, APP_VERSION } from '../../utils/constants';
import { ConfirmModal } from '../shared/ConfirmModal';
import { BottomSheet } from '../shared/BottomSheet';
import DownloadAllModal from '../shared/DownloadAllModal';
import styles from './ProfileScreen.module.css';

export default function ProfileScreen({ onBack, onNavigate, showToast }) {
  const { settings, updateSettings } = useAppContext();
  const user = getCurrentUser();
  const languages = getAllLanguages();

  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showEditName, setShowEditName] = useState(false);
  const [editNameValue, setEditNameValue] = useState(settings.name || '');
  const [showSpeedPicker, setShowSpeedPicker] = useState(false);
  const [showReminderPicker, setShowReminderPicker] = useState(false);
  const [reminderTime, setReminderTime] = useState(settings.reminderTime || '09:00');
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloadInBackground, setDownloadInBackground] = useState(false);

  const initial = (settings.name || user?.displayName || user?.email || 'U')[0].toUpperCase();
  const joinedDate = user?.metadata?.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : null;

  const handleSignOut = async () => {
    await signOut();
    window.location.hash = `#${ROUTES.LOGIN}`;
  };

  const handleSaveName = () => {
    const trimmed = editNameValue.trim();
    if (trimmed) {
      updateSettings({ name: trimmed });
      showToast?.('Name updated', 'success');
    }
    setShowEditName(false);
  };

  const handleDownloadClose = (mode) => {
    if (mode === 'background') setDownloadInBackground(true);
    setShowDownloadModal(false);
  };

  return (
    <div className={styles.screen}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={onBack} aria-label="Go back">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
        <h1 className={styles.headerTitle}>Profile & Settings</h1>
      </div>

      {/* Avatar + Identity */}
      <div className={styles.identity}>
        <div className={styles.avatarWrap}>
          {(settings.photoURL || user?.photoURL) ? (
            <img className={styles.avatar} src={settings.photoURL || user?.photoURL} referrerPolicy="no-referrer" alt="Profile" />
          ) : (
            <div className={styles.avatarInitial}>{initial}</div>
          )}
        </div>
        <p className={styles.name}>{settings.name || user?.displayName || user?.email?.split('@')[0] || 'Learner'}</p>
        <p className={styles.email}>{user?.email || settings.email || ''}</p>
        {joinedDate && <p className={styles.joined}>Joined {joinedDate}</p>}
      </div>

      {/* Quick Stats */}
      <div className={styles.statsRow}>
        <StatTile value={settings.streakCount ?? 0} label={['day', 'streak']} />
        <StatTile value={settings.totalPracticeSeconds > 0 ? Math.round(settings.totalPracticeSeconds / 60) : 0} label={['minutes', 'practiced']} />
      </div>
      <button className={styles.statsLink} onClick={() => onNavigate?.(ROUTES.STATS)}>View detailed stats ›</button>

      <div className={styles.divider} />

      {/* Account */}
      <p className={styles.sectionHeader}>ACCOUNT</p>
      <button className={styles.row} onClick={() => setShowEditName(true)}>
        <span className={styles.rowLabel}>Name</span>
        <span className={styles.rowValue}>{settings.name || '—'} ›</span>
      </button>
      <div className={styles.row}>
        <span className={styles.rowLabel}>Email</span>
        <span className={styles.rowValue}>{user?.email || '—'}</span>
      </div>

      <div className={styles.divider} />

      {/* Language */}
      <p className={styles.sectionHeader}>LANGUAGE</p>
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

      <div className={styles.divider} />

      {/* Daily Goal */}
      <p className={styles.sectionHeader}>DAILY GOAL</p>
      <div className={styles.goalRow}>
        {DAILY_GOAL_OPTIONS.map(mins => (
          <button key={mins}
            className={`${styles.goalPill} ${settings.dailyGoalMinutes === mins ? styles.goalActive : ''}`}
            onClick={() => updateSettings({ dailyGoalMinutes: mins })}>
            {mins} min
          </button>
        ))}
      </div>

      <div className={styles.divider} />

      {/* Display */}
      <p className={styles.sectionHeader}>DISPLAY</p>
      <ToggleRow label="Show characters" checked={settings.showCharacters}
        onChange={(v) => updateSettings({ showCharacters: v })} />
      <ToggleRow label="Show English" checked={settings.showEnglish}
        onChange={(v) => updateSettings({ showEnglish: v })} />
      <ToggleRow label="Auto-advance" checked={settings.autoAdvance}
        onChange={(v) => updateSettings({ autoAdvance: v })} />

      <div className={styles.divider} />

      {/* Playback */}
      <p className={styles.sectionHeader}>PLAYBACK</p>
      <button className={styles.row} onClick={() => setShowSpeedPicker(true)}>
        <span className={styles.rowLabel}>Default speed</span>
        <span className={styles.rowValue}>{settings.defaultSpeed === 'slower' ? 'Slower' : 'Natural'} ›</span>
      </button>
      <button className={styles.row} onClick={() => setShowReminderPicker(true)}>
        <span className={styles.rowLabel}>Daily reminder</span>
        <span className={styles.rowValue}>{settings.reminderTime ? settings.reminderTime : 'Off'} ›</span>
      </button>

      <div className={styles.divider} />

      {/* Offline */}
      <p className={styles.sectionHeader}>OFFLINE</p>
      <p className={styles.hint}>Download all audio so lessons work without internet.</p>
      {downloadInBackground && (
        <p className={styles.hint} style={{ color: 'var(--color-brand-dark)', fontWeight: 600 }}>Downloading in background…</p>
      )}
      <button className={styles.downloadBtn} onClick={() => setShowDownloadModal(true)}>
        Download all audio
      </button>

      <div className={styles.divider} />

      {/* App */}
      <p className={styles.sectionHeader}>APP</p>
      {onNavigate && (
        <>
          <button className={styles.row} onClick={() => onNavigate(ROUTES.ABOUT)}>
            <span className={styles.rowLabel}>About ShadowSpeak</span>
            <span className={styles.rowValue}>›</span>
          </button>
          <button className={styles.row} onClick={() => onNavigate(ROUTES.FAQ)}>
            <span className={styles.rowLabel}>FAQ</span>
            <span className={styles.rowValue}>›</span>
          </button>
          <button className={styles.row} onClick={() => onNavigate(ROUTES.CONTACT)}>
            <span className={styles.rowLabel}>Contact / Support</span>
            <span className={styles.rowValue}>›</span>
          </button>
        </>
      )}

      <div className={styles.divider} />

      {/* Sign out + Delete */}
      <button className={styles.signOutBtn} onClick={() => setShowSignOutConfirm(true)}>Sign out</button>
      <button className={styles.deleteSection} onClick={() => setShowDeleteConfirm(true)} style={{ cursor: 'pointer', border: 'none', background: 'none', width: '100%', textAlign: 'left' }}>
        <p className={styles.deleteTitle}>Delete account</p>
        <p className={styles.deleteBody}>Permanently delete your account and all data.</p>
      </button>

      <p className={styles.versionLabel}>ShadowSpeak v{APP_VERSION}</p>

      {/* Modals */}
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

      {showDeleteConfirm && (
        <ConfirmModal
          title="Delete your account?"
          body="This will permanently delete your account, progress, and all saved data. This cannot be undone."
          confirmLabel={deleting ? 'Deleting…' : 'Delete account'}
          destructive
          onConfirm={async () => {
            setDeleting(true);
            try {
              await deleteAccount();
              // Clear IndexedDB
              const dbs = await window.indexedDB.databases?.() || [];
              for (const db of dbs) { if (db.name) window.indexedDB.deleteDatabase(db.name); }
              window.location.hash = `#${ROUTES.LOGIN}`;
              window.location.reload();
            } catch (err) {
              setDeleting(false);
              showToast?.('Failed to delete account. You may need to sign in again first.', 'error');
              setShowDeleteConfirm(false);
            }
          }}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}

      {showEditName && (
        <BottomSheet title="Edit name" onClose={() => setShowEditName(false)} showConfirm confirmLabel="Save" onConfirm={handleSaveName}>
          <label className={styles.fieldLabel}>FIRST NAME</label>
          <input className={styles.nameInput} value={editNameValue}
            onChange={(e) => setEditNameValue(e.target.value)} maxLength={30} autoFocus />
          <p className={styles.fieldHint}>This is how ShadowSpeak will greet you.</p>
        </BottomSheet>
      )}

      {showSpeedPicker && (
        <BottomSheet title="Default speed" onClose={() => setShowSpeedPicker(false)}>
          <p className={styles.fieldHint}>Which speed should new lessons start with?</p>
          {[
            { id: 'slower', label: 'Slower', desc: 'Native speaker, slowed down. Better for beginners.' },
            { id: 'natural', label: 'Natural (recommended)', desc: 'Normal conversation speed.' },
          ].map(opt => (
            <button key={opt.id}
              className={`${styles.pickerOption} ${settings.defaultSpeed === opt.id ? styles.pickerSelected : ''}`}
              onClick={() => { updateSettings({ defaultSpeed: opt.id }); setShowSpeedPicker(false); }}>
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
        <BottomSheet title="Reminder time" onClose={() => setShowReminderPicker(false)}
          showConfirm confirmLabel="Save" onConfirm={() => { updateSettings({ reminderTime }); setShowReminderPicker(false); }}>
          <p className={styles.fieldHint}>When should we remind you to practice?</p>
          <input type="time" className={styles.timeInput} value={reminderTime} onChange={e => setReminderTime(e.target.value)} />
        </BottomSheet>
      )}

      {showDownloadModal && (
        <DownloadAllModal language={settings.currentLanguage} onClose={handleDownloadClose} />
      )}
    </div>
  );
}

function StatTile({ value, label }) {
  return (
    <div className={styles.statTile}>
      <p className={styles.statNum}>{value}</p>
      <p className={styles.statLabel}>{label[0]}<br />{label[1]}</p>
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
