// src/components/screens/LibraryScreen.jsx — Phrases/Vocab toggle, queue, cards

import { useState, useEffect, useCallback } from 'react';
import { getAllLibraryEntries, saveLibraryEntry } from '../../services/storage';
import { useAudio } from '../../contexts/AudioContext';
import { useAppContext } from '../../contexts/AppContext';
import { formatReviewStatus } from '../../utils/formatters';
import { ROUTES, SRS_MAX_INTERVAL } from '../../utils/constants';
import styles from './LibraryScreen.module.css';

/**
 * Library screen showing user's saved phrases and vocab.
 */
export default function LibraryScreen({ onNavigate }) {
  const { settings } = useAppContext();
  const { loadQueue, play, currentPhrase, isPlaying, pause } = useAudio();
  const [entries, setEntries] = useState([]);
  const [phrases, setPhrases] = useState({});
  const [filter, setFilter] = useState('all');
  const [mode, setMode] = useState('phrases');
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    async function load() {
      const all = await getAllLibraryEntries();
      setEntries(all);

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

  const handlePlayPhrase = useCallback(async (e, phraseId) => {
    e.stopPropagation();
    const phrase = phrases[phraseId];
    if (!phrase) return;
    if (currentPhrase?.id === phraseId && isPlaying) {
      pause();
      return;
    }
    await loadQueue([phrase], settings.currentLanguage);
    await play();
  }, [phrases, loadQueue, play, pause, currentPhrase, isPlaying, settings.currentLanguage]);

  const toggleExpand = useCallback((phraseId) => {
    setExpandedId(prev => prev === phraseId ? null : phraseId);
  }, []);

  const handleMarkKnown = useCallback(async (entry) => {
    const updated = {
      ...entry,
      status: 'mastered',
      interval: SRS_MAX_INTERVAL,
      nextReviewAt: Date.now() + SRS_MAX_INTERVAL * 24 * 60 * 60 * 1000,
    };
    await saveLibraryEntry(updated);
    setEntries(prev => prev.map(e => e.phraseId === entry.phraseId ? updated : e));
  }, []);

  const filtered = filter === 'all'
    ? entries
    : filter === 'due'
      ? entries.filter(e => e.nextReviewAt && new Date(e.nextReviewAt) <= new Date())
      : entries.filter(e => e.status === filter);

  const learningCount = entries.filter(e => e.status === 'learning').length;
  const masteredCount = entries.filter(e => e.status === 'mastered').length;
  const dueCount = entries.filter(e => e.nextReviewAt && new Date(e.nextReviewAt) <= new Date()).length;

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

      {/* Phrase list */}
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
              <p className={styles.emptyText}>Browse topics to find phrases you want to learn.</p>
            </>
          ) : (
            <p className={styles.emptyText}>No phrases match this filter.</p>
          )}
        </div>
      ) : (
        <div className={styles.phraseList}>
          {filtered.map(entry => {
            const phrase = phrases[entry.phraseId];
            const isActive = currentPhrase?.id === entry.phraseId;
            const isExpanded = expandedId === entry.phraseId;

            return (
              <div key={entry.phraseId} className={`${styles.phraseCard} ${isActive ? styles.activeCard : ''}`}>
                <button className={styles.cardBody} onClick={() => toggleExpand(entry.phraseId)}>
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

                  <div className={styles.cardRight}>
                    <span className={`${styles.status} ${styles[entry.status]}`}>
                      {entry.status === 'mastered' ? 'Mastered' : formatReviewStatus(entry.interval, entry.nextReviewAt)}
                    </span>
                    {entry.bestScore != null && (
                      <span className={styles.bestScore}>{entry.bestScore}%</span>
                    )}
                    <span className={`${styles.chevron} ${isExpanded ? styles.chevronOpen : ''}`}>&rsaquo;</span>
                  </div>
                </button>

                <button
                  className={styles.playBtn}
                  onClick={(e) => handlePlayPhrase(e, entry.phraseId)}
                  aria-label={isActive && isPlaying ? 'Pause' : 'Play'}
                >
                  {isActive && isPlaying ? <PauseIcon /> : <PlayIcon />}
                </button>

                {/* Expanded section */}
                {isExpanded && phrase && (
                  <div className={styles.expandedSection}>
                    {phrase.context && (
                      <p className={styles.contextLine}>{phrase.context}</p>
                    )}

                    {phrase.words && phrase.words.length > 0 && (
                      <div className={styles.wordCards}>
                        {phrase.words.map((word, i) => (
                          <div key={i} className={styles.wordCard}>
                            <span className={styles.wordChinese}>{word.chinese}</span>
                            <span className={styles.wordJyutping}>{word.jyutping}</span>
                            <span className={styles.wordEnglish}>{word.english}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className={styles.expandedActions}>
                      <button className={styles.repeatBtn} onClick={(e) => handlePlayPhrase(e, entry.phraseId)}>
                        Repeat
                      </button>
                      {entry.status !== 'mastered' && (
                        <button className={styles.knowItBtn} onClick={() => handleMarkKnown(entry)}>
                          I know this!
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add phrase button */}
      <button className={styles.addPhraseBtn} onClick={() => onNavigate?.(ROUTES.CUSTOM_PHRASE)}>
        <span className={styles.addPlusCircle}>+</span>
        <span className={styles.addLabel}>Add a phrase</span>
      </button>
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
      <rect x="6" y="4" width="4" height="16" rx="1" />
      <rect x="14" y="4" width="4" height="16" rx="1" />
    </svg>
  );
}
