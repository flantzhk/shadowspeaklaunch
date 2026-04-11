// src/App.jsx — Root: router, context providers, layout shell

import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { AppProvider, useAppContext } from './contexts/AppContext';
import { AudioProvider } from './contexts/AudioContext';
import { TopBar } from './components/layout/TopBar';
import { TabBar } from './components/layout/TabBar';
import { MiniPlayer } from './components/layout/MiniPlayer';
import { LoadingSpinner } from './components/shared/LoadingSpinner';
import { useToast } from './components/shared/Toast';
import { useLibraryActions } from './hooks/useLibraryActions';
import { ROUTES } from './utils/constants';
import { isAuthenticated, waitForAuth, getCurrentUser } from './services/auth';
import { fbAuth } from './services/firebase';
import { getDB } from './services/storage';
import { initOfflineQueueListener } from './services/offlineManager';
import { logger } from './utils/logger';
import { OfflineBanner } from './components/shared/OfflineBanner';
import { StorageFullModal } from './components/shared/StorageFullModal';
import { TopicMasteredCelebration } from './components/shared/TopicMasteredCelebration';
import './styles/global.css';

const HomeScreen = lazy(() => import('./components/screens/HomeScreen'));
const LibraryScreen = lazy(() => import('./components/screens/LibraryScreen'));
const PracticeScreen = lazy(() => import('./components/screens/PracticeScreen'));
const SettingsScreen = lazy(() => import('./components/screens/SettingsScreen'));
const NowPlayingScreen = lazy(() => import('./components/screens/NowPlayingScreen'));
const TopicDetailScreen = lazy(() => import('./components/screens/TopicDetailScreen'));
const OnboardingScreen = lazy(() => import('./components/screens/OnboardingScreen'));
const ShadowSession = lazy(() => import('./components/screens/ShadowSession'));
const PromptDrill = lazy(() => import('./components/screens/PromptDrill'));
const SpeedRun = lazy(() => import('./components/screens/SpeedRun'));
const ToneGym = lazy(() => import('./components/screens/ToneGym'));
const DialogueSceneScreen = lazy(() => import('./components/screens/DialogueScene'));
const CustomPhraseInput = lazy(() => import('./components/screens/CustomPhraseInput'));
const AIConversation = lazy(() => import('./components/screens/AIConversation'));
const StatsScreen = lazy(() => import('./components/screens/StatsScreen'));
const WhatDidTheySay = lazy(() => import('./components/screens/WhatDidTheySay'));
const SessionSummary = lazy(() => import('./components/screens/SessionSummary'));
const LoginScreen = lazy(() => import('./components/screens/LoginScreen'));
const RegisterScreen = lazy(() => import('./components/screens/RegisterScreen'));
const ForgotPasswordScreen = lazy(() => import('./components/screens/ForgotPasswordScreen'));
const WelcomeScreen = lazy(() => import('./components/screens/WelcomeScreen'));
const SearchScreen = lazy(() => import('./components/screens/SearchScreen'));
const LegalPages = lazy(() => import('./components/screens/LegalPage').then(m => ({ default: m.PrivacyPolicy })));
const TermsPage = lazy(() => import('./components/screens/LegalPage').then(m => ({ default: m.TermsOfService })));
const ProfileScreen = lazy(() => import('./components/screens/ProfileScreen'));
const AboutScreen = lazy(() => import('./components/screens/AboutScreen'));
const LicensesScreen = lazy(() => import('./components/screens/LicensesScreen'));
const FAQScreen = lazy(() => import('./components/screens/FAQScreen'));
const ContactScreen = lazy(() => import('./components/screens/ContactScreen'));
const EmailVerification = lazy(() => import('./components/screens/EmailVerification'));
const NewPassword = lazy(() => import('./components/screens/NewPassword'));
const AIScenarioPicker = lazy(() => import('./components/screens/AIScenarioPicker'));
const DayDetailScreen = lazy(() => import('./components/screens/DayDetailScreen'));
const ScenePickerScreen = lazy(() => import('./components/screens/ScenePickerScreen'));
const SceneSummary = lazy(() => import('./components/screens/SceneSummary'));
const ToneGymResults = lazy(() => import('./components/screens/ToneGymResults'));
const FirstLaunchDownload = lazy(() => import('./components/screens/FirstLaunchDownload'));

function parseHash(hash) {
  const clean = hash.replace('#', '');
  const [path, id] = clean.split('/');
  return { path: path || ROUTES.HOME, id: id || null };
}

function useRouter() {
  const [route, setRoute] = useState(() => parseHash(window.location.hash));
  useEffect(() => {
    const handler = () => setRoute(parseHash(window.location.hash));
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);
  const navigate = useCallback((path, params = {}) => {
    window.location.hash = params.id ? `#${path}/${params.id}` : `#${path}`;
  }, []);
  const goBack = useCallback(() => window.history.back(), []);
  return { route, navigate, goBack };
}

const Loader = ({ size = 32 }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, height: '100%' }}>
    <LoadingSpinner size={size} />
  </div>
);

const PUBLIC_ROUTES = [ROUTES.LOGIN, ROUTES.REGISTER, ROUTES.FORGOT_PASSWORD, ROUTES.NEW_PASSWORD, ROUTES.EMAIL_VERIFY, ROUTES.PRIVACY, ROUTES.TERMS];

function MainLayout() {
  const { route, navigate, goBack } = useRouter();
  const { settings, isLoading, updateSettings } = useAppContext();
  const { showToast, ToastComponent } = useToast();
  const { handleSaveToLibrary, handleMarkKnown } = useLibraryActions(showToast, settings.currentLanguage, () => setShowStorageFull(true));
  const [showNowPlaying, setShowNowPlaying] = useState(false);
  const [sessionSummary, setSessionSummary] = useState(null);
  const [activeScene, setActiveScene] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [showStorageFull, setShowStorageFull] = useState(false);
  const [showFirstLaunch, setShowFirstLaunch] = useState(false);
  const [topicMastered, setTopicMastered] = useState(null); // { topicName, phraseCount }

  useEffect(() => {
    const timeout = setTimeout(() => {
      setAuthError('Unable to connect. Please check your internet connection and reload.');
      setAuthReady(true);
    }, 10000);

    waitForAuth().then((user) => {
      clearTimeout(timeout);
      if (user) {
        const name = (user.displayName || '').split(' ')[0];
        const photoURL = user.photoURL || '';
        const updates = {};
        if (name && name !== settings.name) updates.name = name;
        if (photoURL) updates.photoURL = photoURL;
        // Returning users (have displayName or email) skip onboarding
        if (!settings.onboardingCompleted && (user.displayName || user.email)) {
          updates.onboardingCompleted = true;
        }
        if (Object.keys(updates).length > 0) updateSettings(updates);
      }
      setAuthReady(true);
    }).catch(() => {
      clearTimeout(timeout);
      setAuthError('Failed to initialize. Please reload the app.');
      setAuthReady(true);
    });
  }, []);

  if (isLoading || !authReady) return <Loader size={40} />;

  if (authError && !isAuthenticated()) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, height: '100%', padding: '24px', textAlign: 'center', gap: '16px' }}>
        <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>{authError}</p>
        <button onClick={() => window.location.reload()} style={{ padding: '12px 28px', borderRadius: '10px', background: 'var(--color-brand-dark)', color: 'white', fontWeight: 600, fontSize: '15px' }}>
          Reload
        </button>
      </div>
    );
  }

  // Auth guard: redirect unauthenticated users to login
  if (!PUBLIC_ROUTES.includes(route.path) && route.path !== ROUTES.WELCOME && !isAuthenticated()) {
    window.location.hash = `#${ROUTES.LOGIN}`;
    return null;
  }

  // Redirect authenticated users away from login/register
  if ([ROUTES.LOGIN, ROUTES.REGISTER].includes(route.path) && isAuthenticated()) {
    window.location.hash = `#${ROUTES.HOME}`;
    return null;
  }

  // Auth screens render without app chrome
  if (PUBLIC_ROUTES.includes(route.path) || route.path === ROUTES.WELCOME) {
    return (
      <Suspense fallback={<Loader size={40} />}>
        {renderScreen(route, navigate, goBack, showToast, () => {})}
        {ToastComponent}
      </Suspense>
    );
  }

  if (!settings.onboardingCompleted) {
    return (
      <Suspense fallback={<Loader size={40} />}>
        <OnboardingScreen onComplete={() => {
          updateSettings({ onboardingCompleted: true });
          setShowFirstLaunch(true);
        }} />
      </Suspense>
    );
  }

  if (showFirstLaunch) {
    return (
      <Suspense fallback={<Loader size={40} />}>
        <FirstLaunchDownload onComplete={() => setShowFirstLaunch(false)} />
      </Suspense>
    );
  }

  const isTab = [ROUTES.HOME, ROUTES.LIBRARY, ROUTES.PRACTICE].includes(route.path);
  const SESSION_ROUTES = [ROUTES.SHADOW_SESSION, ROUTES.PROMPT_DRILL, ROUTES.SPEED_RUN, ROUTES.TONE_GYM, ROUTES.DIALOGUE];
  const isSession = SESSION_ROUTES.includes(route.path);

  return (
    <>
      <OfflineBanner />
      {isTab && <TopBar streak={settings.streakCount} language={settings.currentLanguage} userName={settings.name} photoURL={settings.photoURL} onSettingsTap={() => navigate(ROUTES.SETTINGS)} onStatsTap={() => navigate(ROUTES.STATS)} onProfileTap={() => navigate(ROUTES.PROFILE)} />}

      {!isSession && (
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <Suspense fallback={<Loader />}>
            {renderScreen(route, navigate, goBack, showToast, setActiveScene)}
          </Suspense>
        </main>
      )}

      {isTab && (
        <>
          <MiniPlayer onExpand={() => setShowNowPlaying(true)} />
          <TabBar activeTab={route.path} onTabChange={(t) => navigate(t)} />
        </>
      )}

      {showNowPlaying && (
        <Suspense fallback={null}>
          <NowPlayingScreen onClose={() => setShowNowPlaying(false)}
            onSaveToLibrary={handleSaveToLibrary} onMarkKnown={handleMarkKnown} />
        </Suspense>
      )}

      {isSession && !sessionSummary && route.path !== ROUTES.DIALOGUE && (
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <Suspense fallback={<Loader />}>
            {renderSessionScreen(route.path, () => navigate(ROUTES.HOME), (s) => setSessionSummary(s))}
          </Suspense>
        </main>
      )}

      {activeScene && (
        <Suspense fallback={null}>
          <DialogueSceneScreen sceneData={activeScene}
            onBack={() => { setActiveScene(null); navigate(ROUTES.HOME); }}
            onComplete={(s) => { setActiveScene(null); if (s?.id) setSessionSummary(s); else navigate(ROUTES.HOME); }} />
        </Suspense>
      )}

      {sessionSummary && sessionSummary.mode === 'dialogue' ? (
        <Suspense fallback={null}>
          <SceneSummary
            summary={sessionSummary}
            chatLog={sessionSummary.chatLog}
            sceneTitle={sessionSummary.sceneTitle}
            onDone={() => { setSessionSummary(null); navigate(ROUTES.HOME); }}
          />
        </Suspense>
      ) : sessionSummary && sessionSummary.mode === 'tone-gym' ? (
        <Suspense fallback={null}>
          <ToneGymResults
            summary={sessionSummary}
            onDone={() => { setSessionSummary(null); navigate(ROUTES.HOME); }}
            onPlayAgain={() => { setSessionSummary(null); navigate(ROUTES.TONE_GYM); }}
          />
        </Suspense>
      ) : sessionSummary ? (
        <Suspense fallback={null}>
          <SessionSummary summary={sessionSummary}
            onDone={() => { setSessionSummary(null); navigate(ROUTES.HOME); }} />
        </Suspense>
      ) : null}

      {showStorageFull && (
        <StorageFullModal
          onClose={() => setShowStorageFull(false)}
          onGoToLibrary={() => navigate(ROUTES.LIBRARY)}
        />
      )}

      {topicMastered && (
        <TopicMasteredCelebration
          topicName={topicMastered.topicName}
          phraseCount={topicMastered.phraseCount}
          onDone={() => setTopicMastered(null)}
          onAIPractice={() => { setTopicMastered(null); navigate(ROUTES.AI_SCENARIO); }}
        />
      )}

      {ToastComponent}
    </>
  );
}

function renderSessionScreen(path, onBack, onComplete) {
  const props = { onBack, onComplete };
  switch (path) {
    case ROUTES.SHADOW_SESSION: return <ShadowSession {...props} />;
    case ROUTES.PROMPT_DRILL: return <PromptDrill {...props} />;
    case ROUTES.SPEED_RUN: return <SpeedRun {...props} />;
    case ROUTES.TONE_GYM: return <ToneGym {...props} />;
    default: return null;
  }
}

function renderScreen(route, navigate, goBack, showToast, onStartScene) {
  switch (route.path) {
    case ROUTES.LOGIN: return <LoginScreen />;
    case ROUTES.REGISTER: return <RegisterScreen />;
    case ROUTES.FORGOT_PASSWORD: return <ForgotPasswordScreen />;
    case ROUTES.WELCOME: return <WelcomeScreen />;
    case ROUTES.HOME: return <HomeScreen onNavigate={navigate} />;
    case ROUTES.LIBRARY: return <LibraryScreen onNavigate={navigate} />;
    case ROUTES.PRACTICE: return <PracticeScreen onNavigate={navigate} onStartScene={onStartScene} />;
    case ROUTES.SETTINGS: return <SettingsScreen onBack={goBack} onNavigate={navigate} />;
    case ROUTES.TOPIC_DETAIL: return <TopicDetailScreen topicId={route.id} onBack={goBack} showToast={showToast} onStartScene={onStartScene} />;
    case ROUTES.CUSTOM_PHRASE: return <CustomPhraseInput onBack={goBack} showToast={showToast} />;
    case ROUTES.WHAT_DID_THEY_SAY: return <WhatDidTheySay onBack={goBack} showToast={showToast} />;
    case ROUTES.AI_CHAT: return <AIConversation onBack={goBack} showToast={showToast} />;
    case ROUTES.STATS: return <StatsScreen onBack={goBack} onNavigate={navigate} />;
    case ROUTES.SEARCH: return <SearchScreen onBack={goBack} onNavigate={navigate} />;
    case ROUTES.PRIVACY: return <LegalPages onBack={goBack} />;
    case ROUTES.TERMS: return <TermsPage onBack={goBack} />;
    case ROUTES.PROFILE: return <ProfileScreen onBack={goBack} onNavigate={navigate} showToast={showToast} />;
    case ROUTES.ABOUT: return <AboutScreen onBack={goBack} onNavigate={navigate} />;
    case ROUTES.LICENSES: return <LicensesScreen onBack={goBack} />;
    case ROUTES.FAQ: return <FAQScreen onBack={goBack} />;
    case ROUTES.CONTACT: return <ContactScreen onBack={goBack} showToast={showToast} />;
    case ROUTES.EMAIL_VERIFY: return <EmailVerification onBack={goBack} onVerified={() => navigate(ROUTES.HOME)} />;
    case ROUTES.NEW_PASSWORD: return <NewPassword onBack={goBack} showToast={showToast} />;
    case ROUTES.AI_SCENARIO: return <AIScenarioPicker onBack={goBack} onNavigate={navigate} onSelectScenario={(s) => { navigate(ROUTES.AI_CHAT); }} />;
    case ROUTES.DAY_DETAIL: return <DayDetailScreen date={route.id} onBack={goBack} />;
    case ROUTES.SCENE_PICKER: return <ScenePickerScreen onBack={goBack} onStartScene={onStartScene} />;
    default: return <HomeScreen onNavigate={navigate} />;
  }
}

function App() {
  useEffect(() => {
    async function init() {
      try { await getDB(); initOfflineQueueListener(); logger.info('Initialized'); }
      catch (e) { logger.error('Init failed', e); }
    }
    init();
  }, []);

  return (
    <AppProvider><AudioProvider><MainLayout /></AudioProvider></AppProvider>
  );
}

export default App;
