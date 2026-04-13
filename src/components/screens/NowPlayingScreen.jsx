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
    currentIndex,
    queueLength,
    isPlaying,
    play,
    pause,
    next,
    previous,
    currentTime,
    duration,
    speed,
    isRepeat,
    setSpeed,
    toggleRepeat,
  } = useAudio();

  const progress = { current: currentIndex + 1, total: queueLength };

  const { settings } = useAppContext();

  if (!currentPhrase) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className={styles.overlay}>
      {/* Header: drag handle + close button */}
      <div className={styles.handleBar}>
        <div className={styles.handle} />
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close player">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Artwork */}
      <div className={styles.artworkWrap}>
        <div className={styles.artwork}>
          <span className={styles.artworkChar}>{currentPhrase.chinese?.[0] || '?'}</span>
        </div>
      </div>

      {/* Phrase text */}
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

      {/* Transport controls */}
      <div className={styles.transport}>
        <button className={styles.skipBtn} onClick={previous} aria-label="Previous phrase">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="var(--color-text-secondary)">
            <polygon points="19 20 9 12 19 4 19 20" />
            <rect x="5" y="4" width="2" height="16" />
          </svg>
        </button>

        <button
          className={styles.mainPlayBtn}
          onClick={isPlaying ? pause : play}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              <polygon points="6 3 20 12 6 21 6 3" />
            </svg>
          )}
        </button>

        <button className={styles.skipBtn} onClick={next} aria-label="Next phrase">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="var(--color-text-secondary)">
            <polygon points="5 4 15 12 5 20 5 4" />
            <rect x="17" y="4" width="2" height="16" />
          </svg>
        </button>
      </div>

      {/* Progress bar */}
      <div className={styles.progressSection}>
        <div className={styles.progressTrack}>
          <div className={styles.progressFill} style={{ width: `${progressPercent}%` }} />
        </div>
        <div className={styles.timeLabels}>
          <span>{formatSeconds(currentTime)}</span>
          <span>{formatSeconds(duration)}</span>
        </div>
      </div>

      {/* Playback settings box */}
      <div className={styles.settingsBox}>
        <span className={styles.settingsLabel}>PLAYBACK</span>

        <div className={styles.settingRow}>
          <button
            className={`${styles.settingBtn} ${isRepeat ? styles.settingActive : ''}`}
            onClick={toggleRepeat}
          >
            <RepeatIcon />
            <span>Repeat</span>
          </button>

          <div className={styles.speedToggle}>
            <button
              className={`${styles.speedOption} ${speed !== 1.0 ? styles.speedActive : ''}`}
              onClick={() => setSpeed(0.75)}
            >
              Slower
            </button>
            <button
              className={`${styles.speedOption} ${speed === 1.0 ? styles.speedActive : ''}`}
              onClick={() => setSpeed(1.0)}
            >
              Natural
            </button>
          </div>
        </div>

        <span className={styles.phraseCounter}>{progress.current} of {progress.total}</span>
      </div>

      {/* Action buttons */}
      <div className={styles.actions}>
        <button className={styles.saveBtn} onClick={() => onSaveToLibrary?.(currentPhrase)}>
          Save to Library
        </button>
        <button className={styles.knowBtn} onClick={() => onMarkKnown?.(currentPhrase)}>
          I know this!
        </button>
      </div>

      {/* Word breakdown */}
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
    </div>
  );
}

function RepeatIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="17 1 21 5 17 9" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <polyline points="7 23 3 19 7 15" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  );
}

function formatSeconds(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}
