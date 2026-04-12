# ShadowSpeak — Data Files Handoff

## Files I'm providing

I'm giving you 7 JSON files. Here is exactly what to do with each one.

---

## Step 1 — Restructure the existing topic files

The current `src/data/topics/cantonese/` folder has individual topic files (one object per file). The new structure needs **one file per category, each containing an array of topics**.

Delete or replace the existing individual topic files. The new files replace all of them.

---

## Step 2 — Place these files

Put all 7 files into `src/data/topics/cantonese/`:

### `the-very-basics.json`
Array of 4 topics: Daily Basics, Numbers and Counting, Quick Questions, Yes No Maybe.
→ Use the file I'm providing as-is.

### `food-and-drink.json`
Array of **5 topics**: Ordering Coffee, At a Restaurant, Wet Market, Dim Sum, **plus At a Coffee Shop**.

The `at-a-coffee-shop.json` I'm providing is a **single object** (not an array). Before saving `food-and-drink.json`, add the coffee shop object as the 5th element inside the food-and-drink array. The final file should look like:

```json
[
  { "id": "ordering-coffee", ... },
  { "id": "at-a-restaurant", ... },
  { "id": "wet-market", ... },
  { "id": "dim-sum", ... },
  { "id": "at-a-coffee-shop", ... }
]
```

### `getting-around.json`
Array of 4 topics: Taxis and Uber, MTR and Buses, Shopping, Asking for Directions.
→ Use the file I'm providing as-is.

### `social-life.json`
Array of 4 topics: Meeting Someone New, School Gate Chat, Celebrations, Small Talk.
→ Use the file I'm providing as-is.

### `home-and-family.json`
Array of 4 topics: Managing Home, Talking to Kids, Doctor and Pharmacy, Groceries.
→ Use the file I'm providing as-is.

### `everyday-essentials.json`
Array of 3 topics: Building Lobby, Convenience Store, Making Reservations.
→ Use the file I'm providing as-is.

---

## Step 3 — Fix languageManager.js

In `src/services/languageManager.js`, find the `getTopicsForLanguage` function.

Change this line:
```js
return Object.values(modules).map(mod => mod.default || mod);
```

To:
```js
return Object.values(modules).flatMap(mod => mod.default || mod);
```

Each file is now an array of topics. Without this change nothing will load.

---

## Step 4 — Update cantonese.json

In `src/data/languages/cantonese.json`, update the categories array to:

```json
"categories": [
  "the-very-basics",
  "food-and-drink",
  "getting-around",
  "social-life",
  "home-and-family",
  "everyday-essentials"
]
```

---

## Step 5 — Verify it works

After deploying:
1. Log in to the app
2. Home screen should show 6 category rows with all topics visible
3. Tap any topic — phrases should appear inside
4. Tap "Start lesson" — a Shadow Session should load with real Cantonese phrases
5. Check browser console — there should be no 404 errors for JSON files

If topics appear but phrases don't load, double-check the `flatMap` change in Step 3.

---

## Do not

- Do not create placeholder or empty arrays for any category — all files are provided
- Do not modify any phrase content — the Cantonese has been carefully written
- Do not change the file naming — the category IDs in `cantonese.json` must match the filenames exactly
