// src/contexts/AudioContext.jsx — Playback state, queue, current phrase

import { createContext, useContext, useRef, useState, useCallback, useEffect } from 'react';
import { AudioEngine } from '../services/audio';

const AudioCtx = createContext(null);

/**
 * AudioProvider wraps the app with audio playback state.
 * @param {{ children: React.ReactNode }} props
 */
function AudioProvider({ children }) {
  const engineRef = useRef(null);
  const [currentPhrase, setCurrentPhrase] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [queueLength, setQueueLength] = useState(0);
  const [playbackState, setPlaybackState] = useState('idle');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeedState] = useState(1.0);
  const [isRepeat, setIsRepeat] = useState(false);

  useEffect(() => {
    const engine = new AudioEngine();
    engineRef.current = engine;

    engine.on('phraseChange', (phrase, index) => {
      setCurrentPhrase(phrase);
      setCurrentIndex(index);
    });

    engine.on('stateChange', (state) => {
      setPlaybackState(state);
    });

    engine.on('timeUpdate', (time, dur) => {
      setCurrentTime(time);
      setDuration(dur || 0);
    });

    return () => engine.destroy();
  }, []);

  const loadQueue = useCallback(async (phrases, language, defaultSpeed) => {
    if (!engineRef.current) return;
    // Apply default speed setting if provided
    if (defaultSpeed) {
      const speedNum = defaultSpeed === 'slower' ? 0.75 : 1.0;
      engineRef.current._speed = speedNum;
      setSpeedState(speedNum);
    }
    setQueueLength(phrases.length);
    setPlaybackState('loading');
    try {
      await engineRef.current.loadQueue(phrases, language);
      // Only set ready if not already in error state
      if (engineRef.current._audio?.src) {
        setPlaybackState('ready');
      }
    } catch (err) {
      setPlaybackState('error');
    }
  }, []);

  const play = useCallback(async () => {
    await engineRef.current?.play();
  }, []);

  const pause = useCallback(() => {
    engineRef.current?.pause();
  }, []);

  const next = useCallback(async () => {
    await engineRef.current?.next();
  }, []);

  const previous = useCallback(async () => {
    await engineRef.current?.previous();
  }, []);

  const setSpeed = useCallback(async (newSpeed) => {
    if (!engineRef.current) return;
    setSpeedState(newSpeed);
    await engineRef.current.setSpeed(newSpeed);
  }, []);

  const toggleRepeat = useCallback(() => {
    if (!engineRef.current) return;
    const newVal = engineRef.current.toggleRepeat();
    setIsRepeat(newVal);
  }, []);

  const value = {
    currentPhrase,
    currentIndex,
    queueLength,
    playbackState,
    currentTime,
    duration,
    speed,
    isRepeat,
    isPlaying: playbackState === 'playing',
    hasQueue: queueLength > 0,
    loadQueue,
    play,
    pause,
    next,
    previous,
    setSpeed,
    toggleRepeat,
  };

  return (
    <AudioCtx.Provider value={value}>
      {children}
    </AudioCtx.Provider>
  );
}

/**
 * Hook to access audio playback state and controls.
 */
function useAudio() {
  const context = useContext(AudioCtx);
  if (!context) {
    throw new Error('useAudio must be used within AudioProvider');
  }
  return context;
}

export { AudioProvider, useAudio };
