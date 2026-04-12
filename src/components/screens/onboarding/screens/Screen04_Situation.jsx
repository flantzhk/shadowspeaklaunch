import { useRef } from 'react';
import { OptionCard } from '../shared/OptionCard';

const OPTIONS = [
  'New to Hong Kong',
  'Been here a while but never learned properly',
  'Grew up here — it\'s time to actually learn',
  'I know a little already',
];

export default function Screen04_Situation({ advance, answers, setAnswers }) {
  const timerRef = useRef(null);

  const select = (option) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setAnswers((prev) => ({ ...prev, situation: option }));
    timerRef.current = setTimeout(() => {
      advance();
    }, 600);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F4F1E8',
      padding: '48px 24px 48px',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
    }}>
      <h1 style={{ fontSize: "1.625rem", fontWeight: 800, color: '#1A2A18', margin: 0, lineHeight: 1.2 }}>
        What describes you best?
      </h1>

      <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {OPTIONS.map((option) => (
          <OptionCard
            key={option}
            label={option}
            selected={answers.situation === option}
            onTap={() => select(option)}
          />
        ))}
      </div>
    </div>
  );
}
