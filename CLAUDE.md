# ShadowSpeak — Claude Code Context

> This is the bridge between the codebase and the Obsidian vault.
> At the start of every session, read the vault files listed below.

---

## Vault Context

The full project brain lives in the Obsidian vault at:
`/Users/faithkayiwa/Documents/Faith Second Brain 2026/03 Projects/ShadowSpeakLaunch/`

**When Faith says "sync the vault" or "update Obsidian":** follow `SYNC-VAULT.md` (repo root) — code → vault direction.
**When Faith says "apply vault changes", "I updated the vault", or "implement what's in the vault":** follow `APPLY-VAULT.md` (repo root) — vault → code direction.

---

### Session start checklist (do this before writing any code)

1. **Read the Active Backlog** — check the 🔒 Active Sessions table. If another session has claimed the files you need, stop and tell Faith.
2. **Claim your scope** — add a row to the Active Sessions table: your session name, what you're building, which `src/` folders you'll touch.
3. **Read the 4 core vault files** below.
4. **Then start building.**

At session end:
1. Say "sync the vault" → follow `SYNC-VAULT.md`
2. Remove your row from Active Sessions
3. Confirm vault lock is set back to UNLOCKED

---

### Always read at session start

| File | What's in it |
|---|---|
| `/Users/faithkayiwa/Documents/Faith Second Brain 2026/03 Projects/ShadowSpeakLaunch/CLAUDE.md` | Project overview, current status, version, what's live |
| `/Users/faithkayiwa/Documents/Faith Second Brain 2026/03 Projects/ShadowSpeakLaunch/02 Development/(C) Active Backlog.md` | Known bugs + prioritised backlog — what to build next |
| `/Users/faithkayiwa/Documents/Faith Second Brain 2026/03 Projects/ShadowSpeakLaunch/02 Development/(C) Architecture Reference.md` | Full tech stack, folder structure, key architectural notes |
| `/Users/faithkayiwa/Documents/Faith Second Brain 2026/03 Projects/ShadowSpeakLaunch/04 Released/(C) ShadowSpeak v1.15.35 — Released Features.md` | Latest shipped features |

---

### Read when relevant

**UI / copy work:**
| File | What's in it |
|---|---|
| `/Users/faithkayiwa/Documents/Faith Second Brain 2026/03 Projects/ShadowSpeakLaunch/01 Design/(C) Brand Voice Guidelines.md` | Brand voice, tone, personas, CTAs, words to avoid |
| `/Users/faithkayiwa/Documents/Faith Second Brain 2026/03 Projects/ShadowSpeakLaunch/01 Design/(C) Screens & Layout.md` | All 50 screens documented with layout specs |
| `/Users/faithkayiwa/Documents/Faith Second Brain 2026/03 Projects/ShadowSpeakLaunch/01 Design/Onboarding Flow — 16 Screens.md` | Detailed 16-screen onboarding flow |
| `/Users/faithkayiwa/Documents/Faith Second Brain 2026/03 Projects/ShadowSpeakLaunch/01 Design/(C) UX UI Design Brief.md` | Full UX/UI design brief — every screen, component, state |
| `/Users/faithkayiwa/Documents/Faith Second Brain 2026/03 Projects/ShadowSpeakLaunch/01 Design/(C) Practice Modes Design.md` | Pixel-level specs for all 5 practice modes |

**Strategy / product work:**
| File | What's in it |
|---|---|
| `/Users/faithkayiwa/Documents/Faith Second Brain 2026/03 Projects/ShadowSpeakLaunch/00 Ideas & Research/(C) Feature Roadmap.md` | Prioritised feature pipeline — what's next after current build |
| `/Users/faithkayiwa/Documents/Faith Second Brain 2026/03 Projects/ShadowSpeakLaunch/00 Ideas & Research/(C) Brand Strategy.md` | Brand positioning and go-to-market strategy |
| `/Users/faithkayiwa/Documents/Faith Second Brain 2026/03 Projects/ShadowSpeakLaunch/00 Ideas & Research/(C) Platform Vision.md` | 3-year arc — what ShadowSpeak becomes as an AI coaching platform |
| `/Users/faithkayiwa/Documents/Faith Second Brain 2026/03 Projects/ShadowSpeakLaunch/00 Ideas & Research/(C) Competitive Intelligence.md` | Competitor analysis and market gaps |
| `/Users/faithkayiwa/Documents/Faith Second Brain 2026/03 Projects/ShadowSpeakLaunch/00 Ideas & Research/(C) Pricing Strategy.md` | Pricing model, tiers, and rationale |
| `/Users/faithkayiwa/Documents/Faith Second Brain 2026/03 Projects/ShadowSpeakLaunch/00 Ideas & Research/(C) Launch Marketing Plays.md` | Distribution tactics and launch marketing plan |

**Process / standards:**
| File | What's in it |
|---|---|
| `/Users/faithkayiwa/Documents/Faith Second Brain 2026/03 Projects/ShadowSpeakLaunch/06 Skills/(C) ShadowSpeak App Dev Standards.md` | Dev conventions, testing standards, code style |
| `/Users/faithkayiwa/Documents/Faith Second Brain 2026/03 Projects/ShadowSpeakLaunch/06 Skills/(C) release.md` | Step-by-step release skill |
| `/Users/faithkayiwa/Documents/Faith Second Brain 2026/03 Projects/ShadowSpeakLaunch/COMMANDS.md` | All available skills and commands for this project |
| `/Users/faithkayiwa/Documents/Faith Second Brain 2026/03 Projects/ShadowSpeakLaunch/02 Development/(C) Implementation Guide — Historical.md` | Original full build guide — historical decisions and architectural rationale |
| `DATA-FILES-HANDOFF.md` *(repo root — stays here, documents repo JSON files)* | JSON lesson data file structure and usage |

---

## Codebase

- **Repo:** `flantzhk/shadowspeaklaunch` on GitHub
- **Live at:** `https://flantzhk.github.io/shadowspeaklaunch/` (PWA)
- **Version:** v1.23.0 (source of truth: `src/utils/constants.js` → `APP_VERSION`)
- **Version reporting:** Always tell the user the new version number after every deploy/publish. State it clearly in the response: "Deployed as vX.X.X"
- **Note:** `package.json` is now synced — both should be bumped together on every deploy

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18.3 + Vite |
| Auth | Firebase Auth (`shadowspeak-22f04`) — email/password + Google OAuth |
| API proxy | Cloudflare Worker at `api.shadowspeak.app` |
| Scoring + TTS | cantonese.ai |
| Local storage | IndexedDB (6 stores) |
| Routing | Hash-based — fully static, no SSR |
| State | React Context only — no Redux/Zustand |
| Deploy | GitHub Actions → GitHub Pages |

---

## Folder Structure

```
src/
├── components/
│   ├── screens/          ← all 50 screen components
│   ├── layout/           ← Sidebar, BottomTabBar, TopBar, NowPlayingBar
│   └── ui/               ← shared UI primitives
├── contexts/
│   ├── AppContext.jsx     ← global settings (streak, language, goals, toggles)
│   └── AudioContext.jsx   ← playback state + AudioEngine
├── services/
│   ├── api.js             ← HTTP client (pronunciation, TTS, STT)
│   ├── auth.js            ← Firebase auth
│   ├── audio.js           ← AudioEngine class
│   ├── storage.js         ← IndexedDB
│   ├── srs.js             ← SM-2 spaced repetition
│   ├── streak.js          ← streak tracking + freeze logic
│   ├── lessonBuilder.js   ← smart daily lesson generator
│   ├── aiChat.js          ← AI conversation — calls Claude 3.5 Haiku via Worker; hardcoded fallback for offline only
│   ├── notifications.js   ← Web Push subscribe/unsubscribe; VAPID via Worker CRON
│   ├── offlineManager.js  ← offline queue sync
│   ├── languageManager.js ← language pack loader
│   └── dialogueLoader.js  ← dialogue scene loader
└── utils/
    └── constants.js       ← APP_VERSION, score thresholds
```

---

## Rules

- Bump `APP_VERSION` in `src/utils/constants.js` on every deploy
- Bump `CACHE_VERSION` in `sw.js` when changing precached files
- No em dashes in user-facing text
- Minimum touch target: 44px (56px for primary actions)
- When completing a feature: update the vault backlog (`(C) Active Backlog.md`) — mark the item done, move it to the released features note if it's a full feature ship

---

## Coding Principles

These apply to every session. Favour caution over speed on non-trivial work.

**Think Before Coding** — State your assumptions explicitly before writing anything. If uncertain about scope or intent, ask. Surface tradeoffs rather than making silent decisions.

**Simplicity First** — Write only the minimum code needed to solve the specific request. Before submitting, ask: "Would a senior engineer say this is overcomplicated?" If yes, simplify. No speculative features, no premature abstraction.

**Surgical Changes** — Modify only what the task requires. Match the existing code style, even if you'd do it differently. Do not remove dead code that your changes didn't create. Do not touch unrelated files.

**Goal-Driven Execution** — Before starting multi-step work, state a brief plan with clear success criteria and checkpoints. Transform tasks into verifiable objectives. Don't start building until the goal is agreed.

---

## Design Tokens

Canonical source: `src/styles/variables.css`. These must always match.

| Token | CSS Variable | Value |
|---|---|---|
| Body background (cream) | `--color-bg` | `#F7F4EC` |
| Page background | `--color-bg-page` | `#EDE8DC` |
| Surface (white) | `--color-surface` | `#FFFFFF` |
| Brand dark (forest) | `--color-brand-dark` | `#1A2A18` |
| Brand green | `--color-brand-green` | `#8BB82B` |
| Brand lime (accent) | `--color-brand-lime` | `#C5E85A` |
| Brand lime muted | `--color-brand-lime-muted` | `rgba(197, 232, 90, 0.15)` |
| Jyutping / Pinyin purple | `--color-jyutping` | `#8F6AE8` |
| Primary text | `--color-text-primary` | `#1A1A1A` |
| Secondary text | `--color-text-secondary` | `#5A5A5A` |
| Muted text | `--color-text-muted` | `#9A9A9A` |
| Error / poor score | `--color-error` / `--color-score-poor` | `#D04040` |
| Warning / fair score | `--color-warning` / `--color-score-fair` | `#E8A030` |
| Success / excellent score | `--color-success` / `--color-score-excellent` | `#2A5A10` |
| Streak orange | `--color-streak-orange` | `#E8703A` |
| Border (subtle) | `--color-border` | `rgba(0, 0, 0, 0.06)` |
| Primary font | `--font-family` | DM Sans |
| CJK font | — | Noto Sans HK / Noto Sans SC |

---

## Known Stubs (don't pretend these work)

- Apple Sign-In → code live (`signInWithApple()` in `auth.js`), but needs Firebase console config.
- Apple Sign-In → code live (`signInWithApple()` in `auth.js`), but needs Firebase console config (Authentication → Sign-in method → Apple → Enable). Shows graceful error until configured.

---

## Workflow for Releases

When shipping a feature:
1. Implement + test
2. Bump `APP_VERSION` in `constants.js`
3. Bump `CACHE_VERSION` in `sw.js`
4. Commit + push + PR against `main` + merge
5. Update vault: mark backlog item done in `(C) Active Backlog.md`, add entry to `(C) ShadowSpeak v[X] — Released Features.md`
6. Update `CLAUDE.md` current status line in both the vault and here if version changes

---

## Current Status (as of v1.23.0 — 2026-04-18)

**New in v1.23.0:** Cross-device sync for library + streak. `src/services/sync.js` mirrors every library write to `users/{uid}/library/{phraseId}` with a `_updatedAt` stamp; streak fields sync to `users/{uid}`. On login, remote is merged into IDB (newer wins). **Requires Firestore security rules below.**

### Firestore rules (must be deployed manually)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      match /library/{phraseId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

## Current Status (as of v1.22.1 — 2026-04-18)

**Live:** Shadow speaking, Prompt Drill, Speed Run, Tone Gym, AI Conversation (real Claude 3.5 Haiku), Spaced Repetition (SM-2), full gamification (streaks, XP, 13 achievements), 50 screens, desktop + mobile layouts. ElevenLabs English TTS in shadow mode. Web Push notifications. Apple Sign-In (code live, Firebase config pending). **Stripe Checkout live on web** — all 4 plans wired (Monthly, Annual with trial, Lifetime, Family). Cookie consent banner (GDPR/UK-PECR). Email capture modal (streak milestones 3d + 7d). Firebase Analytics events. Firestore user doc on registration. Account deletion (Apple guideline 5.1.1). Privacy/Terms links on paywall + register. Streak freeze confirmation toasts. Send feedback button. Visible error states on all key API flows. **PostHog analytics (consent-gated, EU region). Subscription hook (real-time Firestore + offline fallback).** **Internal admin dashboard (#admin, UID-gated).** **Support page (#support — FAQ + contact). In-app data export (Download my data — JSON).**

**Remaining gaps:**
1. Stripe webhook — subscription lifecycle not written to Firestore yet (manual setup needed, see `10 Monetisation/(C) Stripe Implementation.md`)
2. Pro feature gating — no subscription check on pro features yet (needs webhook first)
3. RevenueCat — needed for App Store iOS/Android (separate task)
4. Apple Sign-In — code live, Firebase console config pending
