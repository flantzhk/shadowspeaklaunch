# SHADOWSPEAK — MISSING SCREENS DESIGN BRIEF

> **Completes the gaps identified in `DESIGN-AUDIT-MISSING-SCREENS.md`.**
> Use alongside `UXUI-DESIGN-BRIEF.md` and `PRACTICE-MODES-DESIGN.md`.
> Same branding, same design tokens, same component language.

---

## TABLE OF CONTENTS

### Round 1 — Ship Blockers
1. [Session Summary Screen](#1-session-summary-screen)
2. [Custom Phrase Input Modal](#2-custom-phrase-input-modal)
3. [Mic Permission Explanation](#3-mic-permission-explanation)
4. [Mic Permission Denied State](#4-mic-permission-denied-state)
5. [Topic Download Progress](#5-topic-download-progress)
6. [Email Verification Screen](#6-email-verification-screen)
7. [New Password Screen](#7-new-password-screen)
8. [Legal Pages (Privacy + Terms)](#8-legal-pages)

### Round 2 — Settings, Pickers, Reusable Components
9. [Bottom Sheet Component](#9-bottom-sheet-component)
10. [Daily Goal Picker](#10-daily-goal-picker)
11. [Reminder Time Picker](#11-reminder-time-picker)
12. [Language Picker](#12-language-picker)
13. [Speed Picker](#13-speed-picker)
14. [Confirmation Modal](#14-confirmation-modal)
15. [Action Sheet Component](#15-action-sheet-component)
16. [Toast Notification Component](#16-toast-notification-component)
17. [Download All Audio Modal](#17-download-all-audio-modal)
18. [Edit Name Sheet](#18-edit-name-sheet)
19. [Profile / Account Screen](#19-profile-account-screen)
20. [Sign Out Confirmation](#20-sign-out-confirmation)
21. [About Screen](#21-about-screen)

### Round 3 — Auth Completion
22. [OAuth Loading State](#22-oauth-loading-state)

### Round 4 — AI Flows
23. [AI Scenario Picker](#23-ai-scenario-picker)
24. [AI Conversation Review](#24-ai-conversation-review)
25. [AI Text Input Mode](#25-ai-text-input-mode)

### Round 5 — Search, Celebration, Progress
26. [Search Screen](#26-search-screen)
27. [Word/Vocab Detail Screen](#27-word-vocab-detail-screen)
28. [Milestone Celebration](#28-milestone-celebration)
29. [Streak at Risk State](#29-streak-at-risk-state)
30. [Level Up Toast (Prompt Mode)](#30-level-up-toast)
31. [Day Detail / Session History](#31-day-detail-session-history)
32. [Tone Gym Results Screen](#32-tone-gym-results-screen)
33. [Scene Mode — Scene Picker](#33-scene-mode-scene-picker)
34. [Scene Complete Summary (detailed)](#34-scene-complete-summary)
35. [Bulk Save Modal (Scene Mode)](#35-bulk-save-modal)

### Round 6 — Edge Cases and States
36. [Storage Full Warning](#36-storage-full-warning)
37. [Update Available Banner](#37-update-available-banner)
38. [Persistent Offline Banner](#38-persistent-offline-banner)
39. [First Launch Download Progress](#39-first-launch-download-progress)
40. [Pre-lesson Loading State](#40-pre-lesson-loading-state)
41. [Topic Fully Mastered Celebration](#41-topic-fully-mastered-celebration)
42. [Hero Card Variants (Day 1 + Completed)](#42-hero-card-variants)

### Web Pages
43. [FAQ Page](#43-faq-page)
44. [Contact / Support Page](#44-contact-support-page)

### Clarified Behaviors
45. [Resolved ambiguities](#45-resolved-ambiguities)

---

# ROUND 1 — SHIP BLOCKERS

---

## 1. SESSION SUMMARY SCREEN

Shown at the end of every practice session (Shadow, Prompt, Speed Run, Tone Gym, Scene, Quick Review, Topic session). This is the most-used missing screen.

```
┌─────────────────────────────────────────┐
│                                         │
│              ┌──────┐                   │
│              │  ✓   │                   │  ← Success icon
│              └──────┘                   │     80x80 circle
│                                         │
│         Session complete                │  ← 28px display font
│         Great work, Faith                │
│                                         │
│    ┌──────────────────────────────┐     │
│    │                              │     │
│    │  ┌──────┐ ┌──────┐ ┌──────┐ │     │  ← 3 stat tiles
│    │  │  12  │ │  89  │ │ 5:42 │ │     │
│    │  │phrases│ │ avg  │ │ time │ │     │
│    │  │       │ │ score│ │      │ │     │
│    │  └──────┘ └──────┘ └──────┘ │     │
│    │                              │     │
│    └──────────────────────────────┘     │
│                                         │
│    🔥 Streak: 13 days (+1 today)        │  ← Streak update
│                                         │
│    ─────────────────────────────        │
│                                         │
│    PHRASES PRACTICED                    │  ← Per-phrase breakdown
│    ● Maai⁴ daan¹            92 ★        │
│    ● Nei⁵ hou²              88 ★        │
│    ● Gei² do¹ cin²          78 ★        │
│    ● Dung³ naai⁵ caa⁴       95 ★        │
│    ● Jiu³ bo¹ lo⁴ baau¹     71          │
│    ... (scroll for more)                │
│                                         │
│    ─────────────────────────────        │
│                                         │
│    🏆 Milestone unlocked:                │  ← Celebration if any
│    "10 phrases mastered"                │
│                                         │
│                                         │
│    ┌───── Practice more ─────┐          │
│    ┌───── Done ──────────────┐          │
│                                         │
└─────────────────────────────────────────┘
```

| Element | Spec |
|---------|------|
| Success icon | 80x80px circle, background: var(--color-brand-lime-muted), centered. Checkmark: 36x36 SVG, stroke: var(--color-brand-dark), stroke-width: 3. Scale-pop animation on mount (0 → 1.2 → 1, 500ms). |
| Title "Session complete" | 28px DM Serif Display, color: var(--color-brand-dark), text-align: center, margin-top: 24px |
| Subtitle | 15px, color: var(--color-text-secondary), text-align: center, margin-top: 4px. Personalized: "Great work, {firstName}". |
| Stat tiles container | 3 tiles in a row, gap: 10px, margin: 28px 22px 0 |
| Each stat tile | flex: 1, background: white, border: 0.5px solid var(--color-border), border-radius: 14px, padding: 16px 12px, text-align: center |
| Stat number | 28px semibold, color: var(--color-brand-dark) |
| Stat label | 11px, color: var(--color-text-muted), margin-top: 2px, letter-spacing: 0.2px |
| Streak update row | margin: 20px 22px 0, padding: 12px 16px, background: var(--color-streak-bg), border-radius: 12px, display: flex, align-items: center, gap: 10px |
| Streak flame | Same as top bar flame, 16x16px |
| Streak text | 13px semibold, color: var(--color-streak-text). "+1 today" is lighter weight: color: #B06830 |
| Section divider | 0.5px horizontal line, color: var(--color-border), margin: 24px 22px |
| Section label "PHRASES PRACTICED" | 11px caps semibold, color: var(--color-text-muted), letter-spacing: 1.2px, padding: 0 22px, margin-bottom: 12px |
| Phrase result row | padding: 10px 22px, display: flex, align-items: center, gap: 12px |
| Phrase dot | 6x6px circle, background varies by score (green ≥90, lime 70-89, orange 50-69, red <50) |
| Phrase text | flex: 1, 14px medium, color: var(--color-text-primary) |
| Phrase score | 13px semibold, color varies by score level, right-aligned |
| Star icon (≥90) | 12px, color: var(--color-brand-green) |
| Milestone section | background: var(--color-brand-lime-muted), border: 1px solid rgba(197,232,90,0.3), border-radius: 14px, padding: 14px 18px, margin: 20px 22px 0 |
| Milestone icon | 🏆 (CSS/SVG trophy), 20px, inline with text |
| Milestone title | 12px semibold, color: var(--color-brand-dark), letter-spacing: 0.3px |
| Milestone name | 15px semibold, color: var(--color-brand-dark), margin-top: 2px, in quotes |
| Action buttons | Stacked, gap: 10px, margin: 28px 22px 32px |
| "Practice more" button | Background: var(--color-brand-dark), color: white, border-radius: 14px, padding: 16px, 15px semibold, text-align: center |
| "Done" button | Background: transparent, border: 1.5px solid var(--color-border-strong), color: var(--color-text-secondary), border-radius: 14px, padding: 16px, 15px semibold, text-align: center |

**Variants by mode:**

| Mode | Stat tile labels | Extra data |
|------|------------------|------------|
| Shadow | Phrases / Avg score / Time | Per-phrase breakdown |
| Prompt | Correct / Accuracy % / Level | Current level shown |
| Speed Run | Score / Personal best / Streak | No phrase breakdown (too fast) |
| Tone Gym | Accuracy / Rounds / Tone focus | Shows tone confusion report |
| Scene | Turns passed / Avg score / Time | Full conversation transcript |

**Behavior:**
- Auto-saves session to IndexedDB on mount
- Updates streak if this is the first session of the day
- Checks for milestone unlocks, shows highest unlock inline
- "Practice more" → returns to Practice tab
- "Done" → returns to wherever user came from (Home if from hero card, Practice if from practice tab)
- No ✕ close button (intentional — user must tap one of the two actions)

---

## 2. CUSTOM PHRASE INPUT MODAL

Triggered from Home "Custom phrase" card, Library "Add a phrase" button, or Search "Not finding it? Add it" action. A bottom sheet that slides up over the current screen.

```
┌─────────────────────────────────────────┐
│  (darkened background behind)           │
│                                         │
│                                         │
│                                         │
│    ─── (drag handle)                    │
│    ┌─────────────────────────────┐      │
│    │                             │      │
│    │  Add a phrase       ✕       │      │  ← Title + close
│    │                             │      │
│    │  ─────────────────────────  │      │
│    │                             │      │
│    │  CHINESE OR ROMANIZATION    │      │  ← Label
│    │  ┌─────────────────────┐    │      │
│    │  │ 你食咗飯未？          │    │      │  ← Text input
│    │  └─────────────────────┘    │      │
│    │  Type Chinese, Jyutping,    │      │
│    │  or what you think you heard│      │
│    │                             │      │
│    │  ┌─ Auto-detect preview ─┐  │      │  ← Preview card
│    │  │ 你食咗飯未？           │  │      │     (appears after typing)
│    │  │ nei5 sik6 zo2 faan6   │  │      │
│    │  │        mei6?          │  │      │
│    │  │ Have you eaten yet?   │  │      │
│    │  │                   [▶] │  │      │
│    │  └───────────────────────┘  │      │
│    │                             │      │
│    │  OPTIONAL CONTEXT            │      │
│    │  ┌─────────────────────┐    │      │
│    │  │ A common greeting   │    │      │  ← Optional context
│    │  └─────────────────────┘    │      │
│    │                             │      │
│    │  ┌── Save to library ──┐    │      │  ← CTA
│    │                             │      │
│    └─────────────────────────────┘      │
└─────────────────────────────────────────┘
```

| Element | Spec |
|---------|------|
| Backdrop | position: fixed, inset: 0, background: rgba(0,0,0,0.4), backdrop-filter: blur(2px), z-index: 200 |
| Sheet | position: fixed, bottom: 0, left: 0, right: 0, background: var(--color-bg), border-radius: 24px 24px 0 0, padding: 16px 22px 24px, max-height: 90vh, overflow-y: auto, transform: translateY(0), transition: transform 300ms ease-out |
| Drag handle | 40x4px bar, background: rgba(0,0,0,0.15), border-radius: 2px, margin: 0 auto 16px |
| Title row | display: flex, justify-content: space-between, align-items: center, margin-bottom: 20px |
| Title | 20px semibold, color: var(--color-brand-dark), letter-spacing: -0.3px |
| Close button | 32x32 tap target, 18px ✕ icon, color: var(--color-text-muted) |
| Divider | 0.5px horizontal, color: var(--color-border), margin-bottom: 20px |
| Field label | 11px caps semibold, color: var(--color-text-muted), letter-spacing: 1.2px, margin-bottom: 8px |
| Text input | width: 100%, padding: 14px 16px, background: white, border: 1.5px solid var(--color-border-strong), border-radius: 12px, font: 16px, color: var(--color-text-primary). Focus: border-color: var(--color-brand-lime), box-shadow: 0 0 0 3px var(--color-brand-lime-muted) |
| Input hint | 11px, color: var(--color-text-faint), margin-top: 4px |
| Preview card | background: white, border: 1px solid var(--color-brand-lime-muted), border-radius: 12px, padding: 14px 16px, margin-top: 16px, display: flex, align-items: flex-start, gap: 12px |
| Preview Chinese | 15px semibold, color: var(--color-text-primary) |
| Preview Jyutping | 13px semibold, color: var(--color-jyutping), margin-top: 4px |
| Preview English | 13px, color: var(--color-text-secondary), margin-top: 3px |
| Preview play button | 36x36px circle, background: var(--color-brand-lime), CSS play triangle, flex-shrink: 0 |
| Save button | width: 100%, background: var(--color-brand-lime), color: var(--color-brand-dark), border-radius: 14px, padding: 16px, 16px semibold, margin-top: 20px |
| Save button (disabled) | background: var(--color-bg-page), color: var(--color-text-faint) |

**Preview generation flow:**
1. User types in input field
2. After 500ms debounce, call `textToJyutping` API (or detect if already Jyutping)
3. Call `translate` API for English meaning
4. Call `textToSpeech` API for audio
5. All three run in parallel, preview card populates as each returns
6. Play button enabled once audio is ready
7. Save button enabled once preview is complete

**Loading state** (while generating):
- Preview card shows skeleton placeholders
- Three rows of shimmer boxes (Chinese, Jyutping, English)
- Play button shows small spinner instead of triangle

**Error state** (if API fails):
- Red border on input
- Error message below: "Couldn't generate this phrase. Check your connection."
- Retry link

**States:**
- Empty: no preview card, save button disabled
- Typing: debounce timer running
- Loading: preview card with skeletons
- Ready: preview populated, save button enabled
- Error: red state with retry

**Behavior:**
- Opens with slide-up animation (300ms ease-out)
- Closes on: backdrop tap, ✕ button, swipe down >100px, save complete
- On save: shows brief success toast "Added to library", closes sheet, updates library count everywhere
- Sheet is auto-focused on the text input on open
- Keyboard automatically appears on mobile

---

## 3. MIC PERMISSION EXPLANATION

Shown the first time a user tries to do something that requires microphone access (Shadow Mode recording, Prompt Mode, AI chat). NOT the browser's native permission dialog — this is OUR screen that explains the why, then triggers the native dialog when the user taps "Allow".

```
┌─────────────────────────────────────────┐
│  ✕                                      │
│                                         │
│                                         │
│              ┌──────┐                   │
│              │  🎤  │                   │  ← Large mic icon
│              └──────┘                   │     120x120 container
│                                         │
│                                         │
│         Microphone access               │  ← Display font
│                                         │
│    ShadowSpeak needs your microphone    │
│    to score your pronunciation and      │
│    give you real feedback.              │
│                                         │
│                                         │
│    ● Recordings are scored instantly     │  ← Bullet points
│    ● Audio is never stored on our        │
│      servers                             │
│    ● You can disable this anytime        │
│      in Settings                         │
│                                         │
│                                         │
│    ┌── Allow microphone ──┐             │  ← Primary CTA
│    ┌── Not now ──────────┐              │  ← Secondary
│                                         │
└─────────────────────────────────────────┘
```

| Element | Spec |
|---------|------|
| Close button (✕) | top-left 22px, 44x44 tap target, 24px icon, color: var(--color-text-muted) |
| Icon container | 120x120px, border-radius: 30px, background: var(--color-brand-lime-muted), margin: 40px auto 32px, display: flex, align-items: center, justify-content: center |
| Mic icon | 52x52px SVG, stroke: var(--color-brand-dark), stroke-width: 2.5, fill: none. Custom drawn mic (body + base + stand) |
| Title | 28px DM Serif Display, color: var(--color-brand-dark), text-align: center |
| Body text | 15px, color: var(--color-text-secondary), text-align: center, line-height: 1.6, margin: 16px 32px 32px, max-width: 320px |
| Bullet list | margin: 0 32px, display: flex, flex-direction: column, gap: 12px |
| Bullet item | display: flex, align-items: flex-start, gap: 10px, font: 14px, color: var(--color-text-secondary), line-height: 1.5 |
| Bullet dot | 6x6px circle, background: var(--color-brand-green), margin-top: 7px, flex-shrink: 0 |
| Primary button | margin: 40px 22px 12px, background: var(--color-brand-lime), color: var(--color-brand-dark), border-radius: 14px, padding: 16px, 16px semibold, text-align: center |
| Secondary button | margin: 0 22px 32px, background: transparent, color: var(--color-text-muted), border: none, padding: 12px, 14px medium, text-align: center |

**Behavior:**
- "Allow microphone" → calls `navigator.mediaDevices.getUserMedia({ audio: true })` which triggers the native browser permission dialog
- If user grants in native dialog → closes this screen, proceeds to recording
- If user denies in native dialog → transitions to "Mic Permission Denied State" (screen 4)
- "Not now" → closes this screen, returns user to previous screen without triggering permission
- Only shown ONCE per install. If user dismisses with "Not now", next time they try to record, this screen shows again.
- After user grants permission, this screen is never shown again.

---

## 4. MIC PERMISSION DENIED STATE

Shown when the user has blocked microphone access (either denied here or in OS settings). Full-screen recovery state.

```
┌─────────────────────────────────────────┐
│  ✕                                      │
│                                         │
│                                         │
│              ┌──────┐                   │
│              │ 🎤   │                   │  ← Mic with red X
│              │  ✕   │                   │     overlay
│              └──────┘                   │
│                                         │
│                                         │
│         Microphone blocked              │
│                                         │
│    ShadowSpeak can't access your        │
│    microphone. You need to enable it    │
│    to score your pronunciation.         │
│                                         │
│                                         │
│    HOW TO ENABLE:                       │  ← Instructions
│                                         │
│    ┌─────────────────────────────┐      │
│    │ 1. Open device Settings      │      │
│    └─────────────────────────────┘      │
│    ┌─────────────────────────────┐      │
│    │ 2. Find ShadowSpeak          │      │
│    └─────────────────────────────┘      │
│    ┌─────────────────────────────┐      │
│    │ 3. Turn on Microphone        │      │
│    └─────────────────────────────┘      │
│                                         │
│                                         │
│    ┌── Open Settings ──┐                │  ← Deep link to settings
│    ┌── Skip for now ──┐                 │  ← Continue without mic
│                                         │
└─────────────────────────────────────────┘
```

| Element | Spec |
|---------|------|
| Icon container | 120x120px, border-radius: 30px, background: #FFE8E8, margin: 40px auto 32px |
| Mic icon | 52x52 SVG, stroke: var(--color-error), stroke-width: 2.5 |
| Red X badge | 32x32px circle, background: var(--color-error), positioned top-right -4px/-4px. White X stroke inside. |
| Title | 28px DM Serif Display, color: var(--color-brand-dark), text-align: center |
| Body | 15px, color: var(--color-text-secondary), text-align: center, line-height: 1.6, margin: 16px 32px |
| Section label "HOW TO ENABLE:" | 11px caps semibold, color: var(--color-text-muted), letter-spacing: 1.2px, margin: 32px 22px 12px |
| Step card | background: white, border: 0.5px solid var(--color-border), border-radius: 12px, padding: 14px 18px, margin: 0 22px 8px, font: 14px, color: var(--color-text-primary) |
| Step number | font-weight: 600, margin-right: 4px |
| Primary button | "Open Settings" — uses Capacitor App plugin to open device app settings. On web (PWA), opens browser's site settings. Styled same as Allow button in screen 3. |
| Secondary button | "Skip for now" — dismisses and returns user. They can still use the app but without pronunciation scoring. |

**Behavior:**
- Shown when `getUserMedia` returns `NotAllowedError` or when checking permission state returns `denied`
- "Open Settings" uses Capacitor App plugin: `App.openSettings()`
- After returning from Settings, app automatically re-checks permission on resume
- If permission is now granted, this screen closes and user can proceed
- "Skip for now" → dismisses, user can use the app but practice modes show a banner: "Enable microphone to score your pronunciation"

---

## 5. TOPIC DOWNLOAD PROGRESS

State shown on a topic card when the user has tapped the cloud/download icon. Also full-screen progress when downloading manually from topic detail.

### 5a. Inline state (on topic card)

```
┌──────────────────┐
│                  │
│  12 phrases  ◐   │  ← Circular progress ring
│              47% │     replaces the play button
│                  │
└──────────────────┘
Daily basics
Hello, thanks, sorry
━━━━━━━━━━━━━ 12/12
```

| Element | Spec |
|---------|------|
| Progress ring | 28x28px SVG, replaces the play button in the card corner. Track: rgba(255,255,255,0.4). Fill: var(--color-brand-lime), stroke-dasharray animated based on progress. stroke-width: 3. |
| Percentage | 9px semibold, color: white, text-shadow for readability, centered inside ring |
| Cancel (tap progress) | Tapping the progress ring cancels the download with a confirmation |

### 5b. Topic Detail download state

When downloading from the Topic Detail screen, the cloud icon becomes a progress indicator with more detail.

```
┌─────────────────────────────────────────┐
│  ┌─────────────────────────────────┐    │
│  │  (artwork)                      │    │
│  │  Ordering coffee      ◐ 47%     │    │
│  │  35 phrases                     │    │
│  └─────────────────────────────────┘    │
│                                         │
│  Downloading audio for offline...       │  ← Banner
│  17 of 35 phrases · 2.4 MB              │
│  ━━━━━━━━━━━━━░░░░░░░░░░░░               │  ← Progress bar
│                                         │
│  [Cancel download]                      │
```

| Element | Spec |
|---------|------|
| Progress banner | margin: 16px 22px, background: var(--color-brand-dark), color: white, border-radius: 12px, padding: 14px 16px |
| Banner title | 13px semibold, color: white |
| Banner meta | 11px, color: rgba(255,255,255,0.6), margin-top: 3px |
| Progress bar | height: 4px, background: rgba(255,255,255,0.15), border-radius: 2px, margin-top: 10px |
| Progress fill | height: 100%, background: var(--color-brand-lime), transition: width 300ms |
| Cancel link | 12px, color: rgba(255,255,255,0.7), text-align: center, padding: 10px 0 0, text-decoration: underline |

### 5c. Downloaded state (success)

After download completes, banner briefly transforms:

```
┌─────────────────────────────────────────┐
│  ✓ Downloaded for offline use           │
│  35 phrases · 5.1 MB                    │
└─────────────────────────────────────────┘
```

Auto-dismisses after 2 seconds. Topic card cloud icon becomes a green checkmark permanently.

**Behavior:**
- Download runs via `downloadTopicAudio()` from offlineManager service
- Progress updates via callback on every audio file cached
- Cancellation sets a flag; the download loop checks it and stops, deleting partially cached files
- Successful download persists: topic card shows checkmark on reload
- Failed download (network drop): banner turns orange, "Download failed. Tap to retry"

---

## 6. EMAIL VERIFICATION SCREEN

Shown immediately after registration. User must verify their email before accessing the app.

```
┌─────────────────────────────────────────┐
│  ✕                                      │
│                                         │
│                                         │
│              ┌──────┐                   │
│              │  ✉️   │                   │  ← Envelope illustration
│              └──────┘                   │
│                                         │
│                                         │
│         Check your email                │  ← Display font
│                                         │
│    We sent a verification link to       │
│    faith@lantz.co                       │  ← User's email
│                                         │
│    Tap the link in the email to         │
│    activate your account.               │
│                                         │
│                                         │
│    ┌── Open email app ──┐               │  ← Deep link (mobile)
│                                         │
│                                         │
│    Didn't get it?                       │
│    [Resend verification email]          │  ← Text button
│                                         │
│    Wrong email?                         │
│    [Change email]                       │  ← Text button
│                                         │
│                                         │
│    Already verified? [Refresh]          │  ← Manual check
│                                         │
└─────────────────────────────────────────┘
```

| Element | Spec |
|---------|------|
| Envelope icon | 100x100px container, border-radius: 28px, background: var(--color-brand-lime-muted). Envelope SVG 44x44px, stroke: var(--color-brand-dark), stroke-width: 2.5 |
| Title | 28px DM Serif Display, color: var(--color-brand-dark), text-align: center, margin-top: 28px |
| Body | 15px, color: var(--color-text-secondary), text-align: center, line-height: 1.6, margin: 16px 32px 8px |
| Email address | 15px semibold, color: var(--color-brand-dark), text-align: center |
| Secondary body | 14px, color: var(--color-text-muted), text-align: center, margin: 12px 32px 32px |
| Primary button "Open email app" | margin: 0 22px, background: var(--color-brand-lime), color: var(--color-brand-dark), border-radius: 14px, padding: 16px, 16px semibold |
| Text buttons | 13px semibold, color: var(--color-brand-dark), text-align: center, padding: 12px, text-decoration: none. Wrapped in labels: "Didn't get it?" (14px, color: muted) |
| Refresh link | 13px, color: var(--color-text-muted), text-align: center, margin-bottom: 16px. "Refresh" styled as link in brand-dark. |

**Behavior:**
- "Open email app" uses Capacitor to open the device's default email client. On web: falls back to `mailto:` which opens the user's webmail.
- "Resend verification email" → calls Supabase auth resend endpoint, shows toast "Email sent"
- "Change email" → returns to Registration screen with email field pre-filled
- "Refresh" → polls Supabase to check if email is verified. If yes, auto-navigates to Ready screen. If no, shows toast "Not verified yet"
- App also auto-polls every 10 seconds while this screen is active
- User cannot access main app until verified

**Deep link handling:**
- When user taps the link in their email on mobile, it opens the app via Universal Link / App Link
- App receives the verification token, validates it, and navigates directly to Ready screen
- On web: clicking the link opens a browser page that calls the verification endpoint then redirects to the app

---

## 7. NEW PASSWORD SCREEN

Shown when user clicks the password reset link in their email. Lets them set a new password.

```
┌─────────────────────────────────────────┐
│  ‹ Back to sign in                      │
│                                         │
│  [ShadowSpeak wordmark]                 │
│  CANTONESE ›                            │
│                                         │
│  Set a new password                     │  ← Display font
│                                         │
│  Choose a strong password for your      │
│  account.                                │
│                                         │
│  NEW PASSWORD                           │
│  ┌─────────────────────────┐            │
│  │ ••••••••••              │ 👁          │  ← Show/hide
│  └─────────────────────────┘            │
│  ━━━━━━━━━━━━━━━ Strong                  │  ← Strength meter
│                                         │
│  CONFIRM PASSWORD                       │
│  ┌─────────────────────────┐            │
│  │ ••••••••••              │            │
│  └─────────────────────────┘            │
│                                         │
│  Passwords must:                        │
│  ✓ Be at least 8 characters              │
│  ✓ Include a number                      │
│  ○ Include a special character           │
│                                         │
│                                         │
│  ┌── Update password ──┐                │
│                                         │
└─────────────────────────────────────────┘
```

| Element | Spec |
|---------|------|
| Layout | Same as login/registration (phone-framed in preview, full screen on device) |
| Back link | "‹ Back to sign in", 14px medium, color: var(--color-text-secondary), margin-bottom: 24px |
| Title | 28px DM Serif Display, color: var(--color-brand-dark) |
| Body | 14px, color: var(--color-text-muted), margin: 8px 0 32px |
| Field label | 11px caps semibold, color: var(--color-text-secondary), letter-spacing: 0.2px, margin-bottom: 6px |
| Input | width: 100%, padding: 14px 16px, background: white, border: 1.5px solid var(--color-border-strong), border-radius: 12px, font: 15px |
| Show/hide eye button | Absolutely positioned right of input, 44x44 tap target, 18px SVG eye icon |
| Strength bar | 4 segments, gap: 4px, margin-top: 6px. Each segment: flex: 1, height: 3px, background: #EEE8D8. Active segments fill based on strength: weak (1 red), medium (2 orange), good (3 lime), strong (4 green). |
| Strength label | 11px, color matches strongest segment, margin-top: 4px, text-align: right |
| Requirements list | margin-top: 16px, display: flex, flex-direction: column, gap: 6px |
| Requirement item | 12px, color: var(--color-text-muted), display: flex, align-items: center, gap: 8px |
| Requirement check | 14x14 circle. ○ unfilled when not met, ✓ green when met |
| Update button | margin-top: 28px, background: var(--color-brand-lime), color: var(--color-brand-dark), border-radius: 14px, padding: 16px, 16px semibold, width: 100%. Disabled state: background: var(--color-bg-page), color: var(--color-text-faint). |

**Validation rules:**
- Min 8 characters (required)
- At least one number (required)
- At least one special character (recommended, not required)
- Must match confirm field (required)
- All requirements shown live with check updates as user types

**Behavior:**
- Reached via deep link from password reset email
- Token from URL is validated on mount; if invalid/expired, shows error state
- On submit: calls Supabase `updateUser({ password })`
- Success: navigates to Login screen with toast "Password updated. Sign in with your new password."
- Error: shows error below form

**Expired token state:**
Replaces the form with:
```
┌─────────────────────────┐
│   ⚠  Link expired        │
│                         │
│   This password reset   │
│   link has expired.     │
│   Request a new one.    │
│                         │
│  ┌─ Request new link ─┐ │
└─────────────────────────┘
```

---

## 8. LEGAL PAGES

Privacy Policy and Terms of Service. Same template, different content. Must be accessible without authentication (App Store requirement).

### Structure

```
┌─────────────────────────────────────────┐
│  ‹ Back                                 │
│                                         │
│  Privacy Policy                         │  ← Display font title
│  Last updated: April 2026               │
│                                         │
│  ─────────────────────────────          │
│                                         │
│  1. What we collect                     │  ← Numbered sections
│                                         │
│  ShadowSpeak collects only the          │
│  information needed to provide the      │
│  service. This includes:                │
│                                         │
│  ● Your email address and name           │
│  ● Your learning progress and streak     │
│  ● Voice recordings (sent to             │
│    cantonese.ai for scoring, never      │
│    stored)                              │
│  ● Anonymous usage analytics             │
│                                         │
│  2. How we use it                       │
│  ...                                    │
│                                         │
│  3. Who we share it with                │
│  ...                                    │
│                                         │
│  (continues)                            │
│                                         │
│  ─────────────────────────────          │
│                                         │
│  Questions? Email us at                 │
│  privacy@shadowspeak.app                │
│                                         │
└─────────────────────────────────────────┘
```

| Element | Spec |
|---------|------|
| Back button | top-left, 14px medium, color: var(--color-text-secondary) |
| Title | 32px DM Serif Display, color: var(--color-brand-dark), padding: 16px 22px 4px |
| Last updated | 12px, color: var(--color-text-muted), padding: 0 22px 24px |
| Divider | 0.5px solid var(--color-border), margin: 0 22px |
| Section heading | 18px semibold, color: var(--color-brand-dark), padding: 28px 22px 10px |
| Body paragraph | 14px, color: var(--color-text-secondary), line-height: 1.7, padding: 0 22px 16px |
| Bullet list | padding: 0 22px 0 38px, display: flex, flex-direction: column, gap: 10px |
| Bullet item | 14px, color: var(--color-text-secondary), line-height: 1.6, position: relative |
| Contact footer | padding: 32px 22px, font: 13px, color: var(--color-text-muted), line-height: 1.6. Email in brand-dark, semibold. |

**Content requirements (for legal review, not design):**
- Privacy Policy: must cover GDPR (what data, why, who sees it, right to delete), COPPA (not for children under 13), mic usage disclosure, cantonese.ai data sharing
- Terms of Service: must cover subscription terms, refund policy, acceptable use, IP ownership, dispute resolution, governing law

**Technical:**
- Served as static HTML pages on shadowspeak.app/privacy and /terms (not inside the app bundle, so they can be updated without app release)
- In-app: loaded in a webview or external browser via Capacitor Browser plugin
- Web pages are crawlable by search engines

---

# ROUND 2 — SETTINGS, PICKERS, REUSABLE COMPONENTS

---

## 9. BOTTOM SHEET COMPONENT

Base component used by all pickers (Daily Goal, Time, Language, Speed, etc.).

### Anatomy

```
┌─────────────────────────────────────────┐
│  (darkened backdrop)                    │
│                                         │
│                                         │
│                                         │
│    ─── (drag handle)                    │  ← 40x4 bar, 16px from top
│    ┌─────────────────────────────┐      │
│    │                             │      │
│    │  Sheet title       ✕        │      │  ← Header
│    │                             │      │
│    │  ─────────────────────────  │      │  ← Divider
│    │                             │      │
│    │  (content)                  │      │
│    │                             │      │
│    │  ┌──── Confirm ────┐         │      │  ← Optional action
│    │                             │      │
│    └─────────────────────────────┘      │
└─────────────────────────────────────────┘
```

| Element | Spec |
|---------|------|
| Backdrop | position: fixed, inset: 0, background: rgba(0,0,0,0.4), z-index: 200 |
| Sheet | position: fixed, bottom: 0, left: 0, right: 0, background: var(--color-bg), border-radius: 24px 24px 0 0, padding: 16px 22px 32px, max-height: 85vh, overflow-y: auto, z-index: 201 |
| Drag handle | 40x4px, background: rgba(0,0,0,0.15), border-radius: 2px, margin: 0 auto 16px |
| Header row | display: flex, justify-content: space-between, align-items: center, margin-bottom: 16px |
| Title | 18px semibold, color: var(--color-brand-dark) |
| Close button | 32x32 tap target, 16px ✕, color: var(--color-text-muted) |
| Divider | 0.5px solid var(--color-border), margin: 0 -22px 20px |

**Motion:**
- Enter: slide up from bottom, 300ms ease-out
- Exit: slide down, 250ms ease-in
- Backdrop fade: 200ms

**Dismissal:**
- Tap backdrop
- Tap ✕ button
- Swipe down (drag handle or sheet body) > 80px with release velocity
- Hardware back button on Android

**Sizing:**
- Content determines height up to max-height: 85vh
- Scrolls internally if content exceeds
- Drag handle is always pinned at top

---

## 10. DAILY GOAL PICKER

Uses the bottom sheet component. Opened from Settings → Daily goal.

```
┌─────────────────────────────────────────┐
│  ───                                    │
│                                         │
│  Daily goal                 ✕           │
│  ───────────────────────────            │
│                                         │
│  How much time per day?                 │
│                                         │
│  ┌─────────────────────────────┐        │
│  │  ◉  5 minutes                │        │  ← Radio option
│  │     Quick daily practice     │        │
│  └─────────────────────────────┘        │
│  ┌─────────────────────────────┐        │
│  │  ○  10 minutes               │        │
│  │     A short commute          │        │
│  └─────────────────────────────┘        │
│  ┌─────────────────────────────┐        │
│  │  ○  15 minutes (recommended) │        │
│  │     Balanced daily session   │        │
│  └─────────────────────────────┘        │
│  ┌─────────────────────────────┐        │
│  │  ○  20 minutes               │        │
│  │     Deep practice            │        │
│  └─────────────────────────────┘        │
│  ┌─────────────────────────────┐        │
│  │  ○  30 minutes               │        │
│  │     Immersion session        │        │
│  └─────────────────────────────┘        │
│                                         │
│  ┌──── Save ────┐                       │
│                                         │
└─────────────────────────────────────────┘
```

| Element | Spec |
|---------|------|
| Description | 14px, color: var(--color-text-muted), margin-bottom: 16px |
| Option card | background: white, border: 1.5px solid var(--color-border-strong), border-radius: 12px, padding: 14px 16px, margin-bottom: 8px, display: flex, align-items: center, gap: 12px |
| Selected card | border-color: var(--color-brand-lime), background: var(--color-brand-lime-muted) |
| Radio button | 20x20 circle, border: 2px solid var(--color-border-strong). Selected: border-color: var(--color-brand-dark), inner dot 10x10 var(--color-brand-dark) |
| Option title | 15px semibold, color: var(--color-text-primary) |
| Option subtitle | 12px, color: var(--color-text-muted), margin-top: 2px |
| "(recommended)" tag | inline, 11px semibold, color: var(--color-brand-green), margin-left: 4px |
| Save button | full width, margin-top: 16px, background: var(--color-brand-lime), color: var(--color-brand-dark), border-radius: 14px, padding: 16px, 15px semibold |

**Behavior:**
- Current value pre-selected on open
- Selection updates instantly (no save button needed?) → yes, use Save button for explicit confirmation
- Alternative: no Save button, each selection immediately updates the setting and closes the sheet (instant picker pattern)
- **Decision: instant picker pattern**. Tapping an option saves and closes. This is faster and matches iOS conventions.

---

## 11. REMINDER TIME PICKER

Uses the bottom sheet component. Different content: a time wheel.

```
┌─────────────────────────────────────────┐
│  ───                                    │
│                                         │
│  Reminder time               ✕          │
│  ───────────────────────────            │
│                                         │
│  When should we remind you?             │
│                                         │
│                                         │
│         ┌──────┬──────┐                 │
│         │  07  │  30  │                 │  ← Time wheel
│         │  08  │  45  │                 │     Hour | Minute
│         │ [09] │ [00] │                 │     Selected row highlighted
│         │  10  │  15  │                 │
│         │  11  │  30  │                 │
│         └──────┴──────┘                 │
│                                         │
│       Reminder at 9:00 AM               │  ← Confirmation text
│                                         │
│  ┌──── Save ────┐                       │
│                                         │
└─────────────────────────────────────────┘
```

| Element | Spec |
|---------|------|
| Description | 14px, color: var(--color-text-muted), margin-bottom: 24px |
| Time wheel container | display: flex, justify-content: center, gap: 20px, margin: 20px 0, position: relative |
| Hour/minute column | width: 80px, height: 200px, overflow: hidden, position: relative. Each column is a scrollable list. |
| Time row | 40px tall, text-align: center, font: 22px, color: var(--color-text-faint), transition: all 200ms |
| Selected row | color: var(--color-brand-dark), font-weight: 600, font-size: 28px |
| Selection overlay | 40px tall horizontal bar centered vertically, background: var(--color-brand-lime-muted), border-top + border-bottom 0.5px solid var(--color-brand-lime), pointer-events: none |
| Confirmation text | 14px, color: var(--color-text-secondary), text-align: center, margin-top: 16px. Shows human-readable time. |

**Behavior:**
- Native scroll-snap on each column with snap-align: center
- CSS: `scroll-snap-type: y mandatory` on column, `scroll-snap-align: center` on rows
- Haptic feedback on snap (Capacitor Haptics plugin, light impact)
- Save button triggers local notification scheduling via Capacitor Local Notifications plugin

**Alternative simpler implementation:**
If scroll wheel is too complex, use a native `<input type="time">` which pops up the OS-native time picker on mobile. Less custom but bulletproof. **Recommendation: use native time input for v1, build custom wheel for v2.**

---

## 12. LANGUAGE PICKER

Bottom sheet. Shows available languages with download status.

```
┌─────────────────────────────────────────┐
│  ───                                    │
│                                         │
│  Language                    ✕          │
│  ───────────────────────────            │
│                                         │
│  ┌─────────────────────────────┐        │
│  │  Cantonese          廣東話   │        │
│  │  395 phrases · Downloaded    │        │  ← Current + status
│  │                          ◉   │        │
│  └─────────────────────────────┘        │
│  ┌─────────────────────────────┐        │
│  │  Mandarin           普通話   │        │
│  │  Coming soon                │        │  ← Disabled state
│  │                              │        │
│  └─────────────────────────────┘        │
│                                         │
│  ─────────────────────────────          │
│                                         │
│  More languages coming:                 │
│  ● French                                │
│  ● Spanish                               │
│  ● Japanese                              │
│                                         │
│  Want a specific language?              │
│  [Let us know]                          │  ← Feedback link
│                                         │
└─────────────────────────────────────────┘
```

| Element | Spec |
|---------|------|
| Language card | background: white, border: 1.5px solid var(--color-border-strong), border-radius: 12px, padding: 16px 18px, margin-bottom: 10px, display: flex, align-items: center, gap: 16px |
| Selected | border-color: var(--color-brand-lime), background: var(--color-brand-lime-muted) |
| Disabled | opacity: 0.5, pointer-events: none |
| Language name (English) | 16px semibold, color: var(--color-text-primary), flex: 1 |
| Language native name | 16px medium, color: var(--color-text-muted), font-family can be system fallback for CJK |
| Status line | 12px, color: var(--color-text-muted), margin-top: 4px, full row below language name |
| Radio indicator | 20x20 circle (same as daily goal picker) |
| Future languages list | 13px, color: var(--color-text-muted), line-height: 1.8, padding-left: 16px |
| Feedback link | 13px semibold, color: var(--color-brand-dark), text-align: center, padding: 16px, text-decoration: underline |

**Behavior:**
- Switching languages requires the app to reload its content (phrase data, topics, dialogues)
- Confirmation modal: "Switching will reload your content. Your progress in Cantonese is saved."
- Feedback link opens `mailto:feedback@shadowspeak.app?subject=Language request`

---

## 13. SPEED PICKER

Simple two-option picker for default playback speed.

```
┌─────────────────────────────────────────┐
│  ───                                    │
│                                         │
│  Default speed               ✕          │
│  ───────────────────────────            │
│                                         │
│  Which speed should new lessons start   │
│  with? You can always change during     │
│  a session.                             │
│                                         │
│  ┌─────────────────────────────┐        │
│  │  ◉  Slower                   │        │
│  │     Native speaker, slowed   │        │
│  │     down. Better for         │        │
│  │     beginners.               │        │
│  │                    🐢         │        │
│  └─────────────────────────────┘        │
│  ┌─────────────────────────────┐        │
│  │  ○  Natural (recommended)    │        │
│  │     Native speaker at        │        │
│  │     normal conversation      │        │
│  │     speed.                   │        │
│  │                    🏃         │        │
│  └─────────────────────────────┘        │
│                                         │
└─────────────────────────────────────────┘
```

| Element | Spec |
|---------|------|
| Option card | Same as daily goal picker but taller due to multi-line descriptions |
| Description | 13px, color: var(--color-text-secondary), line-height: 1.5, margin-top: 4px |
| Visual indicator | 20x20 SVG icon right-aligned. Turtle for slower, runner for natural. Not emoji — custom SVGs. |

**Instant picker pattern** (same as Daily Goal): tap to save and close.

---

## 14. CONFIRMATION MODAL

Generic reusable modal for destructive or important confirmations (Clear Cache, Sign Out, Delete Phrase, etc.). NOT a bottom sheet — a centered modal.

```
┌─────────────────────────────────────────┐
│  (darkened backdrop)                    │
│                                         │
│                                         │
│          ┌───────────────────┐           │
│          │                   │           │
│          │  Clear audio      │           │
│          │  cache?            │           │  ← Title (centered)
│          │                   │           │
│          │  This will remove  │           │
│          │  all downloaded    │           │
│          │  audio (42 MB).    │           │  ← Body
│          │  You can re-       │           │
│          │  download anytime. │           │
│          │                   │           │
│          │  ┌─── Cancel ───┐ │           │
│          │  ┌── Clear ────┐ │           │  ← Actions
│          │                   │           │
│          └───────────────────┘           │
│                                         │
└─────────────────────────────────────────┘
```

| Element | Spec |
|---------|------|
| Backdrop | position: fixed, inset: 0, background: rgba(0,0,0,0.5), z-index: 300 |
| Modal | position: fixed, top: 50%, left: 50%, transform: translate(-50%, -50%), background: white, border-radius: 20px, padding: 24px, max-width: 320px, width: calc(100% - 40px), box-shadow: var(--shadow-card) |
| Title | 18px semibold, color: var(--color-text-primary), text-align: center, margin-bottom: 10px |
| Body | 14px, color: var(--color-text-secondary), text-align: center, line-height: 1.5, margin-bottom: 22px |
| Actions | display: flex, flex-direction: column, gap: 8px |
| Primary action (destructive) | Background: var(--color-error), color: white, border-radius: 12px, padding: 14px, 15px semibold |
| Primary action (normal) | Background: var(--color-brand-lime), color: var(--color-brand-dark) |
| Cancel button | Background: transparent, border: 1.5px solid var(--color-border-strong), color: var(--color-text-secondary), border-radius: 12px, padding: 14px, 15px semibold |

**Variants:**
- Destructive: primary button is red (Clear Cache, Sign Out, Delete Phrase)
- Normal: primary button is lime (general confirmations)
- Info: only one button "Got it"

**Motion:**
- Enter: scale 0.9 → 1.0 with fade, 250ms cubic-bezier(0.34, 1.56, 0.64, 1)
- Exit: scale 1.0 → 0.95 with fade, 150ms ease-in

**Accessibility:**
- Focus trap inside modal
- Escape key closes
- Cancel button is default focus

---

## 15. ACTION SHEET COMPONENT

iOS-style contextual menu for multi-option actions. Different from bottom sheet — looks like iOS action sheet.

```
┌─────────────────────────────────────────┐
│                                         │
│                                         │
│                                         │
│                                         │
│    ┌─────────────────────────────┐      │
│    │  Delete this phrase?         │      │  ← Optional title/body
│    │  This cannot be undone.      │      │
│    └─────────────────────────────┘      │
│    ┌─────────────────────────────┐      │
│    │  Delete phrase              │      │  ← Destructive action
│    └─────────────────────────────┘      │  (red text)
│    ┌─────────────────────────────┐      │
│    │  Move to mastered            │      │  ← Regular action
│    └─────────────────────────────┘      │
│    ┌─────────────────────────────┐      │
│    │  Share this phrase           │      │
│    └─────────────────────────────┘      │
│                                         │
│    ┌─────────────────────────────┐      │
│    │  Cancel                      │      │  ← Always present
│    └─────────────────────────────┘      │
│                                         │
└─────────────────────────────────────────┘
```

| Element | Spec |
|---------|------|
| Backdrop | Same as modal, rgba(0,0,0,0.4) |
| Container | position: fixed, bottom: 0, left: 0, right: 0, padding: 0 12px 12px + safe-area-bottom |
| Title card | background: white, border-radius: 14px 14px 0 0, padding: 16px, text-align: center, border-bottom: 0.5px solid var(--color-border) |
| Title | 14px semibold, color: var(--color-text-primary) |
| Body | 12px, color: var(--color-text-muted), margin-top: 4px |
| Action button | background: white, padding: 18px, text-align: center, font: 16px medium, color: var(--color-brand-dark), border-bottom: 0.5px solid var(--color-border), width: 100% |
| Destructive action | color: var(--color-error), font-weight: 600 |
| Cancel button (separate group) | background: white, border-radius: 14px, padding: 18px, text-align: center, font: 16px semibold, color: var(--color-brand-dark), margin-top: 8px |

**Motion:**
- Enter: slide up from bottom, 300ms ease-out
- Exit: slide down, 200ms ease-in

**Behavior:**
- Used for context-specific actions (long-press phrase card, more button menus)
- Cancel is always present and dismisses without action
- Destructive actions have confirmation via subsequent Confirmation Modal if truly dangerous

---

## 16. TOAST NOTIFICATION COMPONENT

Non-blocking feedback for quick confirmations and errors.

### Anatomy

```
┌───────────────────────────────┐
│  ✓  Saved to library          │  ← Icon + message
└───────────────────────────────┘
```

Positioned: bottom center, above tab bar and above mini player if active.

### Variants

**Success:**
```
┌───────────────────────────────┐
│  ✓  Saved to library          │
└───────────────────────────────┘
```
Background: var(--color-brand-dark), icon: var(--color-brand-lime)

**Error:**
```
┌───────────────────────────────┐
│  ⚠  Couldn't save. Try again  │
└───────────────────────────────┘
```
Background: var(--color-error), icon: white

**Info:**
```
┌───────────────────────────────┐
│  ℹ  5 phrases due for review  │
└───────────────────────────────┘
```
Background: var(--color-brand-dark), icon: rgba(255,255,255,0.9)

**With action:**
```
┌──────────────────────────────────────┐
│  Added to library       [Undo]       │
└──────────────────────────────────────┘
```
Action button on the right, font: 13px semibold, color: var(--color-brand-lime)

| Element | Spec |
|---------|------|
| Container | position: fixed, bottom: calc(var(--tab-bar-height) + var(--player-height) + 16px + env(safe-area-inset-bottom)), left: 50%, transform: translateX(-50%), z-index: 300 |
| Toast | background varies by variant, color: white, border-radius: 12px, padding: 12px 18px, display: flex, align-items: center, gap: 10px, box-shadow: 0 8px 24px rgba(0,0,0,0.2), max-width: calc(100vw - 40px) |
| Icon | 16x16px, flex-shrink: 0 |
| Message | font: 14px medium, line-height: 1.4 |
| Action button | margin-left: 12px, padding: 4px 8px, font: 13px semibold, color accent based on variant |

**Motion:**
- Enter: translateY(20px) → 0, opacity 0 → 1, 200ms ease-out
- Exit: opacity 1 → 0, 150ms ease-in
- Auto-dismiss: 3 seconds (success, info), 4 seconds (error), 5 seconds (with action)
- Hover/touch: pauses auto-dismiss

**Behavior:**
- Only one toast visible at a time
- New toast replaces current (slide up and fade the old one first)
- Stacking optional: up to 3 toasts stack vertically, oldest on top

**Usage guidelines:**
- Success: confirm action (saved, completed, sent)
- Error: non-blocking errors (couldn't save, retry offered)
- Info: ambient notifications (streak reminder, new content available)
- NEVER use toast for critical errors that need user decision — use Confirmation Modal instead

---

## 17. DOWNLOAD ALL AUDIO MODAL

Shown when user taps "Download All Audio" in Settings. Full-screen modal with detailed progress.

```
┌─────────────────────────────────────────┐
│  (darkened backdrop)                    │
│                                         │
│    ┌───────────────────────────────┐    │
│    │                               │    │
│    │  Downloading audio            │    │  ← Title
│    │                               │    │
│    │  ┌─────────────────────────┐  │    │
│    │  │                         │  │    │
│    │  │         ◐               │  │    │  ← Large progress ring
│    │  │        47%              │  │    │     120x120
│    │  │                         │  │    │
│    │  └─────────────────────────┘  │    │
│    │                               │    │
│    │  186 of 395 phrases           │    │  ← Status
│    │  Estimated: 3 minutes left    │    │
│    │                               │    │
│    │  Currently downloading:       │    │
│    │  "Ordering coffee" topic      │    │  ← Current topic
│    │                               │    │
│    │  You can keep using the app   │    │
│    │  while this downloads.        │    │
│    │                               │    │
│    │  ┌── Keep downloading ──┐     │    │  ← Close (but keeps going)
│    │  ┌── Cancel download ──┐     │    │
│    │                               │    │
│    └───────────────────────────────┘    │
└─────────────────────────────────────────┘
```

| Element | Spec |
|---------|------|
| Modal | Same as Confirmation Modal but wider: max-width: 360px |
| Title | 20px semibold, color: var(--color-brand-dark), text-align: center, margin-bottom: 20px |
| Ring container | 120x120px, margin: 0 auto 20px |
| Progress ring | SVG with two circles. Track: stroke: var(--color-border), stroke-width: 8. Fill: stroke: var(--color-brand-lime), stroke-width: 8, stroke-dasharray animated. |
| Percentage | 32px semibold, color: var(--color-brand-dark), centered inside ring |
| Status main | 15px, color: var(--color-text-primary), text-align: center, margin-bottom: 4px |
| Status meta | 13px, color: var(--color-text-muted), text-align: center, margin-bottom: 16px |
| Currently downloading label | 11px caps semibold, color: var(--color-text-muted), letter-spacing: 1px, margin-bottom: 4px |
| Currently downloading name | 14px semibold, color: var(--color-brand-dark), text-align: center, margin-bottom: 20px |
| Info text | 13px, color: var(--color-text-muted), text-align: center, line-height: 1.5, margin-bottom: 24px |
| "Keep downloading" button | Primary (lime), closes modal but download continues in background |
| "Cancel download" button | Destructive variant, stops download, deletes partial files |

**Behavior:**
- Runs `downloadAllContent()` from offlineManager
- Updates via callback on every file cached
- Can be closed without canceling (download continues in background)
- If closed while running: small progress chip appears in Settings screen showing active download
- On complete: toast "All audio downloaded (45 MB)"

---

## 18. EDIT NAME SHEET

Bottom sheet for updating the user's first name.

```
┌─────────────────────────────────────────┐
│  ───                                    │
│                                         │
│  Edit name                   ✕          │
│  ───────────────────────────            │
│                                         │
│  FIRST NAME                             │
│  ┌─────────────────────────────┐        │
│  │ Faith                        │        │
│  └─────────────────────────────┘        │
│                                         │
│  This is how ShadowSpeak will           │
│  greet you.                              │
│                                         │
│  ┌──── Save ────┐                       │
│                                         │
└─────────────────────────────────────────┘
```

| Element | Spec |
|---------|------|
| Uses bottom sheet component base |
| Field label | 11px caps semibold, color: var(--color-text-muted) |
| Input | width: 100%, padding: 14px 16px, background: white, border: 1.5px solid var(--color-border-strong), border-radius: 12px, font: 16px. Auto-focuses on mount. |
| Help text | 13px, color: var(--color-text-muted), margin-top: 8px, margin-bottom: 20px |
| Save button | Full width, lime, 16px semibold |

**Behavior:**
- Input auto-focuses, keyboard appears on mobile
- Max length: 30 characters
- Validation: at least 1 character, no emoji
- Save updates user profile and closes sheet with toast "Name updated"

---

## 19. PROFILE / ACCOUNT SCREEN

Destination when user taps the avatar in the top bar.

```
┌─────────────────────────────────────────┐
│  ← Back                                 │
│                                         │
│                                         │
│            ┌──────────┐                 │
│            │          │                 │  ← Large avatar
│            │    F     │                 │     80x80
│            │          │                 │
│            └──────────┘                 │
│                                         │
│         Faith Lantz                     │
│         faith@lantz.co                  │
│                                         │
│         Joined April 2026               │
│                                         │
│  ─────────────────────────────          │
│                                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐│
│  │    13    │ │   42     │ │  127     ││  ← Stats
│  │  day     │ │ phrases  │ │ minutes  ││
│  │  streak  │ │ learned  │ │ today    ││
│  └──────────┘ └──────────┘ └──────────┘│
│                                         │
│  ─────────────────────────────          │
│                                         │
│  ACCOUNT                                │
│  Name                Faith Lantz    ›   │  ← Edit name
│  Email               faith@lantz.co     │  ← Read-only
│  Password            ••••••••       ›   │  ← Change password
│                                         │
│  ─────────────────────────────          │
│                                         │
│  LEARNING                               │
│  Current language    Cantonese     ›    │
│  Daily goal          15 minutes    ›    │
│                                         │
│  ─────────────────────────────          │
│                                         │
│  [View detailed stats]                  │  ← Link to Stats screen
│                                         │
│  [Sign out]                             │  ← Destructive link
│                                         │
│  ─────────────────────────────          │
│                                         │
│  Delete account                         │  ← Very destructive
│  Permanently delete your account        │
│  and all data.                          │
│                                         │
└─────────────────────────────────────────┘
```

| Element | Spec |
|---------|------|
| Back button | top-left, 14px medium, color: var(--color-text-secondary) |
| Avatar | 80x80px circle, background: #D8C9A8, centered, font: 32px semibold, color: #5a4a2a, margin-top: 20px |
| Name | 22px semibold, color: var(--color-brand-dark), text-align: center, margin-top: 16px |
| Email | 14px, color: var(--color-text-muted), text-align: center, margin-top: 4px |
| Joined date | 12px, color: var(--color-text-faint), text-align: center, margin-top: 6px |
| Stats row | 3 tiles, gap: 10px, margin: 24px 22px |
| Stat tile | flex: 1, background: white, border: 0.5px solid var(--color-border), border-radius: 14px, padding: 16px 12px, text-align: center |
| Stat number | 24px semibold, color: var(--color-brand-dark) |
| Stat label | 11px, color: var(--color-text-muted), margin-top: 2px, line-height: 1.3 |
| Section header | 11px caps semibold, color: var(--color-text-muted), letter-spacing: 1.2px, padding: 24px 22px 10px |
| Setting row | padding: 14px 22px, display: flex, justify-content: space-between, align-items: center, border-bottom: 0.5px solid var(--color-border) |
| Setting label | 15px, color: var(--color-text-primary) |
| Setting value | 14px, color: var(--color-text-muted), display: flex, align-items: center, gap: 6px |
| Setting chevron (›) | 14px, color: var(--color-text-faint) |
| View stats link | 15px semibold, color: var(--color-brand-dark), padding: 20px 22px, text-align: left |
| Sign out link | 15px semibold, color: var(--color-error), padding: 14px 22px, text-align: left |
| Delete account section | padding: 24px 22px, border-top: 0.5px solid var(--color-border), margin-top: 24px |
| Delete account title | 15px semibold, color: var(--color-error), margin-bottom: 6px |
| Delete account body | 13px, color: var(--color-text-muted), line-height: 1.5 |

**Behavior:**
- Name row → Edit Name sheet
- Password row → opens a change password flow (send reset email, same as forgot password)
- Language row → Language Picker sheet
- Daily goal row → Daily Goal Picker sheet
- View detailed stats → Stats screen
- Sign out → Confirmation Modal: "Sign out of ShadowSpeak?" → on confirm, clears tokens, navigates to Login
- Delete account → Confirmation Modal with typed confirmation ("Type DELETE to confirm"), then calls Supabase delete user, wipes all local data, navigates to Landing page

---

## 20. SIGN OUT CONFIRMATION

Uses the Confirmation Modal component.

```
Title:    Sign out of ShadowSpeak?
Body:     Your progress is saved. You can sign back in anytime.
Actions:  [Cancel] [Sign out]
```

Primary action "Sign out" uses the destructive variant (red).

**Behavior:**
- On confirm: `signOut()` clears tokens, clears sessionStorage, navigates to `#login`
- IndexedDB is NOT cleared (preserves offline data in case they sign back in)
- Cache API audio is NOT cleared

---

## 21. ABOUT SCREEN

Version info, credits, and links to legal pages.

```
┌─────────────────────────────────────────┐
│  ← Back                                 │
│                                         │
│                                         │
│              ┌──────┐                   │
│              │ logo │                   │  ← App icon
│              └──────┘                   │
│                                         │
│         ShadowSpeak                     │  ← Wordmark
│         Version 1.0.0                   │
│         Build 42                        │
│                                         │
│                                         │
│    Made with care in Hong Kong          │
│    by Faith Lantz and family.           │
│                                         │
│                                         │
│  ─────────────────────────────          │
│                                         │
│  Privacy Policy                      ›  │
│  Terms of Service                    ›  │
│  Open Source Licenses                ›  │
│                                         │
│  ─────────────────────────────          │
│                                         │
│  Support                             ›  │
│  Send feedback                       ›  │
│  Rate the app                        ›  │
│                                         │
│  ─────────────────────────────          │
│                                         │
│  Follow us                              │
│  @shadowspeak                       ›  │
│                                         │
│  ─────────────────────────────          │
│                                         │
│  Built with cantonese.ai                │  ← Partner credit
│                                         │
│  © 2026 ShadowSpeak                     │
│                                         │
└─────────────────────────────────────────┘
```

| Element | Spec |
|---------|------|
| Logo | 80x80px rounded square, border-radius: 20px, background: var(--color-brand-dark), centered. Inside: lime "S" or custom logo mark. Margin: 32px auto 20px. |
| Wordmark | 24px semibold, centered. Shadow dark + Speak green. |
| Version | 13px, color: var(--color-text-muted), text-align: center, margin-top: 4px |
| Build | 12px, color: var(--color-text-faint), text-align: center |
| Credit text | 14px italic, color: var(--color-text-secondary), text-align: center, margin: 32px 40px, line-height: 1.6 |
| Link row | Same as settings rows: padding 14px 22px, 15px text, chevron right |
| Partner credit | 12px, color: var(--color-text-muted), text-align: center, margin-top: 32px |
| Copyright | 12px, color: var(--color-text-faint), text-align: center, margin: 8px 0 32px |

**Links:**
- Privacy Policy → In-app webview of shadowspeak.app/privacy
- Terms of Service → In-app webview of shadowspeak.app/terms
- Open Source Licenses → Static page listing all npm dependencies and their licenses
- Support → opens mailto:support@shadowspeak.app
- Send feedback → opens mailto:feedback@shadowspeak.app
- Rate the app → Capacitor plugin to open native App Store / Play Store review page
- @shadowspeak → opens Instagram handle in browser

---

# ROUND 3 — AUTH COMPLETION

---

## 22. OAUTH LOADING STATE

Shown briefly between clicking Google/Apple sign-in and the OAuth flow completing.

```
┌─────────────────────────────────────────┐
│                                         │
│                                         │
│                                         │
│                                         │
│                                         │
│              ┌──────┐                   │
│              │      │                   │  ← Spinner
│              │  ⊙   │                   │     40x40
│              │      │                   │
│              └──────┘                   │
│                                         │
│                                         │
│         Signing you in...               │
│                                         │
│         Waiting for Google              │  ← Or "Apple"
│                                         │
│                                         │
│                                         │
│         ┌──── Cancel ────┐              │
│                                         │
└─────────────────────────────────────────┘
```

| Element | Spec |
|---------|------|
| Full screen, background: var(--color-bg) |
| Spinner | 40x40px, CSS keyframe rotation, 800ms linear infinite. Stroke: var(--color-brand-lime), centered |
| Title | 18px semibold, color: var(--color-brand-dark), text-align: center, margin-top: 20px |
| Subtitle | 14px, color: var(--color-text-muted), text-align: center, margin-top: 6px |
| Cancel button | margin: 40px 22px, transparent background, 1.5px border, var(--color-text-secondary) |

**Behavior:**
- Shown on OAuth initiation
- If flow succeeds: navigates to Ready screen (new user) or Home (returning user)
- If flow fails or cancels: returns to Login/Registration with error toast
- Cancel button aborts the OAuth flow

---

# ROUND 4 — AI FLOWS

---

## 23. AI SCENARIO PICKER

Shown when user taps the AI Chat card in Practice tab. Let user choose a scenario before starting the conversation.

```
┌─────────────────────────────────────────┐
│  ← Back                     Online ●    │
│                                         │
│  AI Practice                            │  ← Display font
│  Have a real conversation with          │
│  an AI that speaks Cantonese.           │
│                                         │
│  ─────────────────────────────          │
│                                         │
│  SUGGESTED FOR YOU                      │  ← Based on topics
│                                         │
│  ┌─────────────────────────────┐        │
│  │ ☕                           │        │
│  │ Ordering at a cha chaan teng │        │
│  │ You: customer. AI: staff.    │        │
│  │ ~3 min · Easy                │        │
│  └─────────────────────────────┘        │
│                                         │
│  ┌─────────────────────────────┐        │
│  │ 🚕                           │        │
│  │ Taking a taxi to Central     │        │
│  │ You: passenger. AI: driver.  │        │
│  │ ~4 min · Easy                │        │
│  └─────────────────────────────┘        │
│                                         │
│  ─────────────────────────────          │
│                                         │
│  ALL SCENARIOS                          │
│                                         │
│  ┌─────────────────────────────┐        │
│  │ 🏫 School gate chat          │        │
│  └─────────────────────────────┘        │
│  ┌─────────────────────────────┐        │
│  │ 🥟 Dim sum with friends      │        │
│  └─────────────────────────────┘        │
│  ┌─────────────────────────────┐        │
│  │ 🛒 Wet market bargaining     │        │
│  └─────────────────────────────┘        │
│  ┌─────────────────────────────┐        │
│  │ 🏥 Doctor's appointment      │        │
│  └─────────────────────────────┘        │
│  ┌─────────────────────────────┐        │
│  │ 👋 Meeting a new neighbor    │        │
│  └─────────────────────────────┘        │
│                                         │
│  ─────────────────────────────          │
│                                         │
│  ┌─────────────────────────────┐        │
│  │ ✨ Custom scenario            │        │  ← Free text input
│  │ Describe your own situation  │        │
│  └─────────────────────────────┘        │
│                                         │
└─────────────────────────────────────────┘
```

| Element | Spec |
|---------|------|
| Back button | top-left, 14px medium |
| Online indicator | top-right. 8px green dot + "Online" in 11px semibold, color: var(--color-brand-green). When offline, shows orange dot + "Offline — AI requires internet" |
| Title | 28px DM Serif Display, color: var(--color-brand-dark) |
| Subtitle | 14px, color: var(--color-text-secondary), line-height: 1.5, margin-top: 8px |
| Section header | 11px caps semibold, color: var(--color-text-muted), letter-spacing: 1.2px, padding: 24px 22px 12px |
| Suggested scenario card | background: white, border: 1px solid var(--color-brand-lime-muted), border-radius: 16px, padding: 16px 18px, margin: 0 22px 10px |
| Icon | 28x28 SVG (not emoji, use custom icons), inline, margin-bottom: 8px |
| Scenario title | 15px semibold, color: var(--color-brand-dark), margin-top: 4px |
| Role description | 12px, color: var(--color-text-muted), margin-top: 3px |
| Meta | 11px, color: var(--color-text-faint), margin-top: 6px. Format: "~3 min · Easy" |
| Regular scenario row | background: white, border: 0.5px solid var(--color-border), border-radius: 12px, padding: 14px 16px, margin: 0 22px 8px, display: flex, align-items: center, gap: 12px |
| Regular row icon | 20x20 SVG |
| Regular row title | 14px semibold, color: var(--color-text-primary), flex: 1 |
| Custom scenario card | background: var(--color-brand-lime-muted), border: 1.5px dashed var(--color-brand-green), border-radius: 16px, padding: 16px 18px, margin: 16px 22px 24px |
| Sparkle icon | 18px, color: var(--color-brand-green) |

**Behavior:**
- Suggested scenarios are chosen based on user's recently browsed topics
- Difficulty label: Easy (beginner phrases), Medium (intermediate), Hard (advanced + slang)
- Tap scenario → starts AI conversation (screen 16.12) with that scenario's system prompt
- Tap custom scenario → opens text input modal: "Describe your scenario" with placeholder "e.g., I'm at a hair salon and want a trim"
- Offline state: all cards become disabled and grayed out, tapping shows toast "AI conversation needs internet"

**Scenario library (minimum 10 to launch):**
1. Ordering at a cha chaan teng
2. Taking a taxi to Central
3. School gate chat
4. Dim sum with friends
5. Wet market bargaining
6. Doctor's appointment
7. Meeting a new neighbor
8. Asking for directions
9. Shopping at a clothing store
10. Making plans with a friend

Each scenario defines: title, icon, role setup, difficulty, and a system prompt for the AI.

---

## 24. AI CONVERSATION REVIEW

Shown when user ends an AI conversation. Displays the full transcript with scores, highlights, and save options.

```
┌─────────────────────────────────────────┐
│  ✕ Close                                │
│                                         │
│              ┌──────┐                   │
│              │  ✓   │                   │
│              └──────┘                   │
│                                         │
│         Conversation complete           │
│                                         │
│  Scenario: Ordering at a cha chaan teng │
│                                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐│
│  │    5     │ │   82     │ │  2:14    ││
│  │   turns  │ │   avg    │ │  time    ││
│  │          │ │  score   │ │          ││
│  └──────────┘ └──────────┘ └──────────┘│
│                                         │
│  ─────────────────────────────          │
│                                         │
│  TRANSCRIPT                             │
│                                         │
│  ┌──────────────────┐                   │
│  │ Staff (AI)       │                   │
│  │ 飲咩？            │                   │  ← Other bubble
│  │ What to drink?   │                   │
│  └──────────────────┘                   │
│                                         │
│           ┌──────────────────┐          │
│           │ You              │          │
│           │ 凍奶茶             │          │  ← Your bubble
│           │ Iced milk tea    │          │     + score
│           │     Score: 92 ★  │          │
│           │       [+ Save]   │          │  ← Save button
│           └──────────────────┘          │
│                                         │
│  ┌──────────────────┐                   │
│  │ Staff (AI)       │                   │
│  │ 凍定熱？          │                   │
│  │ Cold or hot?     │                   │
│  └──────────────────┘                   │
│                                         │
│  ... (rest of transcript)               │
│                                         │
│  ─────────────────────────────          │
│                                         │
│  HIGHLIGHTS                             │
│  🎯 3 phrases scored 90+                │  ← Callouts
│  💡 1 new word learned: "凍定熱"          │
│  ⚠ 1 phrase to review: "邊一樣"          │
│                                         │
│  ─────────────────────────────          │
│                                         │
│  ┌── Save all good phrases ──┐          │
│  ┌── Try another scenario ──┐           │
│  ┌── Done ────────────────┐             │
│                                         │
└─────────────────────────────────────────┘
```

| Element | Spec |
|---------|------|
| Header | ✕ close top-left |
| Success icon | Same as Session Summary, 60x60px |
| Title | 24px DM Serif Display, color: var(--color-brand-dark), text-align: center |
| Scenario | 13px italic, color: var(--color-text-muted), text-align: center, margin-top: 4px |
| Stats row | Same as Session Summary (3 tiles) |
| Divider | 0.5px horizontal, var(--color-border), margin: 20px 22px |
| Section header | 11px caps semibold, letter-spacing: 1.2px, color: var(--color-text-muted) |
| Transcript area | padding: 0 22px, display: flex, flex-direction: column, gap: 12px |
| Chat bubbles | Same as Scene Mode spec |
| User bubble with save button | Additional row at bottom of bubble: padding-top: 8px, border-top: 0.5px solid rgba(0,0,0,0.06), margin-top: 6px. Save button: 12px semibold, color: var(--color-brand-dark), text-align: right, display: flex, align-items: center, gap: 4px. Icon: 14x14 plus-circle. |
| Highlights section | padding: 0 22px |
| Highlight row | display: flex, align-items: center, gap: 10px, padding: 8px 0, font: 14px, color: var(--color-text-secondary) |
| Highlight emoji/icon | 16px (use CSS/SVG icons) |
| Action buttons | Stacked, gap: 8px, margin: 24px 22px 32px |
| Save all button | Background: var(--color-brand-lime), 15px semibold, color: var(--color-brand-dark), border-radius: 14px, padding: 16px |
| Try another button | Background: var(--color-brand-dark), color: white |
| Done button | Background: transparent, border: 1.5px solid var(--color-border-strong), color: var(--color-text-secondary) |

**Behavior:**
- Full conversation transcript scrollable
- Tap "+ Save" on any user bubble → saves that phrase to library, changes to "✓ Saved"
- "Save all good phrases" → saves all user bubbles with score ≥80 in one action, shows toast with count
- "Try another scenario" → back to AI Scenario Picker
- "Done" → back to Practice tab
- Also creates a SessionRecord in IndexedDB with mode: "ai-conversation"

---

## 25. AI TEXT INPUT MODE

Alternative input for AI conversation when user prefers typing over speaking. Toggled via "Type instead" link.

```
┌─────────────────────────────────────────┐
│  ✕ End      "Cha chaan teng"   Online ● │
│                                         │
│  [... chat bubbles as in AI screen ...] │
│                                         │
│                                         │
│─────────────────────────────────────────│
│                                         │
│  ┌─────────────────────────────┐  [→]   │  ← Text input + send
│  │ 打 in Cantonese...           │        │
│  └─────────────────────────────┘        │
│                                         │
│  🎤 Speak instead                        │  ← Switch back to voice
└─────────────────────────────────────────┘
```

| Element | Spec |
|---------|------|
| Input bar | Fixed bottom, padding: 12px 16px, background: white, border-top: 0.5px solid var(--color-border) |
| Input wrapper | display: flex, align-items: center, gap: 10px |
| Text input | flex: 1, padding: 14px 16px, background: var(--color-bg), border-radius: 22px, font: 15px. Placeholder: "Type in Cantonese..." |
| Send button | 44x44px circle, background: var(--color-brand-lime), flex-shrink: 0. Send arrow icon: 16x16 SVG. Disabled state (empty input): background: var(--color-bg-page), color: var(--color-text-faint) |
| Speak instead link | margin-top: 8px, 13px medium, color: var(--color-text-muted), text-align: center |

**Behavior:**
- User types in Cantonese characters (using their device's input method)
- Send on button tap or Enter key
- No pronunciation scoring in text mode
- Sent messages appear as user bubbles with a small text icon instead of star/score
- "Speak instead" → switches back to push-to-talk mode
- Helpful for users who can't speak aloud (in public, at night, etc.)

---

# ROUND 5 — SEARCH, CELEBRATION, PROGRESS

---

## 26. SEARCH SCREEN

Full search experience. Triggered from Home search bar.

```
┌─────────────────────────────────────────┐
│  ← Cancel                               │
│                                         │
│  ┌─────────────────────────────┐        │
│  │ 🔍  milk tea                 │ ✕      │  ← Live search
│  └─────────────────────────────┘        │
│                                         │
│  ─────────────────────────────          │
│                                         │
│  PHRASES (3 results)                    │  ← Category header
│                                         │
│  ┌─────────────────────────────┐        │
│  │ Ngo⁵ seung² yiu³ naai⁵ caa⁴ │        │
│  │ 我想要奶茶                   │        │  ← Phrase result
│  │ I'd like a milk tea         │        │
│  │ Ordering coffee · LEARNING  │        │
│  └─────────────────────────────┘        │
│  ┌─────────────────────────────┐        │
│  │ Dung³ naai⁵ caa⁴            │        │
│  │ 凍奶茶                       │        │
│  │ Iced milk tea                │        │
│  │ Ordering coffee             │        │
│  └─────────────────────────────┘        │
│                                         │
│  VOCAB (2 results)                      │
│                                         │
│  ┌─────────────────────────────┐        │
│  │ 奶茶 naai⁵ caa⁴              │        │
│  │ milk tea                    │        │
│  └─────────────────────────────┘        │
│                                         │
│  TOPICS (1 result)                      │
│                                         │
│  ┌─────────────────────────────┐        │
│  │ Ordering coffee              │        │
│  │ 35 phrases                   │        │
│  └─────────────────────────────┘        │
│                                         │
│  ─────────────────────────────          │
│                                         │
│  Can't find what you're looking for?    │
│  ┌── Add as custom phrase ──┐           │
│                                         │
└─────────────────────────────────────────┘
```

| Element | Spec |
|---------|------|
| Cancel button | top-left, 15px medium, color: var(--color-text-secondary). Tapping dismisses and returns to Home. |
| Search input wrapper | padding: 0 22px, position: relative |
| Search input | width: 100%, padding: 14px 44px 14px 44px, background: white, border: 1.5px solid var(--color-border-strong), border-radius: 12px, font: 16px. Auto-focused on mount. |
| Search icon | absolute, 14px from left inside input, color: var(--color-text-muted) |
| Clear (✕) button | absolute, 14px from right inside input, 24x24 tap target, 14px ✕, color: var(--color-text-muted). Only visible when input has value. |
| Category header | 11px caps semibold, color: var(--color-text-muted), letter-spacing: 1.2px, padding: 24px 22px 12px |
| Result count inline | "(3 results)" — 11px normal, color: var(--color-text-faint) |
| Phrase result card | Same as phrase card elsewhere, without the expand chevron. Tap navigates to phrase detail or plays audio. |
| Vocab result card | Same as vocab card, simplified |
| Topic result card | Full-width bar, padding: 14px 16px, white background, similar to settings rows. Tap navigates to Topic Detail. |
| Empty state | Centered illustration + "No results for 'xyz'" text |
| Add custom phrase card | Dashed border card, same as Library empty state add card |

**Search algorithm:**
- Fuzzy match against: romanization, Jyutping, Chinese characters, English translation, context
- Case-insensitive
- Diacritics and tone numbers ignored
- Results ordered by: exact match > starts with > contains > fuzzy
- Grouped by type: Phrases > Vocab > Topics
- Debounced 300ms

**Recent searches** (when input is empty):
```
┌─────────────────────────────────────────┐
│  RECENT                                 │
│  ● milk tea                              │
│  ● hello                                 │
│  ● how much                              │
│                                         │
│  SUGGESTED                              │
│  ● Top phrases this week                 │
│  ● Basics                               │
│  ● Things to order                      │
└─────────────────────────────────────────┘
```

**Behavior:**
- Tap any result → navigate or play
- Tap recent → pre-fills search input
- Input auto-focus on mount (keyboard appears)
- Cancel button dismisses entire screen
- Swipe down anywhere in results dismisses keyboard (like iOS Safari)

---

## 27. WORD / VOCAB DETAIL SCREEN

Tapping a word in a phrase breakdown, or tapping a vocab card.

```
┌─────────────────────────────────────────┐
│  ✕                                      │
│                                         │
│                                         │
│              ┌──────────┐                │
│              │          │                │
│              │   奶茶    │                │  ← Large character
│              │          │                │
│              └──────────┘                │
│                                         │
│         naai⁵ caa⁴                      │  ← Jyutping
│         milk tea                        │  ← English
│                                         │
│         ┌────── ▶ Play ─────┐           │  ← Audio button
│                                         │
│  ─────────────────────────────          │
│                                         │
│  BREAKDOWN                              │
│                                         │
│  ┌─────┐  ┌─────┐                       │
│  │ 奶   │  │ 茶  │                       │
│  │naai5 │  │caa4 │                       │  ← Individual chars
│  │ milk │  │ tea │                       │
│  │ [▶]  │  │ [▶] │                       │
│  └─────┘  └─────┘                       │
│                                         │
│  ─────────────────────────────          │
│                                         │
│  APPEARS IN                             │
│                                         │
│  ┌─────────────────────────────┐        │
│  │ "I'd like a milk tea"        │        │  ← Phrases using this word
│  │ Ngo⁵ seung² yiu³ naai⁵ caa⁴ │        │
│  │ Ordering coffee             │        │
│  └─────────────────────────────┘        │
│  ┌─────────────────────────────┐        │
│  │ "Iced milk tea, less sweet"  │        │
│  │ Dung³ naai⁵ caa⁴ siu² tim⁴  │        │
│  │ Ordering coffee             │        │
│  └─────────────────────────────┘        │
│                                         │
│  ─────────────────────────────          │
│                                         │
│  SRS STATUS                             │
│  Learning · Due in 2 days               │
│  ● ● ● ○ ○  (practice count: 3)         │
│                                         │
│  ┌── Practice now ──┐                   │
│  ┌── I know this ──┐                    │
│                                         │
└─────────────────────────────────────────┘
```

| Element | Spec |
|---------|------|
| Close button | top-left, 24px ✕, color: var(--color-text-muted) |
| Large character | 80px font-size, color: var(--color-brand-dark), text-align: center, margin: 24px 0 16px |
| Jyutping | 22px semibold, color: var(--color-jyutping), text-align: center |
| English | 18px, color: var(--color-text-secondary), text-align: center, margin-top: 6px |
| Play button | margin: 20px auto, display: inline-flex, align-items: center, gap: 8px, background: var(--color-brand-lime), border-radius: 14px, padding: 14px 24px, 15px semibold, color: var(--color-brand-dark). CSS play triangle. |
| Character breakdown | Same as word-by-word in phrase cards, row of small cards with individual chars |
| "Appears in" list | Each card is a phrase result, same as search phrase results |
| SRS status | 13px, color: var(--color-text-secondary), padding: 16px 22px |
| Dots | Visual practice count indicator. Max 5 dots. Filled var(--color-brand-lime), empty rgba(0,0,0,0.1) |
| Action buttons | Stacked, gap: 8px, margin: 24px 22px 32px. Practice now: lime. I know this: dark. |

**Behavior:**
- Modal overlay or full screen (recommend full screen on mobile for readability)
- Play button plays the word's audio
- Character breakdown cards are tappable — each opens its own Word Detail for individual characters
- "Practice now" → starts a mini shadow session with just this word
- "I know this" → marks as mastered, SRS updates, closes screen with toast

---

## 28. MILESTONE CELEBRATION

Shown when user unlocks a milestone (first 10 phrases, 7-day streak, 50 phrases learned, etc.).

```
┌─────────────────────────────────────────┐
│                                         │
│  (confetti animation in background)     │
│                                         │
│                                         │
│              ┌──────┐                   │
│              │ 🏆   │                   │  ← Large trophy
│              └──────┘                   │     120x120
│                                         │
│                                         │
│         Milestone unlocked!             │
│                                         │
│         "7-day streak"                  │  ← Milestone name
│                                         │
│    You've practiced 7 days in a row.    │  ← Description
│    That's how fluency is built.         │
│                                         │
│                                         │
│    Your progress:                       │
│    ✓ First 10 phrases                    │  ← List of milestones
│    ✓ First mastered phrase               │
│    ✓ 7-day streak                        │  ← Just unlocked
│    ○ First mastered topic                │
│    ○ 50 phrases learned                  │
│    ○ First AI conversation              │
│                                         │
│                                         │
│    ┌── Share ──┐ ┌── Continue ──┐       │
│                                         │
└─────────────────────────────────────────┘
```

| Element | Spec |
|---------|------|
| Backdrop | var(--color-bg) with subtle confetti SVG animation or CSS particles |
| Confetti | CSS-only animation using ::before/::after with multiple small squares falling and rotating. Colors: lime, dark, orange, green. Duration: 3 seconds, fade out. |
| Trophy container | 120x120px, border-radius: 30px, background: radial-gradient from var(--color-brand-lime) to transparent |
| Trophy SVG | 60x60px, gold color (#E8B865), stroke: var(--color-brand-dark) |
| Title | 26px DM Serif Display, color: var(--color-brand-dark), text-align: center, margin-top: 28px |
| Milestone name | 20px semibold, color: var(--color-brand-green), text-align: center, margin-top: 6px, in quotes |
| Description | 15px, color: var(--color-text-secondary), text-align: center, margin: 20px 32px, line-height: 1.6 |
| Progress list label | 13px semibold, color: var(--color-text-secondary), text-align: center, margin-top: 32px |
| List | centered, margin: 12px auto, max-width: 280px |
| List item | 14px, color: var(--color-text-secondary), padding: 6px 0, display: flex, align-items: center, gap: 10px |
| Completed check | 18px ✓, color: var(--color-brand-green) |
| Just unlocked | Same but animated: ✓ scales 0 → 1.3 → 1 on screen mount, 500ms |
| Incomplete circle | 16px ○, color: var(--color-text-faint) |
| Actions | margin: 32px 22px, display: flex, gap: 10px |
| Share button | flex: 1, background: transparent, border: 1.5px solid var(--color-border-strong), color: var(--color-text-secondary), border-radius: 14px, padding: 16px, 15px semibold |
| Continue button | flex: 2, background: var(--color-brand-lime), color: var(--color-brand-dark), border-radius: 14px, padding: 16px, 15px semibold |

**Behavior:**
- Shown after Session Summary if a new milestone was unlocked in that session
- Haptic feedback on mount (Capacitor Haptics medium impact)
- Share button → opens native share sheet with pre-filled text: "I just unlocked a 7-day streak in ShadowSpeak! 🏆 shadowspeak.app"
- Continue button → dismisses, returns to where Session Summary was
- Confetti animation plays once on mount, doesn't loop

**Milestone definitions:**
```
first-10-phrases:      Save first 10 phrases to library
first-mastered-phrase: First phrase reaches mastered status
7-day-streak:          7 consecutive days of practice
30-day-streak:         30 consecutive days
first-mastered-topic:  All phrases in a topic mastered
50-phrases-learned:    50 phrases in library
100-phrases-learned:   100 phrases
first-ai-conversation: Complete first AI chat
perfect-session:       All phrases score 90+ in one session
```

---

## 29. STREAK AT RISK STATE

Shown as a banner or full-screen prompt in the evening if user hasn't practiced today and has an active streak.

### 29a. Banner version (home screen overlay)

```
┌─────────────────────────────────────────┐
│                                         │
│ 🔥 Your 13-day streak is at risk!       │
│    Practice 5 minutes to save it.       │
│    [Start quick session]                │
│                                         │
└─────────────────────────────────────────┘
```

| Element | Spec |
|---------|------|
| Banner | margin: 0 22px 18px, background: var(--color-streak-bg), border: 1px solid var(--color-streak-orange), border-radius: 14px, padding: 14px 16px, display: flex, align-items: center, gap: 12px |
| Flame | 24x24 CSS flame, animated pulse |
| Text | flex: 1 |
| Title | 14px semibold, color: var(--color-streak-text) |
| Subtitle | 12px, color: #B06830, margin-top: 2px |
| Action | 13px semibold, color: var(--color-brand-dark), text-decoration: underline |

**Shows on Home when:**
- User has streak count ≥ 3
- Current time is between 18:00 and 23:00 local
- User has NOT completed a session today
- Banner auto-dismissed if user completes a session
- Dismissible manually but reappears next evening if condition still true

### 29b. Notification version

Local notification at user's configured reminder time if conditions met:
- Title: "Your streak is waiting 🔥"
- Body: "13 days strong. Keep it going with a quick 5-minute session."
- Action buttons: "Start now" (opens app) and "Remind later" (re-notifies in 1 hour)

### 29c. Streak recovery offer (next day after streak break)

If user misses a day but opens the app the next morning, show a one-time offer:

```
┌─────────────────────────────────────────┐
│                                         │
│              ┌──────┐                   │
│              │  💔  │                   │  ← Broken heart
│              └──────┘                   │
│                                         │
│    Streak paused                        │
│                                         │
│    Your 13-day streak is paused, but    │
│    you can recover it with a quick      │
│    5-phrase session today.              │
│                                         │
│    ┌── Recover streak ──┐               │
│    ┌── Start fresh ────┐                │
│                                         │
└─────────────────────────────────────────┘
```

**Behavior:**
- "Recover streak" → starts a 5-phrase session. On completion, streak is restored to previous count + 1.
- "Start fresh" → streak resets to 0. Offer is dismissed.
- Only available once per missed day. Limited to 1 recovery per week.

---

## 30. LEVEL UP TOAST (Prompt Mode)

Shown during Prompt Mode when user advances a level (5 correct in a row).

```
       ┌───────────────────────────┐
       │  ⭐  Level 2 unlocked      │
       │      English only mode     │
       └───────────────────────────┘
```

Same toast component as section 16, but larger and with two lines.

| Element | Spec |
|---------|------|
| Toast | Same base as toast component but taller: padding: 16px 20px. |
| Icon | 20px star, color: #E8B865 |
| Title | 15px semibold, color: white |
| Subtitle | 12px, color: rgba(255,255,255,0.7), margin-top: 2px |
| Background | var(--color-brand-dark) with subtle gradient: background: linear-gradient(135deg, var(--color-brand-dark), #2A3A28) |

**Behavior:**
- Slides in from top (not bottom) to distinguish from regular toasts
- Duration: 4 seconds
- Haptic: medium impact
- Also triggers a subtle celebration sound (if sound enabled)

---

## 31. DAY DETAIL / SESSION HISTORY

Triggered by tapping a day cell in the streak calendar on Stats screen.

```
┌─────────────────────────────────────────┐
│  ← Back                                 │
│                                         │
│  Tuesday, April 8                       │  ← Day display
│  ━━━━━━━━━━━━━━━━━━━━━━━━━              │
│                                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐│
│  │    15    │ │   87     │ │  12:34   ││  ← Day stats
│  │ phrases  │ │   avg    │ │  total   ││
│  │          │ │  score   │ │  time    ││
│  └──────────┘ └──────────┘ └──────────┘│
│                                         │
│  SESSIONS (2)                           │
│                                         │
│  ┌─────────────────────────────┐        │
│  │ Morning session  🎧 Shadow    │        │
│  │ 8:32 AM · 10 phrases · 5:20 │        │  ← Session item
│  │ Average score: 89            │        │
│  │                          ›   │        │
│  └─────────────────────────────┘        │
│                                         │
│  ┌─────────────────────────────┐        │
│  │ Evening session  ⚡ Speed Run │        │
│  │ 7:15 PM · 12 phrases · 2:00 │        │
│  │ Score: 12 (personal best!)   │        │
│  │                          ›   │        │
│  └─────────────────────────────┘        │
│                                         │
│  ─────────────────────────────          │
│                                         │
│  Phrases practiced today:               │
│  ● Maai⁴ daan¹                  92       │
│  ● Gei² do¹ cin²                88       │
│  ... (all phrases with scores)          │
│                                         │
└─────────────────────────────────────────┘
```

| Element | Spec |
|---------|------|
| Back button | top-left, 14px medium |
| Date display | 24px semibold, color: var(--color-brand-dark), padding: 16px 22px |
| Day divider | 0.5px, color: var(--color-border), margin: 0 22px 16px |
| Stat tiles | Same 3-tile row as Session Summary and Profile |
| Session header | 11px caps semibold, padding: 24px 22px 12px |
| Session card | background: white, border: 0.5px solid var(--color-border), border-radius: 14px, padding: 14px 16px, margin: 0 22px 8px |
| Session title | 14px semibold, display: flex, justify-content: space-between, align-items: center |
| Session mode tag | 11px, color: var(--color-text-muted), inline icon + text |
| Session meta | 12px, color: var(--color-text-muted), margin-top: 4px |
| Session result | 13px, color: var(--color-text-primary), margin-top: 4px. "Personal best!" in var(--color-brand-green) |
| Chevron | 14px, color: var(--color-text-faint) |

**Behavior:**
- Each session row is tappable → opens a session detail view with turn-by-turn breakdown
- Days with no sessions show empty state: "No practice on this day"

---

## 32. TONE GYM RESULTS SCREEN

End-of-session summary specific to Tone Gym. Differs from generic Session Summary because it shows tone confusion analysis.

```
┌─────────────────────────────────────────┐
│                                         │
│              ┌──────┐                   │
│              │  🎵   │                   │
│              └──────┘                   │
│                                         │
│         Tone Gym complete               │
│                                         │
│  ┌──────────┐ ┌──────────┐              │
│  │   7/10   │ │   70%    │              │  ← Stats
│  │ correct  │ │  accuracy│              │
│  └──────────┘ └──────────┘              │
│                                         │
│  ─────────────────────────────          │
│                                         │
│  TONE ACCURACY                          │
│                                         │
│  Tone 1 (high level)     ━━━━━ 100%     │  ← Per-tone accuracy
│  Tone 2 (mid rising)     ━━━░░  60%     │
│  Tone 3 (mid level)      ━━━━━ 100%     │
│  Tone 4 (low falling)    ━━━━━ 100%     │
│  Tone 5 (low rising)     ━━░░░  40%     │  ← Struggles highlighted
│  Tone 6 (low level)      ━━━░░  60%     │
│                                         │
│  ─────────────────────────────          │
│                                         │
│  YOU OFTEN CONFUSED                     │
│  ● Tone 2 with Tone 5                    │  ← Confusion pairs
│  ● Tone 6 with Tone 3                    │
│                                         │
│  Practice these pairs:                  │
│  ┌──────────────────┐                   │
│  │ si² 史 (history) │                   │
│  │     vs           │                   │  ← Suggested drills
│  │ si⁵ 市 (market)  │                   │
│  │            [▶]   │                   │
│  └──────────────────┘                   │
│                                         │
│  ─────────────────────────────          │
│                                         │
│  ┌── Play again ──┐                     │
│  ┌── Back to practice ──┐               │
│                                         │
└─────────────────────────────────────────┘
```

| Element | Spec |
|---------|------|
| Tone accuracy row | padding: 8px 22px, display: flex, align-items: center, gap: 12px |
| Tone label | 14px, color: var(--color-text-primary), flex: 1. Tone description in parentheses in 11px muted. |
| Accuracy bar | width: 100px, height: 6px, background: #EEE8D8, border-radius: 3px |
| Accuracy fill | Green if ≥80%, lime if 60-79%, orange if 40-59%, red if <40% |
| Accuracy percentage | 12px semibold, color matches fill, width: 40px, text-align: right |
| Confusion pair list | padding: 0 22px, 14px medium |
| Drill card | background: white, border: 1px solid var(--color-brand-lime-muted), border-radius: 12px, padding: 14px, margin: 12px 22px, text-align: center |
| Drill content | 16px, line-height: 1.8 |
| Drill play button | Same as word detail play button |

**Behavior:**
- Accuracy per tone is calculated from this session's rounds
- Confusion pairs tracked across multiple sessions (cumulative data)
- Drill card plays an A/B audio comparison on tap
- "Play again" → returns to Tone Gym start
- "Back to practice" → Practice tab

---

## 33. SCENE MODE — SCENE PICKER

Shown when user taps the Scene Mode card in Practice tab (not when they tap a specific scene from Topic Detail).

```
┌─────────────────────────────────────────┐
│  ← Back                                 │
│                                         │
│  Scene Mode                             │
│  Practice full conversations.           │
│                                         │
│  ─────────────────────────────          │
│                                         │
│  CONTINUE WHERE YOU LEFT OFF            │
│                                         │
│  ┌─────────────────────────────┐        │
│  │ 🍽️  Ordering dinner          │        │
│  │ "Getting a table"           │        │  ← Last played
│  │ 5 turns · At a restaurant    │        │
│  │ Last score: 84              │        │
│  └─────────────────────────────┘        │
│                                         │
│  BY TOPIC                               │
│                                         │
│  ▼ Food and drink (6 scenes)            │  ← Collapsible
│    ● Ordering milk tea                  │
│    ● Asking for the bill                │
│    ● Wet market bargaining              │
│    ● Ordering dim sum                   │
│    ● Changing your order                │
│    ● Asking about allergies             │
│                                         │
│  ▼ Social life (4 scenes)               │
│    ● Meeting a new neighbor             │
│    ● School gate drop-off               │
│    ● Arranging a playdate               │
│    ● Lunar New Year greetings           │
│                                         │
│  ▶ Getting around (3 scenes)            │  ← Collapsed
│  ▶ Home and family (4 scenes)           │
│  ▶ The very basics (2 scenes)           │
│                                         │
└─────────────────────────────────────────┘
```

| Element | Spec |
|---------|------|
| Title | 28px DM Serif Display, padding: 16px 22px 4px |
| Subtitle | 14px, color: var(--color-text-secondary), padding: 0 22px 20px |
| Section header | 11px caps semibold, color: var(--color-text-muted), letter-spacing: 1.2px, padding: 24px 22px 12px |
| Continue card | background: var(--color-brand-lime-muted), border: 1px solid var(--color-brand-lime), border-radius: 16px, padding: 16px, margin: 0 22px |
| Topic accordion | padding: 14px 22px, border-bottom: 0.5px solid var(--color-border), display: flex, align-items: center, gap: 10px, font: 15px semibold |
| Expand/collapse chevron | 14px, color: var(--color-text-muted), transition: transform 200ms. Rotated 180° when expanded. |
| Topic count | 12px, color: var(--color-text-muted), margin-left: auto |
| Scene item | padding: 12px 22px 12px 46px, border-bottom: 0.5px solid var(--color-border), font: 14px, color: var(--color-text-primary) |
| Scene item tap | Navigates to Scene Mode with this specific scene |

**Behavior:**
- "Continue where you left off" shows most recent scene played (if any)
- Topics are collapsible accordions
- Topics with no scenes are hidden
- Completed scenes show a small ✓ next to the title

---

## 34. SCENE COMPLETE SUMMARY

Full spec (previous version was only an ASCII sketch).

```
┌─────────────────────────────────────────┐
│                                         │
│              ┌──────┐                   │
│              │  🏆  │                   │
│              └──────┘                   │
│                                         │
│         Scene complete                  │
│         "Ordering milk tea"             │
│                                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐│
│  │   3/3    │ │   87     │ │  2:45    ││
│  │  turns   │ │   avg    │ │  time    ││
│  │  passed  │ │  score   │ │          ││
│  └──────────┘ └──────────┘ └──────────┘│
│                                         │
│  ─────────────────────────────          │
│                                         │
│  YOUR TURNS                             │
│                                         │
│  Turn 1                         92 ★    │
│  "凍奶茶，少甜"                          │  ← Collapsible
│  Staff was satisfied ✓                  │
│                                         │
│  Turn 2                         88 ★    │
│  "要一個菠蘿包"                          │
│  Staff was satisfied ✓                  │
│                                         │
│  Turn 3                         81      │
│  "堂食"                                  │
│  Staff was satisfied ✓                  │
│                                         │
│  ─────────────────────────────          │
│                                         │
│  ┌── Save all 3 phrases ──┐             │
│  ┌── Replay scene ──────┐               │
│  ┌── Next scene ────────┐               │
│  ┌── Done ──────────────┐               │
│                                         │
└─────────────────────────────────────────┘
```

Same structure as Session Summary but:
- Title shows scene name
- Turn breakdown replaces phrase breakdown
- Each turn is expandable to show the full exchange (what AI said, what user said, score)
- "Save all phrases" button added

---

## 35. BULK SAVE MODAL (Scene Mode)

Triggered from Scene Complete Summary "Save all phrases" button. Confirmation with preview.

```
┌─────────────────────────────────────────┐
│  (backdrop)                             │
│                                         │
│  ┌───────────────────────────────┐      │
│  │                               │      │
│  │  Save these to library?  ✕    │      │
│  │  ─────────────────────────    │      │
│  │                               │      │
│  │  3 phrases from "Ordering     │      │
│  │  milk tea":                   │      │
│  │                               │      │
│  │  ✓ 凍奶茶，少甜                │      │
│  │    Iced milk tea, less sweet  │      │
│  │                               │      │
│  │  ✓ 要一個菠蘿包                │      │
│  │    A pineapple bun please     │      │
│  │                               │      │
│  │  ✓ 堂食                        │      │
│  │    Eat in                     │      │
│  │                               │      │
│  │  Current library: 23 / 50     │      │  ← Library count
│  │  After save: 26 / 50          │      │
│  │                               │      │
│  │  ┌── Save all ────┐           │      │
│  │  ┌── Cancel ────┐             │      │
│  │                               │      │
│  └───────────────────────────────┘      │
└─────────────────────────────────────────┘
```

| Element | Spec |
|---------|------|
| Modal | Same as Confirmation Modal but larger: max-width: 340px |
| Title | 18px semibold, color: var(--color-brand-dark) |
| Body text | 13px, color: var(--color-text-muted), margin-bottom: 16px |
| Phrase list | max-height: 240px, overflow-y: auto, margin-bottom: 16px |
| Phrase item | padding: 10px 0, border-bottom: 0.5px solid var(--color-border) |
| Phrase checkmark | 14px, color: var(--color-brand-green), inline |
| Phrase Chinese | 14px, color: var(--color-text-primary), display: inline |
| Phrase English | 12px, color: var(--color-text-muted), display: block, margin-top: 2px, padding-left: 20px |
| Library count | 12px, color: var(--color-text-muted), padding: 12px 0, border-top: 0.5px solid var(--color-border), border-bottom: 0.5px solid var(--color-border), text-align: center |
| Save button | Primary lime |
| Cancel button | Outlined |

**Behavior:**
- Each phrase has a checkbox, user can deselect phrases they don't want to save
- "Save all" saves checked phrases
- If saving would exceed library max (50), shows warning and blocks save
- On save: closes modal, shows toast "3 phrases saved to library"

---

# ROUND 6 — EDGE CASES AND STATES

---

## 36. STORAGE FULL WARNING

Shown when device storage is critically low and app can't save new data.

```
┌─────────────────────────────────────────┐
│  (backdrop)                             │
│                                         │
│  ┌───────────────────────────────┐      │
│  │                               │      │
│  │       ⚠                        │      │
│  │                               │      │
│  │   Device storage is full      │      │
│  │                               │      │
│  │   ShadowSpeak can't save new  │      │
│  │   audio or progress. Free up  │      │
│  │   space to continue.          │      │
│  │                               │      │
│  │   You can clear cached audio  │      │
│  │   to make room.               │      │
│  │                               │      │
│  │   ┌── Clear audio cache ──┐   │      │
│  │   ┌── Open Settings ─────┐   │      │
│  │   ┌── Dismiss ──────────┐   │      │
│  │                               │      │
│  └───────────────────────────────┘      │
└─────────────────────────────────────────┘
```

| Element | Spec |
|---------|------|
| Uses Confirmation Modal base |
| Warning icon | 48x48px, color: var(--color-warning), centered above title |
| Title | 18px semibold, text-align: center |
| Body | 13px, color: var(--color-text-secondary), text-align: center, line-height: 1.5 |
| Actions | Three stacked buttons |

**Triggers:**
- `navigator.storage.estimate()` shows usage > 90% of quota
- IndexedDB quota exceeded error during a save operation

**Behavior:**
- Clear audio cache: wipes `shadowspeak-audio-v1` cache, shows toast with freed MB
- Open Settings: uses Capacitor App plugin to open device storage settings
- Dismiss: closes modal, user can continue but next save may fail

---

## 37. UPDATE AVAILABLE BANNER

Non-blocking banner shown at the top of Home when a new app version is available.

```
┌─────────────────────────────────────────┐
│ 🎉 A new version of ShadowSpeak is       │
│    available. [Update now]         ✕    │
└─────────────────────────────────────────┘
```

| Element | Spec |
|---------|------|
| Banner | margin: 0 22px 12px, background: var(--color-brand-dark), color: white, border-radius: 12px, padding: 12px 16px, display: flex, align-items: center, gap: 12px |
| Icon | 16x16 celebrate emoji or custom SVG |
| Text | flex: 1, font: 13px |
| Update link | 13px semibold, color: var(--color-brand-lime), text-decoration: underline |
| Close ✕ | 14px, color: rgba(255,255,255,0.6), tap to dismiss |

**Behavior:**
- For PWA: triggered by service worker update event
- For native: triggered by Capacitor App plugin checking store versions
- "Update now" triggers PWA update or opens store listing
- Dismissible per session

---

## 38. PERSISTENT OFFLINE BANNER

Shown when the app detects no network connection. Persistent until reconnected.

```
┌─────────────────────────────────────────┐
│ ◐ You're offline. Some features need    │
│   internet.                              │
└─────────────────────────────────────────┘
```

| Element | Spec |
|---------|------|
| Banner | position: fixed at top of content area (below top bar), margin: 0 22px 12px, background: #FEF3E0, border: 1px solid var(--color-warning), border-radius: 12px, padding: 10px 14px, display: flex, align-items: center, gap: 10px |
| Icon | 14x14 (half-filled circle indicating partial connection), color: var(--color-warning) |
| Text | 12px semibold, color: #8A5510 |

**Behavior:**
- Listens to `navigator.onLine` + API ping checks
- Auto-hides when back online
- On reconnect, shows a brief success toast: "Back online" (3 seconds, green)

---

## 39. FIRST LAUNCH DOWNLOAD PROGRESS

Shown on first app open after registration. Downloads initial content before showing Home.

```
┌─────────────────────────────────────────┐
│                                         │
│                                         │
│              ┌──────┐                   │
│              │  ⊙   │                   │  ← Spinner
│              └──────┘                   │
│                                         │
│                                         │
│         Setting up ShadowSpeak          │
│                                         │
│         Downloading your phrases        │
│         and audio...                    │
│                                         │
│                                         │
│         ━━━━━━━━━━━━━░░░░░░░░            │  ← Progress bar
│         142 of 395 phrases              │
│                                         │
│                                         │
│         This takes about 30             │
│         seconds on Wi-Fi.               │
│                                         │
│                                         │
└─────────────────────────────────────────┘
```

| Element | Spec |
|---------|------|
| Full screen, var(--color-bg) |
| Spinner | 48x48 CSS spinner, var(--color-brand-lime) |
| Title | 22px DM Serif Display, color: var(--color-brand-dark), text-align: center, margin-top: 32px |
| Subtitle | 15px, color: var(--color-text-secondary), text-align: center, margin-top: 12px |
| Progress bar | width: 60%, height: 6px, centered, background: var(--color-border), border-radius: 3px, margin: 32px auto 12px |
| Progress fill | height: 100%, background: var(--color-brand-lime), transition: width 300ms |
| Status text | 13px, color: var(--color-text-muted), text-align: center |
| Help text | 12px, color: var(--color-text-faint), text-align: center, margin-top: 40px |

**Behavior:**
- Downloads language pack JSON + starter phrase audio only (not all audio)
- On completion: navigates to Home with starter library ready
- If network fails mid-download: shows error state with retry button
- Cannot be skipped (essential content)

**Faster path:**
- Phase 1 (blocking): Download language pack + starter phrases JSON (~500KB, 2-3 seconds)
- Phase 2 (background, non-blocking): Download starter phrase audio (10 files, ~500KB)
- Phase 3 (background, non-blocking): Download all phrase audio gradually
- User can start using the app after Phase 1 completes

---

## 40. PRE-LESSON LOADING STATE

Brief loading state shown when "Start lesson" is tapped, before the session screen appears.

### Option A: Inline on hero card

The hero card's "Start lesson" button transforms:

```
Before:           After:
┌───────────┐    ┌───────────────────┐
│ ▶ Start   │ →  │ ⊙ Preparing...    │
│  lesson   │    │                    │
└───────────┘    └───────────────────┘
```

Button shows spinner instead of play triangle, text changes to "Preparing..."

### Option B: Full screen (if delay >1 second)

```
┌─────────────────────────────────────────┐
│                                         │
│              ┌──────┐                   │
│              │  ⊙   │                   │
│              └──────┘                   │
│                                         │
│         Preparing your lesson           │
│                                         │
│         12 phrases ready                │  ← Incremental updates
│                                         │
└─────────────────────────────────────────┘
```

**Behavior:**
- Lesson building is usually <200ms (instant)
- Audio pre-download for lesson phrases can take 2-10 seconds if not cached
- If delay <500ms: just use Option A (button state)
- If delay >500ms: transition to Option B full screen
- Status text updates as audio downloads: "Building lesson" → "Downloading audio 5/12" → "Ready"

---

## 41. TOPIC FULLY MASTERED CELEBRATION

Shown when user masters all phrases in a topic.

```
┌─────────────────────────────────────────┐
│                                         │
│              ┌──────┐                   │
│              │  ⭐   │                   │  ← Gold star
│              └──────┘                   │
│                                         │
│         Topic mastered!                 │
│                                         │
│         "Ordering coffee"               │
│                                         │
│    You've mastered all 35 phrases       │
│    in this topic. 🎉                     │
│                                         │
│                                         │
│  ┌─────────────────────────────┐        │
│  │ "Ordering coffee" on your    │        │  ← Topic card
│  │ library card now shows ⭐    │        │
│  └─────────────────────────────┘        │
│                                         │
│                                         │
│    Want a challenge?                    │
│                                         │
│    ┌── Next topic: At a restaurant ──┐ │
│    ┌── AI conversation practice ────┐ │
│    ┌── Done ─────────────────────┐  │
│                                         │
└─────────────────────────────────────────┘
```

| Element | Spec |
|---------|------|
| Star container | 100x100px, background: radial-gradient from #FFE8A0 to transparent |
| Star SVG | 48x48, gold (#E8B865), stroke: var(--color-brand-dark) |
| Animation | Star rotates 360° once on mount, scales 0 → 1.3 → 1 |
| Title | 26px DM Serif Display |
| Topic name | 20px semibold, color: var(--color-brand-green), in quotes |
| Body text | 15px, color: var(--color-text-secondary), text-align: center, line-height: 1.6, margin: 20px 32px |
| Feature callout | margin: 20px 22px, background: var(--color-brand-lime-muted), padding: 14px 18px, border-radius: 12px, font: 13px, color: var(--color-text-secondary), text-align: center |
| Action buttons | Stacked, gap: 8px, margin: 24px 22px 32px |

**Behavior:**
- Triggered after any session where the last "learning" phrase in a topic becomes mastered
- Suggests the next topic in the same category
- "AI conversation practice" button pre-selects an AI scenario related to this topic
- Topic card on Home + Library now shows a gold star overlay permanently

---

## 42. HERO CARD VARIANTS

The Home hero card has multiple states beyond the default.

### 42a. Day 1 (empty library)

```
┌─────────────────────────────────────────┐
│  ● YOUR FIRST LESSON       Getting      │
│                            started      │
│                                         │
│  The Very Basics                        │
│  5 phrases to get you started           │
│                                         │
│                                         │
│  ┌── ▶  Start your first lesson ──┐    │
└─────────────────────────────────────────┘
```

| Element | Spec |
|---------|------|
| Image | Default gradient (warm terracotta/lime blend), not tied to a topic |
| Label | "YOUR FIRST LESSON" instead of "TODAY'S LESSON" |
| Day badge | Replaced with "Getting started" text |
| Duration picker | Hidden (first lesson is fixed at 5 minutes) |
| Start button | Full width, larger padding, more prominent |

### 42b. Completed today

```
┌─────────────────────────────────────────┐
│  ✓ LESSON COMPLETE         Day 13       │
│                                         │
│  Great work today, Faith                │
│  Your streak is now 13 days             │
│                                         │
│                                         │
│  ┌── Practice more ──┐                  │
└─────────────────────────────────────────┘
```

| Element | Spec |
|---------|------|
| Image | Same topic image but with a green tint overlay |
| Label | "✓ LESSON COMPLETE" in lime |
| Title | Personalized completion message |
| Subtitle | Streak update |
| Button | "Practice more" — navigates to Practice tab instead of auto-starting a new session |

### 42c. Streak broken (first session back)

```
┌─────────────────────────────────────────┐
│  ● FRESH START             Day 1        │
│                                         │
│  Welcome back                           │
│  Let's build a new streak               │
│                                         │
│                                         │
│  ┌── ▶ Start lesson ──┐                 │
└─────────────────────────────────────────┘
```

### 42d. No content available (edge case)

```
┌─────────────────────────────────────────┐
│  ⚠  NO LESSON AVAILABLE                  │
│                                         │
│  Add phrases to your library            │
│  to build your daily lesson             │
│                                         │
│                                         │
│  ┌── Browse topics ──┐                  │
└─────────────────────────────────────────┘
```

Shown if library is empty AND starter phrases failed to load.

---

# WEB PAGES

---

## 43. FAQ PAGE

Static page at shadowspeak.app/faq. Covers common questions.

### Structure

```
┌─────────────────────────────────────────┐
│  [Nav bar — same as landing]            │
│                                         │
│  Frequently asked questions             │  ← Display font title
│                                         │
│  ─────────────────────────────          │
│                                         │
│  GETTING STARTED                        │
│                                         │
│  ▼ How does ShadowSpeak work?           │  ← Expandable
│    ShadowSpeak uses the shadowing       │
│    method: you listen to native         │
│    speakers and repeat what you hear... │
│                                         │
│  ▶ Do I need to know characters?        │
│  ▶ How long until I can hold a          │
│    conversation?                         │
│  ▶ Can my kids use it?                  │
│                                         │
│  PRICING AND BILLING                    │
│                                         │
│  ▶ Is there a free version?             │
│  ▶ Can I cancel anytime?                │
│  ▶ Do you offer refunds?                │
│                                         │
│  TECHNICAL                              │
│                                         │
│  ▶ Does it work offline?                │
│  ▶ Which devices are supported?         │
│  ▶ Why does it need my microphone?      │
│  ▶ Is my data private?                  │
│                                         │
│  CONTENT AND LEARNING                   │
│                                         │
│  ▶ Is this Cantonese or Mandarin?       │
│  ▶ Which romanization system?           │
│  ▶ Can I learn written Chinese?         │
│                                         │
│  ─────────────────────────────          │
│                                         │
│  Still have questions?                  │
│  [Contact us]                           │
│                                         │
│  [Footer — same as landing]             │
│                                         │
└─────────────────────────────────────────┘
```

| Element | Spec |
|---------|------|
| Page layout | Max width 800px, centered. Same nav + footer as landing page. |
| Title | 48px DM Serif Display, color: var(--color-brand-dark), margin: 60px 0 40px |
| Section header | 14px caps semibold, color: var(--color-text-muted), letter-spacing: 1.5px, margin: 32px 0 16px |
| Question item | border-bottom: 0.5px solid var(--color-border), padding: 20px 0 |
| Question | 18px semibold, color: var(--color-brand-dark), display: flex, justify-content: space-between, cursor: pointer |
| Chevron | 16px, color: var(--color-text-muted), transition: transform 200ms. Rotated 180° when expanded. |
| Answer | 15px, color: var(--color-text-secondary), line-height: 1.7, padding: 16px 0 0, display: none. Shown when question is expanded. |
| Contact section | margin: 60px 0, text-align: center |

**Behavior:**
- Questions are collapsed by default
- Tap question to expand/collapse
- URL hash reflects expanded question (e.g., `/faq#offline`) for deep linking
- Search engine friendly — all questions and answers are in DOM, just visually collapsed

---

## 44. CONTACT / SUPPORT PAGE

Static page at shadowspeak.app/contact.

```
┌─────────────────────────────────────────┐
│  [Nav bar]                              │
│                                         │
│  Get in touch                           │
│                                         │
│  ─────────────────────────────          │
│                                         │
│  Whether you've found a bug,            │
│  have a feature idea, or just want      │
│  to say hi, we'd love to hear           │
│  from you.                              │
│                                         │
│                                         │
│  ┌─────────────────────────────┐        │
│  │  💌                           │        │
│  │  General support             │        │
│  │                              │        │
│  │  support@shadowspeak.app     │        │
│  │  [Send email]                │        │
│  └─────────────────────────────┘        │
│                                         │
│  ┌─────────────────────────────┐        │
│  │  💡                           │        │
│  │  Feature requests            │        │
│  │                              │        │
│  │  feedback@shadowspeak.app    │        │
│  │  [Send email]                │        │
│  └─────────────────────────────┘        │
│                                         │
│  ┌─────────────────────────────┐        │
│  │  🔒                           │        │
│  │  Privacy questions           │        │
│  │                              │        │
│  │  privacy@shadowspeak.app     │        │
│  │  [Send email]                │        │
│  └─────────────────────────────┘        │
│                                         │
│  ─────────────────────────────          │
│                                         │
│  Follow us                              │
│  [Instagram] [Twitter]                  │
│                                         │
│  [Footer]                               │
│                                         │
└─────────────────────────────────────────┘
```

| Element | Spec |
|---------|------|
| Title | 48px DM Serif Display, color: var(--color-brand-dark), margin: 60px 0 20px |
| Intro | 18px, color: var(--color-text-secondary), line-height: 1.6, margin-bottom: 48px, max-width: 520px |
| Contact card | background: white, border: 1px solid var(--color-border-strong), border-radius: 16px, padding: 28px, margin-bottom: 16px |
| Icon | 32x32 SVG, margin-bottom: 12px |
| Card title | 20px semibold, color: var(--color-brand-dark), margin-bottom: 12px |
| Email address | 15px, color: var(--color-text-secondary), margin-bottom: 16px |
| Send email button | inline-flex, background: var(--color-brand-lime), color: var(--color-brand-dark), border-radius: 10px, padding: 10px 20px, 14px semibold |

**Behavior:**
- Each "Send email" button opens `mailto:` with pre-filled subject line
- Social links open in new tabs

---

# 45. RESOLVED AMBIGUITIES

Behaviors clarified from the audit:

### Top bar avatar tap
→ Navigates to **Profile / Account Screen** (section 19)

### Top bar streak chip tap
→ Navigates to **Stats Screen** (existing 16.9), scrolling directly to the streak calendar section

### Top bar language label "CANTONESE ›" tap
→ Opens **Language Picker** bottom sheet (section 12)

### Vocab card tap
→ Opens **Word/Vocab Detail Screen** (section 27)

### Score display tap (on Now Playing)
→ Shows a tooltip with: expected Jyutping, transcribed Jyutping, score explanation. No separate screen needed.

### Phrase card expanded "Repeat" button
→ Replays the phrase audio inline at current position. Does NOT start a new mini session.

### Phrase row tap in Topic Detail (body, not buttons)
→ Plays the audio (same as tapping the play button). Body tap = play.

### Swipe-left on phrase card (Library)
→ Reveals a "Delete" action (red, full height). Tap delete → Action Sheet confirmation → removes from library.

### Phrase card "I forgot this" after marking mastered
→ Same card shows this button if status is mastered. Tap moves phrase back to learning and resets SRS interval.

### Email field in Profile (editable?)
→ Read-only in v1. Changing email requires re-verification flow (future).

### "Next scene" behavior in Scene Mode complete
→ Loads the next scene in the same topic. If last scene in topic, loads first scene of next topic.

---

*End of missing screens design brief. All 45 items from the audit (41 missing + 4 ambiguities) are now resolved.*
