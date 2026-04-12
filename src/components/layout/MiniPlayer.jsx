// src/components/layout/MiniPlayer.jsx — Persistent now-playing bar

import { useAudio } from '../../contexts/AudioContext';
import styles from './MiniPlayer.module.css';

/**
 * Persistent mini player bar above the tab bar.
 * Shows when audio is loaded. Tap body to open NowPlayingScreen.
 * @param {{ onExpand: () => void }} props
 */
function MiniPlayer({ onExpand, desktop = false }) {
  const {
    currentPhrase,
    currentIndex,
    queueLength,
    isPlaying,
    play,
    pause,
    currentTime,
    duration,
    speed,
    isRepeat,
    hasQueue,
    setSpeed,
    toggleRepeat,
  } = useAudio();

  const progress = { current: currentIndex + 1, total: queueLength };

  if (!hasQueue || !currentPhrase) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  // Desktop: full-width horizontal bar at the bottom of the screen
  if (desktop) {
    return (
      <div className={styles.desktopBar}>
        {/* Left: artwork + text */}
        <button className={styles.desktopInfo} onClick={onExpand} aria-label="Open full player">
          <div className={styles.artwork}>
            <span className={styles.artworkChar}>{currentPhrase.chinese?.[0] || '?'}</span>
          </div>
          <div className={styles.textArea}>
            <span className={styles.romanization}>{currentPhrase.romanization}</span>
            <span className={styles.chinese}>{currentPhrase.chinese}</span>
          </div>
        </button>

        {/* Centre: progress bar */}
        <div className={styles.desktopProgress}>
          <span className={styles.time}>{formatTime(currentTime)}</span>
          <div className={styles.progressTrack}>
            <div className={styles.progressFill} style={{ width: `${progressPercent}%` }} />
          </div>
          <span className={styles.time}>{formatTime(duration)}</span>
        </div>

        {/* Right: controls */}
        <div className={styles.desktopControls}>
          <button
            className={`${styles.repeatBtn} ${isRepeat ? styles.repeatActive : ''}`}
            onClick={toggleRepeat}
            aria-label={isRepeat ? 'Repeat off' : 'Repeat one'}
          >
            <RepeatIcon />
          </button>
          <span className={styles.counter}>{progress.current} / {progress.total}</span>
          <button
            className={styles.speedPill}
            onClick={() => setSpeed(speed === 1.0 ? 0.75 : 1.0)}
          >
            {speed === 1.0 ? '1x' : '.75x'}
          </button>
          <button
            className={styles.playBtnDesktop}
            onClick={isPlaying ? pause : play}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </button>
        </div>
      </div>
    );
  }

  // Mobile: compact card above tab bar
  return (
    <div className={styles.miniPlayer}>
      {/* Main row: artwork + text + play button */}
      <button className={styles.mainRow} onClick={onExpand} aria-label="Open full player">
        <div className={styles.artwork} style={currentPhrase.imageGradient ? { background: currentPhrase.imageGradient } : undefined}>
          <span className={styles.artworkChar}>{currentPhrase.chinese?.[0] || '?'}</span>
        </div>
        <div className={styles.textArea}>
          <span className={styles.romanization}>{currentPhrase.romanization}</span>
          <span className={styles.chinese}>{currentPhrase.chinese}</span>
          <span className={styles.english}>{currentPhrase.english}</span>
        </div>
      </button>

      <button
        className={styles.playBtn}
        onClick={isPlaying ? pause : play}
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? <PauseIcon /> : <PlayIcon />}
      </button>

      {/* Progress row */}
      <div className={styles.progressRow}>
        <span className={styles.time}>{formatTime(currentTime)}</span>
        <div
          className={styles.progressTrack}
          role="progressbar"
          aria-valuenow={Math.round(progressPercent)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className={styles.progressFill} style={{ width: `${progressPercent}%` }} />
        </div>
        <span className={styles.time}>{formatTime(duration)}</span>
      </div>

      {/* Settings zone */}
      <div className={styles.settingsZone}>
        <button
          className={`${styles.repeatBtn} ${isRepeat ? styles.repeatActive : ''}`}
          onClick={toggleRepeat}
          aria-label={isRepeat ? 'Repeat off' : 'Repeat one'}
          aria-pressed={isRepeat}
        >
          <RepeatIcon />
          <span className={styles.repeatLabel}>Repeat</span>
        </button>

        <span className={styles.counter}>{progress.current} / {progress.total}</span>

        <button
          className={styles.speedPill}
          onClick={() => setSpeed(speed === 1.0 ? 0.75 : 1.0)}
          aria-label={`Speed: ${speed === 1.0 ? 'natural' : 'slower'}`}
        >
          {speed === 1.0 ? '1x' : '.75x'}
        </button>
      </div>
    </div>
  );
}

function PlayIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <rect x="5" y="4" width="5" height="16" rx="1" />
      <rect x="14" y="4" width="5" height="16" rx="1" />
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
