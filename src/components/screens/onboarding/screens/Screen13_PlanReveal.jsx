import { useState, useEffect } from 'react';
import { logEvent } from '../../../../services/analytics';

const FONT = "'DM Sans', -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif";

const LANG_LABELS = {
  cantonese: 'Cantonese',
  mandarin: 'Mandarin',
};

const TOPIC_LABELS = {
  food: 'Food',
  family: 'Family',
  travel: 'Travel',
  greetings: 'Greetings',
  daily: 'Daily life',
  work: 'Work',
};

export default function Screen13_PlanReveal({ advance, answers }) {
  const [phase, setPhase] = useState(0); // 0-3 for loading messages
  const [loadingPercent, setLoadingPercent] = useState(0);
  const [loadingDone, setLoadingDone] = useState(false);

  const langLabel = LANG_LABELS[answers.language] || 'Chinese';
  const topics = (answers.topics || []).map((t) => TOPIC_LABELS[t]).filter(Boolean);
  const topicStr = topics.length > 0 ? topics.slice(0, 2).join(', ') : 'daily basics';

  const MESSAGES = [
    'Building your first lesson...',
    `Setting up ${langLabel} tone scoring...`,
    `Loading phrases for ${topicStr}...`,
    'Almost ready.',
  ];

  // Fire paywall_viewed once on mount
  useEffect(() => {
    logEvent('paywall_viewed', { language: answers.language || 'cantonese' });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Advance through loading messages
  useEffect(() => {
    const timers = [0, 700, 1500, 2200].map((delay, i) =>
      setTimeout(() => setPhase(i), delay)
    );
    const done = setTimeout(() => setLoadingDone(true), 2800);
    return () => { timers.forEach(clearTimeout); clearTimeout(done); };
  }, []);

  // Animate loading bar
  useEffect(() => {
    const start = Date.now();
    const duration = 2800;
    const tick = () => {
      const elapsed = Date.now() - start;
      const pct = Math.min((elapsed / duration) * 100, 100);
      setLoadingPercent(pct);
      if (pct < 100) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F7F4EC',
      padding: '48px 24px 48px',
      fontFamily: FONT,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      {/* ShadowSpeak logo pulse */}
      <div style={{
        width: 72,
        height: 72,
        borderRadius: '50%',
        background: '#1A2A18',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 28,
        animation: 'pulse 2s ease-in-out infinite',
      }}>
        <style>{`
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.08); opacity: 0.85; }
          }
        `}</style>
        <span style={{ fontSize: "1.5rem", fontWeight: 800 }}>
          <span style={{ color: 'white' }}>S</span>
          <span style={{ color: '#C5E85A' }}>S</span>
        </span>
      </div>

      {/* Loading bar */}
      <div style={{
        width: '100%',
        maxWidth: 300,
        height: 3,
        background: '#E8E4D8',
        borderRadius: 2,
        overflow: 'hidden',
        marginBottom: 20,
      }}>
        <div style={{
          height: '100%',
          width: `${loadingPercent}%`,
          background: '#C5E85A',
          borderRadius: 2,
          transition: 'width 80ms linear',
        }} />
      </div>

      {/* Cycling messages */}
      <p style={{
        fontSize: "0.9375rem",
        color: loadingDone ? '#3A6A1A' : '#888',
        fontWeight: loadingDone ? 700 : 400,
        textAlign: 'center',
        transition: 'color 300ms ease',
        margin: 0,
      }}>
        {loadingDone ? 'Ready.' : MESSAGES[phase]}
      </p>

      {loadingDone && (
        <button
          onClick={advance}
          type="button"
          style={{
            marginTop: 40,
            padding: '16px 40px',
            borderRadius: 12,
            border: 'none',
            background: '#C5E85A',
            color: '#1A2A18',
            fontSize: "1rem",
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: FONT,
          }}
        >
          Let's go
        </button>
      )}
    </div>
  );
}
