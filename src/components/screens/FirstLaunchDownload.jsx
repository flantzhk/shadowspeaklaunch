// src/components/screens/FirstLaunchDownload.jsx — First launch content setup

import { useState, useEffect, useRef } from 'react';
import styles from './FirstLaunchDownload.module.css';

/**
 * Full-screen setup screen shown on first launch after registration.
 * Downloads starter phrase data before proceeding.
 * @param {{ onComplete: Function }} props
 */
export default function FirstLaunchDownload({ onComplete }) {
  const [phase, setPhase] = useState('loading'); // loading | ready | error
  const [progress, setProgress] = useState({ done: 0, total: 0, label: 'Setting up...' });
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  useEffect(() => {
    async function setup() {
      try {
        // Phase 1: Load phrase JSON (already bundled, so instant)
        if (mounted.current) setProgress({ done: 0, total: 3, label: 'Loading phrases...' });
        await new Promise(r => setTimeout(r, 300));

        if (mounted.current) setProgress({ done: 1, total: 3, label: 'Building your library...' });
        await new Promise(r => setTimeout(r, 200));

        if (mounted.current) setProgress({ done: 2, total: 3, label: 'Almost ready...' });
        await new Promise(r => setTimeout(r, 200));

        if (mounted.current) {
          setProgress({ done: 3, total: 3, label: 'Ready!' });
          setPhase('ready');
          // Auto-advance after brief delay
          setTimeout(() => { if (mounted.current) onComplete?.(); }, 800);
        }
      } catch (err) {
        if (mounted.current) setPhase('error');
      }
    }
    setup();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const pct = progress.total > 0 ? (progress.done / progress.total) * 100 : 0;

  return (
    <div className={styles.screen}>
      <div className={styles.content}>
        <div className={styles.spinnerWrap}>
          {phase === 'ready' ? (
            <div className={styles.successCircle}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand-dark)" strokeWidth="3">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          ) : (
            <div className={styles.spinner} />
          )}
        </div>

        <h1 className={styles.title}>Setting up ShadowSpeak</h1>
        <p className={styles.subtitle}>
          {phase === 'error'
            ? 'Something went wrong. Please check your connection.'
            : 'Getting your phrases and audio ready...'}
        </p>

        <div className={styles.barTrack}>
          <div className={styles.barFill} style={{ width: `${pct}%` }} />
        </div>
        <p className={styles.statusText}>{progress.label}</p>

        <p className={styles.helpText}>This only takes a moment.</p>

        {phase === 'error' && (
          <button className={styles.retryBtn} onClick={() => window.location.reload()}>
            Retry
          </button>
        )}
      </div>
    </div>
  );
}
