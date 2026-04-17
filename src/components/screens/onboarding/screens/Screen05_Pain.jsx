import { OptionCard } from '../shared/OptionCard';

const FONT = "'DM Sans', -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif";

const OPTIONS = [
  'My tones are wrong but I don\'t know how to fix them',
  'I can understand it, but I can\'t produce it',
  'Apps feel gamified but I\'m not actually speaking',
  'I don\'t know if I\'m saying it right — nobody\'s correcting me',
  'I\'ve tried apps before and quit within a week',
  'I\'m embarrassed to practice out loud',
  'I can read characters but pronunciation is a wall',
];

export default function Screen05_Pain({ advance, answers, setAnswers }) {
  const selected = answers.painPoints;

  const toggle = (option) => {
    setAnswers((prev) => {
      const painPoints = prev.painPoints.includes(option)
        ? prev.painPoints.filter((p) => p !== option)
        : [...prev.painPoints, option];
      return { ...prev, painPoints };
    });
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F7F4EC',
      padding: '48px 24px 120px',
      fontFamily: FONT,
    }}>
      <h1 style={{ fontSize: "1.625rem", fontWeight: 800, color: '#1A2A18', margin: 0, lineHeight: 1.2 }}>
        What's made it difficult until now?
      </h1>
      <p style={{ fontSize: "0.875rem", color: '#888', marginTop: 8 }}>
        Pick all that apply.
      </p>

      <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {OPTIONS.map((option) => (
          <OptionCard
            key={option}
            label={option}
            selected={selected.includes(option)}
            onTap={() => toggle(option)}
          />
        ))}
      </div>

      {selected.length > 0 && (
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
          This is exactly it
        </button>
      )}
    </div>
  );
}
