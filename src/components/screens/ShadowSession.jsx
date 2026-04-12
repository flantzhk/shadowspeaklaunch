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
import { updateStreak, getTodayString } from '../../services/streak';
import { buildLesson } from '../../services/lessonBuilder';
import { blobToBase64 } from '../../services/offlineManager';
import { ScoreBadge } from '../cards/ScoreBadge';
import { RecordButton } from '../shared/RecordButton';
import { LessonLoader } from '../shared/LessonLoader';
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
  const [phase, setPhase] = useState('loading'); // loading | ready | listen | record | scored

  const [lessonPhrases, setLessonPhrases] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const phrases = await buildLesson(settings.dailyGoalMinutes, settings.currentLanguage);
        if (phrases.length > 0) {
          setLessonPhrases(phrases);
          setPhase('ready');
        } else {
          setPhase('empty');
        }
      } catch (err) {
        setPhase('empty');
      }
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleTapToStart = useCallback(async () => {
    if (!lessonPhrases) return;
    setPhase('listen');
    try {
      await audio.loadQueue(lessonPhrases, settings.currentLanguage, settings.defaultSpeed);
      await audio.play();
    } catch (err) {
      // Audio will show error state via playbackState
    }
  }, [audio, lessonPhrases, settings.currentLanguage, settings.defaultSpeed]);

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
      id: crypto.randomUUID(), date: getTodayString(),
      startedAt: sessionStart, completedAt: Date.now(), durationSeconds: dur,
      mode: 'shadow', phrasesAttempted: results.length,
      phrasesMastered: results.filter(r => r.mastered).length, averageScore: avg,
      phraseResults: results.map(r => ({ phraseId: r.phraseId, romanization: r.romanization, english: r.english, score: r.score, replays: 0, markedKnown: false })),
    };
    await saveSession(rec);
    onComplete?.({ ...rec, streakCount: streak });
  }, [sessionStart, results, audio, updateSettings, settings, onComplete]);

  if (phase === 'loading') {
    return <LessonLoader mode="shadow-session" onCancel={onBack} />;
  }

  if (phase === 'empty') {
    return (
      <div className={styles.screen} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '24px', gap: '16px' }}>
        <p style={{ fontSize: '17px', fontWeight: 600, color: 'var(--color-text-primary)' }}>No phrases available</p>
        <p style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>Add phrases to your library first, then come back to practice.</p>
        <button onClick={onBack} style={{ padding: '12px 28px', borderRadius: '10px', background: 'var(--color-brand-dark)', color: 'white', fontWeight: 600, fontSize: '15px' }}>Go back</button>
      </div>
    );
  }

  if (phase === 'ready') {
    return (
      <div className={styles.screen} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '24px', gap: '24px' }}>
        <p style={{ fontSize: '15px', color: 'var(--color-text-muted)' }}>{lessonPhrases?.length || 0} phrases ready</p>
        <button onClick={handleTapToStart} style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--color-brand-lime)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}>
          <span style={{ width: 0, height: 0, borderLeft: '22px solid var(--color-brand-dark)', borderTop: '14px solid transparent', borderBottom: '14px solid transparent', marginLeft: '4px' }} />
        </button>
        <p style={{ fontSize: '17px', fontWeight: 600, color: 'var(--color-text-primary)' }}>Tap to start</p>
        <button onClick={onBack} style={{ fontSize: '14px', color: 'var(--color-text-muted)', padding: '8px' }}>Cancel</button>
      </div>
    );
  }

  const totalPhrases = audio.queueLength > 0 ? audio.queueLength : (lessonPhrases?.length || 1);
  const progress = ((audio.currentIndex + 1) / totalPhrases) * 100;
  // Show phrase text even while audio is loading
  const phrase = audio.currentPhrase || (lessonPhrases ? lessonPhrases[audio.currentIndex] : null);
  const audioLoading = !audio.currentPhrase && phase === 'listen';

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
          <span className={styles.sessionCount}>{audio.currentIndex + 1}/{totalPhrases}</span>
        </div>
      </div>

      {audio.playbackState === 'error' && (
        <div style={{ textAlign: 'center', padding: '24px' }}>
          <p style={{ fontSize: '14px', color: '#c44', marginBottom: '12px' }}>Audio failed to load</p>
          <button onClick={async () => { await audio.retryCurrentPhrase(); }} style={{ padding: '10px 20px', borderRadius: '8px', background: 'var(--color-brand-dark)', color: 'white', fontSize: '14px', fontWeight: 600 }}>
            Retry
          </button>
        </div>
      )}

      {phrase && (
        <div className={styles.phraseDisplay}>
          <p className={styles.romanization}>{phrase.romanization}</p>
          {settings.showCharacters && <p className={styles.chinese} lang="yue">{phrase.chinese}</p>}
          {settings.showEnglish && <p className={styles.english}>{phrase.english}</p>}
          {audioLoading && <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '12px' }}>Loading audio…</p>}
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
