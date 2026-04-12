# ShadowSpeak App Dev Standards

> Reference for Claude and the dev team. Keep this in sync when conventions change.

---

## Stack

| Layer | Tool |
|---|---|
| UI | React 18 + JSX |
| Build | Vite |
| Auth + DB | Firebase (project: `shadowspeak-22f04`) |
| API proxy | Cloudflare Worker at `api.shadowspeak.app` |
| Offline | IndexedDB via `idb` |
| PWA | `vite-plugin-pwa` |
| Testing | Vitest + React Testing Library + Firebase Emulators |

---

## Testing Setup (do this once per project)

### 1. Install

```bash
npm install -D vitest @vitest/ui jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

### 2. `vite.config.js` — add test block

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
  },
})
```

### 3. `src/test/setup.js`

```js
import '@testing-library/jest-dom'
```

### 4. `package.json` scripts

```json
"scripts": {
  "test": "vitest",
  "test:ui": "vitest --ui",
  "test:run": "vitest run"
}
```

### 5. Firebase Emulators (for service tests)

```bash
npm install -g firebase-tools
firebase init emulators   # select Auth, Firestore
firebase emulators:start
```

In test files that touch Firebase, point to emulators:

```js
import { connectAuthEmulator } from 'firebase/auth'
import { connectFirestoreEmulator } from 'firebase/firestore'
import { auth, db } from '../services/firebase'

connectAuthEmulator(auth, 'http://localhost:9099')
connectFirestoreEmulator(db, 'localhost', 8080)
```

---

## File Conventions

```
src/
  components/
    shared/
      Button.jsx
      Button.test.jsx      ← co-locate tests with component
  services/
    srs.js
    srs.test.js            ← unit tests for pure logic
  test/
    setup.js               ← global test setup only
    fixtures/              ← shared mock data
      user.js
      lesson.js
```

---

## What to Test (and what not to)

### Always test
- **Pure logic** in `src/services/` — SRS scoring, streak calculation, lesson builder, XP math
- **Custom hooks** — `useAudio`, `useProgress`, etc.
- **Critical UI paths** — login flow, lesson completion, saving to library

### Test when it's non-trivial
- Context providers (AudioContext, AuthContext) — test that they expose the right values
- Screen components — test that they render the right state given props/context

### Don't bother testing
- Firebase SDK calls directly (Firebase tests its own SDK)
- Vite config, build output
- Simple presentational components with no logic (e.g. a static card)
- Things that are easier to catch with TypeScript or a linter

---

## Example: Unit test (pure logic)

```js
// src/services/srs.test.js
import { describe, it, expect } from 'vitest'
import { calculateNextReview } from './srs'

describe('calculateNextReview', () => {
  it('increases interval on correct answer', () => {
    const result = calculateNextReview({ interval: 1, ease: 2.5 }, 'correct')
    expect(result.interval).toBeGreaterThan(1)
  })

  it('resets interval on fail', () => {
    const result = calculateNextReview({ interval: 10, ease: 2.5 }, 'fail')
    expect(result.interval).toBe(1)
  })
})
```

---

## Example: Component test

```js
// src/components/shared/Button.test.jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import Button from './Button'

describe('Button', () => {
  it('calls onClick when pressed', async () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Press me</Button>)
    await userEvent.click(screen.getByRole('button', { name: /press me/i }))
    expect(handleClick).toHaveBeenCalledOnce()
  })
})
```

---

## Example: Hook test

```js
// src/hooks/useStreak.test.js
import { renderHook } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { useStreak } from './useStreak'

describe('useStreak', () => {
  it('returns 0 streak for new user', () => {
    const { result } = renderHook(() => useStreak(null))
    expect(result.current.streak).toBe(0)
  })
})
```

---

## Versioning

- `APP_VERSION` is tracked in `package.json` → `version`
- Bump it on every deploy using semver (`major.minor.patch`)
- The version is shown on the Profile screen
- Claude should bump the version when deploying a meaningful change

---

## Firebase Rules

- Always use Firebase, never Supabase
- Firebase project ID: `shadowspeak-22f04`
- Auth + Firestore go through Firebase SDK directly
- External AI/API calls go through the Cloudflare Worker proxy at `api.shadowspeak.app`
- Never expose service account keys in client code

---

## Deploy Checklist

- [ ] `npm run build` passes with no errors
- [ ] `npm run test:run` passes
- [ ] `APP_VERSION` bumped in `package.json`
- [ ] Firebase security rules reviewed if schema changed
- [ ] PWA manifest / service worker not broken (check in Chrome DevTools > Application)
