const TESTIMONIALS = {
  'New to Hong Kong': {
    quote: "Six weeks in, I ordered my coffee in Cantonese. The barista just nodded. No fuss. That nod was everything.",
    name: 'James T.',
    role: 'Living in Kennedy Town \u00b7 8 months in HK',
    initials: 'JT',
  },
  'Been here a while but never learned properly': {
    quote: "Three years here and I'd never tried. I was embarrassed it had taken me this long. ShadowSpeak fixed that in a month.",
    name: 'Sarah L.',
    role: 'Living in Mid-Levels \u00b7 3 years in HK',
    initials: 'SL',
  },
  "Grew up here — it's time to actually learn": {
    quote: "I grew up here but Cantonese was always my parents' language. Now it's mine too.",
    name: 'Michelle C.',
    role: 'Hong Kong resident \u00b7 lifelong learner',
    initials: 'MC',
  },
  'I know a little already': {
    quote: "I had survival Cantonese. Now I actually have conversations. Real ones.",
    name: 'David M.',
    role: 'Living in Sai Kung \u00b7 5 years in HK',
    initials: 'DM',
  },
};

// Fallback if situation doesn't match
const DEFAULT_KEY = 'New to Hong Kong';

export default function Screen06_SocialProof({ advance, answers }) {
  const testimonial = TESTIMONIALS[answers.situation] || TESTIMONIALS[DEFAULT_KEY];

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F4F1E8',
      padding: '48px 24px 48px',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
    }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: '#1A2A18', margin: 0 }}>
        They felt exactly the same way.
      </h1>

      {/* Testimonial card */}
      <div style={{
        background: 'white',
        borderRadius: 16,
        padding: 20,
        marginTop: 24,
      }}>
        <p style={{
          fontSize: "0.9375rem",
          fontStyle: 'italic',
          fontWeight: 500,
          color: '#1A2A18',
          lineHeight: 1.6,
          margin: 0,
        }}>
          "{testimonial.quote}"
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16 }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: '#E8F4D8',
            color: '#3A6A1A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: "0.8125rem",
            fontWeight: 700,
          }}>
            {testimonial.initials}
          </div>
          <div>
            <div style={{ fontSize: "0.8125rem", fontWeight: 700, color: '#1A2A18' }}>{testimonial.name}</div>
            <div style={{ fontSize: "0.75rem", color: '#999' }}>{testimonial.role}</div>
          </div>
        </div>
      </div>

      {/* App Store card */}
      <div style={{
        background: 'white',
        border: '1px solid #E8E4D8',
        borderRadius: 12,
        padding: 14,
        marginTop: 12,
      }}>
        <div style={{ fontSize: "0.875rem", color: '#C5E85A', letterSpacing: 2 }}>★★★★★</div>
        <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: '#1A2A18', marginTop: 4 }}>
          The only app that taught me to actually speak
        </div>
        <div style={{ fontSize: "0.6875rem", color: '#999', marginTop: 2 }}>App Store review</div>
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
        That could be me →
      </button>
    </div>
  );
}
