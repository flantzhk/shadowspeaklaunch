import { useState, useCallback, useRef } from 'react';
import { useAppContext } from '../../../contexts/AppContext';
import { OnboardingProgressBar } from './shared/OnboardingProgressBar';
import Screen01_Hook from './screens/Screen01_Hook';
import Screen02_HowItWorks from './screens/Screen02_HowItWorks';
import Screen03_Goal from './screens/Screen03_Goal';
import Screen04_Situation from './screens/Screen04_Situation';
import Screen05_Pain from './screens/Screen05_Pain';
import Screen06_SocialProof from './screens/Screen06_SocialProof';
import Screen07_TaxiScenario from './screens/Screen07_TaxiScenario';
import Screen08_Preferences from './screens/Screen08_Preferences';
import Screen09_RestaurantScenario from './screens/Screen09_RestaurantScenario';
import Screen10_MicPermission from './screens/Screen10_MicPermission';
import Screen11_LiveDemo from './screens/Screen11_LiveDemo';
import Screen12_FriendScenario from './screens/Screen12_FriendScenario';
import Screen13_PlanReveal from './screens/Screen13_PlanReveal';
import Screen14_Gate from './screens/Screen14_Gate';
import styles from './OnboardingFlow.module.css';

const SCREENS = [
  Screen01_Hook,       // 0
  Screen02_HowItWorks, // 1
  Screen03_Goal,       // 2
  Screen04_Situation,  // 3
  Screen05_Pain,       // 4
  Screen06_SocialProof,// 5
  Screen07_TaxiScenario,// 6
  Screen08_Preferences,// 7
  Screen09_RestaurantScenario, // 8
  Screen10_MicPermission, // 9
  Screen11_LiveDemo,   // 10
  Screen12_FriendScenario, // 11
  Screen13_PlanReveal, // 12
  Screen14_Gate,       // 13
];

// Screen indices (0-based) that show the progress bar
// Screens 3,4,5,6,8,10,13,14 in spec → indices 2,3,4,5,7,9,12,13
const PROGRESS_SCREENS = new Set([2, 3, 4, 5, 7, 9, 12, 13]);

// Screen indices that show back button
// No back on: 1,2,7,9,12 (spec) → indices 0,1,6,8,10,11
const NO_BACK_SCREENS = new Set([0, 1, 6, 8, 10, 11]);

export default function OnboardingFlow({ onComplete }) {
  const { updateSettings } = useAppContext();
  const [screenIndex, setScreenIndex] = useState(0);
  const [direction, setDirection] = useState('forward');
  const [isAnimating, setIsAnimating] = useState(false);
  const containerRef = useRef(null);

  const [answers, setAnswers] = useState({
    goals: [],
    situation: null,
    painPoints: [],
    language: 'cantonese',
    dailyGoalMinutes: 20,
    micGranted: false,
    demoScore: null,
    plan: 'free',
  });

  const advance = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setDirection('forward');
    setScreenIndex((prev) => Math.min(prev + 1, SCREENS.length - 1));
    setTimeout(() => setIsAnimating(false), 300);
  }, [isAnimating]);

  const back = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setDirection('back');
    setScreenIndex((prev) => Math.max(prev - 1, 0));
    setTimeout(() => setIsAnimating(false), 250);
  }, [isAnimating]);

  const writeAllAnswersToSettings = useCallback(async () => {
    await updateSettings({
      currentLanguage: answers.language,
      dailyGoalMinutes: answers.dailyGoalMinutes,
      onboardingCompleted: true,
    });
  }, [answers, updateSettings]);

  const handleComplete = useCallback(async (plan) => {
    await writeAllAnswersToSettings();
    onComplete(plan);
  }, [writeAllAnswersToSettings, onComplete]);

  const CurrentScreen = SCREENS[screenIndex];
  const showProgress = PROGRESS_SCREENS.has(screenIndex);
  const showBack = !NO_BACK_SCREENS.has(screenIndex);
  // Progress bar step is 1-indexed: index 0 = screen 1
  const progressStep = screenIndex + 1;

  return (
    <div className={styles.container}>
      {showBack && (
        <button
          className={styles.backButton}
          onClick={back}
          type="button"
          aria-label="Go back"
        >
          ‹
        </button>
      )}
      {showProgress && (
        <div className={styles.progressWrapper}>
          <OnboardingProgressBar currentStep={progressStep} totalSteps={14} />
        </div>
      )}
      <div
        ref={containerRef}
        className={`${styles.screenWrapper} ${
          direction === 'forward' ? styles.slideInRight : styles.slideInLeft
        }`}
        key={screenIndex}
      >
        <CurrentScreen
          advance={advance}
          back={back}
          answers={answers}
          setAnswers={setAnswers}
          updateSettings={updateSettings}
          onComplete={handleComplete}
        />
      </div>
    </div>
  );
}
