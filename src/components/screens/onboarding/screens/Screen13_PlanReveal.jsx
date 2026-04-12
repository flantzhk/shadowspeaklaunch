import { useState, useEffect } from 'react';

const PROJECTIONS = {
  10: 'At 10 min/day, you could have 100+ phrases in 4 weeks.',
  20: 'At 20 min/day, you could have 200+ phrases in 4 weeks.',
  30: 'At 30 min/day, you could have 300+ phrases in 4 weeks.',
};

const CHECKLIST = [
  'Starter phrases ready',
  'Pronunciation scoring on',
  'Daily review queue set',
];

export default function Screen13_PlanReveal({ advance, answers }) {
  const [loadingPercent, setLoadingPercent] = useState(0);
  const [loadingDone, setLoadingDone] = useState(false);
  const [visibleChecks, setVisibleChecks] = useState(0);

  // Animate loading bar
  useEffect(() => {
    const start = Date.now();
    const duration = 2500;
    const frame = () => {
      const elapsed = Date.now() - start;
      const pct = Math.min((elapsed / duration) * 100, 100);
      setLoadingPercent(pct);
      if (pct < 100) {
        requestAnimationFrame(frame);
      } else {
        setLoadingDone(true);
      }
    };
    requestAnimationFrame(frame);
  }, []);

  // Stagger checklist items after loading done
  useEffect(() => {
    if (!loadingDone) return;
    const timers = CHECKLIST.map((_, i) =>
      setTimeout(() => setVisibleChecks(i + 1), i * 400)
    );
    return () => timers.forEach(clearTimeout);
  }, [loadingDone]);

  const projection = PROJECTIONS[answers.dailyGoalMinutes] || PROJECTIONS[20];

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F4F1E8',
      padding: '48px 24px 48px',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
    }}>
      <h1 style={{ fontSize: "1.625rem", fontWeight: 800, color: '#1A2A18', margin: 0 }}>
        Your plan is ready.
      </h1>

      {/* Summary card */}
      <div style={{
        background: 'white',
        borderRadius: 14,
        padding: '16px 18px',
        marginTop: 24,
      }}>
        {[
          ['Language', 'Cantonese'],
          ['Daily goal', `${answers.dailyGoalMinutes} min`],
          ['First topic', 'Daily Basics'],
          ['Your level', 'Beginner'],
        ].map(([label, value]) => (
          <div key={label} style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '8px 0',
            borderBottom: '1px solid #F4F1E8',
          }}>
            <span style={{ fontSize: "0.8125rem", color: '#999' }}>{label}</span>
            <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: '#1A2A18' }}>{value}</span>
          </div>
        ))}
      </div>

      {/* Loading moment */}
      <div style={{
        background: 'white',
        borderRadius: 14,
        padding: '16px 18px',
        marginTop: 10,
      }}>
        <div style={{
          height: 3,
          background: '#E8E4D8',
          borderRadius: 2,
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${loadingPercent}%`,
            background: '#C5E85A',
            borderRadius: 2,
            transition: 'width 50ms linear',
          }} />
        </div>
        <p style={{
          fontSize: "0.8125rem",
          color: loadingDone ? '#3A6A1A' : '#888',
          fontWeight: loadingDone ? 600 : 400,
          marginTop: 8,
          marginBottom: 0,
        }}>
          {loadingDone ? 'Ready ✓' : 'Putting your phrases together…'}
        </p>
      </div>

      {/* Projection */}
      <p style={{
        fontSize: "0.9375rem",
        color: '#555',
        lineHeight: 1.6,
        textAlign: 'center',
        marginTop: 20,
      }}>
        {projection}
      </p>

      {/* Checklist */}
      <div style={{
        background: 'white',
        borderRadius: 14,
        padding: '16px 18px',
        marginTop: 10,
      }}>
        {CHECKLIST.map((item, i) => (
          <div
            key={item}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '8px 0',
              opacity: i < visibleChecks ? 1 : 0,
              transform: i < visibleChecks ? 'translateY(0)' : 'translateY(8px)',
              transition: 'opacity 300ms ease, transform 300ms ease',
            }}
          >
            <div style={{
              width: 18,
              height: 18,
              borderRadius: '50%',
              background: '#C5E85A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: "0.6875rem",
              color: '#1A2A18',
              fontWeight: 700,
              flexShrink: 0,
            }}>
              ✓
            </div>
            <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: '#1A2A18' }}>{item}</span>
          </div>
        ))}
      </div>

      <button
        onClick={advance}
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
        Let's go →
      </button>
    </div>
  );
}
