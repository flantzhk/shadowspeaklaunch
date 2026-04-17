import { useState } from 'react';

const FONT = "'DM Sans', -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif";

const PHRASES = {
  cantonese: { chinese: '你食咗飯未呀？', romanisation: 'nei5 sik6 zo2 faan6 mei6 aa3', english: 'Have you eaten yet?' },
  mandarin: { chinese: '你吃饭了吗？', romanisation: 'nǐ chī fàn le ma', english: 'Have you eaten?' },
};

function getScoreColor(s) {
  if (s >= 80) return '#C5E85A';
  if (s >= 60) return '#E8A030';
  return '#D04040';
}

function getScoreLabel(s) {
  if (s >= 80) return 'Strong start.';
  if (s >= 60) return 'Good start.';
  return 'Keep going.';
}

export default function Screen14_ScoreCard({ advance, answers }) {
  const score = answers.demoScore ?? 84;
  const phrase = PHRASES[answers.language] || PHRASES.cantonese;
  const scoreColor = getScoreColor(score);
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const shareData = {
      title: 'My ShadowSpeak Score',
      text: `I just scored ${score}/100 on my first ${answers.language === 'mandarin' ? 'Mandarin' : 'Cantonese'} pronunciation attempt. Try it at shadowspeak.app`,
      url: 'https://shadowspeak.app?utm_source=share&utm_medium=onboarding',
    };
    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      // User cancelled share — no action needed
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F7F4EC',
      padding: '32px 24px 48px',
      fontFamily: FONT,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      <h2 style={{
        fontSize: "1.25rem",
        fontWeight: 800,
        color: '#1A2A18',
        margin: 0,
        textAlign: 'center',
      }}>
        Your first score.
      </h2>

      {/* Score card — designed to be screenshot-shared */}
      <div style={{
        width: '100%',
        maxWidth: 340,
        background: '#1A2A18',
        borderRadius: 20,
        padding: '28px 24px',
        marginTop: 20,
        textAlign: 'center',
        boxShadow: '0 8px 32px rgba(26,42,24,0.2)',
      }}>
        {/* Title */}
        <div style={{
          fontSize: "0.75rem",
          fontWeight: 700,
          color: '#C5E85A',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          marginBottom: 16,
        }}>
          My ShadowSpeak Score
        </div>

        {/* Chinese characters */}
        <div style={{
          fontSize: "2.25rem",
          fontWeight: 700,
          color: 'white',
          lineHeight: 1.1,
        }}>
          {phrase.chinese}
        </div>

        {/* Romanisation */}
        <div style={{
          fontSize: "0.875rem",
          color: '#8F6AE8',
          marginTop: 8,
          fontWeight: 600,
        }}>
          {phrase.romanisation}
        </div>

        {/* Translation */}
        <div style={{
          fontSize: "0.75rem",
          color: 'rgba(255,255,255,0.5)',
          marginTop: 4,
        }}>
          {phrase.english}
        </div>

        {/* Score circle */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 20,
        }}>
          <div style={{
            width: 96,
            height: 96,
            borderRadius: '50%',
            background: scoreColor,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <span style={{ fontSize: "2.5rem", fontWeight: 800, color: '#1A2A18', lineHeight: 1 }}>{score}</span>
            <span style={{ fontSize: "0.625rem", fontWeight: 700, color: '#1A2A18', opacity: 0.7 }}>/100</span>
          </div>
        </div>

        {/* Score caption */}
        <div style={{
          marginTop: 14,
          fontSize: "0.875rem",
          color: scoreColor,
          fontWeight: 700,
        }}>
          First attempt. {score}/100. {getScoreLabel(score)}
        </div>

        {/* Wordmark */}
        <div style={{
          marginTop: 20,
          fontSize: "0.75rem",
          color: 'rgba(255,255,255,0.3)',
        }}>
          shadowspeak.app
        </div>
      </div>

      {/* Share button */}
      <button
        onClick={handleShare}
        type="button"
        style={{
          marginTop: 16,
          padding: '12px 28px',
          borderRadius: 10,
          border: '1.5px solid #1A2A18',
          background: 'transparent',
          color: '#1A2A18',
          fontSize: "0.9375rem",
          fontWeight: 700,
          cursor: 'pointer',
          fontFamily: FONT,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        {copied ? 'Copied to clipboard' : 'Share your result'}
      </button>

      <p style={{
        fontSize: "0.8125rem",
        color: '#888',
        textAlign: 'center',
        marginTop: 12,
        maxWidth: 280,
        lineHeight: 1.5,
      }}>
        Most learners improve 3-5 points per session. That's real progress.
      </p>

      {/* Primary CTA */}
      <button
        onClick={advance}
        type="button"
        style={{
          width: '100%',
          maxWidth: 340,
          marginTop: 20,
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
        Continue to the full app
      </button>
    </div>
  );
}
