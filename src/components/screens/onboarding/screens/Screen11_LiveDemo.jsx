import { useState, useEffect, useRef } from 'react';
import { useRecorder } from '../../../../hooks/useRecorder';
import { textToSpeech, scorePronunciation } from '../../../../services/api';

const PHRASES = {
  cantonese: {
    chinese: '你食咗飯未呀？',
    romanisation: 'nei5 sik6 zo2 faan6 mei6 aa3',
    english: 'Have you eaten yet?',
    apiLanguage: 'cantonese',
  },
  mandarin: {
    chinese: '你吃饭了吗？',
    romanisation: 'nǐ chī fàn le ma',
    english: 'Have you eaten?',
    apiLanguage: 'mandarin',
  },
};

const FALLBACK_SCORE = 84;
const MAX_RECORD_MS = 5000;

function PhraseCard({ phrase }) {
  return (
    <div style={{
      background: 'white',
      borderRadius: 16,
      padding: '20px 18px',
    }}>
      <div style={{ fontSize: "1.75rem", fontWeight: 700, color: '#1A2A18', lineHeight: 1.2 }}>{phrase.chinese}</div>
      <div style={{ fontSize: "0.9375rem", color: '#8F6AE8', marginTop: 8, fontWeight: 600 }}>{phrase.romanisation}</div>
      <div style={{ fontSize: "0.8125rem", color: '#999', marginTop: 4 }}>{phrase.english}</div>
    </div>
  );
}

function AudioDots({ playing }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 16 }}>
      {Array.from({ length: 9 }).map((_, i) => (
        <div
          key={i}
          style={{
            width: playing ? 6 : 4,
            height: playing ? 6 : 4,
            borderRadius: '50%',
            background: playing ? '#C5E85A' : '#E0DDD4',
            transition: 'all 200ms ease',
            animation: playing ? `dotWave 600ms ease-in-out ${i * 60}ms infinite alternate` : 'none',
          }}
        />
      ))}
      {playing && (
        <style>{`
          @keyframes dotWave {
            0% { transform: scaleY(1); }
            100% { transform: scaleY(2.5); }
          }
        `}</style>
      )}
    </div>
  );
}

function ScoreCircle({ score, visible }) {
  const getScoreColor = (s) => {
    if (s >= 90) return '#2A6A10';
    if (s >= 70) return '#C5E85A';
    if (s >= 50) return '#E8A030';
    return '#D04040';
  };

  const getScoreTextColor = (s) => {
    if (s >= 70 && s < 90) return '#1A2A18';
    return 'white';
  };

  const getLabel = (s) => {
    if (s >= 90) return 'Excellent!';
    if (s >= 70) return 'Great!';
    if (s >= 50) return 'Keep going';
    return 'Try again';
  };

  const bg = getScoreColor(score);
  const textColor = getScoreTextColor(score);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      marginTop: 24,
      opacity: visible ? 1 : 0,
      animation: visible ? 'scoreReveal 500ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards' : 'none',
    }}>
      <style>{`
        @keyframes scoreReveal {
          0% { transform: scale(0); opacity: 0; }
          70% { transform: scale(1.15); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
      <div style={{
        width: 100,
        height: 100,
        borderRadius: '50%',
        background: bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <span style={{ fontSize: "2.625rem", fontWeight: 800, color: textColor }}>{score}</span>
      </div>
      <div style={{ fontSize: "0.875rem", fontWeight: 600, color: bg, marginTop: 8 }}>
        {getLabel(score)}
      </div>
    </div>
  );
}

export default function Screen11_LiveDemo({ advance, answers, setAnswers }) {
  const phrase = PHRASES[answers.language] || PHRASES.cantonese;
  const langLabel = answers.language === 'mandarin' ? 'Mandarin' : 'Cantonese';

  const [state, setState] = useState('listen'); // 'listen' | 'record' | 'score' | 'static'
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(null);
  const [transcribed, setTranscribed] = useState(null);
  const [scoreVisible, setScoreVisible] = useState(false);
  const { isRecording, startRecording, stopRecording } = useRecorder();
  const recordTimerRef = useRef(null);
  const audioRef = useRef(null);

  // If mic not granted, skip to static view
  useEffect(() => {
    if (!answers.micGranted) {
      setState('static');
    }
  }, [answers.micGranted]);

  // Auto-play audio on mount for listen state
  useEffect(() => {
    if (state !== 'listen') return;
    let cancelled = false;

    const playAudio = async () => {
      try {
        const blob = await textToSpeech(phrase.chinese, {
          language: phrase.apiLanguage,
          speed: 0.85,
          outputExtension: 'mp3',
        });
        if (cancelled) return;
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audioRef.current = audio;
        setIsPlaying(true);
        audio.play();
        audio.onended = () => {
          URL.revokeObjectURL(url);
          setIsPlaying(false);
          if (!cancelled) {
            setTimeout(() => {
              if (!cancelled) setState('record');
            }, 800);
          }
        };
        audio.onerror = () => {
          URL.revokeObjectURL(url);
          setIsPlaying(false);
          // TTS failed — show static play button, transition to record after delay
          if (!cancelled) {
            setTimeout(() => {
              if (!cancelled) setState('record');
            }, 800);
          }
        };
      } catch {
        // API call failed (no auth) — skip to record
        if (!cancelled) {
          setTimeout(() => {
            if (!cancelled) setState('record');
          }, 800);
        }
      }
    };

    playAudio();
    return () => {
      cancelled = true;
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [state]);

  const handleRecord = async () => {
    if (isRecording) {
      const blob = await stopRecording();
      if (recordTimerRef.current) clearTimeout(recordTimerRef.current);
      handleScoring(blob);
    } else {
      await startRecording();
      recordTimerRef.current = setTimeout(async () => {
        const blob = await stopRecording();
        handleScoring(blob);
      }, MAX_RECORD_MS);
    }
  };

  const handleScoring = async (blob) => {
    setState('score');
    let finalScore = FALLBACK_SCORE;
    try {
      if (!blob) throw new Error('No audio');
      const result = await scorePronunciation(blob, phrase.chinese, phrase.apiLanguage);
      finalScore = result.score ?? FALLBACK_SCORE;
      setScore(finalScore);
      setTranscribed(result.jyutping ?? result.pinyin ?? null);
    } catch {
      setScore(FALLBACK_SCORE);
      setTranscribed(null);
    }
    setAnswers((prev) => ({ ...prev, demoScore: finalScore }));
    setTimeout(() => setScoreVisible(true), 100);
  };

  const ContextCard = () => (
    <div style={{
      background: '#1A2A18',
      borderRadius: 12,
      padding: '12px 16px',
      marginBottom: 16,
    }}>
      <p style={{
        fontSize: "0.8125rem",
        color: 'rgba(255,255,255,0.8)',
        margin: 0,
        lineHeight: 1.5,
      }}>
        In {langLabel}, asking "Have you eaten?" is how people say "How are you?" Try saying it.
      </p>
    </div>
  );

  // Static fallback for no-mic users
  if (state === 'static') {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#F4F1E8',
        padding: '48px 24px 48px',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
      }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: '#1A2A18', margin: 0 }}>
          Here's what scoring looks like.
        </h2>
        <div style={{ marginTop: 16 }}><ContextCard /></div>
        <div><PhraseCard phrase={phrase} /></div>

        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <p style={{ fontSize: "0.8125rem", color: '#888', marginBottom: 12 }}>
            This is what your score looks like
          </p>
          <ScoreCircle score={FALLBACK_SCORE} visible />
        </div>

        <p style={{
          fontSize: "0.9375rem",
          fontWeight: 600,
          color: '#1A2A18',
          textAlign: 'center',
          marginTop: 20,
          lineHeight: 1.5,
        }}>
          That's how ShadowSpeak works.<br />Every phrase. Every day.
        </p>

        <button
          onClick={() => {
            setAnswers((prev) => ({ ...prev, demoScore: FALLBACK_SCORE }));
            advance();
          }}
          type="button"
          style={{
            width: '100%',
            marginTop: 24,
            padding: '16px 0',
            borderRadius: 12,
            border: 'none',
            background: '#C5E85A',
            color: '#1A2A18',
            fontSize: "1rem",
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          See my result card
        </button>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F4F1E8',
      padding: '48px 24px 48px',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
    }}>
      <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: '#1A2A18', margin: 0 }}>
        Now try it yourself.
      </h2>

      <div style={{ marginTop: 16 }}><ContextCard /></div>
      <div><PhraseCard phrase={phrase} /></div>

      {/* Listen state */}
      {state === 'listen' && (
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: '#8BB82B' }}>
            Step 1 — Listen
          </div>
          <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center' }}>
            <div style={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              background: '#1A2A18',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {/* Play triangle */}
              <div style={{
                width: 0,
                height: 0,
                borderTop: '10px solid transparent',
                borderBottom: '10px solid transparent',
                borderLeft: '16px solid #C5E85A',
                marginLeft: 3,
              }} />
            </div>
          </div>
          <AudioDots playing={isPlaying} />
        </div>
      )}

      {/* Record state */}
      {state === 'record' && (
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: '#8BB82B' }}>
            Step 2 — Say it back
          </div>
          <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center' }}>
            <div style={{ position: 'relative', width: 140, height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {/* Pulsing rings */}
              {isRecording && (
                <>
                  <style>{`
                    @keyframes pulse1 { 0% { transform: scale(1); opacity: 0.3; } 100% { transform: scale(1.4); opacity: 0; } }
                    @keyframes pulse2 { 0% { transform: scale(1); opacity: 0.2; } 100% { transform: scale(1.6); opacity: 0; } }
                  `}</style>
                  <div style={{
                    position: 'absolute',
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                    border: '2px solid #C5E85A',
                    animation: 'pulse1 3s infinite',
                  }} />
                  <div style={{
                    position: 'absolute',
                    width: 140,
                    height: 140,
                    borderRadius: '50%',
                    border: '2px solid #C5E85A',
                    animation: 'pulse2 3s infinite 0.5s',
                  }} />
                </>
              )}
              <button
                onClick={handleRecord}
                type="button"
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  background: '#1A2A18',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                  <path d="M18 4a5 5 0 0 0-5 5v9a5 5 0 0 0 10 0V9a5 5 0 0 0-5-5Z" fill="#C5E85A" />
                  <path d="M28 16v2a10 10 0 0 1-20 0v-2" stroke="#C5E85A" strokeWidth="2" strokeLinecap="round" />
                  <path d="M18 28v4M14 32h8" stroke="#C5E85A" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>
          <p style={{
            fontSize: "0.9375rem",
            fontWeight: 600,
            color: isRecording ? '#E8703A' : '#1A2A18',
            marginTop: 20,
          }}>
            {isRecording ? 'Recording...' : 'Tap to speak'}
          </p>
        </div>
      )}

      {/* Score state */}
      {state === 'score' && (
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          {score !== null && (
            <>
              <ScoreCircle score={score} visible={scoreVisible} />
              {scoreVisible && (
                <>
                  <div style={{
                    fontSize: "0.8125rem",
                    color: '#666',
                    fontFamily: '"SF Mono", Menlo, monospace',
                    marginTop: 16,
                    lineHeight: 1.8,
                  }}>
                    <div>Expected: {phrase.romanisation}</div>
                    <div>You said: {transcribed || '—'}</div>
                  </div>

                  <p style={{
                    fontSize: "0.9375rem",
                    fontWeight: 600,
                    color: '#1A2A18',
                    textAlign: 'center',
                    marginTop: 20,
                    lineHeight: 1.5,
                  }}>
                    That's how ShadowSpeak works.<br />Every phrase. Every day.
                  </p>

                  <button
                    onClick={() => advance()}
                    type="button"
                    style={{
                      width: '100%',
                      marginTop: 24,
                      padding: '16px 0',
                      borderRadius: 12,
                      border: 'none',
                      background: '#C5E85A',
                      color: '#1A2A18',
                      fontSize: "1rem",
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    See my result card
                  </button>
                </>
              )}
            </>
          )}
          {score === null && (
            <p style={{ fontSize: "0.875rem", color: '#888', marginTop: 20 }}>Scoring your pronunciation...</p>
          )}
        </div>
      )}
    </div>
  );
}
