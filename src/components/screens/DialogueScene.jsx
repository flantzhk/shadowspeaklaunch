// src/components/screens/DialogueScene.jsx — Conversation flow practice

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { useRecorder } from '../../hooks/useRecorder';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { textToSpeech, scorePronunciation } from '../../services/api';
import { isAuthenticated } from '../../services/auth';
import { updateAfterPractice } from '../../services/srs';
import { saveSession } from '../../services/storage';
import { updateStreak } from '../../services/streak';
import { ScoreBadge } from '../cards/ScoreBadge';
import { RecordButton } from '../shared/RecordButton';
import styles from './DialogueScene.module.css';

/**
 * @param {{ sceneData: Object, onBack: Function, onComplete: Function }} props
 */
export default function DialogueScene({ sceneData, onBack, onComplete }) {
  const { settings, updateSettings } = useAppContext();
  const { isRecording, startRecording, stopRecording, error: micError } = useRecorder();
  const isOnline = useOnlineStatus();
  const [turnIndex, setTurnIndex] = useState(0);
  const [phase, setPhase] = useState('playing'); // playing|recording|scored|done
  const [score, setScore] = useState(null);
  const [chatLog, setChatLog] = useState([]);
  const [sessionStart] = useState(Date.now());
  const audioRef = useRef(new Audio());
  const scrollRef = useRef(null);

  const scene = sceneData;
  const turn = scene?.turns[turnIndex];

  useEffect(() => { return () => { audioRef.current.pause(); }; }, []);

  useEffect(() => {
    if (!turn) return;
    if (turn.speaker === 'other') playOtherTurn(turn);
    else setPhase('playing');
  }, [turnIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [chatLog]);

  const playOtherTurn = useCallback(async (t) => {
    setPhase('playing');
    addToLog(t, null);
    if (isAuthenticated()) {
      try {
        const blob = await textToSpeech(t.chinese, {
          language: 'cantonese', speed: 0.9, outputExtension: 'mp3',
          voiceId: t.voiceId || undefined,
        });
        const url = URL.createObjectURL(blob);
        audioRef.current.src = url;
        await audioRef.current.play();
        audioRef.current.onended = () => {
          URL.revokeObjectURL(url);
          setTimeout(() => advanceTurn(), t.pauseAfterMs || 2000);
        };
      } catch (err) {
        setTimeout(() => advanceTurn(), t.pauseAfterMs || 2000);
      }
    } else {
      setTimeout(() => advanceTurn(), t.pauseAfterMs || 2000);
    }
  }, []);

  const addToLog = useCallback((t, scoreVal) => {
    setChatLog(prev => [...prev, { ...t, score: scoreVal }]);
  }, []);

  const advanceTurn = useCallback(() => {
    const next = turnIndex + 1;
    if (next >= scene.turns.length) { finishScene(); return; }
    setTurnIndex(next);
    setScore(null);
  }, [turnIndex, scene]);

  const handleRecord = useCallback(async () => {
    audioRef.current.pause();
    await startRecording();
    setPhase('recording');
  }, [startRecording]);

  const handleStopRecord = useCallback(async () => {
    const blob = await stopRecording();
    if (!blob || !turn) return;
    setPhase('scored');

    let scoreVal = null;
    if (isOnline && isAuthenticated()) {
      try {
        const result = await scorePronunciation(blob, turn.chinese, 'cantonese');
        scoreVal = result.score;
        if (turn.phraseId) await updateAfterPractice(turn.phraseId, scoreVal);
      } catch (err) { /* non-fatal */ }
    }
    setScore(scoreVal);
    addToLog(turn, scoreVal);
  }, [stopRecording, turn, isOnline, addToLog]);

  const handleContinue = useCallback(() => { advanceTurn(); }, [advanceTurn]);

  const handleReplay = useCallback(() => {
    setTurnIndex(0); setChatLog([]); setScore(null); setPhase('playing');
  }, []);

  const finishScene = useCallback(async () => {
    setPhase('done');
    const dur = Math.round((Date.now() - sessionStart) / 1000);
    const streak = await updateStreak();
    await updateSettings({ streakCount: streak, totalPracticeSeconds: settings.totalPracticeSeconds + dur });
    const rec = {
      id: crypto.randomUUID(), date: new Date().toISOString().slice(0, 10),
      startedAt: sessionStart, completedAt: Date.now(), durationSeconds: dur,
      mode: 'dialogue', phrasesAttempted: scene.turns.filter(t => t.speaker === 'user').length,
      phrasesMastered: 0, averageScore: null, phraseResults: [],
    };
    await saveSession(rec);
    onComplete?.({ ...rec, streakCount: streak });
  }, [sessionStart, scene, updateSettings, settings, onComplete]);

  if (!scene) return null;

  return (
    <div className={styles.screen}>
      <div className={styles.header}>
        <button className={styles.closeBtn} onClick={onBack} aria-label="Exit">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <h2 className={styles.title}>{scene.title}</h2>
        <div style={{ width: 44 }} />
      </div>

      <div className={styles.chatArea} ref={scrollRef}>
        {chatLog.map((entry, i) => (
          <div key={i} className={`${styles.bubble} ${entry.speaker === 'user' ? styles.userBubble : styles.otherBubble}`}>
            <span className={styles.speakerLabel}>{entry.speakerLabel}</span>
            <p className={styles.bubbleRoman}>{entry.romanization}</p>
            <p className={styles.bubbleChinese} lang="yue">{entry.chinese}</p>
            <p className={styles.bubbleEnglish}>{entry.english}</p>
            {entry.score !== null && entry.score !== undefined && (
              <div className={styles.bubbleScore}><ScoreBadge score={entry.score} variant="compact" /></div>
            )}
          </div>
        ))}
      </div>

      <div className={styles.controls}>
        {phase === 'playing' && turn?.speaker === 'user' && (
          <RecordButton isRecording={false} onStart={handleRecord} onStop={() => {}} error={micError} />
        )}
        {phase === 'recording' && (
          <RecordButton isRecording={isRecording} onStart={handleRecord} onStop={handleStopRecord} error={micError} />
        )}
        {phase === 'scored' && (
          <div className={styles.scoredControls}>
            <ScoreBadge score={score} variant="full" />
            <button className={styles.continueBtn} onClick={handleContinue}>Continue</button>
          </div>
        )}
        {phase === 'done' && (
          <div className={styles.doneControls}>
            <button className={styles.replayBtn} onClick={handleReplay}>Replay</button>
            <button className={styles.doneBtn} onClick={() => onComplete?.({})}>Done</button>
          </div>
        )}
      </div>
    </div>
  );
}
