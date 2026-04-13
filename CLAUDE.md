# ShadowSpeak — Claude Code Context

> This is the bridge between the codebase and the Obsidian vault.
> At the start of every session, read the vault files listed below.

---

## Vault Context (read these at session start)

The full project brain lives in the Obsidian vault. Read these files before doing anything:

| File | What's in it |
|---|---|
| `/Users/faithkayiwa/Documents/Faith Second Brain 2026/03 Projects/ShadowSpeakLaunch/CLAUDE.md` | Project overview, current status, version, what's live |
| `/Users/faithkayiwa/Documents/Faith Second Brain 2026/03 Projects/ShadowSpeakLaunch/02 Development/(C) Active Backlog.md` | Known bugs + prioritised backlog — what to build next |
| `/Users/faithkayiwa/Documents/Faith Second Brain 2026/03 Projects/ShadowSpeakLaunch/02 Development/(C) Architecture Reference.md` | Full tech stack, folder structure, key architectural notes |
| `/Users/faithkayiwa/Documents/Faith Second Brain 2026/03 Projects/ShadowSpeakLaunch/04 Released/(C) ShadowSpeak v1.15.33-34 — Released Features.md` | Latest shipped features |

Read all four before starting work. They are the source of truth for what exists and what's needed.

**When Faith says "sync the vault" or "update Obsidian":** follow the instructions in `SYNC-VAULT.md` (in this repo root). That file tells you exactly what to update, in which vault file, and in what format.

---

## Codebase

- **Repo:** `flantzhk/shadowspeaklaunch` on GitHub
- **Live at:** `shadowspeak.app` (PWA)
- **Version:** v1.15.34 (source of truth: `src/utils/constants.js` → `APP_VERSION`)
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

## Design Tokens

| Token | Value |
|---|---|
| Body background (cream) | `#F5F1EB` |
| Header/dark surfaces (forest) | `#1F3329` |
| Accent lime | `#C4F000` |
| Jyutping/Pinyin plum | `#8F6AE8` |
| White surfaces | `#FFFFFF` |
| Border/divider (stone) | `#EDE8E0` |
| Primary text (ink) | `#2C2C2C` |
| Error/badge red | `#F05A3A` |
| Primary font | DM Sans |
| CJK font | Noto Sans HK / Noto Sans SC |

---

## Known Stubs (don't pretend these work)

- Payments → `Screen13_PlanReveal` + `Screen14_Gate` exist in onboarding. No payment provider wired. Only remaining major gap.
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

## Current Status (as of v1.15.34 — 2026-04-13)

**Live:** Shadow speaking, Prompt Drill, Speed Run, Tone Gym, AI Conversation (real Claude 3.5 Haiku), Spaced Repetition (SM-2), full gamification (streaks, XP, 13 achievements), 50 screens, desktop + mobile layouts. ElevenLabs English TTS in shadow mode. Web Push notifications. Apple Sign-In (code live, Firebase config pending).

**One remaining gap:**
1. Payments — UI exists (`Screen13_PlanReveal`, `Screen14_Gate`), no provider wired yet (Stripe recommended)
