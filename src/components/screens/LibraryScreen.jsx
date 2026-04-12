// src/components/screens/LibraryScreen.jsx — Phrases/Vocab toggle, queue, cards

import { useState, useEffect, useCallback } from 'react';
import { getAllLibraryEntries } from '../../services/storage';
import { useAudio } from '../../contexts/AudioContext';
import { useAppContext } from '../../contexts/AppContext';
import { ROUTES } from '../../utils/constants';
import PhraseCard from '../cards/PhraseCard';
import styles from './LibraryScreen.module.css';

/**
 * Library screen showing user's saved phrases and vocab.
 */
export default function LibraryScreen({ onNavigate, showToast }) {
  const { settings } = useAppContext();
  const { loadQueue, play } = useAudio();
  const [entries, setEntries] = useState([]);
  const [phrases, setPhrases] = useState({});
  const [filter, setFilter] = useState('all');
  const [mode, setMode] = useState('phrases');

  const loadEntries = useCallback(async () => {
    const all = await getAllLibraryEntries();
    setEntries(all);
  }, []);

  useEffect(() => {
    async function load() {
      await loadEntries();

      const modules = import.meta.glob('../../data/topics/cantonese/*.json', { eager: true });
      const phraseMap = {};
      for (const mod of Object.values(modules)) {
        const raw = mod.default || mod;
        const topicList = Array.isArray(raw) ? raw : [raw];
        for (const topic of topicList) {
          for (const p of topic.phrases) {
            phraseMap[p.id] = p;
          }
        }
      }
      setPhrases(phraseMap);
    }
    load();
  }, []);

  const sorted = [...entries].sort((a, b) => (a.addedAt || 0) - (b.addedAt || 0));
  const byMode = sorted.filter(e => mode === 'phrases' ? e.type !== 'vocab' : e.type === 'vocab');
  const filtered = filter === 'all'
    ? byMode
    : filter === 'due'
      ? byMode.filter(e => e.nextReviewAt && new Date(e.nextReviewAt) <= new Date())
      : byMode.filter(e => e.status === filter);

  const learningCount = byMode.filter(e => e.status === 'learning').length;
  const masteredCount = byMode.filter(e => e.status === 'mastered').length;
  const dueCount = byMode.filter(e => e.nextReviewAt && new Date(e.nextReviewAt) <= new Date()).length;

  const handlePlayAll = useCallback(async () => {
    const playable = filtered
      .map(entry => phrases[entry.phraseId])
      .filter(Boolean);
    if (playable.length > 0) {
      await loadQueue(playable, settings.currentLanguage);
      await play();
    }
  }, [filtered, phrases, loadQueue, play, settings.currentLanguage]);

  return (
    <div className={styles.screen}>
      {/* Phrases / Vocab toggle */}
      <div className={styles.modeToggle}>
        <button
          className={`${styles.modeBtn} ${mode === 'phrases' ? styles.modeActive : ''}`}
          onClick={() => setMode('phrases')}
        >
          Phrases
        </button>
        <button
          className={`${styles.modeBtn} ${mode === 'vocab' ? styles.modeActive : ''}`}
          onClick={() => setMode('vocab')}
        >
          Vocab
        </button>
      </div>

      {/* Add phrase — top position */}
      <button className={styles.addPhraseBtn} onClick={() => onNavigate?.(ROUTES.CUSTOM_PHRASE)}>
        <span className={styles.addPlusCircle}>+</span>
        <span className={styles.addLabel}>Add a phrase</span>
      </button>

      {/* Queue meter */}
      <div className={styles.queueCard}>
        <div className={styles.queueHeader}>
          <span className={styles.queueTitle}>Learning queue</span>
          <span className={styles.queueCount}>{entries.length} total</span>
        </div>
        <div className={styles.meterBar}>
          <div
            className={styles.meterFillMastered}
            style={{ width: entries.length > 0 ? `${(masteredCount / entries.length) * 100}%` : '0%' }}
          />
          <div
            className={styles.meterFillLearning}
            style={{ width: entries.length > 0 ? `${(learningCount / entries.length) * 100}%` : '0%' }}
          />
        </div>
        <div className={styles.queueLegend}>
          <span className={styles.legendItem}>
            <span className={styles.legendDotMastered} />
            {masteredCount} mastered
          </span>
          <span className={styles.legendItem}>
            <span className={styles.legendDotLearning} />
            {learningCount} learning
          </span>
        </div>
      </div>

      {/* Filter row */}
      <div className={styles.filterRow}>
        {[
          { key: 'all', label: 'All' },
          { key: 'learning', label: 'Learning' },
          { key: 'mastered', label: 'Mastered' },
          { key: 'due', label: `Due (${dueCount})` },
        ].map(f => (
          <button
            key={f.key}
            className={`${styles.filterButton} ${filter === f.key ? styles.filterActive : ''}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Play all filtered phrases */}
      {filtered.length > 0 && mode === 'phrases' && (
        <button className={styles.playAllBtn} onClick={handlePlayAll}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
          Play {filter === 'all' ? 'all' : filter} {filtered.length} phrase{filtered.length !== 1 ? 's' : ''}
        </button>
      )}

      {/* Entry list */}
      {filtered.length === 0 ? (
        <div className={styles.empty}>
          {entries.length === 0 ? (
            <>
              <div className={styles.emptyIcon}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="1.5">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
              </div>
              <p className={styles.emptyTitle}>Your library is empty</p>
              <p className={styles.emptyText}>Browse topics to save phrases you want to learn.</p>
            </>
          ) : (
            <p className={styles.emptyText}>No entries match this filter.</p>
          )}
        </div>
      ) : (
        <div className={styles.phraseList}>
          {filtered.map(entry => (
            <PhraseCard
              key={entry.phraseId}
              phrase={phrases[entry.phraseId] || null}
              libraryEntry={entry}
              onPlay={(chinese) => {
                if ('speechSynthesis' in window) {
                  window.speechSynthesis.cancel();
                  const u = new SpeechSynthesisUtterance(chinese);
                  u.lang = 'zh-HK';
                  u.rate = 0.8;
                  window.speechSynthesis.speak(u);
                }
              }}
              onSaved={loadEntries}
              showToast={showToast}
            />
          ))}
        </div>
      )}
    </div>
  );
}
