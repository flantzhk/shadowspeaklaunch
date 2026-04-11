# CHANGE DIRECTIVE: API Proxy + Simplified Auth Flow

> **Read this before continuing any work. These changes override the corresponding sections in IMPLEMENTATION-GUIDE.md.**

---

## What changed and why

The cantonese.ai API key is now owned and paid for by ShadowSpeak. Users never see, enter, or manage an API key. All API calls route through our own proxy server which adds the key server-side.

This removes the API Key Setup screen, simplifies onboarding, and eliminates all client-side API key handling.

---

## 1. NEW API ARCHITECTURE

### Before (old — do NOT implement)
```
App (client) ──── api_key in request body ────→ cantonese.ai/api/*
```

### After (new — implement THIS)
```
App (client) ──── auth token in header ────→ api.shadowspeak.app/* ────→ cantonese.ai/api/*
                                                    │
                                            Cloudflare Worker:
                                            - Validates user auth token
                                            - Injects cantonese.ai API key
                                            - Rate limits per user
                                            - Forwards request
                                            - Returns response
```

### Changes to `src/utils/constants.js`

```js
// REMOVE THIS:
// export const API_BASE_URL = 'https://cantonese.ai/api';

// REPLACE WITH:
export const API_BASE_URL = 'https://api.shadowspeak.app';

// Endpoints stay the same paths:
export const API_ENDPOINTS = {
  SCORE_PRONUNCIATION: '/score-pronunciation',
  TTS: '/tts',
  STT: '/stt',
  TEXT_TO_JYUTPING: '/text-to-jyutping',
};
```

### Changes to `src/services/api.js`

Remove all API key handling. Replace with auth token.

```js
// REMOVE: getApiKey(), encryptApiKey(), decryptApiKey(), _cachedApiKey
// REMOVE: any FormData.append('api_key', ...) lines
// REMOVE: any JSON body { api_key: ... } fields

// NEW: Auth token from user session
function getAuthToken() {
  return sessionStorage.getItem('shadowspeak_token') || null;
}

// NEW: All requests include auth header instead of api_key field
async function fetchWithAuth(url, options = {}) {
  const token = getAuthToken();
  if (!token) {
    throw new ApiError('Not authenticated', 401, url);
  }

  const headers = {
    ...(options.headers || {}),
    'Authorization': `Bearer ${token}`,
  };

  return fetchWithRetry(url, { ...options, headers });
}
```

### Updated API call patterns

**Score Pronunciation (before):**
```js
// OLD — do not use
const formData = new FormData();
formData.append('api_key', getApiKey());  // REMOVE THIS LINE
formData.append('audio', audioBlob, 'recording.ogg');
formData.append('text', expectedText);
formData.append('language', language);
```

**Score Pronunciation (after):**
```js
// NEW — proxy handles API key
async function scorePronunciation(audioBlob, expectedText, language = 'cantonese') {
  const formData = new FormData();
  // NO api_key field — proxy adds it server-side
  formData.append('audio', audioBlob, 'recording.ogg');
  formData.append('text', expectedText);
  formData.append('language', language);

  const response = await fetchWithAuth(
    `${API_BASE_URL}${API_ENDPOINTS.SCORE_PRONUNCIATION}`,
    { method: 'POST', body: formData }
  );

  return response.json();
}
```

**Text-to-Speech (before):**
```js
// OLD
const body = { api_key: getApiKey(), text, language, speed, ... };
```

**Text-to-Speech (after):**
```js
// NEW
async function textToSpeech(text, { language = 'cantonese', speed = 1.0, outputExtension = 'mp3' } = {}) {
  // NO api_key in body — proxy adds it
  const response = await fetchWithAuth(
    `${API_BASE_URL}${API_ENDPOINTS.TTS}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        language,
        speed,
        output_extension: outputExtension,
        frame_rate: '24000',
        should_use_turbo_model: false,
      }),
    }
  );

  // TTS returns audio binary directly
  return response.blob();
}
```

**Speech-to-Text (after):**
```js
async function speechToText(audioBlob) {
  const formData = new FormData();
  // NO api_key
  formData.append('data', audioBlob, 'audio.ogg');
  formData.append('with_timestamp', 'false');

  const response = await fetchWithAuth(
    `${API_BASE_URL}${API_ENDPOINTS.STT}`,
    { method: 'POST', body: formData }
  );

  return response.json();
}
```

**Text-to-Jyutping (unchanged — this endpoint is free, no auth needed):**
```js
async function textToJyutping(text, outputType = 'list') {
  // This hits cantonese.ai directly — free endpoint, no key needed
  const response = await fetch('https://cantonese.ai/api/text-to-jyutping', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, outputType }),
  });

  return response.json();
}
```

---

## 2. PROXY SERVER (Cloudflare Worker)

Create a Cloudflare Worker at `api.shadowspeak.app` with this logic:

```js
// cloudflare-worker/index.js

const CANTONESE_AI_KEY = ''; // Set as Cloudflare secret, never in code
const CANTONESE_AI_BASE = 'https://cantonese.ai/api';

// Allowed proxy paths
const ALLOWED_PATHS = ['/tts', '/stt', '/score-pronunciation'];

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*', // Lock to your domain in production
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Only POST allowed
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders });
    }

    // Validate path
    if (!ALLOWED_PATHS.includes(path)) {
      return new Response('Not found', { status: 404, headers: corsHeaders });
    }

    // Validate auth token
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders });
    }
    const token = authHeader.slice(7);
    const user = await validateToken(token, env);
    if (!user) {
      return new Response('Invalid token', { status: 401, headers: corsHeaders });
    }

    // Rate limit: 100 requests per user per hour
    const rateLimitKey = `rate:${user.id}:${Math.floor(Date.now() / 3600000)}`;
    const count = await env.KV.get(rateLimitKey) || 0;
    if (parseInt(count) >= 100) {
      return new Response('Rate limit exceeded', { status: 429, headers: corsHeaders });
    }
    await env.KV.put(rateLimitKey, String(parseInt(count) + 1), { expirationTtl: 3600 });

    // Clone request body and inject API key
    const contentType = request.headers.get('Content-Type') || '';
    let forwardBody;

    if (contentType.includes('multipart/form-data')) {
      // For STT and score-pronunciation: add api_key as form field
      const formData = await request.formData();
      formData.append('api_key', env.CANTONESE_AI_KEY);
      forwardBody = formData;
    } else {
      // For TTS: add api_key to JSON body
      const json = await request.json();
      json.api_key = env.CANTONESE_AI_KEY;
      forwardBody = JSON.stringify(json);
    }

    // Forward to cantonese.ai
    const forwardHeaders = new Headers();
    if (!contentType.includes('multipart/form-data')) {
      forwardHeaders.set('Content-Type', 'application/json');
    }

    const apiResponse = await fetch(`${CANTONESE_AI_BASE}${path}`, {
      method: 'POST',
      headers: forwardHeaders,
      body: forwardBody,
    });

    // Return response with CORS headers
    const responseHeaders = new Headers(apiResponse.headers);
    Object.entries(corsHeaders).forEach(([k, v]) => responseHeaders.set(k, v));

    return new Response(apiResponse.body, {
      status: apiResponse.status,
      headers: responseHeaders,
    });
  },
};

async function validateToken(token, env) {
  // Validate against your auth provider (Supabase, Firebase, custom)
  // Return user object { id, email } or null
  // Implementation depends on your auth choice
}
```

### Cloudflare Worker setup steps:
1. `npm create cloudflare@latest shadowspeak-api`
2. Paste the worker code above
3. Set secret: `wrangler secret put CANTONESE_AI_KEY`
4. Create KV namespace for rate limiting: `wrangler kv namespace create RATE_LIMIT`
5. Deploy: `wrangler deploy`
6. Set custom domain: `api.shadowspeak.app` in Cloudflare dashboard

---

## 3. NEW USER FLOW

### Registration flow (simplified)

```
Landing Page
  └─→ [Start free] or [Create account]
        └─→ Registration Screen
              - First name
              - Email
              - Password
              - [Create account] button
              - Google / Apple social sign-in
              └─→ Backend creates account, returns auth token
                    └─→ Token stored in sessionStorage
                          └─→ Ready Screen
                                - "You're all set"
                                - 5 phrases ready / 10 min / 0 day streak
                                - [Start your first lesson]
                                      └─→ Home Screen (app)
```

### Login flow

```
Landing Page
  └─→ [Sign in]
        └─→ Login Screen
              - Email
              - Password
              - [Sign in] button
              - Google / Apple social sign-in
              - [Forgot password?]
              └─→ Backend validates, returns auth token
                    └─→ Token stored in sessionStorage
                          └─→ Home Screen (app)
```

### No API key setup screen. It does not exist. Do not build it.

---

## 4. WHAT TO REMOVE FROM EXISTING CODE

If any of these exist, delete them:

```
□ Remove: any getApiKey() function
□ Remove: any encryptApiKey() / decryptApiKey() functions
□ Remove: any API key storage in IndexedDB
□ Remove: any API key field in UserSettings type/schema
□ Remove: any API key input field in Settings screen UI
□ Remove: any API Key Setup screen component
□ Remove: any 'api_key' field in any API request body or FormData
□ Remove: any import of Web Crypto API for key encryption
□ Remove: any constants like API_KEY_STORAGE_KEY or ENCRYPTION_KEY_NAME
```

---

## 5. WHAT TO ADD

```
□ Add: auth token management (store in sessionStorage on login/register, clear on logout)
□ Add: fetchWithAuth() wrapper that adds Bearer token header to all API calls
□ Add: redirect to Login screen when token is missing or expired (401 response)
□ Add: Login screen component (email + password + social login)
□ Add: Registration screen component (name + email + password + social login)
□ Add: Forgot Password screen component (email input + success state)
□ Add: Ready screen component (shown once after first registration)
□ Add: Logout button in Settings screen (clears token, navigates to Login)
□ Add: API_BASE_URL constant pointing to proxy (https://api.shadowspeak.app)
```

---

## 6. UPDATED SETTINGS SCREEN

The Settings screen no longer has an API key section. New layout:

```
Settings
├── PRACTICE
│   ├── Daily goal          [20 min      ▾]
│   ├── Default speed       [Natural     ▾]
│   └── Auto-advance          [────●]
├── DISPLAY
│   ├── Show characters       [────●]
│   └── Show English          [────●]
├── NOTIFICATIONS
│   ├── Daily reminder        [────●]
│   └── Reminder time       [08:00       ▾]
├── LANGUAGE
│   └── Current language    [Cantonese   ▾]
├── STORAGE
│   ├── Audio cache              42 MB
│   ├── [Download All Audio]
│   └── [Clear Cache]
├── ACCOUNT
│   ├── Name                Faith Lantz
│   ├── Email               faith@lantz.co
│   └── [Sign out]
└── About ShadowSpeak · Privacy Policy · v1.0.0
```

No API key field. No API key management. No cantonese.ai references visible to the user.

---

## 7. UPDATED IndexedDB SCHEMA

### UserSettings — remove API key fields

```typescript
interface UserSettings {
  name: string;
  email: string;                        // Added
  dailyGoalMinutes: 5 | 10 | 15 | 20 | 30;
  reminderTime: string | null;
  currentLanguage: string;
  showCharacters: boolean;
  showEnglish: boolean;
  showRomanization: boolean;
  autoAdvance: boolean;
  defaultSpeed: "slower" | "natural";
  streakCount: number;
  streakLastDate: string | null;
  totalPracticeSeconds: number;
  onboardingCompleted: boolean;
  // REMOVED: apiKey — no longer stored on client
}
```

---

## 8. AUTH IMPLEMENTATION NOTES

Choose ONE auth provider. Recommendation: **Supabase** (free tier, handles email/password + Google + Apple, returns JWT tokens, works with Cloudflare Workers).

```
Supabase setup:
1. Create project at supabase.com
2. Enable Email/Password auth
3. Enable Google OAuth provider
4. Enable Apple OAuth provider
5. Get project URL + anon key
6. In the app: use @supabase/supabase-js client
7. In the proxy worker: validate JWT using Supabase JWT secret
```

If Supabase adds too much bundle size (~40KB), use their REST API directly with fetch instead of the SDK:

```js
// Lightweight auth without SDK
async function signUp(email, password, name) {
  const response = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ email, password, data: { name } }),
  });
  const data = await response.json();
  if (data.access_token) {
    sessionStorage.setItem('shadowspeak_token', data.access_token);
    sessionStorage.setItem('shadowspeak_refresh', data.refresh_token);
  }
  return data;
}

async function signIn(email, password) {
  const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json();
  if (data.access_token) {
    sessionStorage.setItem('shadowspeak_token', data.access_token);
    sessionStorage.setItem('shadowspeak_refresh', data.refresh_token);
  }
  return data;
}

async function signOut() {
  sessionStorage.removeItem('shadowspeak_token');
  sessionStorage.removeItem('shadowspeak_refresh');
  window.location.hash = '#login';
}

function isAuthenticated() {
  return !!sessionStorage.getItem('shadowspeak_token');
}
```

### Token refresh

Supabase access tokens expire after 1 hour. Add a refresh check:

```js
async function refreshTokenIfNeeded() {
  const token = sessionStorage.getItem('shadowspeak_token');
  if (!token) return false;

  // Decode JWT to check expiry (no verification needed client-side)
  const payload = JSON.parse(atob(token.split('.')[1]));
  const expiresAt = payload.exp * 1000;
  const fiveMinutes = 5 * 60 * 1000;

  if (Date.now() > expiresAt - fiveMinutes) {
    const refreshToken = sessionStorage.getItem('shadowspeak_refresh');
    if (!refreshToken) return false;

    const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    const data = await response.json();
    if (data.access_token) {
      sessionStorage.setItem('shadowspeak_token', data.access_token);
      sessionStorage.setItem('shadowspeak_refresh', data.refresh_token);
      return true;
    }
    return false;
  }

  return true;
}
```

### Updated fetchWithAuth with auto-refresh

```js
async function fetchWithAuth(url, options = {}) {
  const isValid = await refreshTokenIfNeeded();
  if (!isValid) {
    signOut(); // Token expired and can't refresh — send to login
    throw new ApiError('Session expired. Please sign in again.', 401, url);
  }

  const token = sessionStorage.getItem('shadowspeak_token');
  const headers = {
    ...(options.headers || {}),
    'Authorization': `Bearer ${token}`,
  };

  return fetchWithRetry(url, { ...options, headers });
}
```

---

## 9. UPDATED ROUTER — AUTH GUARD

```js
// In App.jsx, wrap the router with auth check

function App() {
  const { route } = useRouter();

  // Public routes (no auth required)
  const publicRoutes = ['login', 'register', 'forgot-password', 'landing'];

  if (!publicRoutes.includes(route.path) && !isAuthenticated()) {
    // Not logged in, trying to access protected route
    window.location.hash = '#login';
    return null;
  }

  // Authenticated user trying to access login/register — send to home
  if (['login', 'register'].includes(route.path) && isAuthenticated()) {
    window.location.hash = '#home';
    return null;
  }

  return <ScreenRouter route={route} />;
}
```

---

## 10. CONTENT SECURITY POLICY UPDATE

```html
<!-- In index.html — updated connect-src -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self';
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  connect-src 'self' https://api.shadowspeak.app https://cantonese.ai/api/text-to-jyutping;
  media-src 'self' blob:;
  img-src 'self' data: blob:;
">
```

Note: `cantonese.ai/api/text-to-jyutping` is still called directly (free endpoint, no key). Everything else goes through `api.shadowspeak.app`.

---

## VERIFICATION CHECKLIST

After implementing these changes, confirm:

```
□ No string "api_key" appears anywhere in client-side code (search entire src/ folder)
□ No cantonese.ai URL appears in client code EXCEPT for text-to-jyutping
□ All API calls (TTS, STT, score-pronunciation) go through api.shadowspeak.app
□ All API calls include Authorization: Bearer <token> header
□ Login screen: enter email + password → get token → navigate to Home
□ Registration screen: enter name + email + password → get token → navigate to Ready screen → Home
□ Forgot password screen: enter email → show success state
□ Settings screen: no API key field visible
□ Settings screen: Sign out button clears token and navigates to Login
□ Unauthenticated user accessing #home gets redirected to #login
□ Authenticated user accessing #login gets redirected to #home
□ Token refresh works: after 50 minutes, next API call refreshes token silently
□ Expired token with no refresh: user gets redirected to login with "Session expired" message
□ Offline mode still works: cached audio plays, IndexedDB data loads, scoring queued
□ text-to-jyutping still works (direct call to cantonese.ai, no auth needed)
```

---

*End of change directive. This overrides the API and auth sections of IMPLEMENTATION-GUIDE.md.*
