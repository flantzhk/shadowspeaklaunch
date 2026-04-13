// src/components/screens/ScenePickerScreen.jsx — Browse dialogue scenes by topic

import { useState, useEffect } from 'react';
import styles from './ScenePickerScreen.module.css';

/**
 * @param {{ onBack: Function, onStartScene: Function }} props
 */
export default function ScenePickerScreen({ onBack, onStartScene }) {
  const [scenes, setScenes] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function load() {
      const modules = import.meta.glob('../../data/topics/**/*.json', { eager: true });
      const allScenes = [];
      for (const mod of Object.values(modules)) {
        const raw = mod.default || mod;
        const topicList = Array.isArray(raw) ? raw : [raw];
        for (const topic of topicList) {
          const dialogues = topic.dialogueScenes || topic.dialogues || [];
          if (Array.isArray(dialogues)) {
            for (const scene of dialogues) {
              allScenes.push({ ...scene, topicId: topic.id, topicName: topic.name });
            }
          }
        }
      }
      // Fallback: separate dialogue files
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
  }, []);

  // Group scenes by topicName
  const filtered = search.trim()
    ? scenes.filter(s =>
        s.title?.toLowerCase().includes(search.toLowerCase()) ||
        s.topicName?.toLowerCase().includes(search.toLowerCase())
      )
    : scenes;

  const grouped = filtered.reduce((acc, s) => {
    const key = s.topicName || 'Other';
    if (!acc[key]) acc[key] = [];
    acc[key].push(s);
    return acc;
  }, {});
  const groupKeys = Object.keys(grouped).sort();

  return (
    <div className={styles.screen}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={onBack} aria-label="Go back">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 className={styles.title}>Conversations</h1>
        <div style={{ width: 44 }} />
      </div>

      <p className={styles.subtitle}>
        Practice real-life conversations. You say your lines, we play the other character.
      </p>

      {/* Search */}
      <div className={styles.searchWrap}>
        <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          className={styles.searchInput}
          type="text"
          placeholder="Search conversations..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && (
          <button className={styles.searchClear} onClick={() => setSearch('')} aria-label="Clear">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>💬</span>
          <p className={styles.emptyTitle}>{search ? 'No conversations found' : 'No conversations yet'}</p>
          <p className={styles.emptyText}>
            {search ? 'Try a different search term.' : 'Conversations will appear here as topics are added.'}
          </p>
        </div>
      )}

      {/* Grouped scene list */}
      <div className={styles.sceneList}>
        {groupKeys.map(group => (
          <div key={group} className={styles.group}>
            <h2 className={styles.groupLabel}>{group}</h2>
            {grouped[group].map(scene => {
              const userTurns = scene.turns?.filter(t => t.speaker === 'user') || [];
              const firstUserLine = userTurns[0];
              return (
                <button
                  key={scene.id}
                  className={styles.sceneCard}
                  onClick={() => onStartScene?.(scene)}
                >
                  <div className={styles.sceneIconWrap}>
                    <span className={styles.sceneEmoji}>{scene.emoji || '💬'}</span>
                  </div>
                  <div className={styles.sceneBody}>
                    <div className={styles.sceneTitleRow}>
                      <span className={styles.sceneTitle}>{scene.title}</span>
                      <span className={styles.lineCount}>
                        {userTurns.length} {userTurns.length === 1 ? 'line' : 'lines'}
                      </span>
                    </div>
                    {firstUserLine && (
                      <p className={styles.scenePreview}>
                        You: "{firstUserLine.english}"
                      </p>
                    )}
                  </div>
                  <svg className={styles.chevron} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
