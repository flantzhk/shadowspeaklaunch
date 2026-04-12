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
      background: '#F4F1E8',
      padding: '48px 24px 48px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
    }}>
      {/* Mic icon */}
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none" style={{ marginBottom: 28 }}>
        <circle cx="40" cy="40" r="40" fill="#F0EDC8" opacity="0.5" />
        <path d="M40 18a8 8 0 0 0-8 8v14a8 8 0 0 0 16 0V26a8 8 0 0 0-8-8Z" fill="#C5E85A" />
        <path d="M56 36v4a16 16 0 0 1-32 0v-4" stroke="#C5E85A" strokeWidth="3" strokeLinecap="round" />
        <path d="M40 56v8M32 64h16" stroke="#C5E85A" strokeWidth="3" strokeLinecap="round" />
      </svg>

      <h1 style={{
        fontSize: 24,
        fontWeight: 800,
        color: '#1A2A18',
        textAlign: 'center',
        margin: 0,
      }}>
        ShadowSpeak needs to hear you.
      </h1>

      <p style={{
        fontSize: 15,
        color: '#555',
        lineHeight: 1.7,
        textAlign: 'center',
        maxWidth: 300,
        margin: '16px auto 0',
      }}>
        Pronunciation scoring is the core of how this works.
        When you speak, we listen, score your Cantonese, and
        show you exactly how to improve.
      </p>

      <p style={{
        fontSize: 13,
        color: '#AAA',
        lineHeight: 1.5,
        textAlign: 'center',
        marginTop: 16,
      }}>
        We never store your recordings. They're scored
        and discarded immediately.
      </p>

      <button
        onClick={handleAllow}
        type="button"
        style={{
          width: '100%',
          maxWidth: 340,
          marginTop: 32,
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
        Allow microphone access
      </button>

      <button
        onClick={handleSkip}
        type="button"
        style={{
          background: 'none',
          border: 'none',
          fontSize: 14,
          color: '#BBB',
          marginTop: 16,
          cursor: 'pointer',
          fontFamily: 'inherit',
          padding: '8px 16px',
        }}
      >
        Skip for now
      </button>
    </div>
  );
}
