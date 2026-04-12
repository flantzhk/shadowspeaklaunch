// src/components/screens/ToneGym.jsx — Ear training: pick the correct tone

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { textToSpeech } from '../../services/api';
import { isAuthenticated } from '../../services/auth';
import { saveSession } from '../../services/storage';
import { updateStreak, getTodayString } from '../../services/streak';
import styles from './ToneGym.module.css';

const TOTAL_ROUNDS = 10;
const TONE_PAIRS = [
  { base: '媽', tones: [{ char: '媽', jyutping: 'maa1', tone: 1 }, { char: '麻', jyutping: 'maa4', tone: 4 }] },
  { base: '好', tones: [{ char: '好', jyutping: 'hou2', tone: 2 }, { char: '號', jyutping: 'hou6', tone: 6 }] },
  { base: '心', tones: [{ char: '心', jyutping: 'sam1', tone: 1 }, { char: '沁', jyutping: 'sam3', tone: 3 }] },
  { base: '飛', tones: [{ char: '飛', jyutping: 'fei1', tone: 1 }, { char: '肥', jyutping: 'fei4', tone: 4 }] },
  { base: '四', tones: [{ char: '四', jyutping: 'sei3', tone: 3 }, { char: '死', jyutping: 'sei2', tone: 2 }] },
  { base: '詩', tones: [{ char: '詩', jyutping: 'si1', tone: 1 }, { char: '時', jyutping: 'si4', tone: 4 }] },
  { base: '分', tones: [{ char: '分', jyutping: 'fan1', tone: 1 }, { char: '粉', jyutping: 'fan2', tone: 2 }] },
  { base: '買', tones: [{ char: '買', jyutping: 'maai5', tone: 5 }, { char: '賣', jyutping: 'maai6', tone: 6 }] },
  { base: '長', tones: [{ char: '長', jyutping: 'coeng4', tone: 4 }, { char: '唱', jyutping: 'coeng3', tone: 3 }] },
  { base: '大', tones: [{ char: '大', jyutping: 'daai6', tone: 6 }, { char: '帶', jyutping: 'daai3', tone: 3 }] },
  { base: '知', tones: [{ char: '知', jyutping: 'zi1', tone: 1 }, { char: '紙', jyutping: 'zi2', tone: 2 }] },
  { base: '事', tones: [{ char: '事', jyutping: 'si6', tone: 6 }, { char: '試', jyutping: 'si3', tone: 3 }] },
  { base: '油', tones: [{ char: '油', jyutping: 'jau4', tone: 4 }, { char: '有', jyutping: 'jau5', tone: 5 }] },
  { base: '九', tones: [{ char: '九', jyutping: 'gau2', tone: 2 }, { char: '夠', jyutping: 'gau3', tone: 3 }] },
  { base: '花', tones: [{ char: '花', jyutping: 'faa1', tone: 1 }, { char: '化', jyutping: 'faa3', tone: 3 }] },
  { base: '書', tones: [{ char: '書', jyutping: 'syu1', tone: 1 }, { char: '樹', jyutping: 'syu6', tone: 6 }] },
  { base: '門', tones: [{ char: '問', jyutping: 'man6', tone: 6 }, { char: '文', jyutping: 'man4', tone: 4 }] },
  { base: '雞', tones: [{ char: '雞', jyutping: 'gai1', tone: 1 }, { char: '計', jyutping: 'gai3', tone: 3 }] },
  { base: '天', tones: [{ char: '天', jyutping: 'tin1', tone: 1 }, { char: '甜', jyutping: 'tim4', tone: 4 }] },
  { base: '糖', tones: [{ char: '糖', jyutping: 'tong4', tone: 4 }, { char: '燙', jyutping: 'tong3', tone: 3 }] },
  { base: '魚', tones: [{ char: '魚', jyutping: 'jyu4', tone: 4 }, { char: '語', jyutping: 'jyu5', tone: 5 }] },
  { base: '貓', tones: [{ char: '貓', jyutping: 'maau1', tone: 1 }, { char: '冒', jyutping: 'maau6', tone: 6 }] },
  { base: '水', tones: [{ char: '水', jyutping: 'seoi2', tone: 2 }, { char: '睡', jyutping: 'seoi6', tone: 6 }] },
  { base: '鞋', tones: [{ char: '鞋', jyutping: 'haai4', tone: 4 }, { char: '蟹', jyutping: 'haai5', tone: 5 }] },
  { base: '字', tones: [{ char: '字', jyutping: 'zi6', tone: 6 }, { char: '姐', jyutping: 'ze2', tone: 2 }] },
];

/**
 * @param {{ onBack: Function, onComplete: (summary: Object) => void }} props
 */
export default function ToneGym({ onBack, onComplete }) {
  const { settings, updateSettings } = useAppContext();
  const [round, setRound] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [phase, setPhase] = useState('listen'); // listen|choose|feedback|done
  const [currentPair, setCurrentPair] = useState(null);
  const [correctIndex, setCorrectIndex] = useState(0);
  const [chosen, setChosen] = useState(null);
  const [toneResults, setToneResults] = useState([]);
  const [sessionStart] = useState(Date.now());
  const [sessionPairs] = useState(() => {
    const shuffled = [...TONE_PAIRS].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, TOTAL_ROUNDS);
  });
  const [noAuth, setNoAuth] = useState(false);
  const audioRef = useRef(new Audio());

  useEffect(() => {
    setNoAuth(!isAuthenticated());
    setupRound(0);
    return () => { audioRef.current.pause(); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const setupRound = useCallback((r) => {
    const pair = sessionPairs[r % sessionPairs.length];
    const idx = Math.random() < 0.5 ? 0 : 1;
    setCurrentPair(pair);
    setCorrectIndex(idx);
    setChosen(null);
    setPhase('choose');
  }, [sessionPairs]);

  const playTone = useCallback(async (toneData) => {
    if (!isAuthenticated()) { setNoAuth(true); return; }
    try {
      const blob = await textToSpeech(toneData.char, { language: 'cantonese', speed: 0.85, outputExtension: 'mp3' });
      const url = URL.createObjectURL(blob);
      audioRef.current.src = url;
      await audioRef.current.play();
      audioRef.current.onended = () => URL.revokeObjectURL(url);
    } catch (err) { /* non-fatal */ }
  }, []);

  const handlePlayTarget = useCallback(() => {
    if (currentPair) playTone(currentPair.tones[correctIndex]);
  }, [currentPair, correctIndex, playTone]);

  const handleChoice = useCallback((idx) => {
    const isRight = idx === correctIndex;
    setChosen(idx);
    if (isRight) setCorrect(c => c + 1);
    if (currentPair) {
      const correctTone = currentPair.tones[correctIndex].tone;
      setToneResults(prev => [...prev, { tone: correctTone, isCorrect: isRight }]);
    }
    setPhase('feedback');
  }, [correctIndex, currentPair]);

  const handleNext = useCallback(async () => {
    const next = round + 1;
    if (next >= TOTAL_ROUNDS) { await finish(); return; }
    setRound(next);
    setupRound(next);
  }, [round, setupRound]);

  const finish = useCallback(async () => {
    const dur = Math.round((Date.now() - sessionStart) / 1000);
    const streak = await updateStreak();
    await updateSettings({ streakCount: streak, totalPracticeSeconds: settings.totalPracticeSeconds + dur });
    const rec = {
      id: crypto.randomUUID(), date: getTodayString(),
      startedAt: sessionStart, completedAt: Date.now(), durationSeconds: dur,
      mode: 'tone-gym', phrasesAttempted: TOTAL_ROUNDS, phrasesMastered: 0,
      averageScore: Math.round((correct / TOTAL_ROUNDS) * 100), phraseResults: [],
    };
    await saveSession(rec);
    onComplete?.({ ...rec, streakCount: streak, correct, total: TOTAL_ROUNDS, toneResults });
  }, [sessionStart, correct, toneResults, updateSettings, settings, onComplete]);

  if (!currentPair) return null;

  return (
    <div className={styles.screen}>
      <div className={styles.header}>
        <button className={styles.closeBtn} onClick={onBack} aria-label="Exit">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <span className={styles.score}>{correct}/{round + 1}</span>
        <span className={styles.roundCount}>Round {round + 1}/{TOTAL_ROUNDS}</span>
      </div>

      <div className={styles.playArea}>
        <span className={styles.label}>Listen and pick the correct character</span>
        <button className={styles.listenBtn} onClick={handlePlayTarget} disabled={noAuth}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg>
          Play sound
        </button>
        {noAuth && (
          <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', textAlign: 'center', marginTop: '8px' }}>
            Sign in to hear the audio
          </p>
        )}
      </div>

      <div className={styles.choiceRow}>
        {currentPair.tones.map((t, i) => {
          const isChosen = chosen === i;
          const isCorrectChoice = i === correctIndex;
          let variant = '';
          if (phase === 'feedback') {
            if (isCorrectChoice) variant = styles.choiceCorrect;
            else if (isChosen) variant = styles.choiceWrong;
          }
          return (
            <button key={i} className={`${styles.choiceBtn} ${variant}`}
              onClick={() => phase === 'choose' && handleChoice(i)} disabled={phase !== 'choose' || noAuth}>
              <span className={styles.choiceChar} lang="yue">{t.char}</span>
              <span className={styles.choiceJyutping}>{t.jyutping}</span>
            </button>
          );
        })}
      </div>

      {phase === 'feedback' && (
        <button className={styles.nextBtn} onClick={handleNext}>
          {round + 1 >= TOTAL_ROUNDS ? 'Finish' : 'Next'}
        </button>
      )}
    </div>
  );
}
