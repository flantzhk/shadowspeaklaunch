import { useState, useCallback, useRef } from 'react';
import { useAppContext } from '../../../contexts/AppContext';
import { logEvent } from '../../../services/analytics';
import { OnboardingProgressBar } from './shared/OnboardingProgressBar';
import Screen01_Hook from './screens/Screen01_Hook';
import Screen02_LanguageSelect from './screens/Screen02_LanguageSelect';
import Screen03_Why from './screens/Screen03_Why';
import Screen05_Pain from './screens/Screen05_Pain';
import Screen06_SocialProof from './screens/Screen06_SocialProof';
import Screen06_SwipeCards from './screens/Screen06_SwipeCards';
import Screen07_SolutionReveal from './screens/Screen07_SolutionReveal';
import Screen08_Comparison from './screens/Screen08_Comparison';
import Screen09_Personalisation from './screens/Screen09_Personalisation';
import Screen10_MicPermission from './screens/Screen10_MicPermission';
import Screen11_NotifPermission from './screens/Screen11_NotifPermission';
import Screen13_PlanReveal from './screens/Screen13_PlanReveal';
import Screen11_LiveDemo from './screens/Screen11_LiveDemo';
import Screen14_ScoreCard from './screens/Screen14_ScoreCard';
import Screen15_AccountCreation from './screens/Screen15_AccountCreation';
import Screen16_Paywall from './screens/Screen16_Paywall';
import styles from './OnboardingFlow.module.css';

const SCREENS = [
  Screen01_Hook,            // 0  — Welcome/Hook
  Screen02_LanguageSelect,  // 1  — Language selection
  Screen03_Why,             // 2  — Why learning
  Screen05_Pain,            // 3  — Pain points
  Screen06_SocialProof,     // 4  — Social proof
  Screen06_SwipeCards,      // 5  — Swipe cards
  Screen07_SolutionReveal,  // 6  — Solution reveal
  Screen08_Comparison,      // 7  — Comparison table
  Screen09_Personalisation, // 8  — Topic picker
  Screen10_MicPermission,   // 9  — Mic permission
  Screen11_NotifPermission, // 10 — Notification permission
  Screen13_PlanReveal,      // 11 — Processing/loading
  Screen11_LiveDemo,        // 12 — Demo (speak + score)
  Screen14_ScoreCard,       // 13 — Viral score card
  Screen15_AccountCreation, // 14 — Account creation
  Screen16_Paywall,         // 15 — Paywall
];

// Screen indices that show the progress bar
const PROGRESS_SCREENS = new Set([2, 3, 4, 5, 7, 8, 11, 12, 13]);

// Screen indices with no back button
const NO_BACK_SCREENS = new Set([0, 1, 5, 10]);

export default function OnboardingFlow({ onComplete }) {
  const { updateSettings } = useAppContext();
  const [screenIndex, setScreenIndex] = useState(0);
  const [direction, setDirection] = useState('forward');
  const [isAnimating, setIsAnimating] = useState(false);
  const containerRef = useRef(null);

  const [answers, setAnswers] = useState({
    language: null,          // 'cantonese' | 'mandarin'
    whyLearning: null,
    painPoints: [],
    swipeCards: [],
    topics: [],
    dailyGoalMinutes: 20,
    micGranted: false,
    notifGranted: false,
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
      currentLanguage: answers.language || 'cantonese',
      dailyGoalMinutes: answers.dailyGoalMinutes,
      onboardingCompleted: true,
    });
  }, [answers, updateSettings]);

  const handleComplete = useCallback(async (plan) => {
    await writeAllAnswersToSettings();
    logEvent('onboarding_completed', { plan: plan || 'free' });
    onComplete(plan);
  }, [writeAllAnswersToSettings, onComplete]);

  const CurrentScreen = SCREENS[screenIndex];
  const showProgress = PROGRESS_SCREENS.has(screenIndex);
  const showBack = !NO_BACK_SCREENS.has(screenIndex);
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
          <OnboardingProgressBar currentStep={progressStep} totalSteps={16} />
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
