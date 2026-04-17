export default function Screen10_MicPermission({ advance, setAnswers }) {
  const handleAllow = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop());
      setAnswers((prev) => ({ ...prev, micGranted: true }));
      advance();
    } catch {
      setAnswers((prev) => ({ ...prev, micGranted: false }));
      advance();
    }
  };

  const handleSkip = () => {
    setAnswers((prev) => ({ ...prev, micGranted: false }));
    advance();
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F7F4EC',
      padding: '48px 24px 48px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
    }}>
      {/* Mic icon */}
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none" style={{ marginBottom: 28 }}>
        <circle cx="40" cy="40" r="40" fill="#F0EDC8" opacity="0.5" />
        <path d="M40 18a8 8 0 0 0-8 8v14a8 8 0 0 0 16 0V26a8 8 0 0 0-8-8Z" fill="#C5E85A" />
        <path d="M56 36v4a16 16 0 0 1-32 0v-4" stroke="#C5E85A" strokeWidth="3" strokeLinecap="round" />
        <path d="M40 56v8M32 64h16" stroke="#C5E85A" strokeWidth="3" strokeLinecap="round" />
      </svg>

      <h1 style={{
        fontSize: "1.5rem",
        fontWeight: 800,
        color: '#1A2A18',
        textAlign: 'center',
        margin: 0,
      }}>
        Your voice is how you learn.
      </h1>

      <div style={{ marginTop: 20, maxWidth: 300, textAlign: 'left' }}>
        {[
          'Hear your voice played back against a native speaker',
          'Get a pronunciation score after every phrase',
          'See exactly which tones need work',
        ].map((point) => (
          <div key={point} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12 }}>
            <div style={{
              width: 20,
              height: 20,
              borderRadius: '50%',
              background: '#C5E85A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: "0.625rem",
              color: '#1A2A18',
              fontWeight: 800,
              flexShrink: 0,
              marginTop: 1,
            }}>
              ✓
            </div>
            <span style={{ fontSize: "0.9375rem", color: '#444', lineHeight: 1.5 }}>{point}</span>
          </div>
        ))}
      </div>

      <p style={{
        fontSize: "0.8125rem",
        color: '#AAA',
        lineHeight: 1.5,
        textAlign: 'center',
        marginTop: 8,
        maxWidth: 280,
      }}>
        Your audio never leaves your device during scoring.
      </p>

      <button
        onClick={handleAllow}
        type="button"
        style={{
          width: '100%',
          maxWidth: 340,
          marginTop: 28,
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
        Enable microphone
      </button>

      <button
        onClick={handleSkip}
        type="button"
        style={{
          background: 'none',
          border: 'none',
          fontSize: "0.875rem",
          color: '#BBB',
          marginTop: 16,
          cursor: 'pointer',
          fontFamily: 'inherit',
          padding: '8px 16px',
        }}
      >
        Not now
      </button>
    </div>
  );
}
