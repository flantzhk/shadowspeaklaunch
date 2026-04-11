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

const PUBLIC_ROUTES = [ROUTES.LOGIN, ROUTES.REGISTER, ROUTES.FORGOT_PASSWORD];

function MainLayout() {
  const { route, navigate, goBack } = useRouter();
  const { settings, isLoading, updateSettings } = useAppContext();
  const { showToast, ToastComponent } = useToast();
  const { handleSaveToLibrary, handleMarkKnown } = useLibraryActions(showToast, settings.currentLanguage);
  const [showNowPlaying, setShowNowPlaying] = useState(false);
  const [sessionSummary, setSessionSummary] = useState(null);
  const [activeScene, setActiveScene] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    waitForAuth().then((user) => {
      if (user) {
        const name = (user.displayName || '').split(' ')[0];
        const photoURL = user.photoURL || '';
        if (name && name !== settings.name) updateSettings({ name });
        if (photoURL) updateSettings({ photoURL });
      }
      setAuthReady(true);
    });
  }, []);

  if (isLoading || !authReady) return <Loader size={40} />;

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
        <OnboardingScreen onComplete={() => updateSettings({ onboardingCompleted: true })} />
      </Suspense>
    );
  }

  const isTab = [ROUTES.HOME, ROUTES.LIBRARY, ROUTES.PRACTICE].includes(route.path);
  const SESSION_ROUTES = [ROUTES.SHADOW_SESSION, ROUTES.PROMPT_DRILL, ROUTES.SPEED_RUN, ROUTES.TONE_GYM, ROUTES.DIALOGUE];
  const isSession = SESSION_ROUTES.includes(route.path);

  return (
    <>
      {isTab && <TopBar streak={settings.streakCount} language={settings.currentLanguage} userName={settings.name} photoURL={settings.photoURL} onSettingsTap={() => navigate(ROUTES.SETTINGS)} onStatsTap={() => navigate(ROUTES.STATS)} />}

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

      {sessionSummary && (
        <Suspense fallback={null}>
          <SessionSummary summary={sessionSummary}
            onDone={() => { setSessionSummary(null); navigate(ROUTES.HOME); }} />
        </Suspense>
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
    case ROUTES.SETTINGS: return <SettingsScreen onBack={goBack} />;
    case ROUTES.TOPIC_DETAIL: return <TopicDetailScreen topicId={route.id} onBack={goBack} showToast={showToast} onStartScene={onStartScene} />;
    case ROUTES.CUSTOM_PHRASE: return <CustomPhraseInput onBack={goBack} showToast={showToast} />;
    case ROUTES.WHAT_DID_THEY_SAY: return <WhatDidTheySay onBack={goBack} showToast={showToast} />;
    case ROUTES.AI_CHAT: return <AIConversation onBack={goBack} showToast={showToast} />;
    case ROUTES.STATS: return <StatsScreen onBack={goBack} />;
    case ROUTES.SEARCH: return <SearchScreen onBack={goBack} onNavigate={navigate} />;
    case ROUTES.PRIVACY: return <LegalPages onBack={goBack} />;
    case ROUTES.TERMS: return <TermsPage onBack={goBack} />;
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
