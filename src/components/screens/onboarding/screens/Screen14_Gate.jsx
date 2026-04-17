import { ROUTES } from '../../../../utils/constants';

const FEATURES = [
  '461 real Hong Kong phrases',
  'Pronunciation scoring',
  '5 practice modes',
  'Offline access',
];

export default function Screen14_Gate({ onComplete }) {
  const handleTrial = () => onComplete('trial');
  const handleFree = () => onComplete('free');

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F7F4EC',
      padding: '48px 24px 48px',
      fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
    }}>
      <h1 style={{ fontSize: "1.625rem", fontWeight: 800, color: '#1A2A18', margin: 0 }}>
        Save your plan and keep going.
      </h1>

      {/* Trial card */}
      <div style={{ marginTop: 24, position: 'relative' }}>
        <span style={{
          position: 'absolute',
          top: -10,
          left: 16,
          background: '#C5E85A',
          color: '#1A2A18',
          fontSize: "0.6875rem",
          fontWeight: 700,
          textTransform: 'uppercase',
          borderRadius: 6,
          padding: '3px 10px',
          letterSpacing: 0.5,
        }}>
          Most popular
        </span>
        <div style={{
          background: 'white',
          border: '2px solid #C5E85A',
          borderRadius: 16,
          padding: 20,
        }}>
          <div style={{ fontSize: "1.0625rem", fontWeight: 800, color: '#1A2A18' }}>
            ★ Start free trial
          </div>
          <div style={{ fontSize: "0.9375rem", color: '#1A2A18', marginTop: 6 }}>
            7 days free, then $59.99/year
          </div>
          <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: '#8BB82B' }}>
            $5/month. Cancel any time.
          </div>
          <button
            onClick={handleTrial}
            type="button"
            style={{
              width: '100%',
              marginTop: 16,
              padding: '14px 0',
              borderRadius: 12,
              border: 'none',
              background: '#C5E85A',
              color: '#1A2A18',
              fontSize: "0.9375rem",
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Start my free trial
          </button>
        </div>
      </div>

      {/* Divider */}
      <div style={{
        textAlign: 'center',
        fontSize: "0.8125rem",
        color: '#CCC',
        margin: '16px 0',
      }}>
        ──── or ────
      </div>

      {/* Free card */}
      <div style={{
        background: '#F7F4EC',
        border: '1px solid #E0DDD4',
        borderRadius: 16,
        padding: 20,
      }}>
        <div style={{ fontSize: "0.9375rem", fontWeight: 700, color: '#1A2A18' }}>
          Continue with free access
        </div>
        <div style={{ fontSize: "0.8125rem", color: '#888', marginTop: 4 }}>
          Core features. No payment required.
        </div>
        <button
          onClick={handleFree}
          type="button"
          style={{
            width: '100%',
            marginTop: 16,
            padding: '14px 0',
            borderRadius: 12,
            background: 'transparent',
            border: '1.5px solid #1A2A18',
            color: '#1A2A18',
            fontSize: "0.875rem",
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          Create free account
        </button>
      </div>

      {/* Feature list */}
      <div style={{
        background: 'white',
        borderRadius: 14,
        padding: '16px 18px',
        marginTop: 12,
      }}>
        {FEATURES.map((feature) => (
          <div key={feature} style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '6px 0',
          }}>
            <span style={{ color: '#C5E85A', fontSize: "0.875rem" }}>✓</span>
            <span style={{ fontSize: "0.8125rem", color: '#1A2A18' }}>{feature}</span>
          </div>
        ))}
      </div>

      {/* Footer link */}
      <div style={{ textAlign: 'center', marginTop: 16 }}>
        <button
          onClick={() => { window.location.hash = `#${ROUTES.LOGIN}`; }}
          type="button"
          style={{
            background: 'none',
            border: 'none',
            fontSize: "0.8125rem",
            color: '#AAA',
            cursor: 'pointer',
            fontFamily: 'inherit',
            padding: '8px 16px',
          }}
        >
          Already have an account? Sign in
        </button>
      </div>
    </div>
  );
}
