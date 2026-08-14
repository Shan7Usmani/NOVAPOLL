# NOVAPOLL — Live Poll Creator + Animated Results

A poll creator that lets you ask a question, add **3–4 answer options**, cast a vote and watch results stream in as a **living neon bar chart** — live counts, percentages and vote momentum in real time.

Built for the **Vicodathon Live Steer Challenge** (Top 8 Final). Stack: **React 19 + Vite** with a hand-rolled **Alienware / neon-glass** design system.

## Features

- **Create polls** — question + 3–4 options, live character counts, uniqueness + length validation
- **Cast / change votes** — one tap to vote, tap another option to change it
- **Live animated results** — glassmorphic option cards with smooth neon progress bars, animated percentages, vote counts and a pulsing **LIVE** badge
- **Real-time activity feed** — simulated voters stream in, sliding toasts announce each vote, avatar stack + vote-momentum sparkline track recent activity
- **Poll analytics** — total votes, per-option share, winner highlight, momentum chart
- **Poll management dashboard** — poll history with mini bar charts, reopen/close controls, delete
- **Poll expiry** — optional 5 min / 30 min / 2 h auto-close with live countdown
- **Shareable links** — copy `?p=<id>` deep links; open one and it jumps straight to the live poll
- **Fully responsive + accessible** — mobile-first glass layout, keyboard focusable, reduced-motion support

## Local dev

```bash
npm install
npm run dev      # start dev server
npm run build    # production build -> dist/
npm run preview  # preview the production build
```

## Deploy

Works as a static build (`dist/`) on Vercel / Netlify / GitHub Pages.
