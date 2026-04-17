import { useState } from 'react';

const FONT = "'DM Sans', -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif";

const TOPICS = [
  { id: 'food', icon: '🍜', label: 'Food and restaurants' },
  { id: 'family', icon: '👨‍👩‍👧', label: 'Family conversations' },
  { id: 'travel', icon: '🛫', label: 'Travel and directions' },
  { id: 'greetings', icon: '💬', label: 'Greetings and small talk' },
  { id: 'daily', icon: '🏙️', label: 'Daily life and errands' },
  { id: 'work', icon: '💼', label: 'Work and business' },
];

export default function Screen09_Personalisation({ advance, answers, setAnswers }) {
  const selected = answers.topics || [];

  const toggle = (id) => {
    setAnswers((prev) => {
      const topics = prev.topics || [];
      const next = topics.includes(id)
        ? topics.filter((t) => t !== id)
        : [...topics, id];
      return { ...prev, topics: next };
    });
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
        What do you want to be able to say first?
      </h1>
      <p style={{ fontSize: "0.875rem", color: '#888', marginTop: 8 }}>
        Pick what matters most to you. We'll start there.
      </p>

      {/* 2-column grid */}
      <div style={{
        marginTop: 20,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 12,
      }}>
        {TOPICS.map((topic) => {
          const isSelected = selected.includes(topic.id);
          return (
            <button
              key={topic.id}
              type="button"
              onClick={() => toggle(topic.id)}
              style={{
                background: isSelected ? '#1A2A18' : 'white',
                borderRadius: 14,
                padding: '18px 14px',
                border: `2px solid ${isSelected ? '#C5E85A' : '#EDE8DC'}`,
                cursor: 'pointer',
                fontFamily: FONT,
                textAlign: 'left',
                transition: 'all 150ms ease',
                WebkitTapHighlightColor: 'transparent',
                position: 'relative',
              }}
            >
              {isSelected && (
                <div style={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  background: '#C5E85A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: "0.5625rem",
                  color: '#1A2A18',
                  fontWeight: 800,
                }}>
                  ✓
                </div>
              )}
              <div style={{ fontSize: "1.75rem", marginBottom: 8 }}>{topic.icon}</div>
              <div style={{
                fontSize: "0.8125rem",
                fontWeight: 600,
                color: isSelected ? '#C5E85A' : '#1A2A18',
                lineHeight: 1.3,
              }}>
                {topic.label}
              </div>
            </button>
          );
        })}
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
          Build my lesson
        </button>
      )}
    </div>
  );
}
