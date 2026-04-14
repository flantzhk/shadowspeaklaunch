import { ROUTES } from '../../../../utils/constants';
import { ScenarioCard } from '../shared/ScenarioCard';

function NavBar({ dark }) {
  const textColor = dark ? 'white' : undefined;
  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 10,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '18px 24px',
    }}>
      <div style={{ fontSize: "1.25rem", fontWeight: 800 }}>
        <span style={{ color: textColor || '#1A2A18' }}>Shadow</span>
        <span style={{ color: textColor || '#8BB82B' }}>Speak</span>
      </div>
      <button
        onClick={() => { window.location.hash = `#${ROUTES.LOGIN}`; }}
        type="button"
        style={{
          background: 'none',
          border: 'none',
          fontSize: "0.875rem",
          fontWeight: 600,
          color: textColor || '#1A2A18',
          cursor: 'pointer',
          fontFamily: 'inherit',
          padding: '8px 0',
        }}
      >
        Sign in
      </button>
    </div>
  );
}

export { NavBar };

export default function Screen01_Hook({ advance }) {
  return (
    <div style={{ position: 'relative', height: '100dvh' }}>
      <NavBar dark />
      <ScenarioCard
        backgroundImage="/images/onboarding/coffee-shop.jpg"
        fallbackGradient="linear-gradient(160deg, #0A1A08 0%, #1A2A18 50%, #2A4A20 100%)"
      >
        <h1 style={{
          fontSize: "1.75rem",
          fontWeight: 800,
          color: '#1A2A18',
          lineHeight: 1.2,
          margin: 0,
        }}>
          Speak Chinese the way it was meant to sound.
        </h1>
        <p style={{
          fontSize: "0.9375rem",
          color: '#555',
          lineHeight: 1.6,
          marginTop: 12,
          marginBottom: 0,
        }}>
          Real pronunciation. Real feedback. The AI coaching app built for Chinese learners who are done guessing.
        </p>

        {/* Language pills — both active */}
        <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: '#1A2A18',
            color: '#C5E85A',
            fontSize: "0.75rem",
            fontWeight: 600,
            borderRadius: 20,
            padding: '7px 14px',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#C5E85A' }} />
            Cantonese
          </span>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: '#1A2A18',
            color: '#C5E85A',
            fontSize: "0.75rem",
            fontWeight: 600,
            borderRadius: 20,
            padding: '7px 14px',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#C5E85A' }} />
            Mandarin
          </span>
        </div>

        <button
          onClick={advance}
          type="button"
          style={{
            width: '100%',
            marginTop: 20,
            padding: '17px 0',
            borderRadius: 16,
            border: 'none',
            background: '#C5E85A',
            color: '#1A2A18',
            fontSize: "1rem",
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          Start learning
        </button>
      </ScenarioCard>
    </div>
  );
}
