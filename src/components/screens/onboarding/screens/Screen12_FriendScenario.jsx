import { ScenarioCard } from '../shared/ScenarioCard';

export default function Screen12_FriendScenario({ advance }) {
  return (
    <ScenarioCard
      backgroundImage="/images/onboarding/rooftop.jpg"
      fallbackGradient="linear-gradient(160deg, #0A0A1A 0%, #1A0A2A 50%, #2A1A3A 100%)"
    >
      <div style={{ textAlign: 'center', marginBottom: 6 }}>
        <span style={{ fontSize: "1.75rem", fontWeight: 800, color: '#C5E85A' }}>
          你廣東話講得好好喎！
        </span>
      </div>
      <div style={{ textAlign: 'center', marginBottom: 6 }}>
        <span style={{ fontSize: "0.8125rem", fontStyle: 'italic', color: '#8BB82B' }}>
          Nei⁵ gwong² dung¹ waa² gong² dak¹ hou² hou² wo³!
        </span>
      </div>
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <span style={{ fontSize: "0.6875rem", color: '#BBB' }}>
          "Your Cantonese is really good!"
        </span>
      </div>
      <p style={{
        fontSize: "0.9375rem",
        color: '#555',
        lineHeight: 1.6,
        margin: 0,
      }}>
        Your friend's parents say your Cantonese is good.
        <br />You know it isn't — yet.
        <br />But they're not wrong either.
      </p>
      <button
        onClick={advance}
        type="button"
        style={{
          width: '100%',
          marginTop: 20,
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
        Keep going →
      </button>
    </ScenarioCard>
  );
}
