// src/components/screens/ShadowSession.jsx — Active lesson with pronunciation scoring

import { useState, useEffect, useCallback } from 'react';
import { useAudio } from '../../contexts/AudioContext';
import { useAppContext } from '../../contexts/AppContext';
import { useRecorder } from '../../hooks/useRecorder';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { updateAfterPractice } from '../../services/srs';
import { saveSession, addToQueue } from '../../services/storage';
import { scorePronunciation } from '../../services/api';
import { isAuthenticated } from '../../services/auth';
import { updateStreak } from '../../services/streak';
import { buildLesson } from '../../services/lessonBuilder';
import { blobToBase64 } from '../../services/offlineManager';
import { ScoreBadge } from '../cards/ScoreBadge';
import { RecordButton } from '../shared/RecordButton';
import { SCORE_THRESHOLDS } from '../../utils/constants';
import styles from './ShadowSession.module.css';

/**
 * @param {{ onBack: Function, onComplete: (summary: Object) => void }} props
 */
export default function ShadowSession({ onBack, onComplete }) {
  const { settings, updateSettings } = useAppContext();
  const audio = useAudio();
  const { isRecording, startRecording, stopRecording, error: micError } = useRecorder();
  const isOnline = useOnlineStatus();

  const [sessionStart] = useState(Date.now());
  const [results, setResults] = useState([]);
  const [currentScore, setCurrentScore] = useState(null);
  const [isScoring, setIsScoring] = useState(false);
  const [phase, setPhase] = useState('loading'); // loading | listen | record | scored

  useEffect(() => {
    (async () => {
      const phrases = await buildLesson(settings.dailyGoalMinutes, settings.currentLanguage);
      if (phrases.length > 0) { await audio.loadQueue(phrases, settings.currentLanguage); await audio.play(); setPhase('listen'); }
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (audio.playbackState === 'ended' && audio.queueLength > 0 && phase === 'listen' && results.length >= audio.queueLength) finishSession();
  }, [audio.playbackState]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleStartRecording = useCallback(async () => {
    audio.pause(); await startRecording(); setPhase('record');
  }, [audio, startRecording]);

  const handleStopRecording = useCallback(async () => {
    const blob = await stopRecording();
    if (!blob || !audio.currentPhrase) return;

    setPhase('scored');
    setIsScoring(true);
    setCurrentScore(null);

    if (isOnline && isAuthenticated()) {
      try {
        const result = await scorePronunciation(
          blob, audio.currentPhrase.chinese, settings.currentLanguage
        );
        setCurrentScore(result.score);
        await updateAfterPractice(audio.currentPhrase.id, result.score);
        addResult(audio.currentPhrase.id, result.score);
      } catch (err) {
        setCurrentScore(null);
        addResult(audio.currentPhrase.id, null);
      }
    } else {
      // Offline: queue for later
      try {
        const b64 = await blobToBase64(blob);
        await addToQueue('score-pronunciation', {
          audioBase64: b64,
          expectedText: audio.currentPhrase.chinese,
          language: settings.currentLanguage,
          phraseId: audio.currentPhrase.id,
        });
      } catch (err) { /* non-fatal */ }
      setCurrentScore(null);
      addResult(audio.currentPhrase.id, null);
    }
    setIsScoring(false);
  }, [stopRecording, audio, isOnline, settings.currentLanguage]);

  const addResult = useCallback((phraseId, score) => {
    const phrase = audio.currentPhrase;
    setResults(prev => [...prev, {
      phraseId, score,
      romanization: phrase?.romanization || phraseId,
      english: phrase?.english || '',
      mastered: score !== null && score >= SCORE_THRESHOLDS.EXCELLENT,
    }]);
  }, [audio]);

  const handleNext = useCallback(async () => {
    setCurrentScore(null);
    setPhase('listen');
    if (audio.currentIndex < audio.queueLength - 1) {
      await audio.next();
      await audio.play();
    } else {
      await finishSession();
    }
  }, [audio]);

  const handleSkip = useCallback(async () => {
    addResult(audio.currentPhrase?.id, null);
    await handleNext();
  }, [audio, addResult, handleNext]);

  const finishSession = useCallback(async () => {
    audio.pause();
    const dur = Math.round((Date.now() - sessionStart) / 1000);
    const streak = await updateStreak();
    const scores = results.filter(r => r.score !== null).map(r => r.score);
    const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
    await updateSettings({ streakCount: streak, totalPracticeSeconds: settings.totalPracticeSeconds + dur });
    const rec = {
      id: crypto.randomUUID(), date: new Date().toISOString().slice(0, 10),
      startedAt: sessionStart, completedAt: Date.now(), durationSeconds: dur,
      mode: 'shadow', phrasesAttempted: results.length,
      phrasesMastered: results.filter(r => r.mastered).length, averageScore: avg,
      phraseResults: results.map(r => ({ phraseId: r.phraseId, romanization: r.romanization, english: r.english, score: r.score, replays: 0, markedKnown: false })),
    };
    await saveSession(rec);
    onComplete?.({ ...rec, streakCount: streak });
  }, [sessionStart, results, audio, updateSettings, settings, onComplete]);

  if (phase === 'loading') {
    return <div className={styles.screen}><p className={styles.loading}>Building your lesson...</p></div>;
  }

  const progress = audio.queueLength > 0 ? ((audio.currentIndex + 1) / audio.queueLength) * 100 : 0;
  const phrase = audio.currentPhrase;

  return (
    <div className={styles.screen}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={onBack} aria-label="Exit">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <div className={styles.sessionProgress}>
          <div className={styles.sessionBar}>
            <div className={styles.sessionFill} style={{ width: `${progress}%` }} />
          </div>
          <span className={styles.sessionCount}>{audio.currentIndex + 1}/{audio.queueLength}</span>
        </div>
      </div>

      {phrase && (
        <div className={styles.phraseDisplay}>
          <p className={styles.romanization}>{phrase.romanization}</p>
          {settings.showCharacters && <p className={styles.chinese} lang="yue">{phrase.chinese}</p>}
          {settings.showEnglish && <p className={styles.english}>{phrase.english}</p>}
        </div>
      )}

      <div className={styles.controls}>
        {phase === 'listen' && (
          <>
            <button className={styles.playPauseBtn} onClick={audio.isPlaying ? audio.pause : audio.play}>
              {audio.isPlaying ? <PauseIcon /> : <PlayIcon />}
            </button>
            <RecordButton isRecording={false} onStart={handleStartRecording} onStop={() => {}} error={micError} />
          </>
        )}

        {phase === 'record' && (
          <RecordButton isRecording={isRecording} onStart={handleStartRecording} onStop={handleStopRecording} error={micError} />
        )}

        {phase === 'scored' && (
          <div className={styles.scoreSection}>
            <ScoreBadge score={isScoring ? null : currentScore} variant="full" />
            {currentScore !== null && currentScore < SCORE_THRESHOLDS.GOOD && (
              <p className={styles.tryAgain}>Try again or move on</p>
            )}
            <div className={styles.scoreActions}>
              <button className={styles.retryBtn} onClick={() => { setPhase('listen'); audio.play(); }}>
                Replay
              </button>
              <button className={styles.nextBtn} onClick={handleNext}>
                {audio.currentIndex < audio.queueLength - 1 ? 'Next' : 'Finish'}
              </button>
            </div>
          </div>
        )}
      </div>

      {phase === 'listen' && (
        <button className={styles.skipBtn} onClick={handleSkip}>Skip</button>
      )}
    </div>
  );
}

const PlayIcon = () => <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg>;
const PauseIcon = () => <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>;
