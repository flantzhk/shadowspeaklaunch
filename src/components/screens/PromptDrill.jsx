// src/components/screens/PromptDrill.jsx — "Your turn" mode: English → speak → score

import { useState, useEffect, useCallback } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { useRecorder } from '../../hooks/useRecorder';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { speechToText, scorePronunciation } from '../../services/api';
import { isAuthenticated } from '../../services/auth';
import { updateAfterPractice } from '../../services/srs';
import { buildLesson } from '../../services/lessonBuilder';
import { saveSession } from '../../services/storage';
import { updateStreak } from '../../services/streak';
import { ScoreBadge } from '../cards/ScoreBadge';
import { RecordButton } from '../shared/RecordButton';
import styles from './PromptDrill.module.css';

/**
 * @param {{ onBack: Function, onComplete: (summary: Object) => void }} props
 */
export default function PromptDrill({ onBack, onComplete }) {
  const { settings, updateSettings } = useAppContext();
  const { isRecording, startRecording, stopRecording, error: micError } = useRecorder();
  const isOnline = useOnlineStatus();
  const [phrases, setPhrases] = useState([]);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState('loading'); // loading|prompt|recording|result
  const [transcription, setTranscription] = useState('');
  const [score, setScore] = useState(null);
  const [results, setResults] = useState([]);
  const [sessionStart] = useState(Date.now());

  useEffect(() => {
    (async () => {
      const lesson = await buildLesson(settings.dailyGoalMinutes, settings.currentLanguage);
      setPhrases(lesson);
      if (lesson.length > 0) setPhase('prompt');
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const phrase = phrases[index];

  const handleReady = useCallback(async () => {
    setPhase('recording');
    await startRecording();
  }, [startRecording]);

  const handleDone = useCallback(async () => {
    const blob = await stopRecording();
    if (!blob || !phrase) return;
    setPhase('result');

    if (isOnline && isAuthenticated()) {
      try {
        const [sttResult, scoreResult] = await Promise.all([
          speechToText(blob),
          scorePronunciation(blob, phrase.chinese, settings.currentLanguage),
        ]);
        setTranscription(sttResult.text || '');
        setScore(scoreResult.score);
        await updateAfterPractice(phrase.id, scoreResult.score);
        setResults(prev => [...prev, { phraseId: phrase.id, romanization: phrase.romanization || '', english: phrase.english || '', score: scoreResult.score }]);
      } catch (err) {
        setTranscription('Could not transcribe');
        setScore(null);
        setResults(prev => [...prev, { phraseId: phrase.id, romanization: phrase.romanization || '', english: phrase.english || '', score: null }]);
      }
    } else {
      setTranscription('Scoring requires internet');
      setScore(null);
      setResults(prev => [...prev, { phraseId: phrase.id, romanization: phrase.romanization || '', english: phrase.english || '', score: null }]);
    }
  }, [stopRecording, phrase, isOnline, settings.currentLanguage]);

  const handleNext = useCallback(async () => {
    setTranscription(''); setScore(null);
    if (index < phrases.length - 1) {
      setIndex(i => i + 1); setPhase('prompt');
    } else {
      await finish();
    }
  }, [index, phrases.length]);

  const finish = useCallback(async () => {
    const dur = Math.round((Date.now() - sessionStart) / 1000);
    const streak = await updateStreak();
    const scores = results.filter(r => r.score !== null).map(r => r.score);
    await updateSettings({ streakCount: streak, totalPracticeSeconds: settings.totalPracticeSeconds + dur });
    const rec = {
      id: crypto.randomUUID(), date: new Date().toISOString().slice(0, 10),
      startedAt: sessionStart, completedAt: Date.now(), durationSeconds: dur,
      mode: 'prompt', phrasesAttempted: results.length, phrasesMastered: 0,
      averageScore: scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null,
      phraseResults: results.map(r => ({ phraseId: r.phraseId, romanization: r.romanization, english: r.english, score: r.score, replays: 0, markedKnown: false })),
    };
    await saveSession(rec);
    onComplete?.({ ...rec, streakCount: streak });
  }, [sessionStart, results, updateSettings, settings, onComplete]);

  if (phase === 'loading' || !phrase) {
    return <div className={styles.screen}><p className={styles.loading}>Loading...</p></div>;
  }

  return (
    <div className={styles.screen}>
      <div className={styles.header}>
        <button className={styles.closeBtn} onClick={onBack} aria-label="Exit">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <span className={styles.counter}>{index + 1}/{phrases.length}</span>
      </div>

      <div className={styles.promptArea}>
        <span className={styles.label}>Say this in Cantonese:</span>
        <p className={styles.english}>{phrase.english}</p>
        <p className={styles.context}>{phrase.context}</p>
      </div>

      {phase === 'prompt' && (
        <button className={styles.readyBtn} onClick={handleReady}>I&apos;m ready</button>
      )}

      {phase === 'recording' && (
        <RecordButton isRecording={isRecording} onStart={handleReady} onStop={handleDone} error={micError} />
      )}

      {phase === 'result' && (
        <div className={styles.resultArea}>
          <div className={styles.comparison}>
            <div className={styles.expected}>
              <span className={styles.compLabel}>Expected</span>
              <span className={styles.compText} lang="yue">{phrase.chinese}</span>
              <span className={styles.compJyutping}>{phrase.jyutping}</span>
            </div>
            <div className={styles.actual}>
              <span className={styles.compLabel}>You said</span>
              <span className={styles.compText} lang="yue">{transcription || '...'}</span>
            </div>
          </div>
          <ScoreBadge score={score} variant="full" />
          <button className={styles.nextBtn} onClick={handleNext}>
            {index < phrases.length - 1 ? 'Next' : 'Finish'}
          </button>
        </div>
      )}
    </div>
  );
}
