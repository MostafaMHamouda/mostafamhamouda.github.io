# The Learnova Lost Map

Multi-team QR onboarding quest built with React, TypeScript, Vite, Tailwind CSS, React Router, Supabase, and Supabase Realtime.

## Install

```bash
npm install
```

## Environment Variables

Create `.env` from `.env.example`.

```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_ADMIN_PIN=1907
```

If `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY` is missing, the app shows a clear setup error instead of failing silently.

## Supabase Setup

1. Create a Supabase project.
2. Copy your project URL and anon key into `.env`.
3. Run the SQL in [supabase/schema.sql](/C:/Users/Mostafa%20Hamouda/Documents/Codex/learnova-lost-map/supabase/schema.sql).
4. Confirm the tables exist:
   - `teams`
   - `team_completions`
   - `team_events`
   - `game_settings`
5. Confirm Realtime is enabled for the tables you want to watch live.

## Run Locally

```bash
npm run dev
```

Production build:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

## How Registration Works

- Each device registers its own team from `/team-register`.
- A new `teams` row is created in Supabase.
- The device stores only `learnova_current_team_id` in `localStorage`.
- Full game progress is loaded from Supabase after registration.

## How Multi-Team Sync Works

- Player pages load the current team using `learnova_current_team_id`.
- Team progress, score, hints, unlocks, final gate, and reveal state live in Supabase.
- Admin pages subscribe to teams, events, and settings through Supabase Realtime.
- Player map updates when admin changes a team manually.

Important:
`localStorage` is now only used for the current team session and admin PIN session. It is not the source of truth for game progress.

## Project Structure

```text
learnova-lost-map/
|- public/
|  `- assets/
|- scripts/
|- src/
|  |- components/
|  |- data/
|  |  |- gameConfig.ts
|  |  `- qr-access.ts
|  |- hooks/
|  |  |- useCurrentTeam.ts
|  |  `- useTeamCompletions.ts
|  |- lib/
|  |  |- supabase.ts
|  |  `- teamSession.ts
|  |- pages/
|  |- services/
|  |  `- gameService.ts
|  `- types/
|     `- game.ts
`- supabase/
   `- schema.sql
```

## Admin Dashboard

Admin routes:

- `/admin`
- `/admin/live`

Admin access uses a simple PIN gate.

- Enter the PIN from `VITE_ADMIN_PIN`.
- After success, the app stores `learnova_admin_authenticated=true` locally.
- Use `Logout Admin` to clear that session.

Admin tabs include:

- Overview
- Teams
- Team Details
- Activity Log
- Leaderboard
- Game Controls
- QR Routes
- Data Export

## Live Screen

Open `/admin/live` after authenticating in `/admin`.

This screen is meant for a projector or facilitator display and shows:

- team cards
- progress
- scores
- team status

It does not show secret codes or admin controls.

## Editing Secret Codes

World codes live in [src/data/gameConfig.ts](/C:/Users/Mostafa%20Hamouda/Documents/Codex/learnova-lost-map/src/data/gameConfig.ts).

Look for `worldConfigs` and edit the `code` field for each world.

## Editing Challenge Text

Challenge copy still lives in the page wrappers under [src/pages](/C:/Users/Mostafa%20Hamouda/Documents/Codex/learnova-lost-map/src/pages).

Main pages to edit:

- [EducationChallengePage.tsx](/C:/Users/Mostafa%20Hamouda/Documents/Codex/learnova-lost-map/src/pages/EducationChallengePage.tsx)
- [EntrepreneurshipChallengePage.tsx](/C:/Users/Mostafa%20Hamouda/Documents/Codex/learnova-lost-map/src/pages/EntrepreneurshipChallengePage.tsx)
- [EntertainmentChallengePage.tsx](/C:/Users/Mostafa%20Hamouda/Documents/Codex/learnova-lost-map/src/pages/EntertainmentChallengePage.tsx)
- [ExplorationChallengePage.tsx](/C:/Users/Mostafa%20Hamouda/Documents/Codex/learnova-lost-map/src/pages/ExplorationChallengePage.tsx)
- fog trap pages in `src/pages/Fog*.tsx`
- bonus pages in `src/pages/Bonus*.tsx`
- [FinalGatePage.tsx](/C:/Users/Mostafa%20Hamouda/Documents/Codex/learnova-lost-map/src/pages/FinalGatePage.tsx)
- [RevealPage.tsx](/C:/Users/Mostafa%20Hamouda/Documents/Codex/learnova-lost-map/src/pages/RevealPage.tsx)

## Exports

Admin export options include:

- Teams CSV
- Teams JSON
- Events CSV
- Full Game JSON

Full export includes:

- teams
- completions
- events
- settings
- exportedAt

## Reset Game Safely

Recommended flow:

1. Open `/admin`.
2. Export Full Game JSON.
3. Go to `Game Controls`.
4. Type `RESET LEARNOVA MAP`.
5. Run `Reset All Game Data`.

What stays after reset:

- `game_settings`

What gets removed:

- teams
- completions
- events

## QR Routes To Print

Routes with QR access values:

- `/start`
- `/education/mirror-of-misunderstanding?qr=fahim-blue`
- `/entrepreneurship/market-of-needs?qr=riyada-red`
- `/entertainment/story-loom?qr=sharara-gold`
- `/exploration/listening-compass?qr=rahhal-green`
- `/fog/perfect-answer?qr=fog-perfect`
- `/fog/shiny-idea?qr=fog-shiny`
- `/fog/empty-performance?qr=fog-stage`
- `/fog/rush-path?qr=fog-pattern`
- `/fog/lone-hero?qr=fog-balance`
- `/bonus/badge-constellation?qr=bonus-stars`
- `/bonus/wonder-log?qr=bonus-light`
- `/bonus/prototype-flame?qr=bonus-flame`
- `/bonus/anti-dimness-oath?qr=bonus-bond`
- `/final-gate?qr=final-spark`
- `/reveal`

Generate QR files with a public base URL:

```bash
npm run qr:generate -- https://your-public-url
```

## Public Access

If you need quick external testing without workspace login:

```bash
npm run public:tunnel
```

After the tunnel starts, regenerate QR files against the public URL.

## Notes

- Realtime updates are powered by Supabase subscriptions.
- Duplicate scoring is prevented through `team_completions` uniqueness.
- Player pages stay mobile-first and QR-protected.
- Admin PIN is MVP-only protection, not production-grade security.
