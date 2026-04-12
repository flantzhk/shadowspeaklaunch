# Vault Sync — Instructions for Claude Code

When Faith says "sync the vault" or "update Obsidian", follow these instructions exactly.

---

## Step 1 — Read the current vault files first

Before writing anything, read all four files so you don't overwrite or duplicate:

1. `/Users/faithkayiwa/Documents/Faith Second Brain 2026/03 Projects/Language App/CLAUDE.md`
2. `/Users/faithkayiwa/Documents/Faith Second Brain 2026/03 Projects/Language App/02 Development/(C) Active Backlog.md`
3. `/Users/faithkayiwa/Documents/Faith Second Brain 2026/03 Projects/Language App/02 Development/(C) Architecture Reference.md`
4. `/Users/faithkayiwa/Documents/Faith Second Brain 2026/03 Projects/Language App/04 Released/(C) ShadowSpeak v[CURRENT VERSION] — Released Features.md`

---

## Step 2 — Make the right updates based on what happened this session

### If a bug was fixed
→ File: `(C) Active Backlog.md`
→ Find the bug in the `🔴 Known Bugs` table. Change the row to strike-through and add `✅ Fixed [date]` in the Severity column. Example:
  - Before: `| 1 | **Version mismatch** — ... | Low |`
  - After: `| 1 | ~~**Version mismatch** — ...~~ | ✅ Fixed 2026-04-12 |`

### If a backlog item was completed
→ File: `(C) Active Backlog.md`
→ Find the `- [ ]` checkbox item. Change it to `- [x]` and add `*(done [date])*` after the description. Do not delete the item — keep the history.

### If a feature shipped (new user-facing functionality)
→ File: `(C) ShadowSpeak v[VERSION] — Released Features.md`
→ Add the feature under the correct section (Learning & Practice Modes, Auth, Gamification, etc.), or create a new section if needed.
→ Also add a row to the Version History table at the top if the version number changed.
→ If this is a new major/minor version, create a new file: `04 Released/(C) ShadowSpeak v[NEW VERSION] — Released Features.md` and add the version to the history table.

### If the version number changed
→ File: `Language App/CLAUDE.md`
→ Update the `**Version:**` line in the Current Status block.
→ Also update the wikilink at the bottom: `→ See [[04 Released/(C) ShadowSpeak v[NEW VERSION] — Released Features]]`

### If the tech stack, folder structure, or infrastructure changed
→ File: `(C) Architecture Reference.md`
→ Update the relevant table or section. Add a note with the date if it's a significant change.

### If the overall project status changed (e.g. App Store went live, Android started)
→ File: `Language App/CLAUDE.md`
→ Update the `**Status:**` and `**What's live:**` lines in Current Status.
→ Also update `**Three biggest gaps:**` if the priorities shifted.

---

## Step 3 — Confirm what was updated

After writing, tell Faith:
- Which files were updated
- What specifically changed in each one
- Anything you weren't sure about and left unchanged (so she can decide)

---

## Rules

- Never delete content — only add, check off, or strike through
- Always include the date when marking something done (format: YYYY-MM-DD)
- If you're unsure whether something counts as a "shipped feature" vs a bug fix, ask before writing
- Never update `(C) Architecture Reference.md` for minor implementation details — only structural changes (new service, new dependency, new infra)
- The vault is the source of truth for what's done. The backlog and released features must always reflect reality, not aspirations.
