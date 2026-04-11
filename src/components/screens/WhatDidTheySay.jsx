// src/components/screens/WhatDidTheySay.jsx — "What did they say?" lookup

import { useState, useCallback } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { textToJyutping, textToSpeech } from '../../services/api';
import { isAuthenticated } from '../../services/auth';
import { saveLibraryEntry } from '../../services/storage';
import { cacheAudioBlob } from '../../services/audio';
import { loadAllPhrases } from '../../services/lessonBuilder';
import { SRS_INITIAL_EASE } from '../../utils/constants';
import { sanitizeInput } from '../../utils/validators';
import { jyutpingToDisplay } from '../../utils/jyutping';
import styles from './WhatDidTheySay.module.css';

/**
 * @param {{ onBack: Function, showToast: Function }} props
 */
export default function WhatDidTheySay({ onBack, showToast }) {
  const { settings } = useAppContext();
  const isOnline = useOnlineStatus();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [generated, setGenerated] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);

  const handleSearch = useCallback(async () => {
    const q = sanitizeInput(query).toLowerCase();
    if (!q) return;
    setIsLoading(true); setGenerated(null); setResults([]);

    try {
      const all = await loadAllPhrases(settings.currentLanguage);
      const matches = all.filter(p =>
        p.chinese.includes(q) || p.jyutping.toLowerCase().includes(q) ||
        p.romanization.toLowerCase().includes(q) || p.english.toLowerCase().includes(q)
      ).slice(0, 5);

      if (matches.length > 0) {
        setResults(matches);
      } else if (isOnline) {
        const jResult = await textToJyutping(q);
        if (jResult.success && jResult.result) {
          const jp = jResult.result.map(r => r.jyutping).join(' ');
          const gen = { chinese: q, jyutping: jp, romanization: jyutpingToDisplay(jp), english: '' };
          setGenerated(gen);

          if (isAuthenticated()) {
            const blob = await textToSpeech(q, {
              language: settings.currentLanguage, speed: 1.0, outputExtension: 'mp3', turbo: true,
            });
            setAudioBlob(blob);
          }
        }
      } else {
        showToast?.('No match found. Go online to generate.', 'info');
      }
    } catch (err) {
      showToast?.('Lookup failed', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [query, isOnline, settings.currentLanguage, showToast]);

  const handlePlayAudio = useCallback((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audio.play();
    audio.onended = () => URL.revokeObjectURL(url);
  }, []);

  const handleSave = useCallback(async (phrase) => {
    const phraseId = phrase.id || `lookup-${Date.now()}`;
    try {
      await saveLibraryEntry({
        phraseId, type: 'phrase', addedAt: Date.now(),
        source: phrase.id ? 'browse' : 'custom',
        customData: phrase.id ? null : { chinese: phrase.chinese, jyutping: phrase.jyutping, english: phrase.english },
        interval: 0, easeFactor: SRS_INITIAL_EASE, nextReviewAt: Date.now(),
        lastPracticedAt: null, practiceCount: 0, status: 'learning',
        bestScore: null, lastScore: null, scoreHistory: [],
      });
      if (audioBlob && !phrase.id) {
        await cacheAudioBlob(phraseId, settings.currentLanguage, 1.0, audioBlob);
      }
      showToast?.('Saved to library', 'success');
    } catch (err) {
      showToast?.('Failed to save', 'error');
    }
  }, [audioBlob, settings.currentLanguage, showToast]);

  return (
    <div className={styles.screen}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={onBack} aria-label="Go back">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 className={styles.title}>What did they say?</h1>
      </div>

      <div className={styles.searchRow}>
        <input className={styles.searchInput} type="text" value={query}
          onChange={e => setQuery(e.target.value)} placeholder="Type Chinese, Jyutping, or English..."
          onKeyDown={e => e.key === 'Enter' && handleSearch()} />
        <button className={styles.searchBtn} onClick={handleSearch} disabled={isLoading || !query.trim()}>
          {isLoading ? '...' : 'Search'}
        </button>
      </div>

      {results.length > 0 && (
        <div className={styles.resultList}>
          <h2 className={styles.sectionLabel}>Matches found</h2>
          {results.map(p => (
            <div key={p.id} className={styles.resultCard}>
              <div className={styles.resultInfo}>
                <span className={styles.roman}>{p.romanization}</span>
                <span className={styles.cn} lang="yue">{p.chinese}</span>
                <span className={styles.en}>{p.english}</span>
              </div>
              <button className={styles.addBtn} onClick={() => handleSave(p)}>+</button>
            </div>
          ))}
        </div>
      )}

      {generated && (
        <div className={styles.generatedSection}>
          <h2 className={styles.sectionLabel}>Generated result</h2>
          <div className={styles.generatedCard}>
            <p className={styles.genRoman}>{generated.romanization}</p>
            <p className={styles.genJyutping}>{generated.jyutping}</p>
            <p className={styles.genChinese} lang="yue">{generated.chinese}</p>
            {audioBlob && (
              <button className={styles.playBtn} onClick={() => handlePlayAudio(audioBlob)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21" /></svg>
                Play
              </button>
            )}
            <button className={styles.saveGenBtn} onClick={() => handleSave(generated)}>
              Save to Library
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
