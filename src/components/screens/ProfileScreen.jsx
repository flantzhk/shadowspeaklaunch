// src/components/screens/ProfileScreen.jsx — Item 19

import { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { getCurrentUser, signOut } from '../../services/auth';
import { ConfirmModal } from '../shared/ConfirmModal';
import { BottomSheet } from '../shared/BottomSheet';
import { ROUTES } from '../../utils/constants';
import styles from './ProfileScreen.module.css';

export default function ProfileScreen({ onBack, onNavigate, showToast }) {
  const { settings, updateSettings } = useAppContext();
  const user = getCurrentUser();
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [showEditName, setShowEditName] = useState(false);
  const [editNameValue, setEditNameValue] = useState(settings.name || '');
  const [showGoalPicker, setShowGoalPicker] = useState(false);
  const [showLangPicker, setShowLangPicker] = useState(false);

  const initial = (settings.name || user?.displayName || 'U')[0].toUpperCase();
  const joinedDate = user?.metadata?.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'April 2026';

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

  return (
    <div className={styles.screen}>
      <button className={styles.backBtn} onClick={onBack}>‹ Back</button>

      <div className={styles.avatarWrap}>
        {settings.photoURL ? (
          <img className={styles.avatar} src={settings.photoURL} referrerPolicy="no-referrer" alt="Profile" />
        ) : (
          <div className={styles.avatarInitial}>{initial}</div>
        )}
      </div>

      <p className={styles.name}>{settings.name || user?.displayName || 'Learner'}</p>
      <p className={styles.email}>{user?.email || settings.email || ''}</p>
      <p className={styles.joined}>Joined {joinedDate}</p>

      <div className={styles.divider} />

      <div className={styles.statsRow}>
        <StatTile value={settings.streakCount} label={['day', 'streak']} />
        <StatTile value={settings.totalPracticeSeconds > 0 ? Math.round(settings.totalPracticeSeconds / 60) : 0} label={['minutes', 'practiced']} />
        <StatTile value={0} label={['phrases', 'learned']} />
      </div>

      <div className={styles.divider} />

      <p className={styles.sectionHeader}>ACCOUNT</p>
      <button className={styles.settingRow} onClick={() => setShowEditName(true)}>
        <span className={styles.settingLabel}>Name</span>
        <span className={styles.settingValue}>{settings.name || '—'} <span className={styles.chevron}>›</span></span>
      </button>
      <div className={styles.settingRow}>
        <span className={styles.settingLabel}>Email</span>
        <span className={styles.settingValue}>{user?.email || '—'}</span>
      </div>

      <div className={styles.divider} />

      <p className={styles.sectionHeader}>LEARNING</p>
      <button className={styles.settingRow} onClick={() => setShowLangPicker(true)}>
        <span className={styles.settingLabel}>Current language</span>
        <span className={styles.settingValue}>Cantonese <span className={styles.chevron}>›</span></span>
      </button>
      <button className={styles.settingRow} onClick={() => setShowGoalPicker(true)}>
        <span className={styles.settingLabel}>Daily goal</span>
        <span className={styles.settingValue}>{settings.dailyGoalMinutes} min <span className={styles.chevron}>›</span></span>
      </button>

      <div className={styles.divider} />

      <button className={styles.statsLink} onClick={() => onNavigate?.(ROUTES.STATS)}>View detailed stats</button>
      <button className={styles.signOutLink} onClick={() => setShowSignOutConfirm(true)}>Sign out</button>

      <div className={styles.divider} />

      <div className={styles.deleteSection}>
        <p className={styles.deleteTitle}>Delete account</p>
        <p className={styles.deleteBody}>Permanently delete your account and all data.</p>
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

      {showEditName && (
        <BottomSheet title="Edit name" onClose={() => setShowEditName(false)} showConfirm confirmLabel="Save" onConfirm={handleSaveName}>
          <label className={styles.fieldLabel}>FIRST NAME</label>
          <input
            className={styles.nameInput}
            value={editNameValue}
            onChange={(e) => setEditNameValue(e.target.value)}
            maxLength={30}
            autoFocus
          />
          <p className={styles.fieldHint}>This is how ShadowSpeak will greet you.</p>
        </BottomSheet>
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
