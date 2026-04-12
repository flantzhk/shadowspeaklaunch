import { ScenarioCard } from '../shared/ScenarioCard';

export default function Screen09_RestaurantScenario({ advance }) {
  return (
    <ScenarioCard
      backgroundImage="/images/onboarding/restaurant.jpg"
      fallbackGradient="linear-gradient(160deg, #1A0A08 0%, #2A1A0A 50%, #3A2A10 100%)"
    >
      <div style={{ textAlign: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: "2rem", fontWeight: 800, color: '#C5E85A' }}>
          唔該，埋單。
        </span>
      </div>
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <span style={{ fontSize: "0.8125rem", fontStyle: 'italic', color: '#8BB82B' }}>
          M⁴ goi¹, maai⁴ daan¹.
        </span>
      </div>
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <span style={{ fontSize: "0.6875rem", color: '#BBB' }}>
          "The bill, please"
        </span>
      </div>
      <p style={{
        fontSize: "0.9375rem",
        color: '#555',
        lineHeight: 1.6,
        margin: 0,
      }}>
        You catch the waiter's eye. You say it without thinking.
        <br />He smiles like you've been coming here for years.
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
