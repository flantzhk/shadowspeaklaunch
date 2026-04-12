import styles from './OnboardingProgressBar.module.css';

function OnboardingProgressBar({ currentStep, totalSteps = 14 }) {
  const percent = (currentStep / totalSteps) * 100;

  return (
    <div className={styles.wrapper}>
      <div className={styles.track}>
        <div
          className={styles.fill}
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className={styles.counter}>
        {currentStep} of {totalSteps}
      </span>
    </div>
  );
}

export { OnboardingProgressBar };
