const FONT = "'DM Sans', -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif";

const ROWS = [
  {
    icon: '🎵',
    title: 'Tones',
    pain: 'My tones are wrong but I can\'t fix them',
    solution: 'AI scores every tone, every time. You see exactly where you went wrong.',
  },
  {
    icon: '🎙️',
    title: 'Speaking practice',
    pain: 'Apps teach but never make me actually speak',
    solution: 'Every lesson ends with you speaking. No reading. No clicking. Producing.',
  },
  {
    icon: '📊',
    title: 'Real feedback',
    pain: 'I don\'t know if I\'m saying it right',
    solution: 'Pronunciation scored 0-100 per phrase. Specific, honest, actionable.',
  },
];

const LANG_LABELS = {
  cantonese: 'Cantonese',
  mandarin: 'Mandarin',
};

export default function Screen07_SolutionReveal({ advance, answers }) {
  const langLabel = LANG_LABELS[answers.language] || 'Chinese';

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F7F4EC',
      padding: '48px 24px 48px',
      fontFamily: FONT,
    }}>
      <h1 style={{
        fontSize: "1.625rem",
        fontWeight: 800,
        color: '#1A2A18',
        margin: 0,
        lineHeight: 1.2,
      }}>
        Here's what we built for exactly that.
      </h1>

      <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {ROWS.map((row) => (
          <div
            key={row.title}
            style={{
              background: 'white',
              borderRadius: 14,
              padding: '18px 18px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <div style={{
                fontSize: "1.5rem",
                flexShrink: 0,
                width: 36,
                textAlign: 'center',
              }}>
                {row.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  color: '#AAA',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  marginBottom: 4,
                }}>
                  {row.title}
                </div>
                {/* Pain line */}
                <div style={{
                  fontSize: "0.8125rem",
                  color: '#CCC',
                  textDecoration: 'line-through',
                  marginBottom: 6,
                  lineHeight: 1.4,
                }}>
                  "{row.pain}"
                </div>
                {/* Solution line */}
                <div style={{
                  fontSize: "0.9375rem",
                  fontWeight: 700,
                  color: '#1A2A18',
                  lineHeight: 1.4,
                }}>
                  {row.solution}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Competitive moat banner */}
      <div style={{
        background: '#C5E85A',
        borderRadius: 14,
        padding: '16px 18px',
        marginTop: 12,
        textAlign: 'center',
      }}>
        <p style={{
          fontSize: "0.875rem",
          fontWeight: 700,
          color: '#1A2A18',
          margin: 0,
          lineHeight: 1.5,
        }}>
          ShadowSpeak is the first English-language app built specifically to score your {langLabel} pronunciation in real time.
        </p>
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
          background: '#1A2A18',
          color: '#C5E85A',
          fontSize: "1rem",
          fontWeight: 700,
          cursor: 'pointer',
          fontFamily: FONT,
        }}
      >
        See how it works
      </button>
    </div>
  );
}
