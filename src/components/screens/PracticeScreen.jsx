// src/components/screens/PracticeScreen.jsx — Practice modes hub

import { useState, useEffect } from 'react';
import { getDueEntries } from '../../services/storage';
import { loadAllDialogues } from '../../services/dialogueLoader';
import styles from './PracticeScreen.module.css';

const PRACTICE_MODES = [
  { id: 'session', name: 'Shadow Mode', description: 'Listen, repeat, get scored', icon: '🎧' },
  { id: 'prompt', name: 'Prompt Drill', description: 'See English, speak Cantonese', icon: '🗣' },
  { id: 'speedrun', name: 'Speed Run', description: 'Rapid recall challenge', icon: '⚡' },
  { id: 'tonegym', name: 'Tone Gym', description: 'Train your ear for tones', icon: '🎵' },
  { id: 'ai', name: 'AI Chat', description: 'Practice with an AI partner', icon: '💬' },
];

/**
 * @param {{ onNavigate: Function, onStartScene: Function }} props
 */
export default function PracticeScreen({ onNavigate, onStartScene }) {
  const [dueCount, setDueCount] = useState(0);
  const [scenes, setScenes] = useState([]);

  useEffect(() => {
    getDueEntries().then(due => setDueCount(due.length));
    loadAllDialogues().then(setScenes);
  }, []);

  return (
    <div className={styles.screen}>
      <h1 className={styles.title}>Practice</h1>

      {dueCount > 0 && (
        <div className={styles.reviewCard}>
          <div className={styles.reviewInfo}>
            <span className={styles.reviewCount}>{dueCount}</span>
            <span className={styles.reviewLabel}>phrases due for review</span>
          </div>
          <button className={styles.reviewButton} onClick={() => onNavigate('session')}>
            Quick Review
          </button>
        </div>
      )}

      <div className={styles.modeGrid}>
        {PRACTICE_MODES.map(mode => (
          <button key={mode.id} className={styles.modeCard} onClick={() => onNavigate(mode.id)}>
            <span className={styles.modeIcon}>{mode.icon}</span>
            <span className={styles.modeName}>{mode.name}</span>
            <span className={styles.modeDesc}>{mode.description}</span>
          </button>
        ))}
      </div>

      {scenes.length > 0 && (
        <section className={styles.sceneSection}>
          <h2 className={styles.sectionTitle}>Scene Mode</h2>
          <div className={styles.sceneRow}>
            {scenes.map(scene => (
              <button key={scene.id} className={styles.sceneCard}
                onClick={() => onStartScene?.(scene)}>
                <span className={styles.sceneName}>{scene.title}</span>
                <span className={styles.sceneDesc}>{scene.turns.length} turns</span>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
