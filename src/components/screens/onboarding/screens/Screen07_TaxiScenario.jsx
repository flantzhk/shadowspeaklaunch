import { ScenarioCard } from '../shared/ScenarioCard';

export default function Screen07_TaxiScenario({ advance }) {
  return (
    <ScenarioCard
      backgroundImage="/images/onboarding/taxi-night.jpg"
      fallbackGradient="linear-gradient(160deg, #0A0A14 0%, #1A1A2A 50%, #2A2A3A 100%)"
    >
      <div style={{ textAlign: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: "2rem", fontWeight: 800, color: '#C5E85A' }}>
          去銅鑼灣，唔該。
        </span>
      </div>
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <span style={{ fontSize: "0.8125rem", fontStyle: 'italic', color: '#8BB82B' }}>
          Heoi³ tung⁴ lo⁴ waan¹, m⁴ goi¹.
        </span>
      </div>
      <p style={{
        fontSize: "0.9375rem",
        color: '#555',
        lineHeight: 1.6,
        margin: 0,
      }}>
        Your driver stops trying to guess where you want to go.
        <br />You said it. He understood. That's it.
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
