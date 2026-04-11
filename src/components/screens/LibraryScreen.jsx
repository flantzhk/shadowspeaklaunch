// src/components/screens/LibraryScreen.jsx — Phrases/Vocab toggle, queue, cards

import { useState, useEffect, useCallback } from 'react';
import { getAllLibraryEntries } from '../../services/storage';
import { useAudio } from '../../contexts/AudioContext';
import { useAppContext } from '../../contexts/AppContext';
import { formatReviewStatus } from '../../utils/formatters';
import styles from './LibraryScreen.module.css';

/**
 * Library screen showing user's saved phrases and vocab.
 */
export default function LibraryScreen() {
  const { settings } = useAppContext();
  const { loadQueue, play, currentPhrase, isPlaying, pause } = useAudio();
  const [entries, setEntries] = useState([]);
  const [phrases, setPhrases] = useState({});
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    async function load() {
      const all = await getAllLibraryEntries();
      setEntries(all);

      const modules = import.meta.glob('../../data/topics/cantonese/*.json', { eager: true });
      const phraseMap = {};
      for (const mod of Object.values(modules)) {
        const topic = mod.default || mod;
        for (const p of topic.phrases) {
          phraseMap[p.id] = p;
        }
      }
      setPhrases(phraseMap);
    }
    load();
  }, []);

  const handlePlayPhrase = useCallback(async (phraseId) => {
    const phrase = phrases[phraseId];
    if (!phrase) return;
    if (currentPhrase?.id === phraseId && isPlaying) {
      pause();
      return;
    }
    await loadQueue([phrase], settings.currentLanguage);
    await play();
  }, [phrases, loadQueue, play, pause, currentPhrase, isPlaying, settings.currentLanguage]);

  const filtered = filter === 'all'
    ? entries
    : entries.filter(e => e.status === filter);

  const learningCount = entries.filter(e => e.status === 'learning').length;
  const masteredCount = entries.filter(e => e.status === 'mastered').length;

  return (
    <div className={styles.screen}>
      <h1 className={styles.title}>My Library</h1>

      <div className={styles.queueMeter}>
        <div className={styles.meterLabel}>
          <span>{learningCount} learning</span>
          <span>{masteredCount} mastered</span>
        </div>
        <div className={styles.meterBar}>
          <div
            className={styles.meterFill}
            style={{ width: entries.length > 0 ? `${(masteredCount / entries.length) * 100}%` : '0%' }}
          />
        </div>
      </div>

      <div className={styles.filterRow}>
        {['all', 'learning', 'mastered'].map(f => (
          <button
            key={f}
            className={`${styles.filterButton} ${filter === f ? styles.filterActive : ''}`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyText}>
            {entries.length === 0
              ? 'Your library is empty. Browse topics to add phrases.'
              : 'No phrases match this filter.'}
          </p>
        </div>
      ) : (
        <div className={styles.phraseList}>
          {filtered.map(entry => {
            const phrase = phrases[entry.phraseId];
            const isActive = currentPhrase?.id === entry.phraseId;

            return (
              <div key={entry.phraseId} className={`${styles.phraseCard} ${isActive ? styles.activeCard : ''}`}>
                <button
                  className={styles.playBtn}
                  onClick={() => handlePlayPhrase(entry.phraseId)}
                  aria-label={isActive && isPlaying ? 'Pause' : 'Play'}
                >
                  {isActive && isPlaying ? <PauseIcon /> : <PlayIcon />}
                </button>

                <div className={styles.phraseInfo}>
                  <span className={styles.romanization}>
                    {phrase?.romanization || entry.phraseId}
                  </span>
                  {phrase && (
                    <>
                      <span className={styles.chinese} lang="yue">{phrase.chinese}</span>
                      <span className={styles.english}>{phrase.english}</span>
                    </>
                  )}
                </div>

                <div className={styles.meta}>
                  <span className={`${styles.status} ${styles[entry.status]}`}>
                    {entry.status}
                  </span>
                  <span className={styles.review}>
                    {formatReviewStatus(entry.interval, entry.nextReviewAt)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function PlayIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--color-brand-dark)">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--color-brand-dark)">
      <rect x="6" y="4" width="4" height="16" />
      <rect x="14" y="4" width="4" height="16" />
    </svg>
  );
}
