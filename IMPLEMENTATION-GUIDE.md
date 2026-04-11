# SHADOWSPEAK — CLAUDE CODE IMPLEMENTATION GUIDE

> **This is the single source of truth.** Read this entire document before writing any code. Every decision has been made. Your job is to execute cleanly, verify thoroughly, and ship something bulletproof.

---

## TABLE OF CONTENTS

1. [Project Identity](#1-project-identity)
2. [Architecture](#2-architecture)
3. [Coding Standards](#3-coding-standards)
4. [Design System](#4-design-system)
5. [Data Schemas](#5-data-schemas)
6. [cantonese.ai API Reference](#6-cantoneseai-api-reference)
7. [Offline Architecture](#7-offline-architecture)
8. [Core Services](#8-core-services)
9. [Components](#9-components)
10. [Sprint Tasks with Verification](#10-sprint-tasks-with-verification)
11. [Security](#11-security)
12. [App Store Readiness](#12-app-store-readiness)
13. [Error Handling Patterns](#13-error-handling-patterns)
14. [Performance Budget](#14-performance-budget)
15. [Accessibility Requirements](#15-accessibility-requirements)
16. [Content Philosophy and Rules](#a1-content-philosophy)
17. [Topic Content Manifest](#a2-topic-content-manifest)
18. [Phrase Data File Format](#a3-phrase-data-file-format)
19. [Offline Download System](#a4-offline-download-system)
20. [Content Generation Workflow](#a5-content-generation-workflow)

---

## 1. PROJECT IDENTITY

**App name:** ShadowSpeak
**Tagline:** Learn to speak Cantonese. Not read it. Not write it. Speak it.
**What it does:** Audio-first language learning app using the shadowing method (listen, repeat, score). Designed for English-speaking expat families in Hong Kong.
**Platform targets:** PWA (primary), iOS App Store via Capacitor, Google Play Store via Capacitor.
**Current state:** Working single-file React/JSX app deployed at flantzhk.github.io. Has basic phrase content, shadow mode, pronunciation quiz via cantonese.ai. Needs restructuring, offline support, missing screens, AI features.

**Languages supported (now):** Cantonese (primary)
**Languages supported (soon):** Mandarin
**Languages supported (later):** Abstracted so any language can be added via a JSON language pack.

---

## 2. ARCHITECTURE

### 2.1 Project structure

```
shadowspeak/
├── public/
│   ├── index.html
│   ├── manifest.json          # PWA manifest
│   ├── sw.js                  # Service worker (generated)
│   └── icons/                 # App icons (all sizes)
├── src/
│   ├── main.jsx               # Entry point, renders App
│   ├── App.jsx                # Root: router, context providers, layout shell
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── TabBar.jsx           # Bottom tab navigation
│   │   │   ├── MiniPlayer.jsx       # Persistent now-playing bar
│   │   │   └── TopBar.jsx           # Logo, streak, avatar
│   │   │
│   │   ├── screens/
│   │   │   ├── HomeScreen.jsx       # Today's lesson, library summary, categories
│   │   │   ├── LibraryScreen.jsx    # Phrases/Vocab toggle, queue, cards
│   │   │   ├── PracticeScreen.jsx   # Practice modes hub
│   │   │   ├── TopicDetailScreen.jsx
│   │   │   ├── NowPlayingScreen.jsx # Full player (expanded mini player)
│   │   │   ├── SettingsScreen.jsx
│   │   │   ├── StatsScreen.jsx      # Progress dashboard
│   │   │   ├── OnboardingScreen.jsx
│   │   │   ├── ShadowSession.jsx    # Active lesson playback
│   │   │   ├── PromptDrill.jsx      # "Your turn" mode
│   │   │   ├── SpeedRun.jsx         # Rapid recall game
│   │   │   ├── ToneGym.jsx          # Ear training
│   │   │   ├── DialogueScene.jsx    # Conversation flow practice
│   │   │   └── AIConversation.jsx   # AI chat partner
│   │   │
│   │   ├── cards/
│   │   │   ├── PhraseCard.jsx       # Collapsed/expanded phrase
│   │   │   ├── VocabCard.jsx        # Individual word card
│   │   │   ├── TopicCard.jsx        # Topic thumbnail in category row
│   │   │   ├── HeroCard.jsx         # Today's lesson hero
│   │   │   └── ScoreBadge.jsx       # Pronunciation score display
│   │   │
│   │   └── shared/
│   │       ├── Button.jsx
│   │       ├── Toggle.jsx
│   │       ├── SegmentedControl.jsx
│   │       ├── ProgressBar.jsx
│   │       ├── Modal.jsx
│   │       ├── Toast.jsx
│   │       └── LoadingSpinner.jsx
│   │
│   ├── contexts/
│   │   ├── AppContext.jsx           # Global state: user, settings, current language
│   │   ├── AudioContext.jsx         # Playback state, queue, current phrase
│   │   ├── LibraryContext.jsx       # Library phrases, vocab, SRS state
│   │   └── SessionContext.jsx       # Active lesson/practice session state
│   │
│   ├── services/
│   │   ├── api.js                   # cantonese.ai API wrapper
│   │   ├── audio.js                 # Playback engine, recording, caching
│   │   ├── srs.js                   # Spaced repetition algorithm
│   │   ├── lessonBuilder.js         # Smart lesson generation
│   │   ├── offlineManager.js        # Service worker registration, cache management
│   │   ├── storage.js               # IndexedDB wrapper
│   │   └── analytics.js             # Event tracking (privacy-respecting)
│   │
│   ├── hooks/
│   │   ├── useAudio.js              # Audio playback hook
│   │   ├── useRecorder.js           # Microphone recording hook
│   │   ├── useOnlineStatus.js       # Network status hook
│   │   └── useSRS.js                # SRS scheduling hook
│   │
│   ├── utils/
│   │   ├── constants.js             # App-wide constants
│   │   ├── formatters.js            # Date, time, score formatting
│   │   ├── validators.js            # Input validation
│   │   └── jyutping.js              # Jyutping display utilities
│   │
│   ├── data/
│   │   ├── languages/
│   │   │   ├── cantonese.json       # Language pack: Cantonese
│   │   │   └── mandarin.json        # Language pack: Mandarin
│   │   ├── topics/
│   │   │   ├── cantonese/
│   │   │   │   ├── the-very-basics.json
│   │   │   │   ├── food-and-drink.json
│   │   │   │   ├── social-life.json
│   │   │   │   ├── home-and-family.json
│   │   │   │   └── getting-around.json
│   │   │   └── mandarin/
│   │   │       └── ...
│   │   └── dialogues/
│   │       ├── cantonese/
│   │       │   ├── restaurant-scenes.json
│   │       │   ├── taxi-scenes.json
│   │       │   └── ...
│   │       └── mandarin/
│   │           └── ...
│   │
│   └── styles/
│       ├── variables.css            # CSS custom properties (design tokens)
│       ├── reset.css                # Minimal CSS reset
│       └── global.css               # Global styles, typography
│
├── capacitor.config.ts              # Capacitor config for native builds
├── vite.config.js                   # Vite bundler config
├── package.json
├── CHANGELOG.md
└── IMPLEMENTATION-GUIDE.md          # This file
```

### 2.2 Tech stack

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | React 18 with JSX | Already in use, Claude Code knows it deeply |
| Bundler | Vite | Fast builds, native ESM, good PWA plugin |
| Styling | CSS Modules + CSS custom properties | Scoped styles, no runtime cost, design tokens via variables |
| State | React Context + useReducer | No external deps, sufficient for this app scale |
| Routing | Simple hash-based router (custom) | No react-router dependency, lighter bundle, works offline |
| Offline | Service Worker (Workbox via vite-plugin-pwa) + IndexedDB (idb wrapper) | Industry standard PWA offline |
| Native wrapper | Capacitor 6 | Builds iOS + Android from same web codebase |
| Audio | HTML5 Audio API + MediaRecorder API | Browser-native, no dependencies |
| HTTP | fetch (native) | No axios needed, lighter bundle |
| Testing | Manual verification per sprint | Detailed verification checklists below |

### 2.3 Dependencies (keep this list minimal)

```json
{
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "idb": "^8.0.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.0",
    "vite": "^5.4.0",
    "vite-plugin-pwa": "^0.20.0",
    "@capacitor/core": "^6.0.0",
    "@capacitor/cli": "^6.0.0",
    "@capacitor/ios": "^6.0.0",
    "@capacitor/android": "^6.0.0",
    "@capacitor/filesystem": "^6.0.0",
    "@capacitor/network": "^6.0.0",
    "@capacitor/haptics": "^6.0.0",
    "@capacitor/local-notifications": "^6.0.0",
    "@capacitor/splash-screen": "^6.0.0",
    "@capacitor/status-bar": "^6.0.0"
  }
}
```

**Rule: Do NOT add any dependency not listed here without explicit approval.** Every extra dependency is bundle weight, a security surface, and a maintenance burden.

---

## 3. CODING STANDARDS

### 3.1 Rules Claude Code must follow

```
1. NO default exports except for screen components.
   Every service, hook, utility, and shared component uses named exports.

2. NO inline styles except for truly dynamic values (e.g., progress bar width).
   All styling goes in CSS Modules.

3. NO magic numbers. Every number goes in constants.js with a descriptive name.
   BAD:  if (score >= 90)
   GOOD: if (score >= PRONUNCIATION_PASS_THRESHOLD)

4. NO console.log in committed code. Use a logger utility that can be toggled.
   The logger is silent in production builds.

5. NO any types in JSDoc. Document every function parameter and return type.

6. NO nested ternaries. Use early returns or if/else blocks.

7. NO async operations without try/catch and user-facing error handling.

8. NO direct DOM manipulation. Everything goes through React state.

9. NO setTimeout/setInterval without cleanup in useEffect return.

10. Every component file must be under 200 lines. If longer, split it.

11. Every service file must be under 300 lines. If longer, split it.

12. NO circular imports. Services never import from components.
    Import direction: components → hooks → services → utils → constants
```

### 3.2 File template — component

```jsx
// src/components/cards/ScoreBadge.jsx
import { memo } from 'react';
import styles from './ScoreBadge.module.css';
import { SCORE_THRESHOLDS } from '../../utils/constants';

/**
 * Displays a pronunciation score as a colored badge.
 * @param {Object} props
 * @param {number} props.score - Score from 0-100
 * @param {'compact'|'full'} [props.variant='compact'] - Display variant
 */
function ScoreBadge({ score, variant = 'compact' }) {
  const level = score >= SCORE_THRESHOLDS.EXCELLENT ? 'excellent'
    : score >= SCORE_THRESHOLDS.GOOD ? 'good'
    : score >= SCORE_THRESHOLDS.FAIR ? 'fair'
    : 'needs-work';

  return (
    <div className={`${styles.badge} ${styles[level]} ${styles[variant]}`}>
      <span className={styles.score}>{score}</span>
      {variant === 'full' && (
        <span className={styles.label}>{level.replace('-', ' ')}</span>
      )}
    </div>
  );
}

export { ScoreBadge };
```

### 3.3 File template — service

```js
// src/services/api.js

/**
 * cantonese.ai API wrapper.
 * All API calls go through this module.
 * Handles: authentication, error normalization, retry logic, offline queueing.
 */

import { storage } from './storage';
import { API_BASE_URL, API_ENDPOINTS, MAX_RETRIES, RETRY_DELAY_MS } from '../utils/constants';

/**
 * Score user pronunciation against expected text.
 * @param {Blob} audioBlob - Recorded audio
 * @param {string} expectedText - The Chinese text to compare against
 * @param {'cantonese'|'english'|'mandarin'} language
 * @returns {Promise<{score: number, passed: boolean, expectedJyutping: string, transcribedJyutping: string}>}
 * @throws {ApiError} On network failure or API error
 */
async function scorePronunciation(audioBlob, expectedText, language = 'cantonese') {
  const formData = new FormData();
  formData.append('api_key', getApiKey());
  formData.append('audio', audioBlob, 'recording.ogg');
  formData.append('text', expectedText);
  formData.append('language', language);

  const response = await fetchWithRetry(
    `${API_BASE_URL}${API_ENDPOINTS.SCORE_PRONUNCIATION}`,
    { method: 'POST', body: formData }
  );

  return response;
}

// ... (other API methods follow same pattern)

export { scorePronunciation, textToSpeech, speechToText, textToJyutping, translate };
```

### 3.4 Naming conventions

| Thing | Convention | Example |
|-------|-----------|---------|
| Components | PascalCase | `PhraseCard.jsx` |
| Services | camelCase | `lessonBuilder.js` |
| Hooks | camelCase with `use` prefix | `useAudio.js` |
| CSS Modules | camelCase properties | `styles.phraseCard` |
| Constants | UPPER_SNAKE_CASE | `MAX_LIBRARY_SIZE` |
| Event handlers | `handle` + noun + verb | `handlePhrasePlay` |
| Boolean state | `is` / `has` prefix | `isPlaying`, `hasAudio` |
| Data files | kebab-case | `food-and-drink.json` |

---

## 4. DESIGN SYSTEM

### 4.1 Design tokens (CSS custom properties)

```css
/* src/styles/variables.css */

:root {
  /* === Colors === */
  --color-bg:             #F7F4EC;    /* Warm off-white background */
  --color-bg-page:        #EDE8DC;    /* Outer page/body background */
  --color-surface:        #FFFFFF;    /* Card backgrounds */
  --color-surface-raised: #FFFFFF;    /* Elevated cards */
  --color-border:         rgba(0, 0, 0, 0.06);
  --color-border-strong:  rgba(0, 0, 0, 0.12);

  --color-text-primary:   #1A1A1A;
  --color-text-secondary: #5A5A5A;
  --color-text-tertiary:  #7A7A7A;
  --color-text-muted:     #9A9A9A;
  --color-text-inverse:   #FFFFFF;

  --color-brand-dark:     #1A2A18;    /* Deep olive — player bar, active toggles */
  --color-brand-green:    #8BB82B;    /* Mid green — mastered badges, wordmark */
  --color-brand-lime:     #C5E85A;    /* Lime — CTAs, progress, active states */
  --color-brand-lime-muted: rgba(197, 232, 90, 0.15);

  --color-streak-orange:  #E8703A;    /* Streak flame */
  --color-streak-bg:      #FFF0D8;    /* Streak chip background */
  --color-streak-text:    #8A3810;

  --color-learning-bg:    #FFF0D8;    /* Learning status badge */
  --color-learning-text:  #8A3810;
  --color-mastered-bg:    #E8F1D4;    /* Mastered status badge */
  --color-mastered-text:  #2A5A10;

  --color-score-excellent: #2A5A10;
  --color-score-good:      #8BB82B;
  --color-score-fair:      #E8A030;
  --color-score-poor:      #D04040;

  --color-error:           #D04040;
  --color-warning:         #E8A030;
  --color-success:         #2A5A10;

  --color-jyutping:        #4A6A2A;   /* Jyutping romanization text */

  /* === Typography === */
  --font-family:           -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", system-ui, sans-serif;
  --font-family-mono:      "SF Mono", "Menlo", monospace;

  --font-size-xs:          10px;
  --font-size-sm:          12px;
  --font-size-base:        14px;
  --font-size-md:          16px;
  --font-size-lg:          18px;
  --font-size-xl:          22px;
  --font-size-2xl:         24px;
  --font-size-3xl:         32px;

  --font-weight-normal:    400;
  --font-weight-medium:    500;
  --font-weight-semibold:  600;
  --font-weight-bold:      700;

  --line-height-tight:     1.15;
  --line-height-normal:    1.4;
  --line-height-relaxed:   1.6;

  --letter-spacing-tight:  -0.5px;
  --letter-spacing-normal: -0.2px;
  --letter-spacing-wide:   1.2px;

  /* === Spacing === */
  --space-xs:    4px;
  --space-sm:    8px;
  --space-md:    12px;
  --space-base:  16px;
  --space-lg:    20px;
  --space-xl:    24px;
  --space-2xl:   32px;
  --space-3xl:   40px;

  /* === Radii === */
  --radius-sm:   8px;
  --radius-md:   12px;
  --radius-lg:   16px;
  --radius-xl:   22px;
  --radius-pill:  999px;
  --radius-circle: 50%;

  /* === Shadows === */
  --shadow-card:    0 1px 3px rgba(0, 0, 0, 0.04);
  --shadow-raised:  0 4px 12px rgba(0, 0, 0, 0.08);
  --shadow-player:  0 -4px 20px rgba(0, 0, 0, 0.12);
  --shadow-phone:   0 30px 80px rgba(0, 0, 0, 0.15);

  /* === Transitions === */
  --transition-fast:   150ms ease;
  --transition-normal: 250ms ease;
  --transition-slow:   400ms ease;

  /* === Z-index layers === */
  --z-base:      1;
  --z-card:      10;
  --z-player:    100;
  --z-modal:     200;
  --z-toast:     300;
  --z-overlay:   400;

  /* === Layout === */
  --safe-area-top:    env(safe-area-inset-top, 0px);
  --safe-area-bottom: env(safe-area-inset-bottom, 0px);
  --player-height:    140px;
  --tab-bar-height:   56px;
  --top-bar-height:   52px;
  --content-padding:  22px;
}
```

### 4.2 Visual rules

1. **System font stack only.** No web font downloads. Fast load, native feel.
2. **Romanization is always the largest text** on any phrase display. Chinese characters are secondary. English is tertiary.
3. **Lime green (#C5E85A) is exclusively for interactive elements**: buttons, progress bars, active states. Never used for static text or backgrounds without interaction.
4. **No emojis in the UI.** All icons are SVG or CSS-drawn.
5. **Card border:** `0.5px solid var(--color-border)` with `border-radius: var(--radius-md)`.
6. **All tap targets minimum 44x44px** (Apple HIG requirement for App Store).
7. **Font sizes never below 10px** (App Store accessibility requirement).
8. **No horizontal scroll without visual overflow indicator** (half-visible card at edge).

---

## 5. DATA SCHEMAS

### 5.1 Language pack

```typescript
// Each language is defined by a pack file in src/data/languages/

interface LanguagePack {
  id: string;                         // "cantonese"
  name: string;                       // "Cantonese"
  nativeName: string;                 // "廣東話"
  romanizationSystem: string;         // "Jyutping"
  romanizationLabel: string;          // "JYUTPING" (display label)
  apiLanguage: string;                // "cantonese" (for cantonese.ai API calls)
  pronunciationPassThreshold: number; // 90 for Cantonese, 70 for Mandarin/English
  characterSystem: "traditional" | "simplified";
  ttsVoiceId: string;                 // Default voice ID for TTS
  ttsVoiceIdAlt: string;             // Alternate voice (for dialogue "other" speaker)
  categories: string[];               // ["the-very-basics", "food-and-drink", ...]
  starterPhraseIds: string[];         // 5 phrases pre-loaded into library on Day 1
}
```

### 5.2 Topic

```typescript
interface Topic {
  id: string;                   // "ordering-coffee"
  category: string;             // "food-and-drink"
  name: string;                 // "Ordering coffee"
  description: string;          // "Cha chaan teng, milk tea, iced drinks"
  phraseCount: number;          // 35
  imageGradient: string;        // CSS gradient string for placeholder artwork
  imageUrl: string | null;      // Real photo URL when available
  phrases: Phrase[];
  dialogueScenes: string[];     // IDs of dialogue scenes in this topic
}
```

### 5.3 Phrase

```typescript
interface Phrase {
  id: string;                       // "coffee-001"
  topicId: string;                  // "ordering-coffee"
  romanization: string;             // "Ngo⁵ seung² yiu³ yat¹ bui¹ naai⁵ cha⁴"
  jyutping: string;                 // "ngo5 seung2 jiu3 jat1 bui1 naai5 caa4"
  chinese: string;                  // "我想要一杯奶茶"
  english: string;                  // "I'd like a milk tea"
  context: string;                  // "Ordering at a cha chaan teng"
  difficulty: 1 | 2 | 3;           // 1=beginner, 2=intermediate, 3=advanced
  words: Word[];
  audioUrl: string | null;          // Cached audio URL (null = needs generation)
  audioDuration: number | null;     // Duration in seconds
}

interface Word {
  chinese: string;             // "奶茶"
  jyutping: string;            // "naai5 caa4"
  english: string;             // "milk tea"
}
```

### 5.4 Library entry (stored in IndexedDB)

```typescript
interface LibraryEntry {
  phraseId: string;
  type: "phrase" | "vocab";
  addedAt: number;                 // Unix timestamp
  source: "browse" | "custom" | "ai-conversation" | "starter";
  customData: {                    // Only for source="custom"
    chinese: string;
    jyutping: string;
    english: string;
  } | null;

  // SRS fields
  interval: number;                // Days until next review (starts at 0)
  easeFactor: number;              // Starts at 2.5, adjusts based on performance
  nextReviewAt: number;            // Unix timestamp of next scheduled review
  lastPracticedAt: number | null;  // Unix timestamp
  practiceCount: number;           // Total times practiced
  status: "learning" | "mastered"; // mastered = interval >= 14 days

  // Pronunciation tracking
  bestScore: number | null;
  lastScore: number | null;
  scoreHistory: { score: number; at: number }[];  // Last 10 scores
}
```

### 5.5 Session record (stored in IndexedDB)

```typescript
interface SessionRecord {
  id: string;                    // UUID
  date: string;                  // "2026-04-10"
  startedAt: number;             // Unix timestamp
  completedAt: number;           // Unix timestamp
  durationSeconds: number;
  mode: "shadow" | "prompt" | "speed-run" | "tone-gym" | "dialogue" | "ai-conversation";
  phrasesAttempted: number;
  phrasesMastered: number;       // Moved to mastered during this session
  averageScore: number | null;
  phraseResults: {
    phraseId: string;
    score: number | null;
    replays: number;             // How many times they replayed this phrase
    markedKnown: boolean;
  }[];
}
```

### 5.6 User settings (stored in IndexedDB)

```typescript
interface UserSettings {
  name: string;                         // "Faith"
  dailyGoalMinutes: 5 | 10 | 15 | 20 | 30;
  reminderTime: string | null;          // "08:00" or null for no reminder
  currentLanguage: string;              // "cantonese"
  showCharacters: boolean;              // Default true
  showEnglish: boolean;                 // Default true
  showRomanization: boolean;            // Always true, cannot be turned off
  autoAdvance: boolean;                 // Default true
  defaultSpeed: "slower" | "natural";   // Default "natural"
  streakCount: number;
  streakLastDate: string | null;        // "2026-04-10"
  totalPracticeSeconds: number;
  onboardingCompleted: boolean;
  apiKey: string;                       // cantonese.ai API key (encrypted at rest)
}
```

### 5.7 Dialogue scene

```typescript
interface DialogueScene {
  id: string;                        // "restaurant-asking-for-bill"
  topicId: string;
  title: string;                     // "Asking for the bill"
  description: string;               // "You've finished eating and want to pay"
  turns: DialogueTurn[];
}

interface DialogueTurn {
  speaker: "user" | "other";         // "user" = learner shadows this line
  speakerLabel: string;              // "You" or "Waiter"
  phraseId: string | null;           // Links to phrase DB if it's a library-eligible phrase
  chinese: string;
  jyutping: string;
  romanization: string;              // Display romanization with tone marks
  english: string;
  voiceId: string | null;            // Different TTS voice for "other" speaker
  pauseAfterMs: number;              // Pause before next turn (default 2000)
}
```

---

## 6. CANTONESE.AI API REFERENCE

### 6.1 Base URL and authentication

```
Base URL: https://cantonese.ai/api
Auth: API key passed as form field or JSON body parameter
```

### 6.2 Endpoints

#### Score Pronunciation
```
POST /score-pronunciation
Content-Type: multipart/form-data

Fields:
  api_key:   string (required)
  audio:     file   (required) — wav, mp3, m4a, flac, ogg. Max 10MB.
  text:      string (required) — Target Chinese text
  language:  string (optional) — "cantonese" (default), "english", "mandarin"

Response (Cantonese):
{
  "success": true,
  "score": 95,                              // 0-100
  "expectedJyutping": "nei5 hou2 maa3",
  "transcribedJyutping": "nei5 hou2 maa3",
  "passed": true,                           // true if score >= 90
  "language": "cantonese"
}

Response (Mandarin/English):
{
  "success": true,
  "score": 88,
  "passed": true,
  "expectedText": "Hello, good morning.",
  "transcribedText": "Hello, good morning.",
  "wordScores": [{ "word": "Hello", "score": 90 }, ...],
  "fluencyScore": 92,
  "integrityScore": 100,
  "pronunciationScore": 88,
  "language": "english"
}
```

#### Text-to-Speech
```
POST /tts
Content-Type: application/json

Body:
{
  "api_key":    string (required),
  "text":       string (required, max 5000 chars),
  "language":   string (optional, default "cantonese"),
  "speed":      number (optional, 0.5-3.0, default 1.0),
  "pitch":      number (optional, -12 to +12, default 0),
  "voice_id":   string (optional),
  "output_extension": "wav" | "mp3" (optional, default "wav"),
  "frame_rate": string (optional, default "24000"),
  "should_return_timestamp": boolean (optional, default false),
  "should_use_turbo_model": boolean (optional, default false)
}

Response (should_return_timestamp = false):
  → Direct audio file binary (wav or mp3)

Response (should_return_timestamp = true):
{
  "file": "base64-encoded-audio-string",
  "request_id": "uuid",
  "srt_timestamp": "1\n00:00:00,000 --> 00:00:01,984\n你好\n\n",
  "timestamps": [{ "start": 0, "end": 1.984, "text": "你好" }]
}
```

**IMPORTANT for TTS:**
- Always request `"output_extension": "mp3"` for smaller cache size
- Use `"speed": 0.75` for SLOWER mode, `"speed": 1.0` for NATURAL mode
- Use `"should_use_turbo_model": true` for faster generation during real-time custom phrase creation
- Pre-generate and cache at both speeds for library phrases

#### Speech-to-Text
```
POST /stt
Content-Type: multipart/form-data

Fields:
  api_key:            string  (required)
  data:               file    (required) — wav, mp3, m4a, flac, ogg
  with_timestamp:     boolean (optional, default false)
  with_diarization:   boolean (optional, default false)

Response:
{
  "text": "你好嗎",
  "duration": "2.340000",
  "process_time": "0.19"
}
```

#### Text to Jyutping
```
POST /text-to-jyutping
Content-Type: application/json
(No API key required — free endpoint)

Body:
{
  "text": "你好嗎",
  "outputType": "list"          // "text" or "list"
}

Response (outputType = "list"):
{
  "success": true,
  "result": [
    { "character": "你", "jyutping": "nei5" },
    { "character": "好", "jyutping": "hou2" },
    { "character": "嗎", "jyutping": "maa3" }
  ]
}
```

### 6.3 API wrapper implementation pattern

```js
// src/services/api.js

const API_BASE = 'https://cantonese.ai/api';

class ApiError extends Error {
  constructor(message, status, endpoint) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.endpoint = endpoint;
  }
}

async function fetchWithRetry(url, options, maxRetries = 2) {
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        ...options,
        signal: AbortSignal.timeout(30000), // 30s timeout
      });

      if (response.status === 429) {
        // Rate limited — wait and retry
        const waitMs = Math.min(1000 * Math.pow(2, attempt), 8000);
        await new Promise(r => setTimeout(r, waitMs));
        continue;
      }

      if (!response.ok) {
        throw new ApiError(
          `API error: ${response.status}`,
          response.status,
          url
        );
      }

      return response;
    } catch (error) {
      lastError = error;
      if (error.name === 'AbortError') {
        throw new ApiError('Request timed out', 408, url);
      }
      if (attempt < maxRetries) {
        await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
      }
    }
  }

  throw lastError;
}

function getApiKey() {
  // Retrieved from IndexedDB user settings
  // Never hardcoded, never in source code
  const key = _cachedApiKey;
  if (!key) throw new ApiError('API key not configured', 401, 'config');
  return key;
}
```

### 6.4 API call budget per session

Estimate for cost management:

| Action | API calls | Frequency |
|--------|-----------|-----------|
| Generate phrase audio (TTS) | 1 per phrase | Once per phrase (cached forever) |
| Score pronunciation | 1 per phrase practiced | Every shadow session |
| Custom phrase Jyutping | 1 per custom phrase | Rare |
| Custom phrase TTS | 1 per custom phrase | Rare |
| AI conversation turn | 1 per turn | Premium feature |

A typical daily session (15 phrases) = ~15 pronunciation scoring calls + 0 TTS calls (cached).

---

## 7. OFFLINE ARCHITECTURE

### 7.1 Cache strategy

```
┌─────────────────────────────────────────────┐
│                  ONLINE                      │
│                                             │
│  cantonese.ai API ←──── API Service ───→ Queue (IndexedDB)
│         │                    │                    │
│         ▼                    ▼                    │
│    Audio files          JSON responses            │
│         │                    │                    │
│         ▼                    ▼                    │
│    Cache API            IndexedDB                 │
│    (audio blobs)        (structured data)         │
│         │                    │                    │
│         └──────────┬─────────┘                    │
│                    ▼                              │
│              Service Worker                       │
│              (cache-first for assets)             │
│                    │                              │
│         ┌──────────┴──────────┐                   │
│         ▼                    ▼                    │
│    App Shell              Audio Files             │
│    (HTML/CSS/JS)         (per phrase)             │
│                                                   │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│                 OFFLINE                      │
│                                             │
│  App Shell ──── from Service Worker cache    │
│  Phrase data ── from IndexedDB               │
│  Audio files ── from Cache API               │
│  SRS state ──── from IndexedDB               │
│  Session data ─ from IndexedDB               │
│  Scoring ────── QUEUED (scored when online)   │
│  AI chat ────── UNAVAILABLE (shown clearly)   │
│                                             │
└─────────────────────────────────────────────┘
```

### 7.2 IndexedDB schema

```js
// src/services/storage.js
// Using 'idb' wrapper for cleaner IndexedDB API

import { openDB } from 'idb';

const DB_NAME = 'shadowspeak';
const DB_VERSION = 1;

async function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // User settings (single row)
      db.createObjectStore('settings', { keyPath: 'id' });

      // Library entries
      const library = db.createObjectStore('library', { keyPath: 'phraseId' });
      library.createIndex('by-status', 'status');
      library.createIndex('by-next-review', 'nextReviewAt');
      library.createIndex('by-type', 'type');

      // Session records
      const sessions = db.createObjectStore('sessions', { keyPath: 'id' });
      sessions.createIndex('by-date', 'date');

      // Offline queue (pending API calls)
      db.createObjectStore('queue', { keyPath: 'id', autoIncrement: true });

      // Cached phrase metadata (so topics load offline)
      db.createObjectStore('phrases', { keyPath: 'id' });

      // Cached topic metadata
      db.createObjectStore('topics', { keyPath: 'id' });
    }
  });
}
```

### 7.3 Audio cache manager

```js
// src/services/audio.js (cache portion)

const AUDIO_CACHE_NAME = 'shadowspeak-audio-v1';

/**
 * Cache audio for a phrase at both speeds.
 * Call this when a phrase is saved to library.
 */
async function cacheAudioForPhrase(phrase, language) {
  const cache = await caches.open(AUDIO_CACHE_NAME);

  for (const speed of [0.75, 1.0]) {
    const cacheKey = `audio/${language}/${phrase.id}/${speed}`;
    const existing = await cache.match(cacheKey);
    if (existing) continue; // Already cached

    try {
      const audioBlob = await api.textToSpeech(phrase.chinese, {
        language,
        speed,
        outputExtension: 'mp3',
      });
      await cache.put(cacheKey, new Response(audioBlob));
    } catch (error) {
      // Non-fatal: audio will be generated on-demand when online
      logger.warn(`Failed to cache audio for ${phrase.id} at speed ${speed}`);
    }
  }
}

/**
 * Get cached audio for a phrase. Returns null if not cached.
 */
async function getCachedAudio(phraseId, language, speed) {
  const cache = await caches.open(AUDIO_CACHE_NAME);
  const cacheKey = `audio/${language}/${phraseId}/${speed}`;
  const response = await cache.match(cacheKey);
  if (!response) return null;
  return await response.blob();
}
```

### 7.4 Offline queue

```js
// When offline, queue API calls for later execution
async function queueForLater(action, data) {
  const db = await getDB();
  await db.add('queue', {
    action,       // "score-pronunciation", "sync-session", etc.
    data,         // Serializable data (audio as base64 for scoring)
    createdAt: Date.now(),
    attempts: 0,
  });
}

// Process queue when back online
async function processOfflineQueue() {
  const db = await getDB();
  const items = await db.getAll('queue');

  for (const item of items) {
    try {
      await executeQueuedAction(item);
      await db.delete('queue', item.id);
    } catch (error) {
      // Increment attempts, skip after 3 failures
      if (item.attempts >= 3) {
        await db.delete('queue', item.id);
      } else {
        await db.put('queue', { ...item, attempts: item.attempts + 1 });
      }
    }
  }
}

// Listen for online event
window.addEventListener('online', processOfflineQueue);
```

---

## 8. CORE SERVICES

### 8.1 SRS Algorithm (services/srs.js)

Use a simplified SM-2 algorithm. This is the same core algorithm behind Anki.

```js
/**
 * Calculate next review interval based on user response.
 *
 * @param {LibraryEntry} entry - Current library entry
 * @param {'correct'|'hard'|'forgot'} quality - How well the user recalled
 * @param {number|null} pronunciationScore - Score from 0-100, or null if not scored
 * @returns {Partial<LibraryEntry>} Updated SRS fields
 */
function calculateNextReview(entry, quality, pronunciationScore = null) {
  let { interval, easeFactor, practiceCount } = entry;

  // Adjust quality based on pronunciation score
  if (pronunciationScore !== null) {
    if (pronunciationScore >= 90) quality = 'correct';
    else if (pronunciationScore >= 70) quality = 'hard';
    else quality = 'forgot';
  }

  practiceCount += 1;

  if (quality === 'forgot') {
    // Reset to beginning
    interval = 0;
    easeFactor = Math.max(1.3, easeFactor - 0.2);
  } else if (quality === 'hard') {
    // Small increase
    interval = Math.max(1, Math.ceil(interval * 1.2));
    easeFactor = Math.max(1.3, easeFactor - 0.1);
  } else {
    // Normal progression
    if (interval === 0) interval = 1;
    else if (interval === 1) interval = 3;
    else interval = Math.ceil(interval * easeFactor);

    easeFactor = Math.min(3.0, easeFactor + 0.1);
  }

  // Cap interval at 180 days
  interval = Math.min(interval, 180);

  const now = Date.now();
  const nextReviewAt = now + interval * 24 * 60 * 60 * 1000;
  const status = interval >= 14 ? 'mastered' : 'learning';

  return {
    interval,
    easeFactor,
    practiceCount,
    nextReviewAt,
    lastPracticedAt: now,
    status,
  };
}

/**
 * Get all phrases due for review today.
 * Sorted by most overdue first.
 */
async function getDueForReview() {
  const db = await getDB();
  const now = Date.now();
  const all = await db.getAllFromIndex('library', 'by-next-review');
  return all
    .filter(entry => entry.nextReviewAt <= now)
    .sort((a, b) => a.nextReviewAt - b.nextReviewAt);
}
```

### 8.2 Lesson Builder (services/lessonBuilder.js)

```js
/**
 * Build today's lesson from the user's library + SRS state.
 *
 * @param {number} targetMinutes - 10, 20, or 30
 * @param {string} language - Current language ID
 * @returns {Promise<Phrase[]>} Ordered list of phrases for the session
 */
async function buildLesson(targetMinutes, language) {
  const SECONDS_PER_PHRASE = 120; // ~2 min per phrase (listen + repeat + pause)
  const targetPhrases = Math.floor((targetMinutes * 60) / SECONDS_PER_PHRASE);

  const dueForReview = await srs.getDueForReview();
  const libraryEntries = await storage.getAllLibraryEntries();
  const learningEntries = libraryEntries.filter(e => e.status === 'learning');

  const lesson = [];

  // Priority 1: Phrases due for review (max 60% of lesson)
  const reviewSlots = Math.floor(targetPhrases * 0.6);
  lesson.push(...dueForReview.slice(0, reviewSlots));

  // Priority 2: Learning phrases not yet due (fill remaining)
  const remaining = targetPhrases - lesson.length;
  const notYetDue = learningEntries
    .filter(e => !lesson.find(l => l.phraseId === e.phraseId))
    .sort((a, b) => (a.lastPracticedAt || 0) - (b.lastPracticedAt || 0));
  lesson.push(...notYetDue.slice(0, remaining));

  // Priority 3: If library is thin, pull from starter content
  if (lesson.length < targetPhrases) {
    const starterPhrases = await getStarterFallback(
      language,
      targetPhrases - lesson.length,
      lesson.map(l => l.phraseId)
    );
    lesson.push(...starterPhrases);
  }

  // Resolve phrase IDs to full phrase objects
  return resolvePhrasesForLesson(lesson);
}
```

### 8.3 Audio playback engine (services/audio.js)

```js
/**
 * Audio engine with queue management.
 * Handles: play, pause, seek, speed, repeat-one, auto-advance.
 */
class AudioEngine {
  constructor() {
    this._audio = new Audio();
    this._queue = [];
    this._currentIndex = 0;
    this._isRepeatOne = false;
    this._speed = 1.0; // 0.75 = slower, 1.0 = natural
    this._onPhraseChange = null;
    this._onStateChange = null;
    this._autoAdvance = true;

    this._audio.addEventListener('ended', () => this._handleEnded());
    this._audio.addEventListener('error', (e) => this._handleError(e));
  }

  /**
   * Load a lesson (ordered list of phrases) into the queue.
   */
  async loadQueue(phrases, language) {
    this._queue = phrases;
    this._currentIndex = 0;
    await this._loadCurrentPhrase(language);
  }

  async _loadCurrentPhrase(language) {
    const phrase = this._queue[this._currentIndex];
    if (!phrase) return;

    // Try cached audio first (offline support)
    const cached = await getCachedAudio(phrase.id, language, this._speed);
    if (cached) {
      this._audio.src = URL.createObjectURL(cached);
    } else {
      // Generate on-demand (requires online)
      const blob = await api.textToSpeech(phrase.chinese, {
        language,
        speed: this._speed,
        outputExtension: 'mp3',
      });
      this._audio.src = URL.createObjectURL(blob);
      // Cache for next time
      cacheAudioForPhrase(phrase, language).catch(() => {});
    }

    this._audio.playbackRate = 1.0; // Speed is baked into the TTS, not playback rate
    this._onPhraseChange?.(phrase, this._currentIndex);
  }

  play()  { this._audio.play(); this._onStateChange?.('playing'); }
  pause() { this._audio.pause(); this._onStateChange?.('paused'); }

  next(language)     { if (this._currentIndex < this._queue.length - 1) { this._currentIndex++; this._loadCurrentPhrase(language); } }
  previous(language) { if (this._currentIndex > 0) { this._currentIndex--; this._loadCurrentPhrase(language); } }

  setSpeed(speed, language) {
    this._speed = speed;
    this._loadCurrentPhrase(language); // Reload with new speed audio
  }

  get currentPhrase() { return this._queue[this._currentIndex] || null; }
  get progress()      { return { current: this._currentIndex + 1, total: this._queue.length }; }
  get currentTime()   { return this._audio.currentTime; }
  get duration()      { return this._audio.duration; }

  _handleEnded() {
    if (this._isRepeatOne) {
      this._audio.currentTime = 0;
      this._audio.play();
    } else if (this._autoAdvance && this._currentIndex < this._queue.length - 1) {
      this._currentIndex++;
      this._loadCurrentPhrase();
      // Brief pause before next phrase
      setTimeout(() => this.play(), 1500);
    } else {
      this._onStateChange?.('ended');
    }
  }

  _handleError(e) {
    logger.error('Audio playback error', e);
    this._onStateChange?.('error');
  }

  destroy() {
    this._audio.pause();
    this._audio.src = '';
    if (this._audio.src.startsWith('blob:')) {
      URL.revokeObjectURL(this._audio.src);
    }
  }
}
```

### 8.4 Microphone recorder (hooks/useRecorder.js)

```js
import { useState, useRef, useCallback } from 'react';

/**
 * Hook for recording user audio via MediaRecorder.
 * Returns audio as Blob for API submission.
 *
 * @returns {{
 *   isRecording: boolean,
 *   startRecording: () => Promise<void>,
 *   stopRecording: () => Promise<Blob>,
 *   error: string|null
 * }}
 */
function useRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      chunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
        }
      });

      // Prefer ogg/opus for smaller files, fall back to webm
      const mimeType = MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')
        ? 'audio/ogg;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : 'audio/webm';

      const recorder = new MediaRecorder(stream, { mimeType });

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch (err) {
      setError('Microphone access denied. Please enable it in your browser settings.');
    }
  }, []);

  const stopRecording = useCallback(() => {
    return new Promise((resolve) => {
      const recorder = mediaRecorderRef.current;
      if (!recorder || recorder.state === 'inactive') {
        resolve(null);
        return;
      }

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType });
        // Stop all audio tracks to release microphone
        recorder.stream.getTracks().forEach(track => track.stop());
        setIsRecording(false);
        resolve(blob);
      };

      recorder.stop();
    });
  }, []);

  return { isRecording, startRecording, stopRecording, error };
}

export { useRecorder };
```

---

## 9. COMPONENTS

### 9.1 Component hierarchy (rendering tree)

```
App
├── AppProvider (context)
│   ├── OnboardingScreen (if !onboardingCompleted)
│   └── MainLayout
│       ├── TopBar (logo, streak, avatar)
│       ├── ScreenRouter
│       │   ├── HomeScreen
│       │   │   ├── HeroCard (today's lesson)
│       │   │   ├── CustomPhraseCard
│       │   │   ├── LibrarySummaryCard
│       │   │   ├── SearchBar
│       │   │   └── CategoryRow[] (horizontal scroll of TopicCards)
│       │   │
│       │   ├── LibraryScreen
│       │   │   ├── SegmentedControl (Phrases / Vocab)
│       │   │   ├── FilterBar (Learning / Mastered)
│       │   │   ├── QueueMeter
│       │   │   ├── PhraseCard[] or VocabCard[]
│       │   │   └── AddPhraseButton
│       │   │
│       │   ├── PracticeScreen
│       │   │   ├── QuickReviewCard
│       │   │   └── PracticeModeRow (Shadow, Prompt, Speed Run, Tone Gym, Scene)
│       │   │
│       │   ├── TopicDetailScreen
│       │   ├── SettingsScreen
│       │   ├── StatsScreen
│       │   ├── ShadowSession
│       │   ├── PromptDrill
│       │   ├── SpeedRun
│       │   ├── ToneGym
│       │   ├── DialogueScene
│       │   └── AIConversation
│       │
│       ├── MiniPlayer (persistent, above tab bar)
│       ├── NowPlayingScreen (modal overlay when mini player tapped)
│       └── TabBar (Home, My Library, Practice)
```

### 9.2 Router implementation

No dependency. Hash-based routing.

```jsx
// Inside App.jsx

const ROUTES = {
  HOME: 'home',
  LIBRARY: 'library',
  PRACTICE: 'practice',
  TOPIC_DETAIL: 'topic',      // topic/:topicId
  SETTINGS: 'settings',
  STATS: 'stats',
  SHADOW_SESSION: 'session',
  PROMPT_DRILL: 'prompt',
  SPEED_RUN: 'speedrun',
  TONE_GYM: 'tonegym',
  DIALOGUE: 'dialogue',
  AI_CHAT: 'ai',
};

function useRouter() {
  const [route, setRoute] = useState(() => parseHash(window.location.hash));

  useEffect(() => {
    const handler = () => setRoute(parseHash(window.location.hash));
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);

  const navigate = useCallback((path, params = {}) => {
    const hash = params.id ? `#${path}/${params.id}` : `#${path}`;
    window.location.hash = hash;
  }, []);

  const goBack = useCallback(() => window.history.back(), []);

  return { route, navigate, goBack };
}

function parseHash(hash) {
  const clean = hash.replace('#', '');
  const [path, id] = clean.split('/');
  return { path: path || 'home', id: id || null };
}
```

---

## 10. SPRINT TASKS WITH VERIFICATION

Each sprint has:
- **Tasks**: What to build
- **Verify**: How to confirm it works correctly
- **Quality gate**: The standard it must meet before moving on

---

### SPRINT 0: Foundation (Days 1-2)

#### Tasks
1. Initialize Vite project with React
   ```bash
   npm create vite@latest shadowspeak -- --template react
   cd shadowspeak
   npm install idb
   npm install -D vite-plugin-pwa @capacitor/core @capacitor/cli
   ```

2. Create the full directory structure from Section 2.1

3. Set up `src/styles/variables.css` with all design tokens from Section 4.1

4. Create `src/styles/reset.css`:
   ```css
   *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
   html { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
   body { font-family: var(--font-family); color: var(--color-text-primary); background: var(--color-bg); }
   button { font: inherit; cursor: pointer; border: none; background: none; }
   input { font: inherit; border: none; outline: none; }
   a { text-decoration: none; color: inherit; }
   img { display: block; max-width: 100%; }
   ```

5. Create `src/utils/constants.js` with all magic numbers:
   ```js
   export const MAX_LIBRARY_SIZE = 50;
   export const SECONDS_PER_PHRASE = 120;
   export const PRONUNCIATION_PASS_THRESHOLD = { cantonese: 90, mandarin: 70, english: 70 };
   export const SCORE_THRESHOLDS = { EXCELLENT: 90, GOOD: 70, FAIR: 50 };
   export const SRS_INITIAL_EASE = 2.5;
   export const SRS_MIN_EASE = 1.3;
   export const SRS_MAX_EASE = 3.0;
   export const SRS_MAX_INTERVAL = 180;
   export const SRS_MASTERED_THRESHOLD = 14; // days
   export const RECORDING_MAX_SECONDS = 10;
   export const API_BASE_URL = 'https://cantonese.ai/api';
   export const API_ENDPOINTS = {
     SCORE_PRONUNCIATION: '/score-pronunciation',
     TTS: '/tts',
     STT: '/stt',
     TEXT_TO_JYUTPING: '/text-to-jyutping',
   };
   export const AUDIO_CACHE_NAME = 'shadowspeak-audio-v1';
   export const APP_CACHE_NAME = 'shadowspeak-app-v1';
   ```

6. Create `src/services/storage.js` (IndexedDB wrapper per Section 7.2)

7. Create `src/services/api.js` (cantonese.ai wrapper per Section 6.3)

8. Create the Cantonese language pack `src/data/languages/cantonese.json`

9. Create phrase data files for at least "The very basics" category (4 topics, ~55 phrases) following the schema in Section 5.3

10. Port existing pronunciation quiz integration to the new API wrapper

11. Create `src/App.jsx` with basic routing shell, context providers, and the 3-tab layout

#### Verify — Sprint 0
```
□ npm run dev starts without errors
□ App renders with 3-tab layout (Home, My Library, Practice)
□ IndexedDB opens and creates all object stores on first load
□ API wrapper can call text-to-jyutping (free endpoint, no key needed):
  - fetch('https://cantonese.ai/api/text-to-jyutping', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: '你好', outputType: 'list' })
    })
  - Response contains { success: true, result: [...] }
□ Phrase data loads from JSON files
□ CSS variables render correctly (check colors, spacing in browser dev tools)
□ No console errors or warnings
□ Build output (npm run build) is under 200KB gzipped (excluding audio)
□ All files follow naming conventions from Section 3.4
□ No file exceeds line limits (200 for components, 300 for services)
```

---

### SPRINT 1: Audio Engine + Offline (Days 3-5)

#### Tasks
1. Build `AudioEngine` class per Section 8.3
2. Build `AudioContext` provider wrapping the engine
3. Build `useAudio` hook exposing: play, pause, next, previous, setSpeed, toggleRepeat, currentPhrase, progress, isPlaying
4. Build audio caching per Section 7.3
5. Build `useOnlineStatus` hook
6. Build offline queue per Section 7.4
7. Configure `vite-plugin-pwa` in vite.config.js:
   ```js
   import { VitePWA } from 'vite-plugin-pwa';

   export default {
     plugins: [
       react(),
       VitePWA({
         registerType: 'autoUpdate',
         workbox: {
           globPatterns: ['**/*.{js,css,html,json}'],
           runtimeCaching: [
             {
               urlPattern: /^https:\/\/cantonese\.ai\/api\/tts/,
               handler: 'CacheFirst',
               options: {
                 cacheName: 'shadowspeak-audio-v1',
                 expiration: { maxEntries: 500, maxAgeSeconds: 30 * 24 * 60 * 60 },
               },
             },
           ],
         },
         manifest: {
           name: 'ShadowSpeak',
           short_name: 'ShadowSpeak',
           theme_color: '#1A2A18',
           background_color: '#F7F4EC',
           display: 'standalone',
           orientation: 'portrait',
           start_url: '/',
           icons: [/* all required sizes */],
         },
       }),
     ],
   };
   ```

8. Build the `MiniPlayer` component (persistent bar above tab bar):
   - Shows when audio is loaded
   - Displays: romanization, characters, English, play/pause button, progress bar
   - Tapping body area opens NowPlayingScreen
   - Settings zone: Repeat-1 toggle, Speed pill, phrase counter

9. Test full audio flow: load phrases → play → pause → next → previous → speed toggle → repeat toggle

#### Verify — Sprint 1
```
□ Audio plays for any phrase (TTS generated on demand if not cached)
□ Speed toggle generates different audio (speed 0.75 vs 1.0)
□ Repeat-one loops the current phrase
□ Auto-advance plays next phrase after 1.5s pause
□ Mini player shows correct phrase info and updates on track change
□ Progress bar updates in real-time during playback
□ OFFLINE TEST: Enable airplane mode, then:
  □ App shell loads from service worker
  □ Previously played phrases play from cache
  □ Uncached phrases show "Audio not available offline" message
  □ No crash, no blank screen
□ Going back online triggers queue processing
□ Audio cache size is reasonable (check Cache Storage in DevTools)
□ No memory leaks: play 20 phrases, check devtools Memory tab
□ Blob URLs are revoked when no longer needed
```

---

### SPRINT 2: Screens (Days 6-9)

#### Tasks
1. **HomeScreen**: hero card with lesson picker (10/20/30 min), custom phrase input card, library summary card, search bar, category rows with horizontal scroll TopicCards
2. **TopicDetailScreen**: large artwork, description, all phrases with play + save buttons, "Start this topic" CTA, progress bar
3. **NowPlayingScreen**: full-screen overlay with large phrase display, transport controls, settings zone, save/know buttons, pronunciation score badge
4. **SettingsScreen**: all settings from Section 5.6
5. **OnboardingScreen**: single screen, language selector, "Start your first lesson" CTA
6. Pre-load 5 starter phrases into library on first launch (from language pack `starterPhraseIds`)
7. Implement save-to-library flow: tap + button on phrase → saved to IndexedDB → audio cached in background → toast confirmation

#### Verify — Sprint 2
```
□ Home screen renders all 5 category rows with correct topic cards
□ Topic cards show correct phrase counts and progress bars
□ Tapping a topic card navigates to TopicDetailScreen
□ TopicDetailScreen lists all phrases with play buttons
□ Saving a phrase: tap + → toast "Saved to library" → phrase appears in Library tab
□ Library count updates on home screen after saving
□ NowPlayingScreen opens when tapping mini player body
□ NowPlayingScreen transport controls work (prev/play/next)
□ NowPlayingScreen "Save to Library" button works
□ NowPlayingScreen "I know this!" button updates SRS state
□ Settings screen persists all changes to IndexedDB
□ Onboarding screen shows on first launch, not on subsequent launches
□ After onboarding, library contains 5 starter phrases
□ All tap targets are >= 44x44px (inspect with DevTools)
□ Horizontal scroll rows show half-visible card at edge (overflow hint)
□ Back navigation works consistently on all screens
```

---

### SPRINT 3: SRS + Smart Lessons (Days 10-12)

#### Tasks
1. Implement SRS algorithm per Section 8.1
2. Implement lesson builder per Section 8.2
3. Wire hero card "Start lesson" to build and play a lesson
4. Update library cards to show SRS state: "Due today", "Review in 3 days", "Practiced 2 days ago"
5. Update queue meter with real data from IndexedDB
6. Add end-of-session summary screen: phrases practiced, scores, streak update
7. Implement streak logic: increment on session completion, reset if day missed, persist in settings

#### Verify — Sprint 3
```
□ Start lesson → lesson built from library phrases in correct priority order
□ With empty library → lesson pulls from starter content
□ With full library → lesson prioritizes overdue phrases
□ After completing a session → SRS intervals update correctly:
  □ New phrase: interval goes from 0 → 1 day
  □ Known phrase: interval increases (1 → 3 → 7 → 14 → ...)
  □ Forgotten phrase: interval resets to 0
□ Library cards show correct "last practiced" timestamps
□ Library cards show "Due today" when nextReviewAt <= now
□ Queue meter shows correct mastered/learning split
□ Streak increments after first session of the day
□ Streak does NOT increment for second session same day
□ End-of-session summary shows accurate stats
□ Streak persists across app restarts (stored in IndexedDB)
```

---

### SPRINT 4: Pronunciation Scoring (Days 13-15)

#### Tasks
1. Implement `useRecorder` hook per Section 8.4
2. Build recording UI: pulsing mic icon, countdown timer, "Recording..." indicator
3. Integrate pronunciation scoring into shadow sessions:
   - After phrase audio plays → brief pause → start recording (3-5 seconds) → stop → send to API → show score
4. Build `ScoreBadge` component (green/yellow/orange/red based on score)
5. Store score history per phrase in IndexedDB
6. Feed scores into SRS algorithm (high score = accelerate, low score = slow down)
7. Queue scoring for offline: record audio → store blob → score when online → update UI

#### Verify — Sprint 4
```
□ Microphone permission prompt appears on first recording attempt
□ Recording indicator shows during recording
□ Recording stops after timeout (max 10 seconds)
□ Score displays correctly: green (90+), yellow (70-89), orange (50-69), red (<50)
□ Score response includes expectedJyutping and transcribedJyutping
□ When score < 70: "Try again" prompt appears
□ Score history stored in IndexedDB (check via DevTools → Application → IndexedDB)
□ Scores feed into SRS: practice a phrase with score 95, verify interval increases faster
□ OFFLINE: recording happens, score shows as "Pending", scores arrive after reconnection
□ No microphone permission issues on iOS Safari (test in simulator)
□ Audio recording format is compatible with cantonese.ai API (ogg or webm)
□ No echo/feedback: app audio is muted during recording
```

---

### SPRINT 5: Practice Tab (Days 16-19)

Build all 4 practice modes.

#### Tasks
1. **PracticeScreen** hub: quick review card + horizontal scroll of mode cards
2. **Shadow Mode** (refined): lesson flow with scoring, end-of-session summary
3. **Prompt Mode**: show English → user speaks → STT transcribes → compare → score
4. **Speed Run**: rapid-fire English prompts, 5-second timer, score counter, personal best
5. **Tone Gym**: play two audio clips, user picks the correct one. 10 rounds per session.

#### Verify — Sprint 5
```
□ Practice hub shows "X phrases due for review" with correct count
□ Shadow Mode: full flow works (play → pause → record → score → next)
□ Prompt Mode:
  □ English prompt appears
  □ User taps "I'm ready" → recording starts
  □ After recording → STT transcription shown
  □ Comparison: expected vs actual displayed side-by-side
  □ Score calculated and displayed
□ Speed Run:
  □ English prompt appears with 5-second countdown
  □ Timer visible and accurate
  □ Correct answer plays audio + shows green flash
  □ Wrong/timeout shows correct answer
  □ Final score and personal best displayed
  □ Personal best persists across sessions
□ Tone Gym:
  □ Two audio clips play (same word, different tones)
  □ User taps choice
  □ Correct/incorrect feedback shown immediately
  □ 10 rounds, summary score at end
  □ Tone confusion patterns tracked
□ All modes feed results back into SRS
□ All modes record a SessionRecord in IndexedDB
```

---

### SPRINT 6: Dialogue Scenes (Days 20-23)

#### Tasks
1. Create dialogue scene data for top 5 topics (2-3 scenes each, ~12 scenes total)
2. Build `DialogueScene` component per Section 9.1
3. Use different TTS voice_id for "other" speaker
4. "User" turns: play audio → pause → user records → pronunciation score
5. "Other" turns: play audio with subtitles (romanization, characters, English)
6. Add dialogue scenes to TopicDetailScreen
7. Add "Scene Mode" to Practice tab

#### Verify — Sprint 6
```
□ Dialogue scene plays through all turns in correct order
□ "Other" speaker uses a different voice (verify audibly)
□ "User" turns pause for recording
□ Pronunciation score shown after each user turn
□ Chat-bubble visual layout: user on right, other on left
□ Scene can be replayed from beginning
□ Phrases from dialogue scenes can be saved to library
□ At least 12 dialogue scenes exist across 5 topics
□ Dialogue scenes appear on TopicDetailScreen
□ Scene Mode appears in Practice tab
```

---

### SPRINT 7: Custom Phrases + "What did they say?" (Days 24-26)

#### Tasks
1. Build custom phrase input flow:
   - User types Chinese text
   - Auto-call Text-to-Jyutping API
   - Auto-call TTS API for audio
   - Save to library with "Added by you" tag
2. Build "What did they say?" feature:
   - Input: user types approximate romanization or Chinese
   - Fuzzy match against phrase database
   - If no match: generate Jyutping + audio + English via APIs
   - Display result with "Save to library" button
3. Implement phrase-of-the-day notification (Local Notifications via Capacitor)

#### Verify — Sprint 7
```
□ Custom phrase: type "你食咗飯未" → Jyutping auto-generated → audio plays → saved to library
□ Custom phrase card shows "Added by you" tag in library
□ Custom phrase audio is cached for offline use
□ "What did they say?": type approximate text → matching phrase found or new phrase generated
□ Generated phrases have correct Jyutping (verify against known phrases)
□ Phrase-of-the-day notification fires at set time (test with short delay)
□ Tapping notification opens the app to that phrase
□ All custom phrase API calls handle errors gracefully (show error toast, not crash)
```

---

### SPRINT 8: AI Conversation Partner (Days 27-31)

#### Tasks
1. Build scenario selector UI (list of situations)
2. Build conversation interface (chat bubbles with romanization/characters/English)
3. Integrate with cantonese.ai chatbot or Claude API:
   - System prompt with scenario context
   - AI responds in Cantonese only, short sentences
   - AI responses get TTS audio
4. User speaks → STT transcription → display + pronunciation score
5. Post-conversation review: transcript, highlights, save-to-library buttons
6. Mark as online-only (clear offline indicator)

#### Verify — Sprint 8
```
□ Scenario selector shows at least 5 scenarios
□ Selecting scenario starts conversation with context-appropriate AI greeting
□ AI responds in Cantonese with short sentences (1-2 sentences)
□ AI responses play audio automatically
□ User recording → transcription displayed → pronunciation score shown
□ Conversation flows naturally for 4-5 turns
□ Post-conversation review shows full transcript
□ Any phrase from conversation can be saved to library
□ OFFLINE: screen shows "AI conversation requires internet" message
□ API errors show user-friendly message, not crash
□ Conversation history is not stored server-side (privacy)
```

---

### SPRINT 9: Stats + Polish (Days 32-35)

#### Tasks
1. Build StatsScreen: streak calendar, time practiced, phrases learned, score trends, milestones
2. Streak freeze logic (1 free per week)
3. Notification system: daily reminder, streak-at-risk, review nudge
4. Performance: lazy loading, virtual scroll for long lists, audio preloading
5. Animations: page transitions (slide), card expand/collapse (spring), score reveal (pop)
6. Dark mode (optional, based on system preference)
7. Accessibility audit: contrast ratios, focus indicators, screen reader labels
8. Bundle size audit: target <300KB gzipped

#### Verify — Sprint 9
```
□ Stats screen shows accurate data from IndexedDB
□ Streak calendar renders correctly for last 3 months
□ Milestones unlock at correct thresholds
□ Notifications fire at correct times
□ Page transitions are smooth (no jank, 60fps)
□ WCAG AA contrast: all text passes (use browser accessibility audit)
□ All interactive elements have focus indicators
□ Screen reader (VoiceOver on iOS) can navigate all screens
□ Bundle size: npm run build → check dist/ size
□ Lighthouse PWA score: >= 90
□ Lighthouse Performance score: >= 85
□ No memory leaks after 30 minutes of use (DevTools Performance Monitor)
```

---

### SPRINT 10: Multi-language + App Store (Days 36-38)

#### Tasks
1. Abstract all language-specific content into language packs (Section 5.1)
2. Build language switcher (in settings + TopBar "CANTONESE >" hint)
3. Create Mandarin language pack
4. Initialize Capacitor:
   ```bash
   npx cap init ShadowSpeak com.shadowspeak.app --web-dir dist
   npx cap add ios
   npx cap add android
   ```
5. Configure Capacitor plugins (filesystem, network, haptics, notifications, splash, status bar)
6. Create app icons (all sizes required by iOS and Android)
7. Create splash screens
8. Build and test on iOS Simulator and Android Emulator
9. Fix any platform-specific issues (Safe Area, status bar, keyboard behavior)
10. Prepare App Store assets: screenshots, description, keywords, privacy policy URL

#### Verify — Sprint 10
```
□ Language switcher changes all content, audio, and API calls
□ Mandarin phrases load correctly with correct romanization system
□ Pronunciation scoring works for Mandarin (threshold 70)
□ Capacitor build succeeds: npx cap build ios / npx cap build android
□ App runs in iOS Simulator with correct safe areas
□ App runs in Android Emulator with correct status bar
□ Splash screen displays correctly
□ App icon renders at all sizes without cropping issues
□ Microphone permission prompt shows correct usage description
□ App works after force-quit and relaunch (state persists)
□ App handles incoming phone calls gracefully (audio pauses)
□ Privacy policy URL is accessible and accurate
□ App Store screenshots are 6.7" (1290x2796) and 6.1" (1170x2532)
□ No rejected APIs used (no private frameworks, no deprecated calls)
```

---

## 11. SECURITY

### 11.1 API key management

```
CRITICAL: The cantonese.ai API key must NEVER appear in source code.

Storage: Encrypted in IndexedDB via the Web Crypto API.
Entry: User enters API key in Settings screen on first setup.
Transmission: Key is added to API calls at runtime from memory.
Memory: Key is decrypted once at app start, held in module-level variable (not global/window).
```

```js
// Key encryption/decryption using Web Crypto API
const ENCRYPTION_KEY_NAME = 'shadowspeak-key';

async function getOrCreateEncryptionKey() {
  // Use a derived key from a fixed salt + device-specific entropy
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode('shadowspeak-local-encryption'),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: new TextEncoder().encode('ss-salt-v1'), iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

async function encryptApiKey(apiKey) {
  const key = await getOrCreateEncryptionKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    new TextEncoder().encode(apiKey)
  );
  return { iv: Array.from(iv), data: Array.from(new Uint8Array(encrypted)) };
}

async function decryptApiKey(stored) {
  const key = await getOrCreateEncryptionKey();
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: new Uint8Array(stored.iv) },
    key,
    new Uint8Array(stored.data)
  );
  return new TextDecoder().decode(decrypted);
}
```

### 11.2 Content Security Policy

Add to index.html:
```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self';
  style-src 'self' 'unsafe-inline';
  connect-src 'self' https://cantonese.ai https://api.anthropic.com;
  media-src 'self' blob:;
  img-src 'self' data: blob:;
  font-src 'self';
">
```

### 11.3 Data privacy

```
- NO user data is sent to any server except cantonese.ai for pronunciation scoring and TTS.
- NO analytics without explicit consent.
- ALL user data (library, settings, scores, sessions) is stored locally in IndexedDB.
- Audio recordings are sent to cantonese.ai API for scoring only. They are not stored server-side.
- API key is encrypted at rest and never transmitted to any server other than cantonese.ai.
- App privacy policy must disclose: microphone usage, API data transmission, local storage.
```

### 11.4 Input sanitization

```js
// All user text input (custom phrases, search) must be sanitized
function sanitizeInput(text) {
  return text
    .trim()
    .slice(0, 500)                          // Max length
    .replace(/[<>]/g, '')                    // Prevent HTML injection
    .replace(/javascript:/gi, '')            // Prevent JS injection
    .replace(/on\w+=/gi, '');                // Prevent event handler injection
}

// All text rendered in JSX is auto-escaped by React.
// NEVER use dangerouslySetInnerHTML.
```

---

## 12. APP STORE READINESS

### 12.1 iOS requirements

```
- Minimum deployment target: iOS 15.0
- Required device capabilities: arm64, microphone
- Privacy usage descriptions (in Info.plist):
  NSMicrophoneUsageDescription: "ShadowSpeak needs your microphone to score your pronunciation"
- App Transport Security: cantonese.ai uses HTTPS (compliant)
- No private APIs used
- No UIWebView (Capacitor uses WKWebView)
- Safe Area insets respected (use env() CSS)
- Support all iPhone sizes (SE through 16 Pro Max)
- Splash screen: LaunchScreen.storyboard (generated by Capacitor)
- App icon: 1024x1024 without transparency
- Screenshots: 6.7" and 6.5" sizes minimum
```

### 12.2 Android requirements

```
- Minimum SDK: 24 (Android 7.0)
- Target SDK: 34 (Android 14)
- Permissions:
  RECORD_AUDIO (microphone for pronunciation)
  INTERNET (API calls)
  POST_NOTIFICATIONS (daily reminders, Android 13+)
- Adaptive icon: foreground + background layers
- Feature graphic: 1024x500
- Screenshots: phone (at least 2) + tablet (optional)
```

### 12.3 App Store rejection prevention checklist

```
□ App does not crash on any screen (test every flow)
□ App works without internet (offline mode, not blank screen)
□ App explains why it needs microphone access BEFORE requesting permission
□ No placeholder content (all "lorem ipsum" replaced with real content)
□ No broken links or dead-end screens
□ Settings screen has a working "Contact Us" or support link
□ Privacy policy URL is live and accurate
□ App does not use excessive battery (no polling, no wake locks)
□ Audio pauses when app goes to background
□ Audio pauses on incoming phone call
□ App handles low storage gracefully (show warning, don't crash)
□ App handles permission denial gracefully (explain, don't crash)
□ No UIWebView references (Capacitor 6 uses WKWebView by default)
□ App content is appropriate for all ages (4+ rating)
```

---

## 13. ERROR HANDLING PATTERNS

### 13.1 Standard error types

```js
// src/utils/errors.js

class AppError extends Error {
  constructor(message, code, recoverable = true) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.recoverable = recoverable;
  }
}

// Error codes
const ErrorCodes = {
  NETWORK_OFFLINE:      'NETWORK_OFFLINE',
  API_KEY_MISSING:      'API_KEY_MISSING',
  API_KEY_INVALID:      'API_KEY_INVALID',
  API_RATE_LIMITED:     'API_RATE_LIMITED',
  API_SERVER_ERROR:     'API_SERVER_ERROR',
  AUDIO_PLAY_FAILED:   'AUDIO_PLAY_FAILED',
  MIC_PERMISSION_DENIED: 'MIC_PERMISSION_DENIED',
  MIC_NOT_AVAILABLE:   'MIC_NOT_AVAILABLE',
  STORAGE_FULL:        'STORAGE_FULL',
  STORAGE_ERROR:       'STORAGE_ERROR',
};
```

### 13.2 User-facing error messages

```js
const USER_MESSAGES = {
  NETWORK_OFFLINE:       'You\'re offline. This feature needs internet.',
  API_KEY_MISSING:       'Add your cantonese.ai API key in Settings to use this feature.',
  API_KEY_INVALID:       'Your API key is invalid. Check it in Settings.',
  API_RATE_LIMITED:      'Too many requests. Wait a moment and try again.',
  API_SERVER_ERROR:      'Something went wrong. Try again in a moment.',
  AUDIO_PLAY_FAILED:    'Audio couldn\'t play. Try again.',
  MIC_PERMISSION_DENIED: 'Microphone access needed for pronunciation scoring. Enable it in your device settings.',
  MIC_NOT_AVAILABLE:    'Microphone not available on this device.',
  STORAGE_FULL:         'Device storage is full. Free up space to continue saving phrases.',
  STORAGE_ERROR:        'Couldn\'t save data. Try again.',
};
```

### 13.3 Error boundary

```jsx
// Wrap each screen in an error boundary
class ScreenErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    logger.error('Screen error', { error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className={styles.errorScreen}>
          <h2>Something went wrong</h2>
          <p>Try going back or restarting the app.</p>
          <Button onClick={() => { this.setState({ hasError: false }); window.location.hash = '#home'; }}>
            Go home
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}
```

---

## 14. PERFORMANCE BUDGET

| Metric | Target | How to check |
|--------|--------|-------------|
| First Contentful Paint | < 1.5s | Lighthouse |
| Time to Interactive | < 3.0s | Lighthouse |
| Bundle size (JS, gzipped) | < 150KB | `npm run build`, check dist/ |
| Bundle size (CSS, gzipped) | < 20KB | `npm run build`, check dist/ |
| IndexedDB read (single entry) | < 5ms | Performance.now() around reads |
| Audio start latency (cached) | < 200ms | Measure from tap to audio output |
| Audio start latency (network) | < 2s | Measure from tap to audio output |
| Memory usage (after 30 min) | < 100MB | DevTools Memory tab |
| Offline app load | < 1s | Test with airplane mode |

### 14.1 Optimization techniques

```
- Code split by route (dynamic import for each screen)
- Preload audio for next phrase while current plays
- Virtualize long lists (library with 50+ phrases)
- Lazy load topic content (only load when category scrolled into view)
- Compress phrase data (remove whitespace from JSON in build)
- Use requestIdleCallback for non-critical work (SRS recalculation, cache cleanup)
- Debounce search input (300ms)
- Throttle progress bar updates (60fps max via requestAnimationFrame)
```

---

## 15. ACCESSIBILITY REQUIREMENTS

```
WCAG 2.1 Level AA compliance required for App Store.

□ Color contrast: minimum 4.5:1 for body text, 3:1 for large text
  - Test: var(--color-text-secondary) #5A5A5A on var(--color-surface) #FFFFFF = 7.0:1 ✓
  - Test: var(--color-brand-lime) #C5E85A on var(--color-brand-dark) #1A2A18 = 5.8:1 ✓
  - CAUTION: var(--color-text-muted) #9A9A9A on white = 2.9:1 ✗ — use only for non-essential decorative text

□ Touch targets: minimum 44x44px (Apple HIG), 48x48dp (Android Material)
□ Focus indicators: visible focus ring on all interactive elements (2px solid var(--color-brand-lime))
□ Screen reader labels: all buttons have aria-label, all images have alt text
□ Reduced motion: respect prefers-reduced-motion media query
□ Audio controls: all audio has visible play/pause, no autoplay without user action
□ Text resizing: app works at 200% text zoom (Dynamic Type on iOS)
□ Language attribute: <html lang="en"> with lang="yue" on Cantonese text spans
□ Heading hierarchy: one h1 per screen, sequential headings (no skipping h2 → h4)
```

---

## APPENDIX A: VITE CONFIG

```js
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.png'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,json,png,svg}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.origin === 'https://cantonese.ai' && url.pathname.startsWith('/api/tts'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'shadowspeak-audio-v1',
              expiration: { maxEntries: 1000, maxAgeSeconds: 90 * 24 * 60 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      manifest: {
        name: 'ShadowSpeak — Learn to Speak Cantonese',
        short_name: 'ShadowSpeak',
        description: 'Audio-first Cantonese learning through shadowing',
        theme_color: '#1A2A18',
        background_color: '#F7F4EC',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        categories: ['education'],
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
  build: {
    target: 'es2020',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          storage: ['idb'],
        },
      },
    },
  },
  server: {
    port: 3000,
  },
});
```

---

## APPENDIX B: CAPACITOR CONFIG

```ts
// capacitor.config.ts
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.shadowspeak.app',
  appName: 'ShadowSpeak',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#F7F4EC',
      showSpinner: false,
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#F7F4EC',
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_shadowspeak',
      iconColor: '#1A2A18',
    },
  },
  ios: {
    contentInset: 'automatic',
    preferredContentMode: 'mobile',
    backgroundColor: '#F7F4EC',
  },
  android: {
    backgroundColor: '#F7F4EC',
  },
};

export default config;
```

---

## APPENDIX C: LOGGER UTILITY

```js
// src/utils/logger.js

const IS_PRODUCTION = import.meta.env.PROD;

const logger = {
  info: (...args) => { if (!IS_PRODUCTION) console.info('[SS]', ...args); },
  warn: (...args) => { if (!IS_PRODUCTION) console.warn('[SS]', ...args); },
  error: (...args) => { console.error('[SS]', ...args); }, // Always log errors
};

export { logger };
```

---

## A1. CONTENT PHILOSOPHY

The app's previous version ("Canto Is Easy") treated phrases as isolated flashcards. ShadowSpeak treats phrases as **parts of conversations**. Every phrase exists within a scene, and every scene exists within a real-life situation.

Think of it like learning music. You don't learn individual notes — you learn songs. And within those songs, you learn the patterns (chord progressions) that show up everywhere. In ShadowSpeak, the "songs" are dialogue scenes and the "chord progressions" are high-frequency phrase patterns that appear across multiple scenes.

### Content rules Claude Code must follow when generating or structuring phrase data:

```
1. Every phrase must have a CONTEXT field that names the real-life moment.
   BAD:  context: "Restaurant"
   GOOD: context: "Telling the waiter you're allergic to shellfish"

2. Every topic must contain at least 2 DIALOGUE SCENES (multi-turn conversations).
   Phrases that appear in dialogue scenes are also available as standalone practice cards.

3. Phrases within a topic must be ordered by CONVERSATION FLOW, not difficulty.
   The first phrases in "At a restaurant" should be what you say FIRST (greeting, 
   how many people) not the hardest phrases (complaining about the bill).

4. Every phrase must include a WORD-BY-WORD BREAKDOWN (the words array).
   Each word has: chinese, jyutping, english.

5. Dialogue scenes use TWO SPEAKERS: "user" (the learner) and "other" (native speaker).
   The "other" speaker has a role label: "Waiter", "Taxi driver", "Parent", etc.

6. Every dialogue scene must be 4-8 turns. Not shorter (too simple). Not longer (overwhelming).

7. The "other" speaker's lines must include COMMON RESPONSES the learner will hear in real life.
   These are not vocabulary — they are listening comprehension anchors.

8. Phrases must use COLLOQUIAL Cantonese, not formal/written Chinese.
   BAD:  "請問洗手間在哪裡？" (written Mandarin-influenced)
   GOOD: "唔該，厠所喺邊度？" (spoken Cantonese)

9. Romanization uses DISPLAY FORMAT with tone superscripts for user-facing text 
   (e.g., "Nei⁵ hou² maa³") and PLAIN JYUTPING for the jyutping field 
   (e.g., "nei5 hou2 maa3"). Both must be present on every phrase.

10. English translations must be NATURAL, not literal.
    BAD:  "I want need one cup milk tea"
    GOOD: "I'd like a milk tea"
```

---

## A2. TOPIC CONTENT MANIFEST

This is the complete content map. Each topic lists its phrase groups and dialogue scenes. Claude Code should use this as the blueprint when creating the JSON data files.

### Category 1: The Very Basics (4 topics)

#### Topic: Daily Basics (12 phrases)
**Situation:** Your first words in any Cantonese encounter.

**Phrase groups (ordered by conversation flow):**
1. Greetings: 你好 (hello), 早晨 (good morning), 你好嗎 (how are you)
2. Politeness: 唔該 (thank you/excuse me), 多謝 (thanks), 唔好意思 (sorry)
3. Farewells: 拜拜 (bye bye), 下次見 (see you next time), 慢慢行 (take care)
4. Essentials: 係 (yes), 唔係 (no), 好 (okay/good)

**Dialogue Scene 1: "Meeting your neighbor in the lift"**
```
You:    早晨！(Good morning!)
Other:  早晨！你好嗎？(Good morning! How are you?)
You:    好好，多謝。你呢？(Good, thanks. And you?)
Other:  幾好呀。今日天氣好好。(Pretty good. The weather is nice today.)
You:    係呀！拜拜！(Yes! Bye!)
Other:  拜拜！(Bye!)
```

**Dialogue Scene 2: "Apologizing for bumping into someone"**
```
You:    唔好意思！(Sorry!)
Other:  冇問題。(No problem.)
You:    唔該晒。(Thank you so much.)
Other:  唔使客氣。(You're welcome.)
```

---

#### Topic: Numbers and Counting (15 phrases)
**Situation:** Prices, phone numbers, quantities.

**Phrase groups:**
1. Numbers 1-10: 一 to 十
2. Tens and hundreds: 二十, 三十, 一百
3. Money: 幾多錢 (how much), X蚊 (X dollars), 太貴 (too expensive)
4. Quantities: 一個 (one of), 兩個 (two of), 夠 (enough)

**Dialogue Scene 1: "Asking the price at a market stall"**
```
You:    唔該，呢個幾多錢？(Excuse me, how much is this?)
Other:  三十蚊。(Thirty dollars.)
You:    太貴喇！平啲得唔得？(Too expensive! Can you go lower?)
Other:  廿五蚊啦。(Twenty-five dollars then.)
You:    好，我要一個。(Okay, I'll take one.)
Other:  好，多謝。(Okay, thanks.)
```

**Dialogue Scene 2: "Giving your phone number"**
```
Other:  你電話幾號？(What's your phone number?)
You:    九四七二，三三零八。(9472, 3308.)
Other:  我覆你。(I'll call/text you back.)
You:    好，多謝。(Okay, thanks.)
```

---

#### Topic: Quick Questions (18 phrases)
**Situation:** The questions you need every day.

**Phrase groups:**
1. Where: 喺邊度 (where is), 厠所喺邊度 (where's the toilet), 呢度 (here), 嗰度 (there)
2. When: 幾時 (when), 幾點 (what time), 今日 (today), 聽日 (tomorrow)
3. How: 點樣 (how), 點解 (why), 點算 (what to do)
4. What/Which: 咩嘢 (what), 邊個 (who/which one)

**Dialogue Scene 1: "Finding the bathroom in a restaurant"**
```
You:    唔該，厠所喺邊度？(Excuse me, where's the toilet?)
Other:  直行，轉左。(Go straight, turn left.)
You:    多謝！(Thanks!)
```

**Dialogue Scene 2: "Asking what time something starts"**
```
You:    幾點開始？(What time does it start?)
Other:  三點半。(3:30.)
You:    仲有冇位？(Are there still seats?)
Other:  有呀，入嚟坐。(Yes, come in and sit down.)
```

---

#### Topic: Yes, No, Maybe (10 phrases)
**Situation:** Agreeing, declining, hedging politely.

**Phrase groups:**
1. Agreeing: 係 (yes), 好 (okay), 冇問題 (no problem), 得 (can do)
2. Declining: 唔係 (no), 唔得 (can't), 唔使 (no need), 唔好 (don't)
3. Hedging: 可能 (maybe), 睇下先 (let me see first)

**Dialogue Scene 1: "Declining an invitation politely"**
```
Other:  今晚食飯？(Dinner tonight?)
You:    唔得呀，今晚有嘢做。(Can't, I'm busy tonight.)
Other:  聽日呢？(How about tomorrow?)
You:    好呀，冇問題。(Sure, no problem.)
Other:  好，聽日見。(Great, see you tomorrow.)
```

---

### Category 2: Food and Drink (4 topics)

#### Topic: Ordering Coffee (35 phrases)
**Situation:** Navigating a cha chaan teng or cafe.

**Phrase groups:**
1. Ordering: 我想要 (I'd like), 一杯 (one cup of), 唔該 (please)
2. Drinks: 奶茶 (milk tea), 檸茶 (lemon tea), 鴛鴦 (yuanyang), 齋啡 (black coffee), 凍/熱 (iced/hot)
3. Modifiers: 少甜 (less sweet), 少冰 (less ice), 走甜 (no sugar), 走冰 (no ice)
4. Food: 菠蘿包 (pineapple bun), 蛋撻 (egg tart), 西多士 (French toast)
5. Actions: 買單 (the bill), 外賣 (takeaway), 堂食 (eat in)

**Dialogue Scene 1: "Ordering milk tea at a cha chaan teng"**
```
Other:  飲咩？(What to drink?)
You:    凍奶茶，少甜。(Iced milk tea, less sweet.)
Other:  要唔要食嘢？(Want anything to eat?)
You:    要一個菠蘿包。(A pineapple bun please.)
Other:  堂食定外賣？(Eat in or takeaway?)
You:    堂食，唔該。(Eat in, thanks.)
```

**Dialogue Scene 2: "Asking for the bill and paying"**
```
You:    唔該，埋單。(Excuse me, the bill please.)
Other:  一共四十五蚊。(That's 45 dollars total.)
You:    可唔可以用八達通？(Can I use Octopus?)
Other:  得。嘟一嘟。(Yes. Tap here.)
You:    多謝。(Thanks.)
```

**Dialogue Scene 3: "Changing your order"**
```
You:    唔好意思，我想改一改。(Sorry, I'd like to change my order.)
Other:  咩事？(What is it?)
You:    凍奶茶改做熱奶茶。(Change the iced milk tea to hot.)
Other:  好，冇問題。(Okay, no problem.)
```

---

#### Topic: At a Restaurant (28 phrases)
**Situation:** Full restaurant experience from arrival to leaving.

**Phrase groups:**
1. Arrival: 幾多位 (how many people), 有冇位 (any tables available), 等幾耐 (how long to wait)
2. Ordering: 我要 (I want), 有冇推介 (any recommendations), 唔食XX (I don't eat XX)
3. Allergies/dietary: 我對XX敏感 (I'm allergic to XX), 素食 (vegetarian), 唔食牛 (no beef)
4. During meal: 唔該加水 (more water please), 多啲飯 (more rice), 太辣 (too spicy)
5. Bill: 埋單 (the bill), 分開俾 (split the bill), 收唔收卡 (do you take card)
6. Problems: 唔啱 (this is wrong), 我冇叫呢個 (I didn't order this)

**Dialogue Scene 1: "Arriving at a restaurant"**
```
Other:  幾多位？(How many?)
You:    四位。(Four.)
Other:  等十分鐘，得唔得？(Wait 10 minutes, okay?)
You:    好呀。(Sure.)
[pause]
Other:  入嚟坐。呢度。(Come in. Here.)
You:    多謝。有冇餐牌？(Thanks. Do you have a menu?)
Other:  有，喺度。(Yes, here you go.)
```

**Dialogue Scene 2: "Explaining food allergies"**
```
You:    我想問，呢個有冇蝦？(Can I ask, does this have shrimp?)
Other:  有蝦。(Yes, it has shrimp.)
You:    我對蝦敏感。有冇其他推介？(I'm allergic to shrimp. Any other recommendations?)
Other:  呢個雞煲冇海鮮。(This chicken pot has no seafood.)
You:    好，我要呢個。(Okay, I'll have this one.)
```

---

#### Topic: Wet Market (22 phrases)
**Situation:** Buying fresh produce at a HK wet market.

**Phrase groups:**
1. Greetings: 老闆 (boss — how you address vendors), 靚女/靚仔 (pretty lady/handsome guy)
2. Produce: 生果 (fruit), 菜 (vegetables), 魚 (fish), 肉 (meat), 海鮮 (seafood)
3. Quantities: 一斤 (one catty), 半斤 (half catty), 一條 (one piece — for fish), 一磅 (one pound)
4. Negotiation: 幾多錢一斤 (how much per catty), 平啲 (cheaper), 新唔新鮮 (is it fresh)
5. Selection: 我要呢個 (I want this one), 嗰個 (that one), 大啲 (bigger), 細啲 (smaller)

**Dialogue Scene 1: "Buying fruit"**
```
You:    老闆，蘋果幾多錢一斤？(Boss, how much per catty for apples?)
Other:  十五蚊一斤。(Fifteen dollars a catty.)
You:    我要兩斤。(I'll take two catties.)
Other:  仲要唔要其他？(Anything else?)
You:    橙新唔新鮮？(Are the oranges fresh?)
Other:  今朝返嘅，好新鮮。(Came in this morning, very fresh.)
You:    好，一斤橙。(Okay, one catty of oranges.)
Other:  一共四十五蚊。(45 dollars total.)
```

---

#### Topic: Dim Sum (18 phrases)
**Situation:** The quintessential HK dining experience.

**Phrase groups:**
1. Staples: 蝦餃 (har gow), 燒賣 (siu mai), 叉燒包 (char siu bao), 腸粉 (cheung fun), 蘿蔔糕 (turnip cake)
2. Ordering: 要 (want), 再嚟一籠 (one more basket), 夠喇 (that's enough)
3. Tea: 普洱 (pu'er), 香片 (jasmine), 加水 (more water — tap the table)
4. Bill: 埋單 (the bill), 買單 (alternative for bill)

**Dialogue Scene 1: "Ordering dim sum"**
```
Other:  飲咩茶？(What tea?)
You:    普洱，唔該。(Pu'er, please.)
Other:  點心要咩？(What dim sum?)
You:    蝦餃同燒賣。(Har gow and siu mai.)
Other:  要唔要叉燒包？(Want char siu bao?)
You:    好呀，一籠。(Sure, one basket.)
[later]
You:    唔該，再嚟一籠蝦餃。(Excuse me, one more basket of har gow.)
Other:  好。(Okay.)
```

---

### Category 3: Social Life (4 topics)

#### Topic: Meeting Someone New (40 phrases)
**Phrase groups:** Name, where you're from, what you do, family, how long in HK, Cantonese level
**2-3 dialogue scenes:** Party introduction, school gate first meeting, neighbor introduction

#### Topic: School Gate Chat (28 phrases)
**Phrase groups:** Greeting parents, asking about children, pickup arrangements, playdates, school events
**2-3 dialogue scenes:** Morning drop-off chat, arranging a playdate, discussing school event

#### Topic: Celebrations (22 phrases)
**Phrase groups:** Birthday wishes, Lunar New Year greetings, Mid-Autumn, wedding congratulations, gift giving
**2 dialogue scenes:** Lunar New Year visit, birthday party small talk

#### Topic: Small Talk (16 phrases)
**Phrase groups:** Weather, weekend plans, compliments, general chit-chat
**2 dialogue scenes:** Lift/lobby small talk, post-yoga class chat

---

### Category 4: Home and Family (4 topics)

#### Topic: Managing Home (28 phrases)
**Phrase groups:** Instructions for helper, delivery person, repair person, building management
**2-3 dialogue scenes:** Explaining to helper what to cook, dealing with a delivery, calling building management about a repair

#### Topic: Talking to Kids (20 phrases)
**Phrase groups:** Basic instructions, praise, mealtime, bedtime, getting ready
**2 dialogue scenes:** Morning routine instructions, praising good behavior

#### Topic: Doctor and Pharmacy (18 phrases)
**Phrase groups:** Symptoms, describing pain, asking for medicine, understanding instructions
**2-3 dialogue scenes:** Describing symptoms to a doctor, buying medicine at pharmacy

#### Topic: Groceries (14 phrases)
**Phrase groups:** Supermarket basics, asking where things are, bags, payment
**2 dialogue scenes:** Asking where an item is, checkout

---

### Category 5: Getting Around (4 topics)

#### Topic: Taxis and Uber (20 phrases)
**Phrase groups:** Destination, directions, stop here, payment, AC
**2-3 dialogue scenes:** Giving destination to taxi driver, asking driver to stop, paying

#### Topic: MTR and Buses (15 phrases)
**Phrase groups:** Which line/stop, Octopus card, exits, transfers
**2 dialogue scenes:** Asking for directions on MTR, confirming bus stop

#### Topic: Shopping (25 phrases)
**Phrase groups:** Sizes, colors, trying on, discount, comparing
**2-3 dialogue scenes:** Trying on clothes, asking for a discount, returning an item

#### Topic: Asking for Directions (12 phrases)
**Phrase groups:** Left, right, straight, how far, nearby, landmarks
**2 dialogue scenes:** Finding a specific shop, asking how to get to MTR station

---

### Content totals

| Metric | Count |
|--------|-------|
| Categories | 5 |
| Topics | 20 |
| Total phrases | ~395 |
| Dialogue scenes | ~45 (2-3 per topic) |
| Dialogue turns | ~270 (avg 6 turns per scene) |
| Starter phrases | 5 (preloaded on Day 1) |

### Starter phrases (preloaded into library on Day 1)

```json
[
  {
    "id": "starter-001",
    "romanization": "Nei⁵ hou²",
    "jyutping": "nei5 hou2",
    "chinese": "你好",
    "english": "Hello",
    "context": "The universal Cantonese greeting"
  },
  {
    "id": "starter-002",
    "romanization": "M⁴ goi¹",
    "jyutping": "m4 goi1",
    "chinese": "唔該",
    "english": "Thank you / Excuse me",
    "context": "The most useful word in Cantonese"
  },
  {
    "id": "starter-003",
    "romanization": "Gei² do¹ cin²?",
    "jyutping": "gei2 do1 cin2",
    "chinese": "幾多錢？",
    "english": "How much?",
    "context": "Essential for any transaction"
  },
  {
    "id": "starter-004",
    "romanization": "M⁴ hou² ji³ si³",
    "jyutping": "m4 hou2 ji3 si3",
    "chinese": "唔好意思",
    "english": "Sorry / Excuse me",
    "context": "Apologizing or getting someone's attention"
  },
  {
    "id": "starter-005",
    "romanization": "Maai⁴ daan¹",
    "jyutping": "maai4 daan1",
    "chinese": "埋單",
    "english": "The bill, please",
    "context": "Asking for the bill at any restaurant"
  }
]
```

---

## A3. PHRASE DATA FILE FORMAT

Each topic is a single JSON file. Here is the exact format Claude Code must follow.

```json
// src/data/topics/cantonese/food-and-drink.json

{
  "category": {
    "id": "food-and-drink",
    "name": "Food and Drink",
    "topicCount": 4
  },
  "topics": [
    {
      "id": "ordering-coffee",
      "name": "Ordering coffee",
      "description": "Cha chaan teng, milk tea, iced drinks",
      "phraseCount": 35,
      "imageGradient": "linear-gradient(135deg, #6F4E37, #A0785D 50%, #E8D4B8)",
      "imageUrl": null,
      "phrases": [
        {
          "id": "coffee-001",
          "romanization": "Ngo⁵ seung² yiu³ yat¹ bui¹ naai⁵ caa⁴",
          "jyutping": "ngo5 seung2 jiu3 jat1 bui1 naai5 caa4",
          "chinese": "我想要一杯奶茶",
          "english": "I'd like a milk tea",
          "context": "Ordering a drink at a cha chaan teng",
          "difficulty": 1,
          "words": [
            { "chinese": "我", "jyutping": "ngo5", "english": "I/me" },
            { "chinese": "想要", "jyutping": "seung2 jiu3", "english": "would like" },
            { "chinese": "一杯", "jyutping": "jat1 bui1", "english": "one cup" },
            { "chinese": "奶茶", "jyutping": "naai5 caa4", "english": "milk tea" }
          ]
        },
        {
          "id": "coffee-002",
          "romanization": "Dung³ naai⁵ caa⁴, siu² tim⁴",
          "jyutping": "dung3 naai5 caa4 siu2 tim4",
          "chinese": "凍奶茶，少甜",
          "english": "Iced milk tea, less sweet",
          "context": "Specifying your drink preferences",
          "difficulty": 1,
          "words": [
            { "chinese": "凍", "jyutping": "dung3", "english": "iced/cold" },
            { "chinese": "奶茶", "jyutping": "naai5 caa4", "english": "milk tea" },
            { "chinese": "少甜", "jyutping": "siu2 tim4", "english": "less sweet" }
          ]
        }
        // ... remaining phrases
      ],
      "dialogueScenes": [
        {
          "id": "coffee-scene-1",
          "title": "Ordering milk tea at a cha chaan teng",
          "description": "You walk into a cha chaan teng and order your drink and a snack",
          "turns": [
            {
              "speaker": "other",
              "speakerLabel": "Staff",
              "phraseId": null,
              "chinese": "飲咩？",
              "jyutping": "jam2 me1",
              "romanization": "Jam² me¹?",
              "english": "What to drink?",
              "voiceId": "ALTERNATE_VOICE_ID",
              "pauseAfterMs": 2000
            },
            {
              "speaker": "user",
              "speakerLabel": "You",
              "phraseId": "coffee-002",
              "chinese": "凍奶茶，少甜",
              "jyutping": "dung3 naai5 caa4 siu2 tim4",
              "romanization": "Dung³ naai⁵ caa⁴, siu² tim⁴",
              "english": "Iced milk tea, less sweet",
              "voiceId": null,
              "pauseAfterMs": 3000
            },
            {
              "speaker": "other",
              "speakerLabel": "Staff",
              "phraseId": null,
              "chinese": "要唔要食嘢？",
              "jyutping": "jiu3 m4 jiu3 sik6 je5",
              "romanization": "Jiu³ m⁴ jiu³ sik⁶ je⁵?",
              "english": "Want anything to eat?",
              "voiceId": "ALTERNATE_VOICE_ID",
              "pauseAfterMs": 2000
            },
            {
              "speaker": "user",
              "speakerLabel": "You",
              "phraseId": "coffee-008",
              "chinese": "要一個菠蘿包",
              "jyutping": "jiu3 jat1 go3 bo1 lo4 baau1",
              "romanization": "Jiu³ jat¹ go³ bo¹ lo⁴ baau¹",
              "english": "A pineapple bun please",
              "voiceId": null,
              "pauseAfterMs": 2000
            },
            {
              "speaker": "other",
              "speakerLabel": "Staff",
              "phraseId": null,
              "chinese": "堂食定外賣？",
              "jyutping": "tong4 sik6 ding6 ngoi6 maai6",
              "romanization": "Tong⁴ sik⁶ ding⁶ ngoi⁶ maai⁶?",
              "english": "Eat in or takeaway?",
              "voiceId": "ALTERNATE_VOICE_ID",
              "pauseAfterMs": 2000
            },
            {
              "speaker": "user",
              "speakerLabel": "You",
              "phraseId": "coffee-015",
              "chinese": "堂食，唔該",
              "jyutping": "tong4 sik6 m4 goi1",
              "romanization": "Tong⁴ sik⁶, m⁴ goi¹",
              "english": "Eat in, thanks",
              "voiceId": null,
              "pauseAfterMs": 1500
            }
          ]
        }
        // ... more dialogue scenes
      ]
    }
    // ... more topics
  ]
}
```

---

## A4. OFFLINE DOWNLOAD SYSTEM

### A4.1 What needs to be downloadable

The user must be able to use the app **completely offline** after downloading content. This means every piece of content the app displays or plays must be available locally.

| Content type | Storage location | When downloaded |
|-------------|-----------------|----------------|
| App shell (HTML/CSS/JS) | Service Worker cache | On first load (automatic) |
| Phrase data (JSON) | IndexedDB `phrases` store | On first load (all topics) + on app update |
| Topic metadata (JSON) | IndexedDB `topics` store | On first load (all topics) |
| Dialogue scene data | IndexedDB (within topic JSON) | On first load (all topics) |
| Audio — library phrases | Cache API (`shadowspeak-audio-v1`) | When phrase is saved to library |
| Audio — active topic | Cache API | When user taps "Download for offline" on topic |
| Audio — daily lesson | Cache API | When lesson is built (pre-download all lesson audio) |
| User settings | IndexedDB `settings` store | Always local |
| Library state | IndexedDB `library` store | Always local |
| Session history | IndexedDB `sessions` store | Always local |
| SRS data | IndexedDB (within `library` entries) | Always local |

### A4.2 Download manager service

```js
// src/services/offlineManager.js

import { storage } from './storage';
import { textToSpeech } from './api';

/**
 * Download all content for offline use.
 * Called on first app load and when new content is available.
 *
 * @param {string} language - Language pack ID
 * @param {(progress: {phase: string, current: number, total: number}) => void} onProgress
 */
async function downloadAllContent(language, onProgress) {
  const phases = ['phrases', 'audio'];

  // Phase 1: Cache all phrase data in IndexedDB
  onProgress({ phase: 'Saving phrases', current: 0, total: 1 });
  const topicFiles = await loadTopicFiles(language);
  const db = await storage.getDB();

  let phraseCount = 0;
  for (const categoryFile of topicFiles) {
    for (const topic of categoryFile.topics) {
      await db.put('topics', {
        id: topic.id,
        category: categoryFile.category.id,
        name: topic.name,
        description: topic.description,
        phraseCount: topic.phraseCount,
        imageGradient: topic.imageGradient,
        dialogueSceneCount: topic.dialogueScenes?.length || 0,
      });

      for (const phrase of topic.phrases) {
        await db.put('phrases', {
          ...phrase,
          topicId: topic.id,
          categoryId: categoryFile.category.id,
        });
        phraseCount++;
      }

      // Store dialogue scenes alongside topic
      if (topic.dialogueScenes) {
        await db.put('topics', {
          ...await db.get('topics', topic.id),
          dialogueScenes: topic.dialogueScenes,
        });
      }
    }
  }

  onProgress({ phase: 'Phrases saved', current: phraseCount, total: phraseCount });

  // Phase 2: Pre-generate audio for starter phrases + library phrases
  const libraryEntries = await db.getAll('library');
  const starterIds = (await loadLanguagePack(language)).starterPhraseIds;
  const phrasesToCache = new Set([
    ...libraryEntries.map(e => e.phraseId),
    ...starterIds,
  ]);

  let audioCurrent = 0;
  const audioTotal = phrasesToCache.size * 2; // 2 speeds per phrase

  for (const phraseId of phrasesToCache) {
    const phrase = await db.get('phrases', phraseId);
    if (!phrase) continue;

    for (const speed of [0.75, 1.0]) {
      onProgress({
        phase: 'Downloading audio',
        current: audioCurrent,
        total: audioTotal,
      });

      await cacheAudioForPhrase(phrase, language, speed);
      audioCurrent++;
    }
  }

  onProgress({ phase: 'Complete', current: audioTotal, total: audioTotal });
}

/**
 * Download all audio for a specific topic.
 * Called when user taps "Download for offline" on a topic card.
 *
 * @param {string} topicId
 * @param {string} language
 * @param {(progress: {current: number, total: number}) => void} onProgress
 */
async function downloadTopicAudio(topicId, language, onProgress) {
  const db = await storage.getDB();
  const allPhrases = await db.getAll('phrases');
  const topicPhrases = allPhrases.filter(p => p.topicId === topicId);

  const total = topicPhrases.length * 2; // 2 speeds
  let current = 0;

  for (const phrase of topicPhrases) {
    for (const speed of [0.75, 1.0]) {
      const cached = await getCachedAudio(phrase.id, language, speed);
      if (!cached) {
        await cacheAudioForPhrase(phrase, language, speed);
      }
      current++;
      onProgress({ current, total });
    }
  }
}

/**
 * Download audio for all phrases in today's lesson.
 * Called by lesson builder before starting a session.
 */
async function downloadLessonAudio(phrases, language) {
  for (const phrase of phrases) {
    for (const speed of [0.75, 1.0]) {
      const cached = await getCachedAudio(phrase.id, language, speed);
      if (!cached) {
        try {
          await cacheAudioForPhrase(phrase, language, speed);
        } catch (error) {
          // Non-fatal: phrase will play from network or show error
          logger.warn(`Could not pre-cache audio for ${phrase.id}`);
        }
      }
    }
  }
}

/**
 * Check how much storage the app is using.
 * @returns {Promise<{audioMB: number, dataMB: number, totalMB: number}>}
 */
async function getStorageUsage() {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    const totalMB = Math.round((estimate.usage || 0) / 1024 / 1024);
    return { totalMB };
  }
  return { totalMB: 0 };
}

/**
 * Clear all cached audio. Keeps phrase data and user data.
 */
async function clearAudioCache() {
  await caches.delete(AUDIO_CACHE_NAME);
}

/**
 * Check if a specific topic has all audio cached.
 */
async function isTopicDownloaded(topicId, language) {
  const db = await storage.getDB();
  const allPhrases = await db.getAll('phrases');
  const topicPhrases = allPhrases.filter(p => p.topicId === topicId);

  for (const phrase of topicPhrases) {
    const cached = await getCachedAudio(phrase.id, language, 1.0);
    if (!cached) return false;
  }
  return true;
}

export {
  downloadAllContent,
  downloadTopicAudio,
  downloadLessonAudio,
  getStorageUsage,
  clearAudioCache,
  isTopicDownloaded,
};
```

### A4.3 Download UI components

#### Topic card download indicator

Each topic card should show one of three states:

```
1. NOT DOWNLOADED: Small cloud-download icon (outline) in corner
   Tapping plays from network (requires online)

2. DOWNLOADING: Progress circle replacing the icon
   Shows percentage (0-100%)

3. DOWNLOADED: Small checkmark icon in corner
   Fully available offline
```

#### Settings screen storage section

```
Offline Storage
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Audio cache          42 MB
Phrase data           2 MB
User data            <1 MB
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total                44 MB

[Download All Audio]     [Clear Audio Cache]
```

#### First-launch download flow

On first launch after onboarding:

```
Step 1: App loads instantly (shell from service worker)
Step 2: Background: save all phrase data to IndexedDB (fast, JSON only, ~2MB)
Step 3: Background: generate + cache audio for 5 starter phrases (10 files at ~50KB each = ~500KB)
Step 4: Show toast: "Your first lesson is ready. Press play!"
Step 5: Background (non-blocking): continue caching audio for "The Very Basics" category
```

The user can start their first lesson immediately after Step 3. Audio for non-starter phrases generates on demand during the lesson.

### A4.4 Lesson builder pre-download integration

Update the lesson builder to pre-download before starting:

```js
// In lessonBuilder.js, update buildLesson:

async function buildLesson(targetMinutes, language) {
  // ... existing lesson building logic ...

  const lesson = resolvePhrasesForLesson(entries);

  // Pre-download all lesson audio before returning
  // Show loading indicator to user
  await downloadLessonAudio(lesson, language);

  return lesson;
}
```

The HeroCard "Start lesson" button should show a brief loading state:
```
Tap "Start lesson"
→ Button changes to "Preparing lesson..." with spinner
→ Lesson builds (< 1 second)
→ Audio pre-downloads for all lesson phrases (< 5 seconds for cached, longer for first time)
→ Session starts automatically
```

### A4.5 Audio cache key format

Standardize the cache key format across all services:

```
Cache name: "shadowspeak-audio-v1"
Key format: "audio/{language}/{phraseId}/{speed}"

Examples:
  audio/cantonese/coffee-001/1.0
  audio/cantonese/coffee-001/0.75
  audio/mandarin/greeting-001/1.0
  audio/cantonese/custom-abc123/1.0

For dialogue "other" speaker (different voice):
  audio/cantonese/dialogue/{sceneId}/{turnIndex}/{speed}

Examples:
  audio/cantonese/dialogue/coffee-scene-1/0/1.0   (first turn, natural speed)
  audio/cantonese/dialogue/coffee-scene-1/0/0.75   (first turn, slower)
```

### A4.6 Verification checklist for offline

```
□ AIRPLANE MODE TEST (do this after Sprint 1 is complete):

  1. Load app while online. Browse 2 topics. Save 5 phrases to library. Start and complete one lesson.
  2. Enable airplane mode.
  3. Verify:
     □ App loads (service worker serves cached shell)
     □ Home screen renders with all categories and topic cards
     □ Topic cards show correct phrase counts and progress
     □ Library shows all 5 saved phrases
     □ Tapping a saved phrase plays audio (from cache)
     □ Starting a lesson works (all lesson phrases have cached audio)
     □ Shadow session plays audio correctly
     □ Speed toggle works (both speeds cached)
     □ Repeat-one works
     □ "I know this!" updates SRS state (stored locally)
     □ End-of-session summary displays
     □ Streak updates
     □ Settings screen works
     □ Stats screen shows accurate data
  4. Verify these show "offline" indicators:
     □ AI Conversation: "Requires internet connection"
     □ Pronunciation scoring: records audio, shows "Score pending — will score when online"
     □ Custom phrase: "Internet needed to generate audio"
     □ Topic not downloaded: "Download this topic for offline use"
  5. Disable airplane mode.
  6. Verify:
     □ Queued pronunciation scores process and display
     □ Any pending audio downloads resume
     □ No duplicate data or state corruption
```

---

## A5. CONTENT GENERATION WORKFLOW

When Claude Code is building the phrase data files, follow this workflow:

```
For each topic:

1. Create the phrase list following the CONVERSATION FLOW order (Section A1, Rule 3)
   - Start with what you say first in the situation
   - Progress through the natural conversation
   - End with wrap-up phrases (goodbye, thanks, paying)

2. For each phrase:
   - Write the Chinese (colloquial Cantonese, Rule 8)
   - Generate Jyutping using cantonese.ai Text-to-Jyutping API
   - Write display romanization with superscript tone marks
   - Write natural English translation (Rule 10)
   - Write specific context (Rule 1)
   - Break into word-by-word array (Rule 4)
   - Assign difficulty (1/2/3)

3. Create 2-3 dialogue scenes (Rule 2):
   - 4-8 turns each (Rule 6)
   - Mix user + other speakers
   - "Other" speaker's lines are common responses (Rule 7)
   - Link user turns to phrase IDs where possible
   - Other speaker turns may introduce phrases NOT in the topic's phrase list
     (these are listening comprehension — the user hears them but doesn't need to produce them)

4. Validate:
   □ Every phrase has all required fields per Section 5.3
   □ Every phrase has a non-empty words array
   □ All Jyutping is valid (tone numbers 1-6 on every syllable)
   □ Dialogue scene turns alternate between user and other
   □ Dialogue scene phraseIds reference real phrase IDs in the same topic
   □ No duplicate phrase IDs across any topic
   □ Phrase count matches the topic's phraseCount field
```

---

*End of implementation guide. This is the single source of truth. Read it completely before writing any code. Follow it exactly.*
