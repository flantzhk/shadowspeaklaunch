// src/components/cards/PhraseCard.jsx — Shared phrase card for Library + Topic Detail

import { useState, useCallback, useRef } from 'react';
import { saveLibraryEntry, getLibraryEntry } from '../../services/storage';
import { textToSpeech } from '../../services/api';
import { isAuthenticated } from '../../services/auth';
import { SRS_INITIAL_EASE, SRS_MAX_INTERVAL } from '../../utils/constants';
import { formatReviewStatus } from '../../utils/formatters';
import styles from './PhraseCard.module.css';

/**
 * @param {{
 *   phrase: Object,
 *   libraryEntry: Object|null,
 *   onPlay: (chinese: string) => void,
 *   onSaved: (phraseId: string) => void,
 *   showToast: Function,
 * }} props
 */
export default function PhraseCard({ phrase, libraryEntry, onPlay, onSaved, showToast }) {
  const [expanded, setExpanded] = useState(false);
  const [repeating, setRepeating] = useState(false);
  const [saved, setSaved] = useState(!!libraryEntry);
  const [entry, setEntry] = useState(libraryEntry);
  const [celebrated, setCelebrated] = useState(false);
  const repeatRef = useRef(null);

  const chinese = phrase?.chinese || entry?.customData?.chinese;
  const romanization = phrase?.romanization || entry?.customData?.jyutping;
  const english = phrase?.english || entry?.customData?.english;
  const isVocab = entry?.type === 'vocab';

  const handlePlay = useCallback((e) => {
    e?.stopPropagation();
    if (chinese) onPlay?.(chinese);
  }, [chinese, onPlay]);

  const handleRepeat = useCallback((e) => {
    e?.stopPropagation();
    if (repeating) {
      setRepeating(false);
      if (repeatRef.current) clearTimeout(repeatRef.current);
      window.speechSynthesis?.cancel();
      return;
    }
    setRepeating(true);
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
  }, [chinese, repeating]);

  const handlePlayWord = useCallback(async (e, wordChinese) => {
    e?.stopPropagation();
    // Prefer TTS API (cantonese.ai) for crisp single-word audio
    if (isAuthenticated()) {
      try {
        const blob = await textToSpeech(wordChinese, { language: 'cantonese', speed: 1.0, outputExtension: 'mp3' });
        if (blob && blob.size > 0) {
          const url = URL.createObjectURL(blob);
          const audio = new Audio(url);
          audio.onended = () => URL.revokeObjectURL(url);
          await audio.play();
          return;
        }
      } catch (e) { /* fall through */ }
    }
    // Fallback: speechSynthesis
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(wordChinese);
      utterance.lang = 'zh-HK';
      utterance.rate = 0.7;
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  const handleSaveToLibrary = useCallback(async () => {
    if (saved) return;
    try {
      const newEntry = {
        phraseId: phrase.id,
        type: 'phrase',
        addedAt: Date.now(),
        source: 'browse',
        customData: null,
        interval: 0,
        easeFactor: SRS_INITIAL_EASE,
        nextReviewAt: Date.now(),
        lastPracticedAt: null,
        practiceCount: 0,
        status: 'learning',
        bestScore: null,
        lastScore: null,
        scoreHistory: [],
      };
      await saveLibraryEntry(newEntry);
      setSaved(true);
      setEntry(newEntry);
      onSaved?.(phrase.id);
      showToast?.('Saved to library', 'success');
    } catch (err) { /* duplicate */ }
  }, [phrase, saved, onSaved, showToast]);

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
      showToast?.('Added to Library', 'success');
    } catch (err) { /* duplicate */ }
  }, [showToast]);

  const handleMarkKnown = useCallback(async () => {
    if (!entry) return;
    setCelebrated(true);
    setTimeout(() => setCelebrated(false), 900);
    const updated = {
      ...entry,
      status: 'mastered',
      interval: SRS_MAX_INTERVAL,
      nextReviewAt: Date.now() + SRS_MAX_INTERVAL * 24 * 60 * 60 * 1000,
    };
    await saveLibraryEntry(updated);
    setEntry(updated);
    showToast?.('🎉 Marked as known!', 'success');
  }, [entry, showToast]);

  return (
    <div className={styles.card}>
      {/* Top row: play + text + expand */}
      <div className={styles.topRow}>
        <button className={styles.playBtn} onClick={handlePlay} aria-label="Play">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="var(--color-brand-dark)"><polygon points="5 3 19 12 5 21 5 3" /></svg>
        </button>

        <button className={styles.body} onClick={() => setExpanded(!expanded)}>
          <div className={styles.textGroup}>
            <span className={styles.romanization}>{romanization}</span>
            {chinese && <span className={styles.chinese} lang="yue">{chinese}</span>}
            {english && <span className={styles.english}>{english}</span>}
          </div>
          <span className={`${styles.expandIcon} ${expanded ? styles.expandIconOpen : ''}`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
          </span>
        </button>
      </div>

      {/* Status row */}
      {entry && (
        <div className={styles.statusRow}>
          <span className={`${styles.badge} ${entry.status === 'mastered' ? styles.badgeMastered : styles.badgeLearning}`}>
            {entry.status === 'mastered' ? '✓ Mastered' : formatReviewStatus(entry.interval, entry.nextReviewAt)}
          </span>
          {entry.bestScore != null && (
            <span className={styles.score}>Best: {entry.bestScore}%</span>
          )}
        </div>
      )}

      {/* Expanded section */}
      {expanded && (
        <div className={styles.expandedSection}>
          {/* Word cards */}
          {phrase?.words && phrase.words.length > 0 && (
            <div className={styles.wordCards}>
              {phrase.words.map((word, i) => (
                <div key={i} className={styles.wordCard}>
                  <div className={styles.wordTap} onClick={(e) => handlePlayWord(e, word.chinese)}>
                    <span className={styles.wordChinese} lang="yue">{word.chinese}</span>
                    <span className={styles.wordJyutping}>{word.jyutping}</span>
                    <span className={styles.wordEnglish}>{word.english}</span>
                    <span className={styles.wordSpeaker}>🔊</span>
                  </div>
                  <button className={styles.wordSave} onClick={(e) => { e.stopPropagation(); handleSaveWord(word); }}>
                    + Library
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Context */}
          {phrase?.context && (
            <p className={styles.context}>{phrase.context}</p>
          )}

          {/* Actions */}
          <div className={styles.actions}>
            <button className={`${styles.actionBtn} ${repeating ? styles.actionActive : ''}`} onClick={handleRepeat}>
              {repeating ? '⏹ Stop' : '🔁 Repeat'}
            </button>
            {!saved && phrase && (
              <button className={styles.actionBtn} onClick={handleSaveToLibrary}>
                + Library
              </button>
            )}
            {entry && entry.status !== 'mastered' && (
              <button
                className={`${styles.actionBtnPrimary} ${celebrated ? styles.celebrateBtn : ''}`}
                onClick={handleMarkKnown}
              >
                {celebrated ? '🎉 Known!' : 'I know this!'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
