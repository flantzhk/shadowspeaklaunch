// src/components/screens/WelcomeScreen.jsx — Post-registration welcome

import { useCallback } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { getCurrentUser } from '../../services/auth';
import { ROUTES } from '../../utils/constants';
import styles from './WelcomeScreen.module.css';

export default function WelcomeScreen() {
  const { updateSettings } = useAppContext();

  const handleStart = useCallback(() => {
    const user = getCurrentUser();
    updateSettings({
      onboardingCompleted: true,
      name: user?.name || '',
      email: user?.email || '',
    });
    window.location.hash = `#${ROUTES.HOME}`;
  }, [updateSettings]);

  return (
    <div className={styles.screen}>
      <div className={styles.center}>
        <div className={styles.playCircle}>
          <div className={styles.playTriangle} />
        </div>

        <div className={styles.heading}>You&rsquo;re all set</div>
        <div className={styles.subtitle}>
          ShadowSpeak works like a podcast. Press play. Repeat what you hear. That&rsquo;s your lesson.
        </div>

        <div className={styles.statsRow}>
          <div className={styles.stat}>
            <div className={styles.statValue}>5</div>
            <div className={styles.statLabel}>phrases ready</div>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <div className={styles.statValue}>10</div>
            <div className={styles.statLabel}>min first lesson</div>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <div className={styles.statValue}>0</div>
            <div className={styles.statLabel}>day streak</div>
          </div>
        </div>

        <button className={styles.primaryBtn} type="button" onClick={handleStart}>
          Start your first lesson
        </button>
      </div>
    </div>
  );
}
