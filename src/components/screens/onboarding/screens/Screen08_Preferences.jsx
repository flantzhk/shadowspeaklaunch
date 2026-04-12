const pillBase = {
  flex: 1,
  padding: '14px 0',
  borderRadius: 12,
  border: 'none',
  fontSize: 14,
  fontWeight: 700,
  cursor: 'pointer',
  fontFamily: 'inherit',
  textAlign: 'center',
  transition: 'all 150ms ease',
  WebkitTapHighlightColor: 'transparent',
};

const goalPillBase = {
  flex: 1,
  padding: '16px 0',
  borderRadius: 12,
  border: '1.5px solid #E8E4D8',
  background: 'white',
  cursor: 'pointer',
  fontFamily: 'inherit',
  textAlign: 'center',
  transition: 'all 150ms ease',
  WebkitTapHighlightColor: 'transparent',
};

export default function Screen08_Preferences({ advance, answers, setAnswers, updateSettings }) {
  const dailyGoal = answers.dailyGoalMinutes;

  const handleCTA = async () => {
    await updateSettings({
      currentLanguage: answers.language,
      dailyGoalMinutes: answers.dailyGoalMinutes,
    });
    advance();
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F4F1E8',
      padding: '48px 24px 48px',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
    }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1A2A18', margin: 0 }}>
        Let's set up your plan.
      </h1>

      {/* Language selector */}
      <div style={{ marginTop: 28 }}>
        <label style={{ fontSize: 13, fontWeight: 600, color: '#666', display: 'block', marginBottom: 10 }}>
          Which language?
        </label>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            style={{
              ...pillBase,
              background: '#1A2A18',
              color: '#C5E85A',
            }}
          >
            <div>Cantonese</div>
            <div style={{ fontSize: 11, color: '#8BB82B', marginTop: 2 }}>廣東話</div>
          </button>
          <button
            type="button"
            disabled
            style={{
              ...pillBase,
              background: '#E8E4D8',
              color: '#AAA',
              opacity: 0.6,
              cursor: 'default',
              position: 'relative',
            }}
          >
            <div>Mandarin</div>
            <div style={{ fontSize: 10, color: '#CCC', marginTop: 2 }}>Coming soon</div>
            <div style={{ fontSize: 11, color: '#CCC', marginTop: 1 }}>普通話</div>
          </button>
        </div>
      </div>

      {/* Daily goal selector */}
      <div style={{ marginTop: 24 }}>
        <label style={{ fontSize: 13, fontWeight: 600, color: '#666', display: 'block', marginBottom: 10 }}>
          How much time per day?
        </label>
        <div style={{ display: 'flex', gap: 10 }}>
          {[10, 20, 30].map((min) => {
            const isSelected = dailyGoal === min;
            return (
              <button
                key={min}
                type="button"
                onClick={() => setAnswers((prev) => ({ ...prev, dailyGoalMinutes: min }))}
                style={{
                  ...goalPillBase,
                  ...(isSelected
                    ? { background: '#1A2A18', color: 'white', borderColor: '#1A2A18' }
                    : { background: 'white', color: '#1A2A18' }),
                }}
              >
                <div style={{ fontSize: 20, fontWeight: 800 }}>{min}</div>
                <div style={{ fontSize: 10, fontWeight: 600, marginTop: 2, opacity: 0.7 }}>MIN</div>
              </button>
            );
          })}
        </div>
      </div>

      <p style={{
        fontSize: 13,
        color: '#AAA',
        fontStyle: 'italic',
        textAlign: 'center',
        marginTop: 16,
      }}>
        Even 10 min/day produces real results in 4 weeks.
      </p>

      <button
        onClick={handleCTA}
        type="button"
        style={{
          width: '100%',
          marginTop: 28,
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
        Build my plan →
      </button>
    </div>
  );
}
