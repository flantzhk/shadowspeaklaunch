// src/components/screens/NowPlayingScreen.jsx — Full player overlay

import { useAudio } from '../../contexts/AudioContext';
import { useAppContext } from '../../contexts/AppContext';
import styles from './NowPlayingScreen.module.css';

/**
 * Full-screen now-playing overlay.
 * @param {{ onClose: () => void, onSaveToLibrary: (phrase: Object) => void, onMarkKnown: (phrase: Object) => void }} props
 */
export default function NowPlayingScreen({ onClose, onSaveToLibrary, onMarkKnown }) {
  const {
    currentPhrase,
    isPlaying,
    play,
    pause,
    next,
    previous,
    currentTime,
    duration,
    speed,
    isRepeat,
    progress,
    setSpeed,
    toggleRepeat,
  } = useAudio();

  const { settings } = useAppContext();

  if (!currentPhrase) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className={styles.overlay}>
      <div className={styles.header}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close player">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
        <span className={styles.counter}>{progress.current} / {progress.total}</span>
        <div style={{ width: 44 }} />
      </div>

      <div className={styles.phraseDisplay}>
        <p className={styles.romanization}>{currentPhrase.romanization}</p>

        {settings.showCharacters && (
          <p className={styles.chinese} lang="yue">{currentPhrase.chinese}</p>
        )}

        {settings.showEnglish && (
          <p className={styles.english}>{currentPhrase.english}</p>
        )}

        <p className={styles.context}>{currentPhrase.context}</p>
      </div>

      {currentPhrase.words && currentPhrase.words.length > 0 && (
        <div className={styles.wordBreakdown}>
          {currentPhrase.words.map((word, i) => (
            <div key={i} className={styles.wordItem}>
              <span className={styles.wordChinese} lang="yue">{word.chinese}</span>
              <span className={styles.wordJyutping}>{word.jyutping}</span>
              <span className={styles.wordEnglish}>{word.english}</span>
            </div>
          ))}
        </div>
      )}

      <div className={styles.progressSection}>
        <div className={styles.progressTrack}>
          <div className={styles.progressFill} style={{ width: `${progressPercent}%` }} />
        </div>
        <div className={styles.timeLabels}>
          <span>{formatSeconds(currentTime)}</span>
          <span>{formatSeconds(duration)}</span>
        </div>
      </div>

      <div className={styles.transport}>
        <button
          className={`${styles.transportBtn} ${isRepeat ? styles.active : ''}`}
          onClick={toggleRepeat}
          aria-label="Toggle repeat"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="17 1 21 5 17 9" />
            <path d="M3 11V9a4 4 0 0 1 4-4h14" />
            <polyline points="7 23 3 19 7 15" />
            <path d="M21 13v2a4 4 0 0 1-4 4H3" />
          </svg>
        </button>

        <button className={styles.transportBtn} onClick={previous} aria-label="Previous phrase">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="19 20 9 12 19 4 19 20" />
            <line x1="5" y1="4" x2="5" y2="20" stroke="currentColor" strokeWidth="2" />
          </svg>
        </button>

        <button
          className={styles.mainPlayBtn}
          onClick={isPlaying ? pause : play}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          ) : (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          )}
        </button>

        <button className={styles.transportBtn} onClick={next} aria-label="Next phrase">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 4 15 12 5 20 5 4" />
            <line x1="19" y1="4" x2="19" y2="20" stroke="currentColor" strokeWidth="2" />
          </svg>
        </button>

        <button
          className={styles.speedPill}
          onClick={() => setSpeed(speed === 1.0 ? 0.75 : 1.0)}
          aria-label={`Speed: ${speed === 1.0 ? 'natural' : 'slower'}`}
        >
          {speed === 1.0 ? 'Natural' : 'Slower'}
        </button>
      </div>

      <div className={styles.actions}>
        <button
          className={styles.actionBtn}
          onClick={() => onSaveToLibrary?.(currentPhrase)}
        >
          + Save to Library
        </button>
        <button
          className={styles.knowBtn}
          onClick={() => onMarkKnown?.(currentPhrase)}
        >
          I know this!
        </button>
      </div>
    </div>
  );
}

/**
 * @param {number} seconds
 * @returns {string}
 */
function formatSeconds(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}
