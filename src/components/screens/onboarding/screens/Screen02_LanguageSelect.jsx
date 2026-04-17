const FONT = "'DM Sans', -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif";

const LANGUAGES = [
  {
    id: 'cantonese',
    chinese: '廣東話',
    english: 'Cantonese',
    description: 'Spoken in Hong Kong, Guangdong, and diaspora communities worldwide.',
    detail: '9 tones. Rich, expressive, alive.',
    accent: '#C5E85A',
  },
  {
    id: 'mandarin',
    chinese: '普通話',
    english: 'Mandarin',
    description: 'Official language of mainland China, Taiwan, and Singapore.',
    detail: '4 tones + neutral. The world\'s most spoken language.',
    accent: '#8F6AE8',
  },
];

export default function Screen02_LanguageSelect({ advance, answers, setAnswers }) {
  const selected = answers.language;

  const choose = (id) => {
    setAnswers((prev) => ({ ...prev, language: id }));
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F7F4EC',
      padding: '48px 24px 120px',
      fontFamily: FONT,
    }}>
      <h1 style={{
        fontSize: "1.625rem",
        fontWeight: 800,
        color: '#1A2A18',
        margin: 0,
        lineHeight: 1.2,
      }}>
        Which language are you learning?
      </h1>
      <p style={{
        fontSize: "0.9375rem",
        color: '#666',
        marginTop: 10,
        lineHeight: 1.5,
      }}>
        We'll tailor lessons, tones, and pronunciation scoring to your language.
      </p>

      <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {LANGUAGES.map((lang) => {
          const isSelected = selected === lang.id;
          return (
            <button
              key={lang.id}
              type="button"
              onClick={() => choose(lang.id)}
              style={{
                width: '100%',
                background: '#1A2A18',
                borderRadius: 16,
                padding: '20px 20px',
                border: `2.5px solid ${isSelected ? lang.accent : 'transparent'}`,
                cursor: 'pointer',
                fontFamily: FONT,
                textAlign: 'left',
                position: 'relative',
                transition: 'border-color 150ms ease, transform 150ms ease',
                WebkitTapHighlightColor: 'transparent',
                transform: isSelected ? 'scale(1.01)' : 'scale(1)',
              }}
            >
              {/* Checkmark */}
              {isSelected && (
                <div style={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  background: lang.accent,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: "0.75rem",
                  color: '#1A2A18',
                  fontWeight: 800,
                }}>
                  ✓
                </div>
              )}

              {/* Chinese characters */}
              <div style={{
                fontSize: "2rem",
                fontWeight: 700,
                color: lang.accent,
                lineHeight: 1,
              }}>
                {lang.chinese}
              </div>

              {/* English name */}
              <div style={{
                fontSize: "1.125rem",
                fontWeight: 700,
                color: 'white',
                marginTop: 8,
              }}>
                {lang.english}
              </div>

              {/* Description */}
              <div style={{
                fontSize: "0.8125rem",
                color: 'rgba(255,255,255,0.6)',
                marginTop: 6,
                lineHeight: 1.5,
              }}>
                {lang.description}
              </div>

              {/* Detail tag */}
              <div style={{
                display: 'inline-block',
                marginTop: 10,
                background: 'rgba(255,255,255,0.08)',
                borderRadius: 20,
                padding: '5px 12px',
                fontSize: "0.75rem",
                fontWeight: 600,
                color: lang.accent,
              }}>
                {lang.detail}
              </div>
            </button>
          );
        })}
      </div>

      <p style={{
        fontSize: "0.75rem",
        color: '#AAA',
        textAlign: 'center',
        marginTop: 16,
      }}>
        More languages coming. These two are where we go deepest.
      </p>

      {selected && (
        <button
          onClick={advance}
          type="button"
          style={{
            position: 'fixed',
            bottom: 32,
            left: 24,
            right: 24,
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
      )}
    </div>
  );
}
