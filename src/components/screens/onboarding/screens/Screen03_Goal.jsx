import { OptionCard } from '../shared/OptionCard';

const OPTIONS = [
  'Order food and drinks without switching to English',
  'Understand what people are saying around me',
  'Connect with Cantonese-speaking friends and their families',
  'Feel more at home in Hong Kong',
  'All of the above',
];

const ALL_OPTION = 'All of the above';

export default function Screen03_Goal({ advance, answers, setAnswers }) {
  const selected = answers.goals;

  const toggle = (option) => {
    setAnswers((prev) => {
      let goals;
      if (option === ALL_OPTION) {
        // "All of the above" deselects others, or deselects itself
        goals = prev.goals.includes(ALL_OPTION) ? [] : [ALL_OPTION];
      } else {
        // Selecting a specific option deselects "All of the above"
        const without = prev.goals.filter((g) => g !== ALL_OPTION);
        goals = without.includes(option)
          ? without.filter((g) => g !== option)
          : [...without, option];
      }
      return { ...prev, goals };
    });
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F4F1E8',
      padding: '48px 24px 120px',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
    }}>
      <h1 style={{ fontSize: "1.625rem", fontWeight: 800, color: '#1A2A18', margin: '24px 0 0', lineHeight: 1.2 }}>
        What do you want to be able to do?
      </h1>

      <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
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
            fontFamily: 'inherit',
          }}
        >
          Next →
        </button>
      )}
    </div>
  );
}
