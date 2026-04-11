# SHADOWSPEAK — PRACTICE MODES DESIGN BRIEF

> **All 5 practice modes. Pixel-level specs, ASCII layouts, interaction flows, state variations.**
> Use alongside `UXUI-DESIGN-BRIEF.md`. This file is the detailed spec for the 5 modes accessed from the Practice tab.

---

## Overview

| # | Mode | Purpose | Skill trained |
|---|------|---------|---------------|
| 1 | **Shadow Mode** | Listen, repeat, get scored | Pronunciation, rhythm, procedural memory |
| 2 | **Prompt Mode** | Hear English, produce Cantonese | Active recall under pressure |
| 3 | **Speed Run** | Rapid-fire English → Cantonese | Fluency, speed, confidence |
| 4 | **Tone Gym** | Pick the correct tone from two clips | Ear training, tone perception |
| 5 | **Scene Mode** | Multi-turn dialogue practice | Conversational flow |

All 5 modes feed data into the SRS system (except Speed Run, which is warmup only).
All 5 modes work offline when audio is cached.
All 5 modes use the cantonese.ai TTS + Score Pronunciation APIs via the backend proxy.

---

## 16.6A PRACTICE MODE 1 — SHADOW MODE

The core practice experience. User listens to a phrase, repeats it aloud, gets scored, moves to the next. This is the daily loop.

```
┌─────────────────────────────────────────┐
│  ✕ End session          3 of 12         │  ← Close + progress
│  ━━━━━━━━━━━━━░░░░░░░░░░░░░░░░          │  ← Progress bar
│                                         │
│                                         │
│         ┌─────────────────┐             │
│         │                 │             │
│         │  Topic artwork  │             │  ← 200px square
│         │    (70% width)  │             │
│         │                 │             │
│         └─────────────────┘             │
│                                         │
│         Maai⁴ daan¹                     │  ← 32px romanization
│         埋單                            │  ← 20px chinese
│         The bill, please                │  ← 15px english
│                                         │
│         Asking for the bill             │  ← 12px italic context
│         at a restaurant                 │
│                                         │
│                                         │
│         ● ● ● ◌ ◌ ◌ ◌ ◌ ◌               │  ← Audio visualizer
│                                         │     (when playing)
│                                         │
│         0:02 ━━━━━━━░░░░░░ 0:04         │  ← Progress
│                                         │
│     ◄◄          ⏸          ►►           │  ← Transport
│                                         │
│     SLOWER  [NATURAL]   🔁1             │  ← Speed + repeat
│                                         │
└─────────────────────────────────────────┘
```

**After audio plays, enters recording state:**

```
┌─────────────────────────────────────────┐
│  ✕ End session          3 of 12         │
│  ━━━━━━━━━━━━━░░░░░░░░░░░░░░░░          │
│                                         │
│         ┌─────────────────┐             │
│         │  Topic artwork  │             │
│         └─────────────────┘             │
│                                         │
│         Maai⁴ daan¹                     │
│         埋單                            │
│         The bill, please                │
│                                         │
│                                         │
│            ┌──────────┐                 │
│            │          │                 │
│            │   🎤     │                 │  ← Large mic button
│            │          │                 │     (pulsing red ring)
│            │          │                 │
│            └──────────┘                 │
│                                         │
│         Your turn — speak now           │  ← Prompt
│         Recording... 2s                 │
│                                         │
└─────────────────────────────────────────┘
```

**After recording, shows score:**

```
┌─────────────────────────────────────────┐
│  ✕ End session          3 of 12         │
│  ━━━━━━━━━━━━━░░░░░░░░░░░░░░░░          │
│                                         │
│         ┌─────────────────┐             │
│         │  Topic artwork  │             │
│         └─────────────────┘             │
│                                         │
│         Maai⁴ daan¹                     │
│         埋單                            │
│                                         │
│              ┌────────┐                 │
│              │        │                 │
│              │   92   │                 │  ← Score reveal
│              │        │                 │     (scale pop anim)
│              └────────┘                 │
│              Excellent!                 │
│                                         │
│         Expected: maai4 daan1           │  ← Feedback
│         You said: maai4 daan1           │
│                                         │
│     ┌── Try again ──┐  ┌── Next ──►┐   │
│                                         │
└─────────────────────────────────────────┘
```

| Element | Spec |
|---------|------|
| Close button (✕) | top-left, 24px, 44x44 tap target, color: var(--color-text-secondary) |
| Progress count "3 of 12" | top-right, 13px medium, color: var(--color-text-muted) |
| Progress bar | full width below header, 3px tall, var(--color-brand-lime) fill on var(--color-bg) track |
| Artwork | 70% of screen width, max 280px, border-radius: 20px, margin: 32px auto 28px |
| Romanization | 32px semibold, color: var(--color-brand-dark), text-align: center, letter-spacing: -0.5px |
| Chinese | 20px, color: var(--color-text-secondary), text-align: center, margin-top: 6px |
| English | 15px, color: var(--color-text-muted), text-align: center, margin-top: 4px |
| Context | 12px italic, color: var(--color-text-muted), text-align: center, margin-top: 6px, max-width: 280px |
| Audio visualizer | 9 dots, centered row, gap: 6px. Active: 6x6px var(--color-brand-lime). Inactive: 4x4px rgba(0,0,0,0.1). Animated wave during playback. |
| Progress row | centered, gap: 10px, margin-top: 16px. Times 10px color: var(--color-text-muted). Bar: flex: 1, max-width: 200px, 3px tall. |
| Transport controls | centered row, gap: 48px, margin-top: 24px |
| Prev/Next | 28x28px with 44x44 tap target, CSS double-triangle icons, color: var(--color-text-secondary) |
| Play/Pause | 60x60px circle, background: var(--color-brand-dark), icon: white |
| Speed + Repeat row | centered, gap: 24px, margin-top: 20px. 11px semibold. Active: var(--color-brand-lime). Inactive: var(--color-text-muted). |

**Recording state:**

| Element | Spec |
|---------|------|
| Mic button | 120x120px circle, background: var(--color-brand-dark), center icon: 40x40px white mic SVG |
| Pulsing ring | 2 concentric rings expanding from mic button. Ring 1: 140x140px, 3s ease-out infinite. Ring 2: 160x160px, 3s ease-out infinite 1.5s delay. Color: var(--color-error) with opacity 0.4 → 0. |
| Recording prompt | 16px semibold, centered, color: var(--color-text-primary), margin-top: 24px |
| Recording timer | 13px, color: var(--color-error), text-align: center, margin-top: 4px |

**Score state:**

| Element | Spec |
|---------|------|
| Score circle | 100x100px circle, background varies by score (green ≥90 / lime 70-89 / orange 50-69 / red <50), centered |
| Score number | 42px semibold white inside circle |
| Score label | 14px semibold, color matches circle, text-align: center, margin-top: 12px. "Excellent" (≥90) / "Good" (70-89) / "Keep practicing" (50-69) / "Try again" (<50) |
| Feedback | 2 lines, 13px, color: var(--color-text-secondary), text-align: center, margin-top: 16px. Uses monospace font for Jyutping. |
| Action buttons | 2 buttons, equal width, gap: 10px, padding: 0 22px, margin-top: 28px. "Try again" = outlined. "Next" = filled lime with arrow. |

**Auto-flow logic:**
1. Audio plays (auto-play on screen enter)
2. After audio ends + 500ms pause → recording starts automatically
3. Recording lasts max 4 seconds or until 1 second of silence detected
4. Score calculated → shown with animation
5. If score ≥70 and auto-advance on → auto-play next phrase after 2 seconds
6. If score <70 → wait for user to tap "Try again" or "Next"

---

## 16.6B PRACTICE MODE 2 — PROMPT MODE ("Your Turn")

Reverses the shadow flow: app shows English, user must produce the Cantonese without hearing it first. Tests recall under pressure.

```
┌─────────────────────────────────────────┐
│  ✕ End session          5 of 10         │
│  ━━━━━━━━━━━━━━━━━━━░░░░░░              │
│                                         │
│                                         │
│         LEVEL 2                         │  ← Difficulty label
│         English only                    │
│                                         │
│                                         │
│         Say this in Cantonese:          │  ← Prompt
│                                         │
│                                         │
│      "How much is the milk tea?"        │  ← Large English
│                                         │
│                                         │
│                                         │
│                                         │
│            ┌──────────┐                 │
│            │          │                 │
│            │   🎤     │                 │  ← Hold to speak
│            │          │                 │
│            └──────────┘                 │
│                                         │
│         Hold to speak                   │
│                                         │
│                                         │
│     [Skip]              [Give up]       │  ← Bottom actions
└─────────────────────────────────────────┘
```

**After user speaks, reveals answer:**

```
┌─────────────────────────────────────────┐
│  ✕ End session          5 of 10         │
│  ━━━━━━━━━━━━━━━━━━━░░░░░░              │
│                                         │
│         "How much is the milk tea?"     │
│                                         │
│         ┌───────────────────┐           │
│         │ You said:         │           │
│         │ naai5 caa4        │           │  ← User attempt
│         │ gei2 cin2         │           │
│         └───────────────────┘           │
│                                         │
│         ┌───────────────────┐           │
│         │ Expected:         │           │
│         │ Naai⁵ caa⁴ gei²   │           │  ← Correct answer
│         │ do¹ cin²?         │           │     with play button
│         │ 奶茶幾多錢？       │           │
│         │              [▶]  │           │
│         └───────────────────┘           │
│                                         │
│              Score: 68                  │
│                                         │
│     ┌── Try again ──┐  ┌── Next ──►┐   │
└─────────────────────────────────────────┘
```

| Element | Spec |
|---------|------|
| Level label | 10px caps semibold, color: var(--color-brand-green), letter-spacing: 1.5px, text-align: center, margin-top: 40px |
| Level description | 12px, color: var(--color-text-muted), text-align: center, margin-top: 2px |
| "Say this in Cantonese:" | 13px, color: var(--color-text-muted), text-align: center, margin-top: 48px |
| English prompt | 26px semibold, color: var(--color-text-primary), text-align: center, margin-top: 16px, padding: 0 32px, line-height: 1.3 |
| Hold-to-speak button | 100x100px circle, background: var(--color-brand-dark), mic icon 36px white. Active (holding): background: var(--color-error), pulse animation. |
| Instruction | 14px semibold, centered below button, margin-top: 16px. Changes: "Hold to speak" → "Recording..." → "Release to send" |
| Bottom actions | Row at bottom, padding: 0 22px 24px. "Skip" and "Give up": 13px medium, color: var(--color-text-muted), underline on tap. |

**Comparison cards (answer reveal):**

| Element | Spec |
|---------|------|
| Card | background: white, border: 0.5px solid var(--color-border), border-radius: 14px, padding: 14px 16px, margin: 12px 22px |
| Label "You said:" | 10px caps semibold, color: var(--color-text-muted), letter-spacing: 1px, margin-bottom: 6px |
| Label "Expected:" | same styling |
| Jyutping text | 18px semibold, color varies: user attempt = color matches score level, expected = var(--color-brand-dark) |
| Chinese (expected only) | 14px, color: var(--color-text-secondary), margin-top: 4px |
| Play button (expected only) | 32x32px circle top-right of card, var(--color-brand-lime) background, CSS play triangle |

**Difficulty levels:**
- **Level 1**: English + Jyutping shown, user just needs to say it
- **Level 2**: English only (shown above)
- **Level 3**: Audio cue only (short beep), user must recall from memory
- Level advances automatically: every 5 correct in a row unlocks next level

---

## 16.6C PRACTICE MODE 3 — SPEED RUN

Rapid-fire English-to-Cantonese recall. Gamified with a timer. No deep practice — this is a warmup/fun mode that tests fluency under pressure.

```
┌─────────────────────────────────────────┐
│  ✕ Quit          ⏱ 45s    Score: 8      │  ← Timer + score
│                                         │
│                                         │
│              ┌──────┐                   │
│              │  ◐   │                   │  ← Circular timer
│              │  3   │                   │     5 → 0 countdown
│              └──────┘                   │
│                                         │
│                                         │
│           Say in Cantonese:             │
│                                         │
│                                         │
│         "Thank you"                     │  ← 32px English prompt
│                                         │
│                                         │
│                                         │
│         ┌────────────────────┐          │
│         │  🎤 Tap to speak   │          │  ← Simpler button
│         └────────────────────┘          │
│                                         │
│                                         │
│  Streak: 🔥 3    Personal best: 12      │  ← Stats footer
└─────────────────────────────────────────┘
```

**After each attempt (flash animation, 600ms):**

Correct:
```
┌─────────────────────────────────────────┐
│                                         │
│              ┌──────┐                   │
│              │  ✓   │                   │  ← Green flash
│              └──────┘                   │
│                                         │
│            唔該 m4 goi1                 │
│                                         │
│              +1                         │  ← Score increment
│                                         │
└─────────────────────────────────────────┘
```

Wrong/timeout:
```
┌─────────────────────────────────────────┐
│                                         │
│              ┌──────┐                   │
│              │  ✕   │                   │  ← Red flash
│              └──────┘                   │
│                                         │
│            唔該 m4 goi1                 │  ← Correct answer
│                                         │     shown briefly
│                                         │
└─────────────────────────────────────────┘
```

**End of session summary:**

```
┌─────────────────────────────────────────┐
│                                         │
│              ┌──────┐                   │
│              │ 🏆   │                   │
│              └──────┘                   │
│                                         │
│         Speed Run Complete              │
│                                         │
│         ┌─────────────────┐             │
│         │                 │             │
│         │      14         │             │  ← Final score
│         │                 │             │
│         │  phrases correct│             │
│         └─────────────────┘             │
│                                         │
│     Personal best beat! (was 12)        │  ← Celebration
│                                         │
│     ┌───── Play again ─────┐            │
│     ┌──── Back to Practice ───┐         │
│                                         │
└─────────────────────────────────────────┘
```

| Element | Spec |
|---------|------|
| Header | Fixed top. "✕ Quit" left, Timer center, "Score: N" right. padding: 14px 22px. 14px semibold. |
| Total timer | Counts down from 60s. Last 10s: color: var(--color-error), pulse animation. |
| Circular timer | 80x80px SVG circle, stroke-dasharray animated, fills clockwise. Number inside: 32px bold. Countdown from 5 to 0 per phrase. |
| English prompt | 32px semibold, text-align: center, padding: 0 32px, margin-top: 24px |
| Speak button | Full-width minus 40px side margins, background: var(--color-brand-dark), color: white, border-radius: 14px, padding: 18px, 16px semibold. Active: scale 0.98. |
| Stats footer | Fixed bottom. 12px, color: var(--color-text-muted), text-align: center, padding: 16px. Streak flame + number. |

**Correct flash:**
- Background briefly tints var(--color-mastered-bg)
- Large green checkmark circle (120x120px) pops in center, scales 0 → 1.2 → 1
- Correct Cantonese answer shown below (20px semibold)
- "+1" floats up and fades out
- Duration: 600ms total, then next phrase

**Wrong/timeout flash:**
- Background briefly tints #FFE0E0
- Large red X circle (120x120px) pops in center
- Correct answer shown below (20px semibold)
- Duration: 1000ms total (longer so user can see the answer)

**Scoring rules:**
- Each correct answer: +1 point
- Each wrong answer or timeout: 0 points, no penalty
- Session length: 60 seconds
- Track streak (consecutive correct) and personal best
- No SRS updates from Speed Run (it's warmup, not deep practice)

---

## 16.6D PRACTICE MODE 4 — TONE GYM

Ear training for tones. Two audio clips play, user picks the correct one. Pure listening practice — no speaking required.

```
┌─────────────────────────────────────────┐
│  ✕ End session          Round 3 of 10   │
│  ━━━━━━━━━━░░░░░░░░░░░░░░░░░░░░          │
│                                         │
│                                         │
│         Which one means:                │
│                                         │
│         "buy" (to buy something)        │  ← Target meaning
│                                         │
│                                         │
│         Listen carefully and pick       │
│         the correct tone:               │
│                                         │
│                                         │
│    ┌───────────┐   ┌───────────┐       │
│    │           │   │           │       │
│    │    A      │   │    B      │       │  ← Two options
│    │           │   │           │       │
│    │    ▶      │   │    ▶      │       │
│    │           │   │           │       │
│    └───────────┘   └───────────┘       │
│                                         │
│                                         │
│         ┌── Play both again ──┐         │
│                                         │
└─────────────────────────────────────────┘
```

**After selection:**

```
┌─────────────────────────────────────────┐
│  ✕ End session          Round 3 of 10   │
│  ━━━━━━━━━━░░░░░░░░░░░░░░░░░░░░          │
│                                         │
│                                         │
│              ┌──────┐                   │
│              │  ✓   │                   │
│              └──────┘                   │
│                                         │
│         You picked A                    │
│                                         │
│    ┌───────────┐   ┌───────────┐       │
│    │    A ✓    │   │    B      │       │
│    │  maai⁵    │   │  maai⁶    │       │  ← Reveal tones
│    │    買     │   │    賣     │       │
│    │   "buy"   │   │  "sell"   │       │
│    │    ▶      │   │    ▶      │       │
│    └───────────┘   └───────────┘       │
│                                         │
│     Tone 5 (low rising) vs              │  ← Tone explanation
│     Tone 6 (low level)                  │
│                                         │
│         ┌───── Next ──────►┐            │
│                                         │
└─────────────────────────────────────────┘
```

| Element | Spec |
|---------|------|
| Round counter | top-right, 13px medium, color: var(--color-text-muted) |
| Question label | 13px, color: var(--color-text-muted), text-align: center, margin-top: 48px |
| Target meaning | 22px semibold, color: var(--color-text-primary), text-align: center, margin-top: 8px, in quotes |
| Instructions | 13px, color: var(--color-text-muted), text-align: center, margin-top: 20px, max-width: 280px |
| Option cards | 2 cards, equal width, gap: 16px, margin: 32px 22px |
| Option card | aspect-ratio: 1, background: white, border: 2px solid var(--color-border-strong), border-radius: 16px, display: flex, flex-direction: column, align-items: center, justify-content: center |
| Option letter | 28px semibold, color: var(--color-brand-dark) |
| Option play button | 48x48px circle, background: var(--color-brand-lime), CSS play triangle, margin-top: 16px |
| "Play both again" button | Full-width minus 60px side margins, background: var(--color-brand-dark), color: white, border-radius: 12px, padding: 14px, 14px semibold |

**Selected state:**

| Element | Spec |
|---------|------|
| Correct pick | Card border: 2px solid var(--color-brand-green), background: var(--color-mastered-bg). Green checkmark overlay top-right. |
| Wrong pick | Card border: 2px solid var(--color-error), background: #FFE0E0. Red X overlay top-right. |
| Both cards reveal | Jyutping (16px semibold), Chinese character (24px), English meaning (12px muted) added to both cards |
| Feedback header | Circle with ✓ or ✕, 80x80px, animated in with scale bounce |
| "You picked A" text | 16px semibold, centered, margin-top: 12px |
| Tone explanation | 13px, color: var(--color-text-secondary), text-align: center, margin: 24px 22px 0, line-height: 1.5. Format: "Tone X (description) vs Tone Y (description)" |
| Next button | Same as Shadow Mode next button |

**Session structure:**
- 10 rounds per session
- Difficulty scales: rounds 1-3 = distant tones (tone 1 vs tone 4), rounds 4-7 = adjacent tones (tone 2 vs tone 3), rounds 8-10 = hardest pairs (tone 5 vs tone 6)
- After 10 rounds: summary showing accuracy % and which tone pairs user confused most
- Tracks tone confusion patterns in IndexedDB (e.g., "user often confuses tone 2 and tone 5")

**Tone pair library:**
Pre-authored minimal pairs (same syllable, different tones, different meanings):
```
maai5 買 (buy) vs maai6 賣 (sell)
si1 詩 (poem) vs si2 史 (history) vs si3 試 (try) vs si4 時 (time) vs si5 市 (market) vs si6 是 (is)
jau4 油 (oil) vs jau5 有 (have) vs jau6 右 (right)
gau2 九 (nine) vs gau3 夠 (enough) vs gau6 舊 (old)
... (at least 30 pairs total)
```

---

## 16.6E PRACTICE MODE 5 — SCENE MODE

Full conversation practice. Multi-turn dialogue where user shadows one side and hears the other. This builds conversational flow, not just phrase recall.

```
┌─────────────────────────────────────────┐
│  ✕ End scene      "Ordering milk tea"   │
│  ━━━━━━━━━━━━━░░░░░░░░░░░░ Turn 3 of 6 │
│                                         │
│  ┌────────────────────────┐             │
│  │ Staff                  │             │
│  │ Jam² me¹?              │             │  ← Other speaker
│  │ 飲咩？                  │             │     (left bubble)
│  │ What to drink?         │             │
│  └────────────────────────┘             │
│                                         │
│             ┌────────────────────────┐  │
│             │ You                    │  │
│             │ Dung³ naai⁵ caa⁴,      │  │  ← Your previous turn
│             │ siu² tim⁴              │  │     (right bubble)
│             │ 凍奶茶，少甜            │  │
│             │ Iced milk tea,         │  │
│             │ less sweet             │  │
│             │            Score: 92 ★ │  │
│             └────────────────────────┘  │
│                                         │
│  ┌────────────────────────┐             │
│  │ Staff              🔊  │             │  ← Currently playing
│  │ Jiu³ m⁴ jiu³ sik⁶ je⁵?│             │
│  │ 要唔要食嘢？             │             │
│  │ Want anything to eat?  │             │
│  └────────────────────────┘             │
│                                         │
│─────────────────────────────────────────│
│                                         │
│    ┌────────────────────────────┐       │  ← Your turn prompt
│    │  🎤 Your turn — tap to speak│       │     (fixed bottom)
│    └────────────────────────────┘       │
│                                         │
└─────────────────────────────────────────┘
```

**Turn 1 state (scene start):**

```
┌─────────────────────────────────────────┐
│  ✕ End scene      "Ordering milk tea"   │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░ Turn 1 of 6│
│                                         │
│                                         │
│         Scene: Ordering milk tea        │
│         at a cha chaan teng             │
│                                         │
│         6 turns · ~3 minutes            │
│                                         │
│                                         │
│           ┌─────────────┐               │
│           │             │               │
│           │ Scene image │               │
│           │             │               │
│           └─────────────┘               │
│                                         │
│                                         │
│         The staff will start...         │
│                                         │
│                                         │
│                                         │
│         ┌──── Start scene ────┐         │
│                                         │
└─────────────────────────────────────────┘
```

**Scene complete state:**

```
┌─────────────────────────────────────────┐
│                                         │
│              ┌──────┐                   │
│              │ 🏆   │                   │
│              └──────┘                   │
│                                         │
│         Scene complete                  │
│                                         │
│         Average score: 87               │
│         3 of 3 turns passed             │
│                                         │
│         ┌─────────────────┐             │
│         │  Score breakdown│             │
│         │  Turn 1: 92 ★   │             │
│         │  Turn 2: 88 ★   │             │
│         │  Turn 3: 81 ★   │             │
│         └─────────────────┘             │
│                                         │
│     ┌── Replay scene ──┐                │
│     ┌── Save phrases to library ─┐      │
│     ┌── Next scene ──►┐                 │
│                                         │
└─────────────────────────────────────────┘
```

| Element | Spec |
|---------|------|
| Header | ✕ left, scene title center (14px semibold, in quotes), progress count right |
| Progress bar | Below header, 3px tall, turns completed / total turns |
| Chat area | Scrollable, padding: 16px 22px, auto-scroll to newest bubble |
| Other speaker bubble | background: white, border: 0.5px solid var(--color-border), border-radius: 16px 16px 16px 4px, padding: 12px 14px, max-width: 80%, align-self: flex-start, margin-bottom: 12px |
| User bubble | background: var(--color-brand-lime-muted), border: 1px solid rgba(197,232,90,0.3), border-radius: 16px 16px 4px 16px, padding: 12px 14px, max-width: 80%, align-self: flex-end, margin-bottom: 12px |
| Speaker label | 10px caps semibold, color: var(--color-text-muted), letter-spacing: 0.5px, margin-bottom: 4px |
| Romanization in bubble | 15px semibold, color: var(--color-brand-dark), line-height: 1.3 |
| Chinese in bubble | 13px, color: var(--color-text-secondary), margin-top: 3px |
| English in bubble | 11px, color: var(--color-text-muted), margin-top: 3px |
| Score in bubble | right-aligned row, 11px semibold, margin-top: 6px. Format: "Score: 92 ★" with color based on score |
| Currently playing icon | Small speaker icon (14px) top-right of bubble, pulse animation |
| Your turn prompt | Fixed bottom, background: white, border-top: 0.5px solid var(--color-border), padding: 16px 22px |
| Tap-to-speak button | Full width, background: var(--color-brand-dark), color: white, border-radius: 14px, padding: 16px, 15px semibold, mic icon left of text. Active (recording): background: var(--color-error), pulse animation, text: "Listening..." |

**Turn flow:**
1. Scene loads with intro card, tap "Start scene"
2. First "other" turn: audio plays automatically with visual playing indicator
3. After audio, if next turn is "user": prompt bar activates, tap to record
4. Recording: max 5 seconds, auto-stop on silence
5. Score calculated, user bubble appears with score
6. If score ≥70: auto-advance to next turn after 1.5s
7. If score <70: user can tap bubble to retry, or tap "next turn" button
8. Continue until all turns complete
9. Summary screen with score breakdown

**Voice differentiation:**
- "Other" speaker uses TTS voice_id_alt from language pack
- "User" playback (on replay) uses TTS voice_id (default)
- This creates a clear audible distinction between the two speakers

**Dialogue scene data source:**
All scenes live in `src/data/dialogues/cantonese/*.json`. See Section A3 for the full schema.

---


*End of practice modes design brief.*
