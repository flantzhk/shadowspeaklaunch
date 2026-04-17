import { OptionCard } from '../shared/OptionCard';

const FONT = "'DM Sans', -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif";

const OPTIONS = [
  { value: 'family', label: 'My family speaks it — I want to join the conversation' },
  { value: 'heritage', label: 'Connecting to my heritage and culture' },
  { value: 'travel', label: "I'm travelling and want to get around" },
  { value: 'work', label: 'Work or business reasons' },
  { value: 'media', label: 'I love the films, music, or drama' },
  { value: 'challenge', label: 'Personal challenge — I want to learn something hard' },
  { value: 'improve', label: "I'm already learning and want to get better" },
];

const LANGUAGE_LABELS = {
  cantonese: 'Cantonese',
  mandarin: 'Mandarin',
};

export default function Screen03_Why({ advance, answers, setAnswers }) {
  const selected = answers.whyLearning;
  const langLabel = LANGUAGE_LABELS[answers.language] || 'Chinese';

  const choose = (value) => {
    setAnswers((prev) => ({ ...prev, whyLearning: value }));
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
        Why are you learning {langLabel}?
      </h1>
      <p style={{
        fontSize: "0.875rem",
        color: '#888',
        marginTop: 8,
      }}>
        No wrong answers. This shapes your lessons.
      </p>

      <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {OPTIONS.map((opt) => (
          <OptionCard
            key={opt.value}
            label={opt.label}
            selected={selected === opt.value}
            onTap={() => choose(opt.value)}
          />
        ))}
      </div>

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
          This is why I'm here
        </button>
      )}
    </div>
  );
}
