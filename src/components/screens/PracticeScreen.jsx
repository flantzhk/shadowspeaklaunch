// src/components/screens/PracticeScreen.jsx — Practice modes hub

import { useState, useEffect } from 'react';
import { getDueEntries } from '../../services/storage';
import { loadAllDialogues } from '../../services/dialogueLoader';
import styles from './PracticeScreen.module.css';

const PRACTICE_MODES = [
  { id: 'session', name: 'Shadow Mode', description: 'Listen, repeat, get scored', icon: 'headphones' },
  { id: 'prompt', name: 'Prompt Drill', description: 'See English, speak Cantonese', icon: 'speech' },
  { id: 'speedrun', name: 'Speed Run', description: 'Rapid recall challenge', icon: 'bolt' },
];

function ModeIcon({ name }) {
  if (name === 'headphones') return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand-dark)" strokeWidth="2">
      <path d="M3 18v-6a9 9 0 0 1 18 0v6" /><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
    </svg>
  );
  if (name === 'speech') return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand-dark)" strokeWidth="2">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
  if (name === 'bolt') return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand-dark)" strokeWidth="2">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
  if (name === 'wave') return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand-dark)" strokeWidth="2">
      <path d="M2 12h2l3-9 4 18 4-18 3 9h2" />
    </svg>
  );
  return null;
}

/**
 * @param {{ onNavigate: Function, onStartScene: Function }} props
 */
export default function PracticeScreen({ onNavigate, onStartScene }) {
  const [dueCount, setDueCount] = useState(0);
  const [scenes, setScenes] = useState([]);

  useEffect(() => {
    getDueEntries().then(due => setDueCount(due.length)).catch(() => setDueCount(0));
    loadAllDialogues().then(setScenes).catch(() => setScenes([]));
  }, []);

  return (
    <div className={styles.screen}>
      <h1 className={styles.title}>Practice</h1>
      <p className={styles.subtitle}>Train your ear and your mouth.</p>

      {/* Quick Review Hero Card */}
      <div className={styles.reviewCard}>
        <div className={styles.reviewText}>
          <h2 className={styles.reviewTitle}>Quick Review</h2>
          <p className={styles.reviewCount}>
            {dueCount > 0
              ? `${dueCount} phrases due for review`
              : 'All caught up! Nothing due for review.'}
          </p>
        </div>
        {dueCount > 0 && (
          <button className={styles.reviewButton} onClick={() => onNavigate('session')}>
            Start Review
          </button>
        )}
      </div>

      {/* Practice Mode Cards (horizontal scroll) */}
      <h2 className={styles.sectionTitle}>Practice Modes</h2>
      <div className={styles.modeRow}>
        {PRACTICE_MODES.map(mode => (
          <button key={mode.id} className={styles.modeCard} onClick={() => onNavigate(mode.id)}>
            <div className={styles.modeIcon}>
              <ModeIcon name={mode.icon} />
            </div>
            <span className={styles.modeName}>{mode.name}</span>
            <span className={styles.modeDesc}>{mode.description}</span>
          </button>
        ))}
      </div>

      {/* AI Practice card */}
      <button className={styles.aiCard} onClick={() => onNavigate('ai-scenario')}>
        <div className={styles.aiIconWrap}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand-lime)" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>
        <div className={styles.aiText}>
          <span className={styles.aiTitle}>AI Conversation</span>
          <span className={styles.aiDesc}>Talk to an AI Cantonese speaker</span>
        </div>
        <span className={styles.aiChevron}>›</span>
      </button>

      {/* Dialogue Scenes */}
      <section className={styles.sceneSection}>
        <div className={styles.sceneSectionHeader}>
          <h2 className={styles.sectionTitle}>Scene Mode</h2>
          <button className={styles.browseAll} onClick={() => onNavigate('scene-picker')}>
            Browse all ›
          </button>
        </div>
        {scenes.length > 0 ? (
          <div className={styles.sceneList}>
            {scenes.slice(0, 3).map(scene => (
              <button key={scene.id} className={styles.sceneCard}
                onClick={() => onStartScene?.(scene)}>
                <div className={styles.sceneInfo}>
                  <span className={styles.sceneName}>{scene.topicName || 'Scene'}</span>
                  <span className={styles.sceneTitle}>"{scene.title}"</span>
                </div>
                <span className={styles.sceneMeta}>{scene.turns.length} turns</span>
              </button>
            ))}
          </div>
        ) : (
          <button className={styles.sceneEmptyCard} onClick={() => onNavigate('scene-picker')}>
            <span className={styles.sceneEmptyText}>Browse dialogue scenes →</span>
          </button>
        )}
      </section>
    </div>
  );
}
