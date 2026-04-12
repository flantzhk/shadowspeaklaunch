// src/components/screens/ScenePickerScreen.jsx — Browse all dialogue scenes

import { useState, useEffect } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import styles from './ScenePickerScreen.module.css';

const DIFFICULTY_LABEL = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' };
const DIFFICULTY_COLOR = {
  beginner: 'var(--color-brand-lime)',
  intermediate: '#E8A030',
  advanced: '#E05050',
};

/**
 * @param {{ onBack: Function, onStartScene: Function }} props
 */
export default function ScenePickerScreen({ onBack, onStartScene }) {
  const { settings } = useAppContext();
  const [scenes, setScenes] = useState([]);
  const [filter, setFilter] = useState('all'); // all | beginner | intermediate | advanced

  useEffect(() => {
    async function load() {
      const modules = import.meta.glob('../../data/topics/cantonese/*.json', { eager: true });
      const allScenes = [];
      for (const mod of Object.values(modules)) {
        const raw = mod.default || mod;
        const topicList = Array.isArray(raw) ? raw : [raw];
        for (const topic of topicList) {
          const scenes = topic.dialogueScenes || topic.dialogues || [];
          if (Array.isArray(scenes)) {
            for (const scene of scenes) {
              allScenes.push({ ...scene, topicId: topic.id, topicName: topic.name });
            }
          }
        }
      }
      // Fallback: try loading separate dialogue files
      if (allScenes.length === 0) {
        const dialogueModules = import.meta.glob('../../data/dialogues/**/*.json', { eager: true });
        for (const mod of Object.values(dialogueModules)) {
          const scene = mod.default || mod;
          if (scene.id && scene.turns) allScenes.push(scene);
        }
      }
      setScenes(allScenes);
    }
    load();
  }, [settings.currentLanguage]);

  const filtered = filter === 'all'
    ? scenes
    : scenes.filter(s => s.difficulty === filter);

  return (
    <div className={styles.screen}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={onBack} aria-label="Go back">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 className={styles.title}>Dialogue Scenes</h1>
        <div style={{ width: 44 }} />
      </div>

      {/* Filter tabs */}
      <div className={styles.filterRow}>
        {[
          { key: 'all', label: 'All' },
          { key: 'beginner', label: 'Beginner' },
          { key: 'intermediate', label: 'Intermediate' },
          { key: 'advanced', label: 'Advanced' },
        ].map(f => (
          <button
            key={f.key}
            className={`${styles.filterBtn} ${filter === f.key ? styles.filterActive : ''}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Scene list */}
      {filtered.length === 0 ? (
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>🗣️</span>
          <p className={styles.emptyTitle}>No scenes available</p>
          <p className={styles.emptyText}>
            {scenes.length === 0
              ? 'Dialogue scenes will appear here as they become available.'
              : 'No scenes match this difficulty level.'}
          </p>
        </div>
      ) : (
        <div className={styles.sceneList}>
          {filtered.map(scene => (
            <button
              key={scene.id}
              className={styles.sceneCard}
              onClick={() => onStartScene?.(scene)}
            >
              <div className={styles.sceneLeft}>
                <div className={styles.sceneIconWrap}>
                  <span className={styles.sceneEmoji}>{scene.emoji || '💬'}</span>
                </div>
              </div>
              <div className={styles.sceneBody}>
                <div className={styles.sceneTopRow}>
                  <span className={styles.sceneTitle}>{scene.title}</span>
                  {scene.difficulty && (
                    <span
                      className={styles.diffBadge}
                      style={{ background: DIFFICULTY_COLOR[scene.difficulty] || 'var(--color-brand-lime)' }}
                    >
                      {DIFFICULTY_LABEL[scene.difficulty] || scene.difficulty}
                    </span>
                  )}
                </div>
                {scene.description && (
                  <p className={styles.sceneDesc}>{scene.description}</p>
                )}
                <div className={styles.sceneFooter}>
                  {scene.topicName && (
                    <span className={styles.sceneTopic}>{scene.topicName}</span>
                  )}
                  {scene.turns && (
                    <span className={styles.sceneTurns}>{scene.turns.length} turns</span>
                  )}
                  {scene.durationMinutes && (
                    <span className={styles.sceneDuration}>~{scene.durationMinutes} min</span>
                  )}
                </div>
              </div>
              <div className={styles.sceneChevron}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
