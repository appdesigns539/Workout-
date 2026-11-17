# Workout Plan Generator

A clean, minimal website that builds a weekly workout plan from your choices and lets you log every session.

## Features

- **Step-by-step builder:** goal, experience, days per week, split, session length, equipment and muscle focus.
- **Smart splits:** Full Body, Upper/Lower, Push/Pull/Legs, PPL + Upper/Lower, or Body Part. The options and the recommended split change with your days per week.
- **Sets, reps and rest by goal:** strength, muscle building, general fitness, fat loss or endurance, adjusted for your experience level.
- **Warm-up and cool-down** for every day, matched to upper-body, lower-body or full-body sessions.
- **Swap (⇄) or remove (×)** any exercise; regenerate for fresh picks; save copies of plans you like.
- **Workout log:** weight and reps per set, a "last time" reference, notes, and lb/kg units.
- **History** of every finished session with volume, plus export and import for backups.
- **Print-friendly** plan layout.

Everything runs in the browser, with no accounts or servers. Your data is stored in your browser's local storage, so use **History → Export data** now and then as a backup.

## Files

| File | What it does |
| --- | --- |
| `index.html` | Page shell and navigation |
| `styles.css` | All styling, including mobile and print |
| `data.js` | Exercise library (~110 exercises), splits, day templates and rep schemes |
| `app.js` | Plan generator, builder, plan view, log and history |

## Run it locally

Open `index.html` in any browser. No build step is needed.

## Publish with GitHub Pages

1. Push these files to the root of the `workout` repository.
2. In the repo, go to **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, select `main` and `/ (root)`, then save.
4. After a minute the site is live at `https://appdesigns539.github.io/workout/`.

## Customizing

- **Add an exercise:** add an `X(...)` line in `data.js` with an id, a name, the slots it can fill (e.g. `['hpull']`), the equipment it needs, a level (1–3), whether it's compound, and a form cue.
- **Change rep schemes:** edit `RX` in `data.js`.
- **Change a day's structure:** edit its `slots` in `DAYS`. Slots are listed in priority order, so shorter sessions use the first few.
