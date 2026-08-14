# Principal Prompt — NOVAPOLL

> Submitted as part of the Vicodathon Live Steer Challenge final round.

## The prompt that guided the implementation

Build a working **Poll Creator + Live Results** web prototype. A user must be able to create a poll, add **3 to 4 answer options**, cast a vote, and immediately view the results through an **animated bar chart** showing live vote counts and percentages.

Core requirements:
1. Create a poll with a clear question.
2. Add 3–4 answer options.
3. Allow users to vote on an option.
4. Display live results after voting.
5. Show vote percentages with an animated bar chart.
6. Deliver a working prototype with a proper, polished UI.

## Styling & UX directive

- Build it in a React (Vite) app with an **Alienware-inspired neon theme** (near-black `#05080c` background, neon green `#00ff7a`, neon cyan `#00d9ff`).
- Use **glassmorphism** (blurred translucent panels with subtle borders) across the UI.
- Make the UI **fully responsive** — mobile-first layouts, fluid type with `clamp()`.
- Make the webpage **interactive** — live vote simulation, animated bars, count-up stats, slide-in activity toasts, live badge pulse, hover micro-interactions.
- Keep the whole thing self-contained (no backend needed) so it deploys as a static site instantly on Vercel.

## Bonus features implemented

- Real-time simulated voter activity + activity toasts + avatar stack + vote-momentum sparkline
- Poll history / management dashboard (reopen, close, delete)
- Poll expiry with live countdown and auto-close
- Shareable deep links (`?p=<id>`)
- Winner highlight + locked-results banner
- Poll analytics: total votes, per-option share, momentum chart
- Animated stat counters on the landing page
