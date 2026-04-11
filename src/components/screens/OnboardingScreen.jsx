// src/components/screens/OnboardingScreen.jsx

import { useState, useCallback } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { saveLibraryEntry } from '../../services/storage';
import { SRS_INITIAL_EASE } from '../../utils/constants';
import { logger } from '../../utils/logger';
import styles from './OnboardingScreen.module.css';
import cantoneseData from '../../data/languages/cantonese.json';

/**
 * Onboarding screen shown on first launch.
 * @param {{ onComplete: () => void }} props
 */
export default function OnboardingScreen({ onComplete }) {
  const { updateSettings } = useAppContext();
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleStart = useCallback(async () => {
    setIsLoading(true);
    try {
      await updateSettings({
        name: name.trim(),
        onboardingCompleted: true,
        currentLanguage: 'cantonese',
      });

      await preloadStarterPhrases();
      onComplete();
    } catch (error) {
      logger.error('Onboarding failed', error);
      setIsLoading(false);
    }
  }, [name, updateSettings, onComplete]);

  return (
    <div className={styles.screen}>
      <div className={styles.content}>
        <div className={styles.logoSection}>
          <span className={styles.logoMark}>SS</span>
          <h1 className={styles.appName}>ShadowSpeak</h1>
          <p className={styles.tagline}>Learn to speak Cantonese. Not read it. Not write it. Speak it.</p>
        </div>

        <div className={styles.form}>
          <label className={styles.field}>
            <span className={styles.label}>What should we call you?</span>
            <input
              className={styles.input}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              autoFocus
            />
          </label>

          <div className={styles.languageSection}>
            <span className={styles.label}>Language</span>
            <div className={styles.languagePill}>
              <span className={styles.languageName}>Cantonese</span>
              <span className={styles.languageNative}>廣東話</span>
            </div>
          </div>
        </div>

        <button
          className={styles.startBtn}
          onClick={handleStart}
          disabled={isLoading}
        >
          {isLoading ? 'Setting up...' : 'Start your first lesson'}
        </button>

        <p className={styles.hint}>
          5 starter phrases will be added to your library
        </p>
      </div>
    </div>
  );
}

/**
 * Pre-load starter phrases into the library.
 */
async function preloadStarterPhrases() {
  const starterIds = cantoneseData.starterPhraseIds;
  const now = Date.now();

  for (const phraseId of starterIds) {
    try {
      await saveLibraryEntry({
        phraseId,
        type: 'phrase',
        addedAt: now,
        source: 'starter',
        customData: null,
        interval: 0,
        easeFactor: SRS_INITIAL_EASE,
        nextReviewAt: now,
        lastPracticedAt: null,
        practiceCount: 0,
        status: 'learning',
        bestScore: null,
        lastScore: null,
        scoreHistory: [],
      });
    } catch (error) {
      logger.error(`Failed to preload phrase ${phraseId}`, error);
    }
  }
}
