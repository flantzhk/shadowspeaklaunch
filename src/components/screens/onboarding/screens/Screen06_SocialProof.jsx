const FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif";

const TESTIMONIALS = [
  {
    quote: "I grew up hearing Cantonese at home but always replied in English. Three weeks in and I had my first full conversation with my grandmother.",
    name: 'Melissa T.',
    role: 'London, 28',
    persona: 'Heritage learner',
    initials: 'MT',
  },
  {
    quote: "The pronunciation scoring changed everything. I finally know what I'm getting wrong instead of just repeating bad habits.",
    name: 'James L.',
    role: 'Vancouver, 34',
    persona: 'Self-taught learner',
    initials: 'JL',
  },
  {
    quote: "Every other app felt like a game. This actually makes me sound like I know what I'm saying.",
    name: 'Wei C.',
    role: 'Manchester, 22',
    persona: 'Mandarin student',
    initials: 'WC',
  },
];

function StarRating() {
  return (
    <div style={{ color: '#C5E85A', fontSize: "0.875rem", letterSpacing: 2 }}>
      ★★★★★
    </div>
  );
}

export default function Screen06_SocialProof({ advance }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#F4F1E8',
      padding: '48px 24px 48px',
      fontFamily: FONT,
    }}>
      <h1 style={{
        fontSize: "1.5rem",
        fontWeight: 800,
        color: '#1A2A18',
        margin: 0,
        lineHeight: 1.25,
      }}>
        Thousands of heritage learners are already speaking.
      </h1>

      <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {TESTIMONIALS.map((t) => (
          <div
            key={t.name}
            style={{
              background: 'white',
              borderRadius: 16,
              padding: '18px 18px',
            }}
          >
            <StarRating />
            <p style={{
              fontSize: "0.9375rem",
              fontStyle: 'italic',
              fontWeight: 500,
              color: '#1A2A18',
              lineHeight: 1.6,
              margin: '10px 0 0',
            }}>
              "{t.quote}"
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14 }}>
              <div style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                background: '#1A2A18',
                color: '#C5E85A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: "0.75rem",
                fontWeight: 700,
                flexShrink: 0,
              }}>
                {t.initials}
              </div>
              <div>
                <div style={{ fontSize: "0.8125rem", fontWeight: 700, color: '#1A2A18' }}>{t.name}</div>
                <div style={{ fontSize: "0.75rem", color: '#999' }}>{t.role}</div>
              </div>
              <div style={{ marginLeft: 'auto' }}>
                <span style={{
                  background: '#C5E85A',
                  color: '#1A2A18',
                  fontSize: "0.6875rem",
                  fontWeight: 700,
                  borderRadius: 20,
                  padding: '3px 10px',
                }}>
                  {t.persona}
                </span>
              </div>
            </div>
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
          fontFamily: FONT,
        }}
      >
        That could be me
      </button>
    </div>
  );
}
