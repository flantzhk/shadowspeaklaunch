# SHADOWSPEAK — UX/UI DESIGN BRIEF

> **Section 16 of IMPLEMENTATION-GUIDE.md. Insert before Content Philosophy.**
> **Claude Code must follow these specs exactly. Every screen, every component, every state.**

---

## 16.1 GLOBAL LAYOUT

### App shell

```
┌─────────────────────────────────┐
│         TOP BAR (52px)          │  Fixed top. Logo + streak + avatar.
│─────────────────────────────────│
│                                 │
│                                 │
│       SCREEN CONTENT            │  Scrollable. Padded 22px sides.
│       (fills remaining)         │
│                                 │
│                                 │
│─────────────────────────────────│
│      MINI PLAYER (if active)    │  Fixed. Above tab bar. 140px tall.
│─────────────────────────────────│
│         TAB BAR (56px)          │  Fixed bottom. 3 tabs.
│─────────────────────────────────│
│       HOME INDICATOR (34px)     │  Safe area bottom (iOS).
└─────────────────────────────────┘
```

- Screen content area scrolls independently
- Mini player persists across all tabs when a session is active
- Content area bottom padding must account for: tab bar (56px) + mini player height when active (140px) + safe area
- All screens use `padding: 0 22px` for side gutters
- Maximum content width: 428px (centered on tablets/iPads)

### Top bar

```
┌─────────────────────────────────────────┐
│  ShadowSpeak        🔥 12   [F]        │
│  CANTONESE ›        days               │
└─────────────────────────────────────────┘
```

| Element | Spec |
|---------|------|
| Wordmark "Shadow" | 16px semibold, color: var(--color-brand-dark) |
| Wordmark "Speak" | 16px semibold, color: var(--color-brand-green) |
| Language label | 9px caps, color: var(--color-text-muted), letter-spacing: 1.2px, margin-top: 2px |
| Streak chip | Background: var(--color-streak-bg), border-radius: 12px, padding: 5px 10px |
| Streak flame | CSS-drawn (no emoji). Orange base (#E8703A) with yellow inner (#FFCC4D). 14x14px. |
| Streak number | 11px semibold, color: var(--color-streak-text) |
| Streak label | 9px medium, color: #B06830 |
| Avatar circle | 32x32px, border-radius: 50%, background: #D8C9A8, initial letter 12px semibold color: #5a4a2a |
| Gap between streak and avatar | 10px |
| Top bar padding | 14px horizontal, 22px vertical top |

**Streak states:**
- 0 days: flame is gray (#CCCCCC), chip background: #F0F0F0, text: #999999
- 1-6 days: flame is orange, chip background: var(--color-streak-bg)
- 7+ days: flame gets subtle CSS pulse animation (scale 1.0 → 1.15, 2s loop)
- 30+ days: flame color shifts to deeper red (#D04030), "🔥" aura glow via box-shadow

### Tab bar

```
┌─────────────────────────────────────────┐
│    Home        My Library      Practice  │
│                  ───                     │
└─────────────────────────────────────────┘
```

| Element | Spec |
|---------|------|
| Tab label (inactive) | 11px medium, color: var(--color-text-muted) |
| Tab label (active) | 11px semibold, color: var(--color-brand-dark) |
| Active indicator | 16px wide, 2px tall bar, color: var(--color-brand-lime), centered below label, border-radius: 1px, margin-top: 4px |
| Tab bar background | var(--color-bg), no border (clean edge) |
| Tab bar height | 56px (excluding safe area) |
| Home indicator bar | 120px wide, 4px tall, color: #1a1a1a, border-radius: 2px, centered, 8px from bottom |
| Each tab | flex: 1, text-align: center, min-height: 44px tap target |

**Tab switching:** No animation. Instant swap. Screen content scrolls to top on re-tap of active tab.

---

## 16.2 HOME SCREEN

Top to bottom, scrollable:

### Greeting

```
Good evening, Faith
Your lesson is ready. Just press play.
```

| Element | Spec |
|---------|------|
| Greeting | 24px semibold, letter-spacing: -0.5px, line-height: 1.2 |
| Subtitle | 13px normal, color: var(--color-text-muted), margin-top: 4px |
| Section padding | 20px top, 22px sides |

**Greeting logic:**
- 5:00-11:59 → "Good morning"
- 12:00-17:59 → "Good afternoon"
- 18:00-4:59 → "Good evening"
- Use first name from settings

### Hero card (Today's Lesson)

```
┌─────────────────────────────────────────┐
│  ┌─────────────────────────────────┐    │
│  │ ● TODAY'S LESSON       Day 12   │    │
│  │                                 │    │  ← 200px tall image area
│  │                                 │    │     with gradient overlay
│  │  At a restaurant                │    │
│  │  Ordering, asking for the bill  │    │
│  └─────────────────────────────────┘    │
│  ┌──────────────┐  ┌──────────────────┐ │
│  │ 10  20 [30]  │  │  ▶  Start lesson │ │  ← 60px action area
│  │ MIN MIN MIN  │  │                  │ │
│  └──────────────┘  └──────────────────┘ │
└─────────────────────────────────────────┘
```

| Element | Spec |
|---------|------|
| Card | background: white, border-radius: 22px, border: 0.5px solid var(--color-border), overflow: hidden |
| Image area | height: 200px, position: relative. Background: topic's imageGradient (or photo). |
| "TODAY'S LESSON" label | 10px caps semibold, color: white, letter-spacing: 1.4px, text-shadow for readability |
| Green dot | 6x6px circle, background: var(--color-brand-lime), margin-right: 6px |
| Day badge | Top-right. background: rgba(255,255,255,0.92), padding: 4px 9px, border-radius: 8px, font: 11px semibold |
| Bottom gradient | linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.65) 100%), covers bottom ~60% of image |
| Title | 22px semibold white, letter-spacing: -0.4px, line-height: 1.15 |
| Subtitle | 12px white, opacity: 0.9, margin-top: 5px |
| Action area | padding: 16px 18px 18px, display: flex, gap: 8px |
| Duration picker | Segmented control. 3 options (10/20/30 MIN). Border: 0.5px solid rgba(0,0,0,0.1), border-radius: 10px. |
| Duration option (inactive) | padding: 10px 11px, background: var(--color-bg), text-align: center. Number: 14px semibold. Label "MIN": 8px caps, color: var(--color-text-muted), letter-spacing: 0.5px. |
| Duration option (active) | background: var(--color-brand-dark). Number: 14px semibold white. Label: 8px caps, color: #A8C878. |
| Start button | flex: 1, background: var(--color-brand-lime), border-radius: 12px, padding: 15px 14px, font: 15px semibold, color: var(--color-brand-dark). Play triangle icon left of text. |
| Play triangle | CSS border trick. 11px left border solid dark, 7px top/bottom transparent. |

**Hero card states:**
- **Active (lesson available):** As designed above
- **Completed today:** Title changes to "Lesson complete ✓", Start button → "Practice more", green tint overlay on image
- **Day 1 (empty library):** Title: "Your first lesson", Subtitle: "5 phrases to get you started"

### Custom phrase input card

```
┌─────────────────────────────────────────┐
│  (+)  Want to say something specific?   │
│       Type it in — goes to My Library   │  › 
└─────────────────────────────────────────┘
```

| Element | Spec |
|---------|------|
| Card | background: white, border: 0.5px solid var(--color-border), border-radius: 14px, padding: 14px 16px, display: flex, align-items: center, gap: 13px |
| Plus circle | 40x40px, border-radius: 50%, background: var(--color-brand-lime), font: 20px semibold dark, centered "+" |
| Title | 14px semibold |
| Subtitle | 11px, color: var(--color-text-muted), margin-top: 2px, line-height: 1.4 |
| Chevron | 18px, color: #b0b0b0, flex-shrink: 0 |
| Margin-top | 18px from hero card |

**Tap behavior:** Opens a modal/sheet with a text input field + "Add phrase" button. After adding: toast confirmation, phrase appears in library.

### Library summary card

```
┌─────────────────────────────────────────┐
│  [📄]  My Library                       │
│        23 phrases · 8 mastered          │
│                                         │
│  Your daily lesson is built from these  │
│  phrases. The more you save, the more   │
│  personal your practice becomes.        │
└─────────────────────────────────────────┘
```

| Element | Spec |
|---------|------|
| Card | background: white, border: 0.5px solid var(--color-border), border-radius: 16px, padding: 16px |
| Icon container | 36x36px, border-radius: 9px, background: #E8F1D4. SVG icon: 16x16px document outline in #3a6a1a. |
| Title "My Library" | 14px semibold |
| Count | 11px, color: var(--color-text-muted), margin-top: 1px |
| Description | 12px, color: var(--color-text-secondary), line-height: 1.55 |
| Margin-top | 18px |

**Tap behavior:** Navigates to Library tab.

### Search bar

```
┌─────────────────────────────────────────┐
│  🔍  Search phrases, words, topics      │
└─────────────────────────────────────────┘
```

| Element | Spec |
|---------|------|
| Bar | background: white, border: 0.5px solid var(--color-border), border-radius: 14px, padding: 11px 14px, display: flex, align-items: center, gap: 10px |
| Search icon | 14px, color: var(--color-text-muted) |
| Placeholder text | 13px, color: var(--color-text-muted) |
| Margin-top | 18px |

**Tap behavior:** Expands into a full search screen with real-time filtering across all phrases, words, and topic names. Results grouped by type.

### Category rows

Each category is a section with a header and horizontal scroll row of topic cards.

```
The very basics                    4 topics
┌──────┐  ┌──────┐  ┌──────┐  ┌──
│      │  │      │  │      │  │    ← half-visible card = scroll hint
│ img  │  │ img  │  │ img  │  │
│   ▶  │  │   ▶  │  │   ▶  │  │
└──────┘  └──────┘  └──────┘  └──
Daily      Numbers    Quick
basics     and cnt    questions
Hello...   1 to 100   Where...
━━━ 12/12  ━━━ 6/15   ━ 3/18
```

| Element | Spec |
|---------|------|
| Section margin-top | 24px |
| Header row | flex, justify-content: space-between, align-items: baseline, padding: 0 22px, margin-bottom: 12px |
| Category name | 16px semibold, letter-spacing: -0.2px |
| Topic count | 11px, color: var(--color-text-muted), font-weight: 500 |
| Scroll container | display: flex, gap: 10px, padding: 0 22px, overflow-x: auto, scrollbar: hidden |

#### Topic card

```
┌──────────────────┐
│  12 phrases    ▶ │  ← 140x100px image area
│                  │
└──────────────────┘
Daily basics           ← 13px semibold, margin-top: 8px
Hello, thanks, sorry   ← 10px muted, margin-top: 3px
━━━━━━━━━━━━━ 12/12    ← progress bar + count
```

| Element | Spec |
|---------|------|
| Card width | 140px, flex-shrink: 0 |
| Image area | 140x100px, border-radius: 12px, overflow: hidden, position: relative |
| Image background | Topic's imageGradient CSS |
| Phrase count badge | Top-left, 8px inset. background: rgba(0,0,0,0.55), color: white, 9px semibold, padding: 3px 7px, border-radius: 5px |
| Play button | Bottom-right, 8px inset. 28x28px circle, background: rgba(255,255,255,0.95), box-shadow: 0 2px 6px rgba(0,0,0,0.15). CSS play triangle inside. |
| Topic name | 13px semibold, line-height: 1.25, margin-top: 8px |
| Topic description | 10px, color: var(--color-text-muted), margin-top: 3px |
| Progress bar container | margin-top: 5px, display: flex, align-items: center, gap: 5px |
| Progress bar track | flex: 1, height: 3px, background: #EEE8D8, border-radius: 2px, overflow: hidden |
| Progress bar fill | height: 100%, background: var(--color-brand-lime), width: percentage based on mastered/total |
| Progress count | 9px, color: var(--color-text-muted), font-weight: 500, flex-shrink: 0 |

**Download indicator on topic card** (overlays on image area):
- Not downloaded: small cloud-arrow-down outline icon, 16px, top-right corner, 6px inset, color: rgba(255,255,255,0.7)
- Downloading: circular progress ring replacing the icon, 20px diameter, stroke: white
- Downloaded: checkmark in circle, 16px, top-right, color: rgba(255,255,255,0.9)

**Tap behavior:**
- Tapping image/body → navigates to TopicDetailScreen
- Tapping play button → starts shadow session with this topic's phrases (skips topic detail)

---

## 16.3 MY LIBRARY SCREEN

### Phrases/Vocab toggle

```
┌─────────────────────────────────────────┐
│      [Phrases]          Vocab           │  ← dark toggle bar
└─────────────────────────────────────────┘
```

| Element | Spec |
|---------|------|
| Container | background: var(--color-brand-dark), border-radius: 10px, overflow: hidden, display: flex, margin: 16px 22px 0 |
| Option (inactive) | flex: 1, padding: 10px, text-align: center, 13px semibold, color: rgba(255,255,255,0.5) |
| Option (active) | background: var(--color-brand-lime), color: var(--color-brand-dark), border-radius: 8px, margin: 2px |

### Learning/Mastered filter

```
  [Learning · 12]    Mastered · 8
```

| Element | Spec |
|---------|------|
| Container | margin: 12px 22px 0, display: flex, gap: 6px |
| Button (inactive) | flex: 1, padding: 8px 0, text-align: center, 12px medium, color: var(--color-text-muted), background: white, border: 0.5px solid var(--color-border), border-radius: 8px |
| Button (active) | background: var(--color-brand-dark), color: white, font-weight: 600, border-color: var(--color-brand-dark) |

### Queue meter (Phrases view only)

```
┌─────────────────────────────────────────┐
│  Learning queue                 23 / 30 │
│  ████████████████░░░░░░░░░░░░░░░░░░░░░ │
│  ● 8 mastered    ● 12 learning          │
└─────────────────────────────────────────┘
```

| Element | Spec |
|---------|------|
| Card | margin: 14px 22px 0, background: white, border: 0.5px solid var(--color-border), border-radius: 12px, padding: 12px 14px |
| "Learning queue" | 11px semibold |
| Count "23 / 30 max" | 11px, color: var(--color-text-muted). "23" is bold, color: var(--color-brand-dark). |
| Progress bar | height: 6px, background: #EEE8D8, border-radius: 3px, display: flex, overflow: hidden |
| Mastered fill | background: var(--color-brand-green) |
| Learning fill | background: #E8A030 |
| Legend dots | 6x6px squares with border-radius: 2px, matching colors. 10px font, color: var(--color-text-muted). Gap: 12px between items. Margin-top: 8px. |

### Phrase card (collapsed)

```
┌─────────────────────────────────────────┐
│  Maai⁴ daan¹                       [▶] │
│  埋單                                ▾  │
│  The bill, please                       │
│  LEARNING  · Practiced 5 days ago       │
└─────────────────────────────────────────┘
```

| Element | Spec |
|---------|------|
| Card | background: white, border: 0.5px solid var(--color-border), border-radius: 14px, padding: 14px 16px, margin-bottom: 8px |
| Layout | display: flex, gap: 12px. Left: flex: 1 (text). Right: play + chevron column. |
| Romanization | 15px semibold, color: var(--color-brand-dark), line-height: 1.2 |
| Chinese | 13px, color: var(--color-text-secondary), margin-top: 3px |
| English | 12px, color: #3a3a3a, margin-top: 4px |
| Status row | margin-top: 6px, display: flex, align-items: center, gap: 8px, flex-wrap: wrap |
| Status badge (Learning) | 9px caps semibold, padding: 3px 7px, border-radius: 4px, background: var(--color-learning-bg), color: var(--color-learning-text), letter-spacing: 0.3px |
| Status badge (Mastered) | Same layout, background: var(--color-mastered-bg), color: var(--color-mastered-text) |
| "Practiced X days ago" | 10px, color: var(--color-text-muted) |
| Play button | 36x36px circle, background: var(--color-bg), border-radius: 50%. CSS play triangle: 8px border-left solid dark, 6px top/bottom transparent, margin-left: 2px. |
| Expand chevron | 11px, color: var(--color-text-muted). "▾" character. |
| Right column | flex-direction: column, align-items: center, gap: 6px, flex-shrink: 0 |

### Phrase card (expanded)

When tapped, the card expands to show context + word-by-word breakdown + action buttons.

```
┌─────────────────────────────────────────┐
│  Hou² hou² aa³! Nei⁵ gwong² ...   [▶]  │
│  好好呀！你廣東話講得好好            ▴   │
│  Oh that's great! Your Cantonese...     │
│  LEARNING  · Practiced 2 days ago       │
│─────────────────────────────────────────│
│  Context: Encouraging someone who's     │
│  learning Cantonese                     │
│                                         │
│  ┌─────┐ ┌─────┐ ┌──────┐ ┌─────┐     │
│  │好好呀│ │ 你  │ │廣東話│ │講得 │     │
│  │hou2  │ │nei5 │ │gwong2│ │gong2│     │
│  │great!│ │you  │ │Canto │ │speak│     │
│  │ [+]  │ │ [✓] │ │ [+]  │ │ [+] │     │
│  └─────┘ └─────┘ └──────┘ └─────┘     │
│                                         │
│  ┌─── Repeat ───┐  ┌─ I know this! ──┐ │
└─────────────────────────────────────────┘
```

| Element | Spec |
|---------|------|
| Expanded section | margin-top: 14px, padding-top: 14px, border-top: 0.5px solid var(--color-border) |
| Context label | 11px italic, color: var(--color-text-muted), margin-bottom: 12px |
| Word cards container | display: flex, gap: 6px, flex-wrap: wrap, margin-bottom: 14px |
| Word card | background: var(--color-bg), border: 0.5px solid rgba(0,0,0,0.08), border-radius: 10px, padding: 10px 10px 8px, text-align: center, min-width: 58px |
| Word card (already saved) | border-color: var(--color-brand-green), background: #F5FAE8 |
| Word — Chinese | 18px medium, color: var(--color-text-primary), line-height: 1.3 |
| Word — Jyutping | 10px semibold, color: var(--color-jyutping), margin-top: 3px |
| Word — English | 10px, color: var(--color-text-secondary), margin-top: 2px |
| Word — Add button | 20x20px circle, border: 0.5px solid rgba(0,0,0,0.15), background: white, centered "+", 13px, color: var(--color-text-muted). Margin: 5px auto 0. |
| Word — Added button | Same size, background: var(--color-brand-lime), border-color: var(--color-brand-lime), color: var(--color-brand-dark), "✓", 11px semibold |
| Action buttons container | display: flex, gap: 6px |
| Repeat button | flex: 1, padding: 11px 8px, border-radius: 10px, 12px semibold, text-align: center. Background: var(--color-brand-dark), color: white. CSS play triangle before text. |
| "I know this!" button | flex: 1, same padding/radius/font. Background: var(--color-brand-lime), color: var(--color-brand-dark). |
| "I forgot this" button (on mastered phrases) | Same layout as "I know this!" but background: var(--color-learning-bg), color: var(--color-learning-text). Replaces "I know this!" |

**Expand/collapse animation:** Height transition, 250ms ease. Chevron rotates 180° on expand.

### Vocab card

```
┌─────────────────────────────────────────┐
│  廣東話                            [▶]  │
│  gwong2 dung1 waa2                      │
│  Cantonese                              │
│  ─────────────────────────────────────  │
│  你識講廣東話？ — Can you speak Canto?   │
│  LEARNING  · Practiced 2 days ago       │
└─────────────────────────────────────────┘
```

| Element | Spec |
|---------|------|
| Card | Same as phrase card: white, border, 14px border-radius, 16px padding, 8px margin-bottom |
| Chinese character | 24px medium, color: var(--color-text-primary), line-height: 1.2 |
| Jyutping | 13px semibold, color: var(--color-jyutping), margin-top: 4px |
| English | 13px, color: #3a3a3a, margin-top: 3px |
| Context sentence | 11px italic, color: var(--color-text-muted), margin-top: 8px, line-height: 1.4, padding-top: 8px, border-top: 0.5px solid var(--color-border) |
| Status row | Same as phrase card, margin-top: 8px |
| Play button | Same as phrase card, right side |

### Add phrase button (bottom of list)

```
┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐
│       (+)  Add a phrase                │
└ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘
```

| Element | Spec |
|---------|------|
| Card | margin: 10px 22px 0, background: white, border: 1.5px dashed rgba(0,0,0,0.12), border-radius: 14px, padding: 14px 16px, display: flex, align-items: center, justify-content: center, gap: 8px |
| Plus circle | 24x24px, border-radius: 50%, background: var(--color-brand-lime), font: 16px semibold dark, centered "+" |
| Label | 13px semibold, color: var(--color-text-secondary) |

---

## 16.4 MINI PLAYER

Persistent bar above the tab bar during any active session.

```
┌─────────────────────────────────────────┐
│  ┌────┐  Maai⁴ daan¹             ⏸    │
│  │ img│  埋單                           │
│  └────┘  The bill, please               │
│  1:24  ━━━━━━━░░░░░░░░░░░░░  4:12      │
│  ┌─────────────────────────────────┐    │
│  │ 🔁1 Repeat   SLOWER    3 of 12 │    │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

| Element | Spec |
|---------|------|
| Container | background: var(--color-brand-dark), border-radius: 18px, margin: 0 12px, overflow: hidden |
| Main row | padding: 12px 14px, display: flex, align-items: center, gap: 12px |
| Artwork | 50x50px, border-radius: 8px, topic imageGradient background |
| Text area | flex: 1, min-width: 0 (for text truncation) |
| Romanization | 14px semibold white, line-height: 1.2, truncate with ellipsis |
| Chinese | 13px, rgba(255,255,255,0.65), margin-top: 2px, truncate |
| English | 11px, rgba(255,255,255,0.45), margin-top: 2px, truncate |
| Play/Pause button | 34x34px circle, background: var(--color-brand-lime). Pause icon: two 2.5px wide, 13px tall bars, color: dark. Play icon: CSS triangle. |
| Progress row | padding: 0 14px, display: flex, align-items: center, gap: 6px |
| Time labels | 9px, rgba(255,255,255,0.4), font-weight: 500 |
| Progress bar track | flex: 1, height: 3px, background: rgba(255,255,255,0.15), border-radius: 2px |
| Progress bar fill | height: 100%, background: var(--color-brand-lime), width: percentage of elapsed time |
| Settings zone | margin: 8px 14px 12px, background: rgba(255,255,255,0.08), border-radius: 10px, padding: 8px 12px, display: flex, align-items: center, justify-content: space-between |
| Repeat icon | Custom loop icon with "1" inside. 16px wide. Active: color: var(--color-brand-lime). Inactive: rgba(255,255,255,0.6). |
| "Repeat" label | 10px, same color as icon, font-weight: 500 |
| Speed pill | 10px semibold, padding: 4px 8px, border-radius: 5px, background: var(--color-brand-lime-muted), color: var(--color-brand-lime). Text: "SLOWER" or "NATURAL". |
| Phrase counter | 10px, rgba(255,255,255,0.4), font-weight: 500. Format: "3 of 12" |

**Tap behavior:** Tapping the text/artwork area opens the NowPlayingScreen (full overlay). Tapping play/pause only toggles playback.

**Pronunciation score badge** (when scored): Small circle overlaid on artwork corner, 18px diameter. Green/yellow/red based on score. Shows score number in 8px bold white.

---

## 16.5 NOW PLAYING SCREEN (Full Player)

Full-screen overlay that slides up from the mini player.

```
┌─────────────────────────────────────────┐
│            ─── (drag to close)          │
│                                         │
│         ┌───────────────────┐           │
│         │                   │           │
│         │    Topic artwork  │           │  ← 280x280px, centered
│         │                   │           │
│         └───────────────────┘           │
│                                         │
│     Maai⁴ daan¹                         │  ← 28px semibold
│     埋單                                │  ← 20px
│     The bill, please                    │  ← 16px muted
│     Asking for the bill at a restaurant │  ← 13px italic muted
│                                         │
│         ◄◄     ⏸     ►►                │  ← Transport controls
│                                         │
│  1:24  ━━━━━━━░░░░░░░░░░░░░  4:12      │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │  PLAYBACK                       │    │
│  │  🔁 Repeat    Speed: [Slower|Nat]│    │  ← Boxed settings zone
│  │  Auto-next: [ON]                │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ┌── Save to Library ──┐ ┌─ I know! ─┐ │
│                                         │
│         Score: 92 ★★★★★               │  ← Pronunciation score
│                                         │
└─────────────────────────────────────────┘
```

| Element | Spec |
|---------|------|
| Background | var(--color-bg), full screen |
| Close handle | 40px wide, 4px tall, background: rgba(0,0,0,0.15), border-radius: 2px, centered, 12px from top |
| Artwork | 280x280px (or 70% of screen width, whichever is smaller), border-radius: 16px, centered |
| Romanization | 28px semibold, color: var(--color-brand-dark), text-align: center, margin-top: 32px |
| Chinese | 20px, color: var(--color-text-secondary), text-align: center, margin-top: 8px |
| English | 16px, color: var(--color-text-muted), text-align: center, margin-top: 6px |
| Context | 13px italic, color: var(--color-text-muted), text-align: center, margin-top: 4px |
| Transport controls | centered row, gap: 40px, margin-top: 32px |
| Previous/Next | 28x28px tap target (min 44px with padding), CSS double-triangle icons, color: var(--color-text-secondary) |
| Play/Pause | 56x56px circle, background: var(--color-brand-dark), icon: white, centered |
| Progress bar | Same style as mini player, full width with 22px side padding, margin-top: 20px |
| Playback settings box | margin: 24px 22px, background: rgba(0,0,0,0.04), border-radius: 14px, padding: 16px |
| "PLAYBACK" label | 10px caps, color: var(--color-text-muted), letter-spacing: 1px, margin-bottom: 12px |
| Repeat toggle | Row with icon + label. Tap toggles on/off. |
| Speed control | Segmented control: "Slower" / "Natural" |
| Auto-next toggle | Row with label + switch component |
| Action buttons | Same as phrase card expanded: "Save to Library" (dark) + "I know this!" (lime) |
| Score display | Centered below actions. Score number + star rating. Only visible after pronunciation is scored. |

**Gestures:**
- Swipe down → closes overlay (returns to mini player)
- Swipe left → next phrase
- Swipe right → previous phrase

---

## 16.6 PRACTICE SCREEN

```
┌─────────────────────────────────────────┐
│  Practice                               │
│  Train your ear and your mouth.         │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │  Quick Review                   │    │
│  │  8 phrases due for review       │    │  ← Hero card
│  │               [Start Review ▶]  │    │
│  └─────────────────────────────────┘    │
│                                         │
│  Practice modes                         │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──        │
│  │ 🎧   │ │ 💬   │ │ ⚡   │ │ 🎵       │  ← Horizontal scroll
│  │Shadow │ │Prompt│ │Speed │ │Tone      │
│  │ Mode  │ │ Mode │ │ Run  │ │ Gym      │
│  │       │ │      │ │      │ │          │
│  │Listen │ │Speak │ │Fast  │ │Train     │
│  │repeat │ │back  │ │recall│ │your ear  │
│  └──────┘ └──────┘ └──────┘ └──        │
│                                         │
│  Dialogue scenes                        │
│  ┌─────────────────────────────────┐    │
│  │  🍽️ At a restaurant             │    │
│  │  "Asking for the bill"          │    │  ← List of available scenes
│  │  6 turns · 3 min                │    │
│  └─────────────────────────────────┘    │
│  ┌─────────────────────────────────┐    │
│  │  🚕 Taxis and Uber             │    │
│  │  "Giving directions"            │    │
│  │  5 turns · 2 min                │    │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

### Quick review hero card

| Element | Spec |
|---------|------|
| Card | background: var(--color-brand-dark), border-radius: 16px, padding: 20px, margin: 0 22px |
| Title "Quick Review" | 18px semibold white |
| Count | 14px, rgba(255,255,255,0.7), margin-top: 4px |
| Button | align-self: flex-end. Background: var(--color-brand-lime), color: dark, 13px semibold, border-radius: 10px, padding: 10px 16px. |

**States:**
- Phrases due: card as designed
- Nothing due: card background changes to var(--color-mastered-bg), text: "All caught up! Nothing due for review." Button hidden.

### Practice mode cards

| Element | Spec |
|---------|------|
| Card | 120px wide, background: white, border: 0.5px solid var(--color-border), border-radius: 14px, padding: 16px, flex-shrink: 0 |
| Icon | 24px, CSS/SVG drawn (no emoji in final build). Centered. |
| Mode name | 14px semibold, text-align: center, margin-top: 10px |
| Description | 11px, color: var(--color-text-muted), text-align: center, margin-top: 4px, line-height: 1.3 |

**Modes (icons are CSS/SVG, descriptions below are for the card):**
1. **Shadow Mode** — icon: headphones. "Listen and repeat each phrase"
2. **Prompt Mode** — icon: speech bubble. "Hear English, speak Cantonese"
3. **Speed Run** — icon: lightning bolt. "Rapid-fire phrase recall"
4. **Tone Gym** — icon: waveform. "Train your ear for tones"

### Dialogue scene list items

| Element | Spec |
|---------|------|
| Card | background: white, border: 0.5px solid var(--color-border), border-radius: 14px, padding: 14px 16px, margin-bottom: 8px |
| Topic name | 14px semibold |
| Scene title | 13px, color: var(--color-text-secondary), margin-top: 2px, in quotes |
| Meta | 11px, color: var(--color-text-muted), margin-top: 4px. Format: "6 turns · 3 min" |

---

## 16.7 TOPIC DETAIL SCREEN

```
┌─────────────────────────────────────────┐
│  ← Back                                │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │                                 │    │
│  │      Topic artwork              │    │  ← 200px tall, full width
│  │                                 │    │
│  │  Ordering coffee           ☁️↓  │    │  ← Download indicator
│  │  35 phrases                     │    │
│  └─────────────────────────────────┘    │
│                                         │
│  Cha chaan teng, milk tea, iced drinks  │  ← Description
│                                         │
│  Progress: ━━━░░░░░░░ 3/35 mastered     │
│                                         │
│  ┌─────────── Start this topic ────────┐│  ← CTA button
│                                         │
│  Scenes                                │
│  ┌─────────────────────────────────┐    │
│  │  "Ordering milk tea"            │    │
│  │  6 turns                   [▶]  │    │
│  └─────────────────────────────────┘    │
│  ┌─────────────────────────────────┐    │
│  │  "Asking for the bill"          │    │
│  │  6 turns                   [▶]  │    │
│  └─────────────────────────────────┘    │
│                                         │
│  All phrases                            │
│  ┌─────────────────────────────────┐    │
│  │  Ngo⁵ seung² yiu³...  [+] [▶]  │    │  ← Phrase rows with
│  │  我想要一杯奶茶                 │    │     save + play buttons
│  │  I'd like a milk tea            │    │
│  └─────────────────────────────────┘    │
│  ... (more phrases)                     │
└─────────────────────────────────────────┘
```

| Element | Spec |
|---------|------|
| Back button | top-left, "← Back", 14px semibold, 44px tap target |
| Artwork | height: 200px, full width, border-radius: 0 0 22px 22px, gradient overlay at bottom |
| Topic name | 22px semibold white, overlaid on artwork bottom |
| Phrase count | 13px white, opacity: 0.8, below topic name |
| Download button | 32x32px, top-right of artwork, 12px inset, circle with cloud-download icon or checkmark if downloaded |
| Description | 14px, color: var(--color-text-secondary), padding: 16px 22px, line-height: 1.5 |
| Progress row | padding: 0 22px, display: flex, align-items: center, gap: 8px |
| Progress bar | Same style as topic card progress bar, but taller (5px) |
| Start button | margin: 16px 22px, full width, background: var(--color-brand-lime), border-radius: 14px, padding: 16px, 16px semibold, text-align: center. Play triangle icon. |
| Section headers ("Scenes", "All phrases") | 16px semibold, padding: 24px 22px 12px |
| Scene cards | Same as practice screen scene list |
| Phrase rows | Simplified phrase cards: romanization + Chinese + English on left, [+] save button and [▶] play button on right. Saved phrases show filled green circle instead of +. |

---

## 16.8 SETTINGS SCREEN

```
┌─────────────────────────────────────────┐
│  Settings                               │
│                                         │
│  PRACTICE                               │
│  Daily goal          [20 min     ▾]     │
│  Default speed       [Natural    ▾]     │
│  Auto-advance          [────●]          │
│                                         │
│  DISPLAY                                │
│  Show characters       [────●]          │
│  Show English          [────●]          │
│                                         │
│  NOTIFICATIONS                          │
│  Daily reminder        [────●]          │
│  Reminder time       [08:00      ▾]     │
│                                         │
│  LANGUAGE                               │
│  Current language    [Cantonese  ▾]     │
│                                         │
│  STORAGE                                │
│  Audio cache              42 MB         │
│  [Download All Audio] [Clear Cache]     │
│                                         │
│  ACCOUNT                                │
│  Name                Faith Lantz        │
│  Email               faith@lantz.co     │
│  [Sign out]                             │
│                                         │
│  About ShadowSpeak · Privacy Policy     │
│  Version 1.0.0                          │
└─────────────────────────────────────────┘
```

| Element | Spec |
|---------|------|
| Section headers | 11px caps, color: var(--color-text-muted), letter-spacing: 1.2px, padding: 24px 22px 8px |
| Setting rows | padding: 12px 22px, display: flex, justify-content: space-between, align-items: center. Label: 15px normal. Control: right-aligned. |
| Dividers | 0.5px solid var(--color-border), margin: 0 22px |
| Toggle switch | 48x28px, border-radius: 14px. Off: background: #E0E0E0. On: background: var(--color-brand-lime). Knob: 24x24px white circle with shadow. |
| Dropdown | 13px, color: var(--color-text-secondary), background: var(--color-bg), border: 0.5px solid var(--color-border), border-radius: 8px, padding: 8px 12px |

---

## 16.9 STATS / PROGRESS SCREEN

```
┌─────────────────────────────────────────┐
│  Your Progress                          │
│                                         │
│  ┌──────┐  ┌──────┐  ┌──────┐          │
│  │  42  │  │  18  │  │ 4.2  │          │  ← Stat tiles
│  │learnd│  │mastrd│  │hrs   │          │
│  └──────┘  └──────┘  └──────┘          │
│                                         │
│  This week     ━━━━━░░ 2h 10m / 3h 30m │
│                                         │
│  Streak calendar                        │
│  ┌─────────────────────────────────┐    │
│  │ Mo Tu We Th Fr Sa Su            │    │
│  │ ▪️ ▪️ ▪️ ░ ▪️ ▪️ ░             │    │  ← GitHub-style heatmap
│  │ ▪️ ▪️ ░ ▪️ ▪️ ▪️ ▪️             │    │
│  │ ...                             │    │
│  └─────────────────────────────────┘    │
│                                         │
│  Score trend (last 30 days)             │
│  ┌─────────────────────────────────┐    │
│  │     ╱‾‾╲    ╱‾‾‾╱              │    │  ← Line chart
│  │  ╱‾╱    ╲╱‾╱                   │    │
│  │ ╱                               │    │
│  └─────────────────────────────────┘    │
│                                         │
│  Milestones                             │
│  ✅ First 10 phrases                    │
│  ✅ 7-day streak                        │
│  🔲 First mastered topic                │
│  🔲 50 phrases learned                  │
│  🔲 First AI conversation              │
└─────────────────────────────────────────┘
```

| Element | Spec |
|---------|------|
| Stat tiles | 3 equal-width cards, gap: 10px, background: white, border-radius: 14px, padding: 16px, text-align: center. Number: 28px semibold. Label: 11px, color: var(--color-text-muted). |
| Weekly progress | background: white, border-radius: 14px, padding: 14px 16px. Label: 14px semibold. Bar: 6px tall, same as queue meter. |
| Streak calendar | Grid of 7 columns. Each cell: 12x12px, border-radius: 2px. No practice: var(--color-bg). Practiced: var(--color-brand-lime). Today: border: 1px solid var(--color-brand-dark). Shows last 12 weeks. |
| Score trend | Simple line chart. Line: 2px, color: var(--color-brand-green). Fill below: var(--color-brand-lime) at 10% opacity. Height: 120px. CSS/SVG drawn, no charting library. |
| Milestones | List items, 14px. Completed: green checkmark. Incomplete: empty square, color: var(--color-text-muted). |

---

## 16.10 ONBOARDING SCREEN

Single screen. No multi-step flow.

```
┌─────────────────────────────────────────┐
│                                         │
│                                         │
│         Shadow Speak                    │
│         ─────────────                   │
│                                         │
│      ShadowSpeak works like             │
│      a podcast for Cantonese.           │
│                                         │
│      Press play.                        │
│      Repeat what you hear.              │
│      That's your lesson.                │
│                                         │
│                                         │
│      Language                           │
│      ┌─────────────────────────┐        │
│      │  ◉ Cantonese  廣東話     │        │
│      │  ○ Mandarin   普通話     │        │
│      └─────────────────────────┘        │
│                                         │
│  ┌──────── Start your first lesson ───┐ │
│                                         │
└─────────────────────────────────────────┘
```

| Element | Spec |
|---------|------|
| Background | var(--color-bg), full screen |
| Wordmark | Centered, same style as top bar but larger (24px) |
| Body text | 18px, color: var(--color-text-secondary), text-align: center, line-height: 1.6, max-width: 280px, centered |
| Key phrases ("Press play.", "Repeat what you hear.") | 18px semibold, color: var(--color-text-primary) |
| Language selector | background: white, border: 0.5px solid var(--color-border), border-radius: 14px, padding: 4px. Each option: padding: 14px 16px, border-radius: 10px. Selected: background: var(--color-brand-lime-muted), border: 1px solid var(--color-brand-lime). |
| Start button | Full width (with 40px side margins), background: var(--color-brand-lime), border-radius: 14px, padding: 18px, 16px semibold, color: dark |

---

## 16.11 DIALOGUE SCENE SCREEN

Chat-bubble layout during dialogue practice.

```
┌─────────────────────────────────────────┐
│  ← Back     "Ordering milk tea"         │
│              2 of 6 turns               │
│─────────────────────────────────────────│
│                                         │
│  ┌───────────────────┐                  │
│  │ Staff:            │                  │  ← Left-aligned bubble
│  │ Jam² me¹?         │                  │     (other speaker)
│  │ 飲咩？            │                  │
│  │ What to drink?    │                  │
│  └───────────────────┘                  │
│                     ┌───────────────┐   │
│                     │ You:          │   │  ← Right-aligned bubble
│                     │ Dung³ naai⁵...│   │     (user)
│                     │ 凍奶茶，少甜  │   │
│                     │ Iced milk tea │   │
│                     │       92 ★    │   │  ← Score
│                     └───────────────┘   │
│                                         │
│  ┌───────────────────┐                  │
│  │ Staff:            │                  │
│  │ Jiu³ m⁴ jiu³...  │   🔊            │  ← Currently playing
│  │ 要唔要食嘢？      │                  │
│  │ Want anything?    │                  │
│  └───────────────────┘                  │
│                                         │
│              ┌────────────────────┐      │
│              │  🎤 Your turn...   │      │  ← Recording prompt
│              │  Tap when ready    │      │
│              └────────────────────┘      │
│                                         │
└─────────────────────────────────────────┘
```

| Element | Spec |
|---------|------|
| Other speaker bubble | background: white, border: 0.5px solid var(--color-border), border-radius: 14px 14px 14px 4px, padding: 12px 14px, max-width: 75%, align-self: flex-start |
| User bubble | background: var(--color-brand-lime-muted), border: 1px solid rgba(197,232,90,0.3), border-radius: 14px 14px 4px 14px, padding: 12px 14px, max-width: 75%, align-self: flex-end |
| Speaker label | 10px semibold, color: var(--color-text-muted), margin-bottom: 4px |
| Romanization in bubble | 14px semibold, color: var(--color-brand-dark) |
| Chinese in bubble | 12px, color: var(--color-text-secondary), margin-top: 2px |
| English in bubble | 11px, color: var(--color-text-muted), margin-top: 2px |
| Score in bubble | right-aligned, 11px semibold, color based on score level |
| Currently playing indicator | Small speaker icon, pulsing animation, right of bubble |
| Recording prompt | centered, background: var(--color-brand-dark), color: white, border-radius: 14px, padding: 14px 24px. Mic icon: 18px. Pulsing red dot when recording. |
| Bubble gap | 12px between bubbles |
| Scroll | auto-scroll to latest bubble, smooth behavior |

---

## 16.12 AI CONVERSATION SCREEN

```
┌─────────────────────────────────────────┐
│  ← Back       AI Practice       Online  │
│─────────────────────────────────────────│
│                                         │
│  Scenario: Ordering at a cha chaan teng │
│                                         │
│  (Same chat bubble layout as dialogue   │
│   scene, but with real-time messages)   │
│                                         │
│  ... bubbles ...                        │
│                                         │
│─────────────────────────────────────────│
│  ┌─────────────────────────────────┐    │
│  │  🎤  Hold to speak...           │    │  ← Bottom input bar
│  └─────────────────────────────────┘    │
│  or type in Cantonese                   │
└─────────────────────────────────────────┘
```

Same bubble styles as dialogue scene. Additional elements:

| Element | Spec |
|---------|------|
| "Online" indicator | 8px green dot + "Online" in 11px, top-right |
| Scenario bar | background: rgba(0,0,0,0.03), padding: 10px 22px, 12px, color: var(--color-text-secondary) |
| Input bar | Fixed bottom. background: white, border-top: 0.5px solid var(--color-border), padding: 12px 22px |
| Hold-to-speak button | Full width, background: var(--color-brand-dark), color: white, border-radius: 14px, padding: 16px. Mic icon. Active state: background: var(--color-score-poor), pulsing. |
| Text input fallback | 12px link below button, "or type in Cantonese", color: var(--color-text-muted) |
| AI thinking indicator | Three-dot bounce animation in a left-aligned bubble |
| Offline state | Full screen overlay: "AI conversation requires internet. Try Shadow Mode for offline practice." with button to Shadow Mode. |

---

## 16.13 EMPTY STATES

Every screen that can be empty must have a designed empty state.

### Library (empty)

```
┌─────────────────────────────────────────┐
│                                         │
│             📚                          │
│                                         │
│     Your library is empty               │
│                                         │
│     Browse topics on the Home tab       │
│     and save phrases you want to        │
│     learn. Your daily lesson is built   │
│     from this library.                  │
│                                         │
│        [Browse topics →]                │
│                                         │
└─────────────────────────────────────────┘
```

(📚 is a CSS/SVG illustration, not an emoji)

### Practice (no phrases due)

```
All caught up! Nothing due for review.
Check back tomorrow, or browse new topics.
```

### Search (no results)

```
No results for "xyz"
Try different keywords or browse topics.
```

### Topic detail (no progress)

Progress bar shows 0/N, text: "You haven't practiced any phrases in this topic yet."

---

## 16.14 LOADING STATES

| Situation | Visual |
|-----------|--------|
| Lesson building | Hero card button → "Preparing lesson..." with small spinner replacing play icon |
| Audio generating | Phrase play button → spinner replacing play triangle, same size |
| Pronunciation scoring | Score badge area → pulsing placeholder circle with "..." |
| Topic audio downloading | Progress ring on topic card image |
| API call in progress | Subtle top-of-screen loading bar (2px tall, var(--color-brand-lime), indeterminate animation) |
| Initial content download | Full screen: "Setting up ShadowSpeak..." with progress bar and "Downloading phrases... 42/395" |

**Spinner spec:** 16px diameter, 2px stroke, color: var(--color-brand-lime) on dark backgrounds or var(--color-brand-dark) on light backgrounds. CSS animation: rotate 360° in 800ms linear infinite.

---

## 16.15 ERROR STATES

| Situation | Visual |
|-----------|--------|
| Audio playback failed | Toast: "Couldn't play audio. Try again." with retry button |
| Mic permission denied | Inline message below recording button: "Enable microphone in Settings to score pronunciation" |
| API error | Toast: "Something went wrong. Try again." |
| Offline + needs network | Inline banner at top of relevant screen: "You're offline. Some features need internet." Dark background, white text, 12px. |
| Storage full | Modal: "Storage full. Clear some cached audio in Settings to continue." |

**Toast spec:** Bottom of screen, 60px above tab bar. background: var(--color-brand-dark), color: white, border-radius: 12px, padding: 14px 18px, font: 13px medium. Auto-dismiss after 4 seconds. Slide-up entrance, fade-out exit.

---

## 16.16 ANIMATIONS AND TRANSITIONS

| Animation | Spec |
|-----------|------|
| Screen transitions | Slide from right (forward), slide from left (back). 250ms ease-out. |
| Tab switching | No animation. Instant. |
| Card expand/collapse | Height transition, 250ms ease. Chevron rotates 180°. |
| Now Playing open | Slide up from bottom, 300ms ease-out. Background dims to rgba(0,0,0,0.3). |
| Now Playing close | Slide down, 250ms ease-in. |
| Score reveal | Scale from 0 → 1.2 → 1.0 (pop effect), 400ms cubic-bezier(0.34, 1.56, 0.64, 1). |
| Toast entrance | Slide up 20px + fade in, 200ms ease-out. |
| Toast exit | Fade out, 150ms ease-in. |
| Streak flame pulse | scale(1) → scale(1.15) → scale(1), 2s ease-in-out infinite (only for 7+ day streaks). |
| Save-to-library | "+" icon morphs to "✓" with scale pop (1 → 1.3 → 1), 300ms. |
| Progress bar fill | Width transition, 500ms ease-out. |
| Recording pulse | Red dot: opacity 1 → 0.3, 1s ease-in-out infinite alternate. |
| Spinner | Rotate 360°, 800ms linear infinite. |

**Reduced motion:** When `prefers-reduced-motion: reduce` is active, all animations become instant (duration: 0ms). Transitions still work but without animation.

---

## 16.17 GESTURE BEHAVIORS

| Gesture | Location | Action |
|---------|----------|--------|
| Tap | Topic card image | Navigate to topic detail |
| Tap | Topic card play button | Start shadow session with this topic |
| Tap | Phrase card body | Expand/collapse |
| Tap | Phrase play button | Play audio (does not expand card) |
| Tap | Mini player body | Open Now Playing screen |
| Tap | Mini player play/pause | Toggle playback only |
| Swipe down | Now Playing screen | Close to mini player |
| Swipe left | Now Playing screen | Next phrase |
| Swipe right | Now Playing screen | Previous phrase |
| Long press | Phrase card | (future: drag to reorder in library) |
| Pull down | Any scrollable list | Refresh content (if online) |
| Tap active tab | Tab bar | Scroll content to top |

---

## 16.18 LANDING PAGE

Separate from the app. Single-page static site at shadowspeak.app. Converts visitors into downloads/signups.

**Design direction:** Warm, confident, grounded. Premium podcast app meets language school. NOT startup-shouty. NOT gamified.

**Typography:** DM Serif Display (headlines) + DM Sans (body). Import from Google Fonts.

**Full working code reference:** `shadowspeak-pages.html` contains the complete implementation with all CSS, HTML, and navigation logic.

### Sections (top to bottom)

**1. Fixed nav bar (64px)**
- Logo (left) + nav links (How it works, Pricing, Log in) + CTA button "Get the app" (right)
- Background: var(--ss-bg) at 85% opacity + backdrop-blur(20px)
- Adds subtle box-shadow on scroll
- Mobile: links collapse to hamburger

**2. Hero (full viewport)**
- Desktop: two columns (55% text, 45% phone mockup)
- Headline: DM Serif Display, 52px. "Learn to speak Cantonese. Not read it. Not write it. *Speak it.*" (italic+green on "Speak it")
- Subhead: 18px DM Sans, secondary color, max-width 460px
- Two CTAs: "Start learning free" (lime primary) + "See how it works" (outline)
- Trust line: "No credit card needed. Works offline after first sync."
- Phone mockup: CSS-drawn phone frame (dark border, notch, rounded corners), rotated 2 degrees, showing actual home screen with mini player. Hover: straightens + slight scale up.
- "Built by expats in Hong Kong" badge above headline (orange pill)

**3. How it works (3 cards)**
- Background: var(--ss-bg-deep) full-bleed
- Three step cards: white, 22px radius, hover lifts with shadow
- Each card: large DM Serif number (lime), title, description, optional Cantonese example phrase
- Example phrase block: background var(--ss-bg), rounded, shows romanization (green) + Chinese + English

**4. "Why not Duolingo?" (dark card)**
- Full-width dark card (brand-dark background, white text)
- Headline: DM Serif Display, 32px
- Body text: addresses the gap directly. Bold lime text for key phrases.

**5. Pricing (2 cards)**
- Free tier: $0, basics category, shadow mode, offline, streaks
- Pro tier: $79/year, featured card with lime border + glow shadow + "Best value" badge
- Both cards have checkmark feature lists and CTA buttons

**6. Footer**
- 4 columns: brand + tagline, Product links, Company links, Legal links
- Bottom bar: copyright + "Made in Hong Kong"

---

## 16.19 AUTH PAGES (Register, Login, Forgot Password)

All auth pages share the same layout:

### Layout (desktop)
```
┌──────────────────────┬──────────────────────┐
│                      │                      │
│    Auth card          │   Decorative panel   │
│    (form content)    │   (Cantonese phrase   │
│                      │    + quote)           │
│                      │                      │
└──────────────────────┴──────────────────────┘
     55% width               45% width
```

- **Left panel:** white background, centered auth card (max-width 420px), white card with 22px radius + raised shadow, 48px/32px padding
- **Right panel:** var(--ss-dark) background, decorative dot pattern overlay at 6% opacity, centered content showing a large Cantonese phrase (DM Serif Display, 42px, lime), Jyutping below, English below that, divider bar (40px lime), motivational quote in italic
- **Mobile:** right panel hidden, left panel fills screen

### Shared elements across auth pages

| Element | Spec |
|---------|------|
| Logo | DM Sans wordmark at top of card, clickable (returns to landing) |
| Title | DM Serif Display, 28px, dark |
| Subtitle | 14px, tertiary color, max 2 lines |
| Social buttons | Full-width, white background, 1.5px border, Google + Apple SVG icons, hover darkens border |
| Divider | "or with email" centered between two lines |
| Input fields | 15px, var(--ss-bg) background, 1.5px border, 12px radius. Focus: lime border + lime glow ring (3px). Error: red border + error text below. |
| Password toggle | "show/hide" text button, right-aligned inside input |
| Primary CTA | Full-width lime button |
| Footer text | "Already have an account? Log in" / "New to ShadowSpeak? Create account" |

### Register page specifics
- Fields: Full name, Email, Password
- Terms checkbox (custom styled, lime when checked with dark checkmark)
- Right panel phrase: 你好 (nei5 hou2) "hello"

### Login page specifics
- Fields: Email, Password
- "Forgot password?" link below password field, right-aligned
- Right panel phrase: 加油 (gaa1 jau2) "keep going"

### Forgot password page specifics
- Single field: Email
- On submit: card content transitions to success state (green checkmark circle, "Check your inbox" message, "Back to login" button)
- Right panel phrase: 冇問題 (mou5 man4 tai4) "no problem"

---

## 16.20 WELCOME / POST-REGISTRATION

Final screen before entering the main app. Shown once after registration or first login.

### Layout
Centered single card (no right panel). Max-width 520px.

### Card content
- Large centered play button circle (72px, lime, with dark play triangle)
- Headline: DM Serif Display, "You're all set"
- Body text: "ShadowSpeak works like a podcast. Press play. Repeat what you hear. That's your lesson."
- Three stat tiles in a row: "5 phrases ready" / "10 min first lesson" / "0 day streak"
- Primary CTA: "Start your first lesson" (large, 16px, 18px padding)
- Subtext: "or explore topics first"

---

## 16.21 PAGE FLOW / NAVIGATION LOGIC

```
Landing page
  ├── "Start free" / "Get the app" → Register (or App Store)
  ├── "Sign in" → Login
  │
Register
  ├── Submit → Welcome screen → Main App (Home)
  ├── "Already have an account?" → Login
  ├── Logo → Landing
  │
Login
  ├── Submit → Main App (Home screen)
  ├── "Forgot password?" → Forgot Password
  ├── "Don't have an account?" → Register
  ├── Logo → Landing
  │
Forgot Password
  ├── Submit → Success state (same page, card transitions)
  ├── "Back to sign in" → Login
  ├── Logo → Landing
  │
Welcome (shown once, after first registration)
  ├── "Start your first lesson" → Main App (Home, first lesson auto-starts)
  ├── "or explore topics first" → Main App (Home)
  │
Main App
  ├── Home / Library / Practice tabs
  ├── Settings → Account management, display prefs, storage
  ├── Sign out → Login
```

### Authentication state rules

```
1. NO AUTH REQUIRED to use the app locally (offline-first).
   Auth is for: syncing across devices, unlocking AI features, accessing Pro content.

2. Free tier users can use the app WITHOUT creating an account.
   They skip straight from landing page to onboarding to app.
   "Create account" is prompted when they try a Pro feature.

3. The cantonese.ai API key is managed SERVER-SIDE via a proxy.
   Users NEVER see, handle, or configure an API key.
   All API calls from the app go to YOUR backend proxy
   (e.g., Cloudflare Worker at api.shadowspeak.app)
   which injects the cantonese.ai key before forwarding.
   This means:
   - No API key screen in the app
   - No API key field in Settings
   - No key stored on the user's device
   - You control costs and rate limiting centrally

4. Session persistence: auth token stored in IndexedDB.
   App checks token on load. If valid → main app. If expired → login.
   If no token and no local data → landing page.
   If no token but local data exists → main app (offline mode).
```

---

*End of UX/UI Design Brief.*
