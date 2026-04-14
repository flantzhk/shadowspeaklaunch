import { useState } from 'react';

const FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif";

const CARDS = [
  "I've been corrected by family and felt too embarrassed to try again.",
  "I can hear the difference between tones — I just can't produce them.",
  "I downloaded a language app once. I got points for clicking pictures of apples.",
  "I want to order food, greet my relatives, say something real. Not textbook phrases.",
  "I feel like a child in conversations I should be part of.",
];

export default function Screen06_SwipeCards({ advance, answers, setAnswers }) {
  const [current, setCurrent] = useState(0);
  const [swiped, setSwiped] = useState([]); // 'yes' | 'no'
  const [animating, setAnimating] = useState(null); // 'yes' | 'no'

  const remaining = CARDS.length - current;
  const done = current >= CARDS.length;

  const respond = (direction) => {
    if (animating) return;
    setAnimating(direction);

    setTimeout(() => {
      setSwiped((prev) => [...prev, direction]);
      if (direction === 'yes') {
        setAnswers((prev) => ({
          ...prev,
          swipeCards: [...(prev.swipeCards || []), current],
        }));
      }
      setCurrent((prev) => prev + 1);
      setAnimating(null);
    }, 250);
  };

  if (done) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#F4F1E8',
        padding: '48px 24px',
        fontFamily: FONT,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{ fontSize: "2.5rem", marginBottom: 16 }}>
          {swiped.filter((s) => s === 'yes').length > 0 ? '💬' : '👋'}
        </div>
        <h2 style={{
          fontSize: "1.375rem",
          fontWeight: 800,
          color: '#1A2A18',
          textAlign: 'center',
          margin: 0,
        }}>
          {swiped.filter((s) => s === 'yes').length > 0
            ? "We hear you. That's exactly what we built this for."
            : "Good to know. We'll show you what's possible."}
        </h2>
        <button
          onClick={advance}
          type="button"
          style={{
            marginTop: 32,
            width: '100%',
            maxWidth: 340,
            padding: '16px 0',
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
          Continue
        </button>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F4F1E8',
      padding: '48px 24px',
      fontFamily: FONT,
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Skip */}
      <button
        onClick={() => { setCurrent(CARDS.length); }}
        type="button"
        style={{
          alignSelf: 'flex-end',
          background: 'none',
          border: 'none',
          fontSize: "0.875rem",
          color: '#BBB',
          cursor: 'pointer',
          fontFamily: FONT,
          padding: '0 0 16px',
        }}
      >
        Skip
      </button>

      <div style={{ marginBottom: 8 }}>
        <h1 style={{
          fontSize: "1.5rem",
          fontWeight: 800,
          color: '#1A2A18',
          margin: 0,
          lineHeight: 1.25,
        }}>
          Tell us what you recognise.
        </h1>
        <p style={{ fontSize: "0.875rem", color: '#888', marginTop: 8 }}>
          {remaining} left
        </p>
      </div>

      {/* Card */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          background: 'white',
          borderRadius: 20,
          padding: '32px 24px',
          width: '100%',
          maxWidth: 360,
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          opacity: animating ? 0 : 1,
          transform: animating === 'yes'
            ? 'translateX(60px) rotate(6deg)'
            : animating === 'no'
            ? 'translateX(-60px) rotate(-6deg)'
            : 'translateX(0) rotate(0)',
          transition: 'opacity 220ms ease, transform 220ms ease',
        }}>
          <p style={{
            fontSize: "1.125rem",
            fontWeight: 600,
            color: '#1A2A18',
            lineHeight: 1.5,
            margin: 0,
            textAlign: 'center',
          }}>
            "{CARDS[current]}"
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div style={{
        display: 'flex',
        gap: 12,
        marginTop: 24,
        paddingBottom: 32,
      }}>
        <button
          onClick={() => respond('no')}
          type="button"
          disabled={!!animating}
          style={{
            flex: 1,
            padding: '16px 0',
            borderRadius: 12,
            border: '2px solid #E8E4D8',
            background: 'white',
            color: '#999',
            fontSize: "0.9375rem",
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: FONT,
          }}
        >
          Not me
        </button>
        <button
          onClick={() => respond('yes')}
          type="button"
          disabled={!!animating}
          style={{
            flex: 1,
            padding: '16px 0',
            borderRadius: 12,
            border: 'none',
            background: '#1A2A18',
            color: '#C5E85A',
            fontSize: "0.9375rem",
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: FONT,
          }}
        >
          That's me
        </button>
      </div>
    </div>
  );
}
