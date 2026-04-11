// src/components/layout/MiniPlayer.jsx — Persistent now-playing bar

import { useAudio } from '../../contexts/AudioContext';
import styles from './MiniPlayer.module.css';

/**
 * Persistent mini player bar above the tab bar.
 * Shows when audio is loaded. Tap body to open NowPlayingScreen.
 * @param {{ onExpand: () => void }} props
 */
function MiniPlayer({ onExpand }) {
  const {
    currentPhrase,
    isPlaying,
    play,
    pause,
    currentTime,
    duration,
    speed,
    isRepeat,
    hasQueue,
    progress,
    setSpeed,
    toggleRepeat,
  } = useAudio();

  if (!hasQueue || !currentPhrase) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className={styles.miniPlayer}>
      <div
        className={styles.progressTrack}
        role="progressbar"
        aria-valuenow={Math.round(progressPercent)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={styles.progressFill}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className={styles.content}>
        <button
          className={styles.body}
          onClick={onExpand}
          aria-label="Open full player"
        >
          <div className={styles.phraseInfo}>
            <span className={styles.romanization}>
              {currentPhrase.romanization}
            </span>
            <span className={styles.secondary}>
              {currentPhrase.chinese} — {currentPhrase.english}
            </span>
          </div>
        </button>

        <div className={styles.controls}>
          <button
            className={`${styles.controlBtn} ${isRepeat ? styles.active : ''}`}
            onClick={toggleRepeat}
            aria-label={isRepeat ? 'Repeat off' : 'Repeat one'}
            aria-pressed={isRepeat}
          >
            <RepeatIcon />
          </button>

          <button
            className={styles.playBtn}
            onClick={isPlaying ? pause : play}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </button>

          <button
            className={styles.speedBtn}
            onClick={() => setSpeed(speed === 1.0 ? 0.75 : 1.0)}
            aria-label={`Speed: ${speed === 1.0 ? 'natural' : 'slower'}`}
          >
            {speed === 1.0 ? '1x' : '.75x'}
          </button>
        </div>
      </div>

      <div className={styles.counter}>
        {progress.current} / {progress.total}
      </div>
    </div>
  );
}

function PlayIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="4" width="4" height="16" />
      <rect x="14" y="4" width="4" height="16" />
    </svg>
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

export { MiniPlayer };
