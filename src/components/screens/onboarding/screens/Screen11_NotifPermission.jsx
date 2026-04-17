const FONT = "'DM Sans', -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif";

export default function Screen11_NotifPermission({ advance, setAnswers }) {
  const handleEnable = async () => {
    try {
      const permission = await Notification.requestPermission();
      setAnswers((prev) => ({ ...prev, notifGranted: permission === 'granted' }));
    } catch {
      setAnswers((prev) => ({ ...prev, notifGranted: false }));
    }
    advance();
  };

  const handleSkip = () => {
    setAnswers((prev) => ({ ...prev, notifGranted: false }));
    advance();
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F7F4EC',
      padding: '48px 24px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: FONT,
    }}>
      {/* Bell icon */}
      <div style={{
        width: 80,
        height: 80,
        borderRadius: '50%',
        background: 'rgba(197,232,90,0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 28,
        fontSize: "2.25rem",
      }}>
        🔔
      </div>

      <h1 style={{
        fontSize: "1.5rem",
        fontWeight: 800,
        color: '#1A2A18',
        textAlign: 'center',
        margin: 0,
        lineHeight: 1.25,
      }}>
        Stay consistent. That's how speaking happens.
      </h1>

      <div style={{ marginTop: 20, maxWidth: 300, textAlign: 'left' }}>
        {[
          'Daily reminder at your chosen time',
          'Streak alerts so you don\'t lose your progress',
          'New phrases added to your language',
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
        textAlign: 'center',
        marginTop: 8,
        maxWidth: 280,
        lineHeight: 1.5,
      }}>
        Once a day at a time that works for you. That's it.
      </p>

      <button
        onClick={handleEnable}
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
          fontFamily: FONT,
        }}
      >
        Enable reminders
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
          fontFamily: FONT,
          padding: '8px 16px',
        }}
      >
        Skip for now
      </button>
    </div>
  );
}
