const FONT = "'DM Sans', -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif";

const ROWS = [
  { feature: 'Real-time pronunciation scoring', us: true, them: false },
  { feature: 'Tone accuracy feedback', us: true, them: false },
  { feature: 'Cantonese-specific (not just Mandarin)', us: true, them: false },
  { feature: 'Lessons you speak out loud', us: true, them: false },
  { feature: 'Heritage learner focus', us: true, them: false },
];

export default function Screen08_Comparison({ advance }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#F7F4EC',
      padding: '48px 24px 48px',
      fontFamily: FONT,
    }}>
      {/* Stat headline */}
      <div style={{
        background: '#1A2A18',
        borderRadius: 16,
        padding: '20px 20px',
        marginBottom: 24,
      }}>
        <p style={{
          fontSize: "1rem",
          fontWeight: 700,
          color: '#C5E85A',
          margin: 0,
          lineHeight: 1.4,
        }}>
          Most people who try to learn Chinese give up within a month.
        </p>
        <p style={{
          fontSize: "0.875rem",
          color: 'rgba(255,255,255,0.75)',
          margin: '8px 0 0',
          lineHeight: 1.5,
        }}>
          Not because the language is too hard — because they have no way to know if they're improving.
        </p>
      </div>

      {/* Comparison table */}
      <div style={{
        background: 'white',
        borderRadius: 16,
        overflow: 'hidden',
      }}>
        {/* Table header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 80px 80px',
          padding: '12px 16px',
          background: '#F7F4EC',
          borderBottom: '1px solid #EDE8DC',
        }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 700, color: '#999' }}>Feature</div>
          <div style={{ fontSize: "0.75rem", fontWeight: 700, color: '#1A2A18', textAlign: 'center' }}>ShadowSpeak</div>
          <div style={{ fontSize: "0.75rem", fontWeight: 700, color: '#999', textAlign: 'center' }}>Other apps</div>
        </div>

        {ROWS.map((row, i) => (
          <div
            key={row.feature}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 80px 80px',
              padding: '13px 16px',
              borderBottom: i < ROWS.length - 1 ? '1px solid #F7F4EC' : 'none',
              alignItems: 'center',
            }}
          >
            <div style={{
              fontSize: "0.8125rem",
              color: '#1A2A18',
              lineHeight: 1.4,
              paddingRight: 8,
            }}>
              {row.feature}
            </div>
            <div style={{
              textAlign: 'center',
              fontSize: "1rem",
            }}>
              {row.us ? (
                <span style={{
                  display: 'inline-flex',
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  background: '#C5E85A',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: "0.625rem",
                  fontWeight: 800,
                  color: '#1A2A18',
                }}>
                  ✓
                </span>
              ) : '—'}
            </div>
            <div style={{
              textAlign: 'center',
              fontSize: "0.875rem",
              color: '#EEA',
            }}>
              {row.them ? (
                <span style={{
                  display: 'inline-flex',
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  background: '#C5E85A',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: "0.625rem",
                  fontWeight: 800,
                  color: '#1A2A18',
                }}>
                  ✓
                </span>
              ) : (
                <span style={{ color: '#E0A0A0', fontSize: "1.125rem" }}>✕</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <p style={{
        fontSize: "0.8125rem",
        color: '#888',
        textAlign: 'center',
        marginTop: 12,
        fontStyle: 'italic',
      }}>
        We checked. No other English-language app does all five.
      </p>

      <button
        onClick={advance}
        type="button"
        style={{
          width: '100%',
          marginTop: 20,
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
        That's why I'm here
      </button>
    </div>
  );
}
