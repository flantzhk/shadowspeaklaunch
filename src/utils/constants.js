// src/utils/constants.js — App-wide constants

export const APP_VERSION = '1.15.34';
export const MAX_LIBRARY_SIZE = 50;
export const SECONDS_PER_PHRASE = 40;
export const PRONUNCIATION_PASS_THRESHOLD = { cantonese: 90, mandarin: 70, english: 70 };
export const SCORE_THRESHOLDS = { EXCELLENT: 90, GOOD: 70, FAIR: 50 };
export const SRS_INITIAL_EASE = 2.5;
export const SRS_MIN_EASE = 1.3;
export const SRS_MAX_EASE = 3.0;
export const SRS_MAX_INTERVAL = 180;
export const SRS_MASTERED_THRESHOLD = 14;
export const RECORDING_MAX_SECONDS = 10;
export const API_BASE_URL = 'https://shadowspeak-api.faith-lantz-ee8.workers.dev';
export const API_ENDPOINTS = {
  SCORE_PRONUNCIATION: '/score-pronunciation',
  TTS: '/tts',
  TTS_ENGLISH: '/tts-english',
  STT: '/stt',
  TEXT_TO_JYUTPING: '/text-to-jyutping',
  AI_CHAT: '/ai-chat',
  PUSH_SUBSCRIBE: '/push-subscribe',
  PUSH_UNSUBSCRIBE: '/push-unsubscribe',
};

// VAPID public key for Web Push subscriptions (non-secret — safe to ship in JS)
export const VAPID_PUBLIC_KEY = 'BCmqvXWvZ-9ES9BJWC9fkC_RoZ16Fh3p3i5IB1uF_YpdM54OUeBTfrCKppryPIx0_6dB6SQcDixoD22J1Y2Q08M';
export const AUDIO_CACHE_NAME = 'shadowspeak-audio-v1';
export const APP_CACHE_NAME = 'shadowspeak-app-v1';
export const DB_NAME = 'shadowspeak';
export const DB_VERSION = 1;
export const MAX_RETRIES = 2;
export const RETRY_DELAY_MS = 1000;
export const API_TIMEOUT_MS = 30000;
export const AUTO_ADVANCE_DELAY_MS = 1500;
export const SEARCH_DEBOUNCE_MS = 300;

export const ROUTES = {
  HOME: 'home',
  LIBRARY: 'library',
  PRACTICE: 'practice',
  TOPIC_DETAIL: 'topic',
  SETTINGS: 'settings',
  STATS: 'stats',
  SHADOW_SESSION: 'session',
  PROMPT_DRILL: 'prompt',
  SPEED_RUN: 'speedrun',
  TONE_GYM: 'tonegym',
  DIALOGUE: 'dialogue',
  AI_CHAT: 'ai',
  AI_SCENARIO: 'ai-scenario',
  CUSTOM_PHRASE: 'custom-phrase',
  LOGIN: 'login',
  REGISTER: 'register',
  FORGOT_PASSWORD: 'forgot-password',
  NEW_PASSWORD: 'new-password',
  EMAIL_VERIFY: 'email-verify',
  WELCOME: 'welcome',
  SEARCH: 'search',
  PRIVACY: 'privacy',
  TERMS: 'terms',
  PROFILE: 'profile',
  ABOUT: 'about',
  FAQ: 'faq',
  CONTACT: 'contact',
  LICENSES: 'licenses',
  DAY_DETAIL: 'day-detail',
  SCENE_PICKER: 'scene-picker',
};

export const DAILY_GOAL_OPTIONS = [5, 10, 15, 20, 30];

export const DEFAULT_USER_SETTINGS = {
  name: '',
  email: '',
  dailyGoalMinutes: 10,
  reminderTime: null,
  currentLanguage: 'cantonese',
  showCharacters: true,
  showEnglish: true,
  showRomanization: true,
  autoAdvance: true,
  defaultSpeed: 'natural',
  streakCount: 0,
  streakLastDate: null,
  streakFreezeUsedWeek: null,
  totalPracticeSeconds: 0,
  onboardingCompleted: false,
  // 'system' | 'light' | 'dark'
  themePreference: 'system',
};
