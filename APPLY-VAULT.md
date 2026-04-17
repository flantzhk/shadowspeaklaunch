# Apply Vault Changes — Instructions for Claude Code

When Faith says **"apply vault changes"**, **"I updated the vault"**, **"the brand guidelines changed"**, or **"implement what's in the vault"** — follow these instructions exactly.

The vault is the source of truth for all design, brand, and product decisions. This file tells you how to translate vault changes into code.

---

## Step 1 — Read the relevant vault files first

Always read these to understand what changed:

1. `/Users/faithkayiwa/Documents/Faith Second Brain 2026/03 Projects/ShadowSpeakLaunch/01 Design/(C) Brand Voice Guidelines.md`
2. `/Users/faithkayiwa/Documents/Faith Second Brain 2026/03 Projects/ShadowSpeakLaunch/01 Design/(C) UX UI Design Brief.md`
3. `/Users/faithkayiwa/Documents/Faith Second Brain 2026/03 Projects/ShadowSpeakLaunch/01 Design/(C) Screens & Layout.md`
4. `/Users/faithkayiwa/Documents/Faith Second Brain 2026/03 Projects/ShadowSpeakLaunch/02 Development/(C) Active Backlog.md`

If Faith says which file she updated, read that one first and skip the others unless relevant.

---

## Step 2 — Make the right changes based on what changed in the vault

### If brand voice or copy changed
→ Source: `(C) Brand Voice Guidelines.md`
→ Action: Audit user-facing strings across the codebase. Check:
  - Onboarding screen copy (`src/components/screens/onboarding/`)
  - CTA labels — ensure they follow the first-person pattern ("This is exactly it", not "Get started")
  - Error states and low-score messages — must be specific and honest, never "Great effort!"
  - Any hardcoded strings that contradict the updated voice attributes or words-to-avoid list
→ Do not change copy that already conforms. Only fix what conflicts with the updated guidelines.

### If a screen layout or component spec changed
→ Source: `(C) UX UI Design Brief.md` or `(C) Practice Modes Design.md`
→ Action: Read the updated spec section, identify the affected component(s) in `src/components/`, implement the change.
→ Check: spacing, touch targets (44px min / 56px for primary), color tokens from `variables.css`, font sizes.
→ Always use existing CSS variables — never hardcode values that are already in the design system.

### If design tokens changed (colors, fonts, spacing)
→ Source: `(C) Brand Voice Guidelines.md` → Section 10 (Design Voice)
→ Action: Update `src/styles/variables.css` to match. Then audit components for any hardcoded values that should now use the updated token.
→ After updating tokens, do a visual check: confirm the key surfaces (dark header, lime accents, cream background) still read correctly.

### If a new backlog item was added in the vault
→ Source: `(C) Active Backlog.md`
→ Action: Read the new item, understand the scope, ask Faith if she wants to build it now or just acknowledge it.
→ Do not start building without confirmation.

### If persona or audience targeting changed
→ Source: `(C) Brand Voice Guidelines.md` → Section 9 (Audience Personas)
→ Action: Review onboarding flow questions and pain-point screens. The onboarding must surface the right pain for the primary persona. Flag any screens that feel misaligned with the updated targeting.

---

## Step 3 — Confirm what was implemented

After making changes, tell Faith:
- Which vault file drove the change
- Which code files were updated
- What specifically changed (before → after for any copy changes)
- Anything ambiguous that you left unchanged and why

---

## Rules

- **Vault wins.** If the code and the vault conflict, the vault is right. Update the code.
- **Don't invent.** If the vault doesn't specify something, don't guess. Ask.
- **Copy changes need context.** Before changing any user-facing string, read the full Brand Voice Guidelines — not just the section Faith mentioned. Copy decisions are rarely isolated.
- **Design token changes are high impact.** If updating `variables.css`, do a full component audit before committing — one token touches many surfaces.
- **Never break existing conforming copy.** If a string already matches the brand voice, leave it alone even if it's not in the guidelines document verbatim.
