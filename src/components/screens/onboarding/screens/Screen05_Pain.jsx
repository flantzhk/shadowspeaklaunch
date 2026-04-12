import { OptionCard } from '../shared/OptionCard';

const OPTIONS = [
  'I never know where to start',
  'The tones feel impossible',
  "I've tried apps but they teach reading, not speaking",
  "I don't have time",
  'Honestly, I just never tried',
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
      background: '#F4F1E8',
      padding: '48px 24px 120px',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
    }}>
      <h1 style={{ fontSize: 26, fontWeight: 800, color: '#1A2A18', margin: 0, lineHeight: 1.2 }}>
        What's held you back until now?
      </h1>

      <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
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
            fontSize: 16,
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          Next →
        </button>
      )}
    </div>
  );
}
