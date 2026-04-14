import { useState } from 'react';

const FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif";

const PLANS = [
  {
    id: 'annual',
    label: 'Annual',
    price: '£54.99',
    period: 'per year',
    monthly: '£4.58/month',
    badge: 'Most popular',
    highlight: true,
  },
  {
    id: 'monthly',
    label: 'Monthly',
    price: '£9.99',
    period: 'per month',
    monthly: 'Billed monthly, cancel anytime',
    badge: null,
    highlight: false,
  },
  {
    id: 'lifetime',
    label: 'Lifetime',
    price: '£149',
    period: 'one time',
    monthly: 'Limited launch offer — price increases after launch',
    badge: 'Launch offer',
    highlight: false,
  },
];

const FEATURES = [
  'Real-time pronunciation scoring on every phrase',
  'Tone accuracy feedback with instant correction',
  'Cantonese and Mandarin lesson plans',
  'AI conversation practice',
  'Spaced repetition review system',
  'Streak tracking and gamified progress',
  'Offline mode for downloaded phrases',
];

export default function Screen16_Paywall({ onComplete }) {
  const [selected, setSelected] = useState('annual');
  const [showFeatures, setShowFeatures] = useState(false);

  const handleCTA = () => {
    onComplete('trial');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F4F1E8',
      padding: '40px 24px 48px',
      fontFamily: FONT,
    }}>
      {/* Wordmark */}
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <span style={{ fontSize: "1.25rem", fontWeight: 800, color: '#1A2A18' }}>Shadow</span>
        <span style={{ fontSize: "1.25rem", fontWeight: 800, color: '#8BB82B' }}>Speak</span>
      </div>

      <h1 style={{
        fontSize: "1.625rem",
        fontWeight: 800,
        color: '#1A2A18',
        margin: 0,
        textAlign: 'center',
        lineHeight: 1.2,
      }}>
        Your Chinese, properly scored.
      </h1>

      <p style={{
        fontSize: "0.9375rem",
        color: '#666',
        textAlign: 'center',
        marginTop: 8,
        lineHeight: 1.5,
      }}>
        Everything you just experienced — every day. Real pronunciation feedback, real progress.
      </p>

      {/* Featured review */}
      <div style={{
        background: '#C5E85A',
        borderRadius: 14,
        padding: '16px 18px',
        marginTop: 20,
      }}>
        <div style={{ fontSize: "0.875rem", color: '#1A2A18', letterSpacing: 1 }}>★★★★★</div>
        <p style={{
          fontSize: "0.875rem",
          fontStyle: 'italic',
          color: '#1A2A18',
          margin: '8px 0 0',
          lineHeight: 1.5,
        }}>
          "The AI coaching is unlike anything else out there. I've been studying for 3 years and this is the first time I've known exactly what to fix."
        </p>
        <div style={{ fontSize: "0.75rem", color: '#3A6A1A', fontWeight: 600, marginTop: 8 }}>
          David K. — Cantonese learner
        </div>
      </div>

      {/* Pricing tiers */}
      <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {PLANS.map((plan) => {
          const isSelected = selected === plan.id;
          return (
            <button
              key={plan.id}
              type="button"
              onClick={() => setSelected(plan.id)}
              style={{
                width: '100%',
                background: isSelected ? '#1A2A18' : 'white',
                borderRadius: 14,
                padding: '16px 18px',
                border: `2px solid ${isSelected ? '#C5E85A' : '#E8E4D8'}`,
                cursor: 'pointer',
                fontFamily: FONT,
                textAlign: 'left',
                position: 'relative',
                transition: 'all 150ms ease',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              {/* Badge */}
              {plan.badge && (
                <div style={{
                  position: 'absolute',
                  top: -10,
                  right: 14,
                  background: '#C5E85A',
                  color: '#1A2A18',
                  fontSize: "0.6875rem",
                  fontWeight: 800,
                  borderRadius: 20,
                  padding: '3px 10px',
                }}>
                  {plan.badge}
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                <div>
                  <div style={{
                    fontSize: "0.875rem",
                    fontWeight: 700,
                    color: isSelected ? '#C5E85A' : '#999',
                    marginBottom: 2,
                  }}>
                    {plan.label}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                    <span style={{
                      fontSize: "1.5rem",
                      fontWeight: 800,
                      color: isSelected ? 'white' : '#1A2A18',
                    }}>
                      {plan.price}
                    </span>
                    <span style={{
                      fontSize: "0.8125rem",
                      color: isSelected ? 'rgba(255,255,255,0.6)' : '#999',
                    }}>
                      {plan.period}
                    </span>
                  </div>
                </div>
                {isSelected && (
                  <div style={{
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    background: '#C5E85A',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: "0.6875rem",
                    color: '#1A2A18',
                    fontWeight: 800,
                  }}>
                    ✓
                  </div>
                )}
              </div>
              <div style={{
                fontSize: "0.75rem",
                color: isSelected ? 'rgba(255,255,255,0.5)' : '#BBB',
                marginTop: 4,
              }}>
                {plan.monthly}
              </div>
            </button>
          );
        })}
      </div>

      {/* Primary CTA */}
      <button
        onClick={handleCTA}
        type="button"
        style={{
          width: '100%',
          marginTop: 20,
          padding: '17px 0',
          borderRadius: 12,
          border: 'none',
          background: '#C5E85A',
          color: '#1A2A18',
          fontSize: "1.0625rem",
          fontWeight: 800,
          cursor: 'pointer',
          fontFamily: FONT,
        }}
      >
        Start my 7-day free trial
      </button>

      {/* Secondary links */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: 20,
        marginTop: 12,
      }}>
        <button
          type="button"
          onClick={() => {}}
          style={{
            background: 'none',
            border: 'none',
            fontSize: "0.8125rem",
            color: '#AAA',
            cursor: 'pointer',
            fontFamily: FONT,
            padding: '4px 0',
          }}
        >
          Restore purchase
        </button>
        <button
          type="button"
          onClick={() => setShowFeatures((v) => !v)}
          style={{
            background: 'none',
            border: 'none',
            fontSize: "0.8125rem",
            color: '#AAA',
            cursor: 'pointer',
            fontFamily: FONT,
            padding: '4px 0',
          }}
        >
          {showFeatures ? 'Hide features' : 'See what\'s included'}
        </button>
      </div>

      {/* Feature list accordion */}
      {showFeatures && (
        <div style={{
          background: 'white',
          borderRadius: 14,
          padding: '16px 18px',
          marginTop: 12,
        }}>
          {FEATURES.map((feature) => (
            <div key={feature} style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
              marginBottom: 10,
            }}>
              <span style={{ color: '#C5E85A', fontWeight: 800, flexShrink: 0 }}>✓</span>
              <span style={{ fontSize: "0.8125rem", color: '#1A2A18', lineHeight: 1.4 }}>{feature}</span>
            </div>
          ))}
        </div>
      )}

      {/* Legal */}
      <p style={{
        fontSize: "0.6875rem",
        color: '#CCC',
        textAlign: 'center',
        marginTop: 16,
        lineHeight: 1.6,
      }}>
        Cancel anytime before trial ends. Payment taken at end of trial period. Annual billing charged in full. Family plan available at £79.99/year for up to 5 members.
      </p>
    </div>
  );
}
