import { NavBar } from './Screen01_Hook';

const stepCardStyle = {
  background: 'white',
  borderRadius: 14,
  padding: '16px 18px',
  marginBottom: 10,
  display: 'flex',
  alignItems: 'flex-start',
  gap: 14,
};

const numberCircle = {
  minWidth: 32,
  height: 32,
  borderRadius: '50%',
  background: '#1A2A18',
  color: '#C5E85A',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 14,
  fontWeight: 800,
};

export default function Screen02_HowItWorks({ advance }) {
  return (
    <div style={{
      position: 'relative',
      minHeight: '100vh',
      background: '#F4F1E8',
      padding: '60px 24px 48px',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
    }}>
      <NavBar />

      <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1A2A18', margin: 0 }}>
        This is how it works
      </h1>
      <p style={{ fontSize: 14, color: '#888', marginTop: 6, marginBottom: 0 }}>
        No account needed. Just try it.
      </p>

      <div style={{ marginTop: 24 }}>
        {/* Step 1 */}
        <div style={stepCardStyle}>
          <div style={numberCircle}>1</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#1A2A18' }}>Press play</div>
            <div style={{ fontSize: 14, color: '#8BB82B', marginTop: 4 }}>Dung³ naai⁵ caa⁴</div>
            <div style={{ fontSize: 13, color: '#999', marginTop: 2 }}>凍奶茶</div>
            <div style={{ fontSize: 12, color: '#BBB', marginTop: 1 }}>Iced milk tea</div>
          </div>
        </div>

        {/* Step 2 */}
        <div style={stepCardStyle}>
          <div style={numberCircle}>2</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#1A2A18', display: 'flex', alignItems: 'center', gap: 8 }}>
              Say it back
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3Z" fill="#C5E85A"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="#C5E85A" strokeWidth="2" strokeLinecap="round"/>
                <path d="M12 19v4M8 23h8" stroke="#C5E85A" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Step 3 */}
        <div style={stepCardStyle}>
          <div style={numberCircle}>3</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#1A2A18' }}>Get your score</div>
            <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                background: '#C5E85A',
                borderRadius: 8,
                padding: '4px 12px',
                fontSize: 14,
                fontWeight: 800,
                color: '#1A2A18',
              }}>87</span>
              <span style={{ fontSize: 12, color: '#3A6A1A', fontWeight: 600 }}>Great!</span>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={advance}
        type="button"
        style={{
          width: '100%',
          marginTop: 24,
          padding: '17px 0',
          borderRadius: 16,
          border: 'none',
          background: '#C5E85A',
          color: '#1A2A18',
          fontSize: 16,
          fontWeight: 700,
          cursor: 'pointer',
          fontFamily: 'inherit',
        }}
      >
        Show me →
      </button>
    </div>
  );
}
