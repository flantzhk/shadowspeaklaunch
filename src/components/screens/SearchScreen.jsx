// src/components/screens/SearchScreen.jsx — Real-time search across phrases/words/topics

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAudio } from '../../contexts/AudioContext';
import { useAppContext } from '../../contexts/AppContext';
import { SEARCH_DEBOUNCE_MS, SRS_INITIAL_EASE } from '../../utils/constants';
import { saveLibraryEntry, getAllLibraryEntries } from '../../services/storage';
import { cacheAudioForPhrase } from '../../services/audio';
import styles from './SearchScreen.module.css';

export default function SearchScreen({ onBack, onNavigate, showToast }) {
  const { settings } = useAppContext();
  const { loadQueue, play } = useAudio();
  const [query, setQuery] = useState('');
  const [allPhrases, setAllPhrases] = useState([]);
  const [allTopics, setAllTopics] = useState([]);
  const [savedIds, setSavedIds] = useState(new Set());

  useEffect(() => {
    getAllLibraryEntries().then(entries => {
      setSavedIds(new Set(entries.map(e => e.phraseId)));
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const modules = import.meta.glob('../../data/topics/cantonese/*.json', { eager: true });
    const phrases = [];
    const topics = [];
    for (const mod of Object.values(modules)) {
      const raw = mod.default || mod;
      const topicList = Array.isArray(raw) ? raw : [raw];
      for (const topic of topicList) {
        topics.push(topic);
        for (const p of topic.phrases) {
          phrases.push({ ...p, topicName: topic.name });
        }
      }
    }
    setAllPhrases(phrases);
    setAllTopics(topics);
  }, []);

  const [debouncedQuery, setDebouncedQuery] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim().toLowerCase()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [query]);

  const results = useMemo(() => {
    if (!debouncedQuery) return { topics: [], phrases: [], words: [] };

    const q = debouncedQuery;
    const matchedTopics = allTopics.filter(t =>
      t.name.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q)
    );

    const matchedPhrases = allPhrases.filter(p =>
      p.romanization?.toLowerCase().includes(q) ||
      p.chinese?.includes(q) ||
      p.english?.toLowerCase().includes(q) ||
      p.jyutping?.toLowerCase().includes(q)
    );

    const wordSet = new Map();
    for (const p of allPhrases) {
      if (!p.words) continue;
      for (const w of p.words) {
        if (
          w.chinese?.includes(q) ||
          w.jyutping?.toLowerCase().includes(q) ||
          w.english?.toLowerCase().includes(q)
        ) {
          wordSet.set(w.chinese, w);
        }
      }
    }

    return { topics: matchedTopics, phrases: matchedPhrases.slice(0, 20), words: [...wordSet.values()].slice(0, 20) };
  }, [debouncedQuery, allPhrases, allTopics]);

  const handlePlayPhrase = useCallback(async (phrase) => {
    await loadQueue([phrase], settings.currentLanguage);
    await play();
  }, [loadQueue, play, settings.currentLanguage]);

  const handleSavePhrase = useCallback(async (phrase, e) => {
    e.stopPropagation();
    if (savedIds.has(phrase.id)) return;
    try {
      await saveLibraryEntry({
        phraseId: phrase.id, type: 'phrase', addedAt: Date.now(),
        source: 'search', customData: null, interval: 0,
        easeFactor: SRS_INITIAL_EASE, nextReviewAt: Date.now(),
        lastPracticedAt: null, practiceCount: 0, status: 'learning',
        bestScore: null, lastScore: null, scoreHistory: [],
      });
      setSavedIds(prev => new Set([...prev, phrase.id]));
      showToast?.('Saved to library', 'success');
      cacheAudioForPhrase(phrase, settings.currentLanguage).catch(() => {});
    } catch {
      showToast?.('Failed to save', 'error');
    }
  }, [savedIds, showToast, settings.currentLanguage]);

  const handleSaveWord = useCallback(async (word, e) => {
    e.stopPropagation();
    const phraseId = `word-${word.chinese}`;
    if (savedIds.has(phraseId)) return;
    try {
      await saveLibraryEntry({
        phraseId, type: 'phrase', addedAt: Date.now(),
        source: 'search', customData: { chinese: word.chinese, jyutping: word.jyutping, english: word.english },
        interval: 0, easeFactor: SRS_INITIAL_EASE, nextReviewAt: Date.now(),
        lastPracticedAt: null, practiceCount: 0, status: 'learning',
        bestScore: null, lastScore: null, scoreHistory: [],
      });
      setSavedIds(prev => new Set([...prev, phraseId]));
      showToast?.('Saved to library', 'success');
    } catch {
      showToast?.('Failed to save', 'error');
    }
  }, [savedIds, showToast]);

  const hasResults = results.topics.length + results.phrases.length + results.words.length > 0;

  return (
    <div className={styles.screen}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={onBack} aria-label="Go back">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div className={styles.searchInputWrap}>
          <svg className={styles.searchIcon} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            className={styles.searchInput}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search phrases, words, topics"
            autoFocus
          />
          {query && (
            <button className={styles.clearBtn} onClick={() => setQuery('')} aria-label="Clear search">
              &times;
            </button>
          )}
        </div>
      </div>

      <div className={styles.results}>
        {!debouncedQuery && (
          <p className={styles.hint}>Type to search across all phrases, words, and topics.</p>
        )}

        {debouncedQuery && !hasResults && (
          <div className={styles.noResults}>
            <p className={styles.noResultsText}>No results for &ldquo;{debouncedQuery}&rdquo;</p>
            <p className={styles.noResultsHint}>Try a shorter keyword or different spelling.</p>
          </div>
        )}

        {results.topics.length > 0 && (
          <section>
            <h3 className={styles.sectionTitle}>Topics</h3>
            {results.topics.map(t => (
              <button key={t.id} className={styles.resultCard} onClick={() => onNavigate('topic', { id: t.id })}>
                <span className={styles.resultTitle}>{t.name}</span>
                <span className={styles.resultMeta}>{t.phraseCount} phrases</span>
              </button>
            ))}
          </section>
        )}

        {results.phrases.length > 0 && (
          <section>
            <h3 className={styles.sectionTitle}>Phrases</h3>
            {results.phrases.map(p => {
              const saved = savedIds.has(p.id);
              return (
                <div key={p.id} className={styles.phraseRow}>
                  <button className={styles.phraseRowPlay} onClick={() => handlePlayPhrase(p)}>
                    <div className={styles.resultPhraseInfo}>
                      <span className={styles.resultRoman}>{p.romanization}</span>
                      <span className={styles.resultChinese}>{p.chinese}</span>
                      <span className={styles.resultEnglish}>{p.english}</span>
                    </div>
                    <span className={styles.resultMeta}>{p.topicName}</span>
                  </button>
                  <button
                    className={`${styles.addBtn} ${saved ? styles.addBtnSaved : ''}`}
                    onClick={(e) => handleSavePhrase(p, e)}
                    aria-label={saved ? 'Saved to library' : 'Save to library'}
                    disabled={saved}
                  >
                    {saved ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                    )}
                  </button>
                </div>
              );
            })}
          </section>
        )}

        {results.words.length > 0 && (
          <section>
            <h3 className={styles.sectionTitle}>Words</h3>
            <div className={styles.wordGrid}>
              {results.words.map(w => {
                const phraseId = `word-${w.chinese}`;
                const saved = savedIds.has(phraseId);
                return (
                  <div key={w.chinese} className={`${styles.wordCard} ${saved ? styles.wordCardSaved : ''}`}>
                    <span className={styles.wordChinese}>{w.chinese}</span>
                    <span className={styles.wordJyutping}>{w.jyutping}</span>
                    <span className={styles.wordEnglish}>{w.english}</span>
                    <button
                      className={`${styles.wordAddBtn} ${saved ? styles.addBtnSaved : ''}`}
                      onClick={(e) => handleSaveWord(w, e)}
                      aria-label={saved ? 'Saved' : 'Save to library'}
                      disabled={saved}
                    >
                      {saved ? '✓' : '+'}
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
