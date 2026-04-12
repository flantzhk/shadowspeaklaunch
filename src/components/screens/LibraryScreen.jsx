// src/components/screens/LibraryScreen.jsx — Phrases/Vocab toggle, queue, cards

import { useState, useEffect, useCallback, useRef } from 'react';
import { getAllLibraryEntries, saveLibraryEntry } from '../../services/storage';
import { useAudio } from '../../contexts/AudioContext';
import { useAppContext } from '../../contexts/AppContext';
import { ROUTES } from '../../utils/constants';
import PhraseCard from '../cards/PhraseCard';
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
    try {
      await loadQueue([phrase], settings.currentLanguage);
      await play();
    } catch (err) {
      // Fallback: use Web Speech API if AudioEngine fails
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(phrase.chinese);
        utterance.lang = 'zh-HK';
        utterance.rate = 0.8;
        window.speechSynthesis.speak(utterance);
      }
    }
  }, [phrases, loadQueue, play, pause, currentPhrase, isPlaying, settings.currentLanguage]);

  const toggleExpand = useCallback((phraseId) => {
    setExpandedId(prev => prev === phraseId ? null : phraseId);
  }, []);

  const [repeatingId, setRepeatingId] = useState(null);
  const repeatRef = useRef(null);

  const handlePlayWord = useCallback((e, chinese) => {
    e.stopPropagation();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(chinese);
      utterance.lang = 'zh-HK';
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  const handleRepeat = useCallback((e, chinese, entryId) => {
    e.stopPropagation();
    if (repeatingId === entryId) {
      // Stop repeating
      setRepeatingId(null);
      if (repeatRef.current) clearTimeout(repeatRef.current);
      window.speechSynthesis?.cancel();
      return;
    }
    setRepeatingId(entryId);
    const playLoop = () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(chinese);
        utterance.lang = 'zh-HK';
        utterance.rate = 0.8;
        utterance.onend = () => {
          repeatRef.current = setTimeout(playLoop, 1500);
        };
        window.speechSynthesis.speak(utterance);
      }
    };
    playLoop();
  }, [repeatingId]);

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

  const handleSaveWord = useCallback(async (word) => {
    try {
      const wordId = `word-${word.chinese}`;
      await saveLibraryEntry({
        phraseId: wordId,
        type: 'vocab',
        addedAt: Date.now(),
        source: 'word-card',
        customData: { chinese: word.chinese, jyutping: word.jyutping, english: word.english },
        interval: 0,
        easeFactor: 2.5,
        nextReviewAt: Date.now(),
        lastPracticedAt: null,
        practiceCount: 0,
        status: 'learning',
        bestScore: null,
        lastScore: null,
        scoreHistory: [],
      });
      setEntries(prev => [...prev, { phraseId: wordId, type: 'vocab', status: 'learning', customData: { chinese: word.chinese, jyutping: word.jyutping, english: word.english } }]);
    } catch (err) { /* duplicate — ignore */ }
  }, []);

  // Filter by mode (phrases vs vocab), then by status filter
  const byMode = entries.filter(e => mode === 'phrases' ? e.type !== 'vocab' : e.type === 'vocab');
  const filtered = filter === 'all'
    ? byMode
    : filter === 'due'
      ? byMode.filter(e => e.nextReviewAt && new Date(e.nextReviewAt) <= new Date())
      : byMode.filter(e => e.status === filter);

  const learningCount = byMode.filter(e => e.status === 'learning').length;
  const masteredCount = byMode.filter(e => e.status === 'mastered').length;
  const dueCount = byMode.filter(e => e.nextReviewAt && new Date(e.nextReviewAt) <= new Date()).length;
  const phraseCount = entries.filter(e => e.type !== 'vocab').length;
  const vocabCount = entries.filter(e => e.type === 'vocab').length;

  return (
    <div className={styles.screen}>
      {/* Phrases / Vocab toggle */}
      <div className={styles.modeToggle}>
        <button
          className={`${styles.modeBtn} ${mode === 'phrases' ? styles.modeActive : ''}`}
          onClick={() => { setMode('phrases'); setFilter('all'); }}
        >
          Phrases{phraseCount > 0 ? ` (${phraseCount})` : ''}
        </button>
        <button
          className={`${styles.modeBtn} ${mode === 'vocab' ? styles.modeActive : ''}`}
          onClick={() => { setMode('vocab'); setFilter('all'); }}
        >
          Vocab{vocabCount > 0 ? ` (${vocabCount})` : ''}
        </button>
      </div>

      {/* Actions row */}
      <div className={styles.actionsRow}>
        <button className={styles.addPhraseBtn} onClick={() => onNavigate?.(ROUTES.CUSTOM_PHRASE)}>
          <span className={styles.addPlusCircle}>+</span>
          <span className={styles.addLabel}>Add a phrase</span>
        </button>
        {filtered.length > 0 && (
          <button className={styles.playAllBtn} onClick={async () => {
            // Build phrase objects for all filtered entries
            const playable = filtered
              .map(entry => {
                const phrase = phrases[entry.phraseId];
                if (phrase) return phrase;
                if (entry.customData) return {
                  id: entry.phraseId,
                  chinese: entry.customData.chinese,
                  romanization: entry.customData.jyutping || '',
                  english: entry.customData.english || '',
                };
                return null;
              })
              .filter(Boolean);
            if (playable.length > 0) {
              await loadQueue(playable, settings.currentLanguage);
              await play();
            }
          }}>
            <span className={styles.playAllIcon}>▶</span>
            <span className={styles.playAllLabel}>Play All</span>
          </button>
        )}
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
            // Build a phrase-like object for vocab entries
            const vocabPhrase = entry.type === 'vocab' && entry.customData ? {
              id: entry.phraseId,
              chinese: entry.customData.chinese,
              romanization: entry.customData.jyutping,
              english: entry.customData.english,
              words: [],
            } : null;

            return (
              <PhraseCard
                key={entry.phraseId}
                phrase={phrase || vocabPhrase}
                libraryEntry={entry}
                onPlay={(chinese) => {
                  if ('speechSynthesis' in window) {
                    window.speechSynthesis.cancel();
                    const u = new SpeechSynthesisUtterance(chinese);
                    u.lang = 'zh-HK'; u.rate = 0.8;
                    window.speechSynthesis.speak(u);
                  }
                }}
                showToast={() => {}}
              />
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
      <rect x="6" y="4" width="4" height="16" rx="1" />
      <rect x="14" y="4" width="4" height="16" rx="1" />
    </svg>
  );
}
