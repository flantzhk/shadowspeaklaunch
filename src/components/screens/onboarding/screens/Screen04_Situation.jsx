import { useRef } from 'react';
import { OptionCard } from '../shared/OptionCard';

const OPTIONS = [
  'I grew up around it but never learned to speak it',
  'I understand some but can\'t produce it',
  'I\'m starting from scratch',
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
      background: '#F7F4EC',
      padding: '48px 24px 48px',
      fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
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
