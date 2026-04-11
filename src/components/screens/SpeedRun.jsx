// src/components/screens/SpeedRun.jsx — Rapid recall game

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { buildLesson } from '../../services/lessonBuilder';
import { saveSession, getSettings, saveSettings } from '../../services/storage';
import { updateStreak } from '../../services/streak';
import styles from './SpeedRun.module.css';

const TIMER_SECONDS = 5;
const TOTAL_ROUNDS = 10;

/**
 * @param {{ onBack: Function, onComplete: (summary: Object) => void }} props
 */
export default function SpeedRun({ onBack, onComplete }) {
  const { settings, updateSettings } = useAppContext();
  const [phrases, setPhrases] = useState([]);
  const [round, setRound] = useState(0);
  const [timer, setTimer] = useState(TIMER_SECONDS);
  const [phase, setPhase] = useState('loading'); // loading|playing|feedback|done
  const [correct, setCorrect] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [wasCorrect, setWasCorrect] = useState(false);
  const [personalBest, setPersonalBest] = useState(0);
  const [options, setOptions] = useState([]);
  const [sessionStart] = useState(Date.now());
  const timerRef = useRef(null);

  useEffect(() => {
    (async () => {
      const lesson = await buildLesson(settings.dailyGoalMinutes, settings.currentLanguage);
      const shuffled = lesson.sort(() => Math.random() - 0.5).slice(0, TOTAL_ROUNDS);
      setPhrases(shuffled);
      const stored = await getSettings();
      setPersonalBest(stored?.speedRunBest || 0);
      if (shuffled.length > 0) { setPhase('playing'); startTimer(); generateOptions(shuffled, 0, lesson); }
    })();
    return () => clearInterval(timerRef.current);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const startTimer = useCallback(() => {
    setTimer(TIMER_SECONDS);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); handleTimeout(); return 0; }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const generateOptions = useCallback((allPhrases, idx, pool) => {
    const correct = allPhrases[idx];
    const others = pool.filter(p => p.id !== correct.id).sort(() => Math.random() - 0.5).slice(0, 3);
    const opts = [correct, ...others].sort(() => Math.random() - 0.5);
    setOptions(opts);
  }, []);

  const handleTimeout = useCallback(() => {
    setShowAnswer(true); setWasCorrect(false); setPhase('feedback');
  }, []);

  const handleChoice = useCallback((chosen) => {
    clearInterval(timerRef.current);
    const isRight = chosen.id === phrases[round]?.id;
    setWasCorrect(isRight);
    if (isRight) setCorrect(c => c + 1);
    setShowAnswer(true); setPhase('feedback');
  }, [phrases, round]);

  const handleNextRound = useCallback(async () => {
    setShowAnswer(false);
    const next = round + 1;
    if (next >= phrases.length || next >= TOTAL_ROUNDS) {
      await finish();
      return;
    }
    setRound(next);
    setPhase('playing');
    generateOptions(phrases, next, phrases);
    startTimer();
  }, [round, phrases, startTimer, generateOptions]);

  const finish = useCallback(async () => {
    setPhase('done');
    const dur = Math.round((Date.now() - sessionStart) / 1000);
    const streak = await updateStreak();
    const newBest = Math.max(personalBest, correct);
    await updateSettings({ streakCount: streak, totalPracticeSeconds: settings.totalPracticeSeconds + dur });
    if (newBest > personalBest) {
      const s = await getSettings();
      await saveSettings({ ...s, speedRunBest: newBest });
      setPersonalBest(newBest);
    }
    const rec = {
      id: crypto.randomUUID(), date: new Date().toISOString().slice(0, 10),
      startedAt: sessionStart, completedAt: Date.now(), durationSeconds: dur,
      mode: 'speed-run', phrasesAttempted: round + 1, phrasesMastered: 0,
      averageScore: null, phraseResults: [],
    };
    await saveSession(rec);
    onComplete?.({ ...rec, streakCount: streak, correct, personalBest: newBest });
  }, [sessionStart, correct, personalBest, round, updateSettings, settings, onComplete]);

  if (phase === 'loading') return <div className={styles.screen}><p className={styles.loading}>Loading...</p></div>;

  const phrase = phrases[round];
  if (phase === 'done') {
    return (
      <div className={styles.screen}>
        <div className={styles.doneCard}>
          <h2 className={styles.doneTitle}>Speed Run Complete</h2>
          <p className={styles.doneScore}>{correct}/{Math.min(phrases.length, TOTAL_ROUNDS)}</p>
          <p className={styles.doneBest}>Personal best: {personalBest}</p>
          <button className={styles.doneBtn} onClick={() => onComplete?.({})}>Done</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.screen}>
      <div className={styles.header}>
        <button className={styles.closeBtn} onClick={onBack} aria-label="Exit">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <span className={styles.score}>{correct} correct</span>
        <span className={styles.roundCount}>{round + 1}/{TOTAL_ROUNDS}</span>
      </div>

      <div className={styles.timerBar}>
        <div className={styles.timerFill} style={{ width: `${(timer / TIMER_SECONDS) * 100}%` }} />
      </div>

      <div className={styles.promptArea}>
        <span className={styles.label}>Which phrase means:</span>
        <p className={styles.english}>{phrase?.english}</p>
      </div>

      {showAnswer && (
        <div className={`${styles.feedback} ${wasCorrect ? styles.correct : styles.wrong}`}>
          {wasCorrect ? 'Correct!' : `Answer: ${phrase?.romanization}`}
        </div>
      )}

      <div className={styles.optionsGrid}>
        {options.map(opt => (
          <button key={opt.id} className={styles.optionBtn}
            onClick={() => phase === 'playing' && handleChoice(opt)}
            disabled={phase !== 'playing'}
          >
            <span className={styles.optRoman}>{opt.romanization}</span>
            <span className={styles.optChinese} lang="yue">{opt.chinese}</span>
          </button>
        ))}
      </div>

      {phase === 'feedback' && (
        <button className={styles.nextBtn} onClick={handleNextRound}>
          {round + 1 >= TOTAL_ROUNDS ? 'Finish' : 'Next'}
        </button>
      )}
    </div>
  );
}
