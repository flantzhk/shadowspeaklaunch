import styles from './ScenarioCard.module.css';

function ScenarioCard({ backgroundImage, fallbackGradient, children }) {
  const bgStyle = backgroundImage
    ? { backgroundImage: `url('${backgroundImage}')` }
    : { background: fallbackGradient };

  return (
    <div className={styles.scenarioScreen}>
      <div className={styles.backgroundFill} style={bgStyle} />
      <div className={styles.overlay} />
      <div className={styles.contentCard}>
        {children}
      </div>
    </div>
  );
}

export { ScenarioCard };
