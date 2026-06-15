# The Learnova Lost Map

Mobile-first QR quest built with React, TypeScript, Vite, Tailwind CSS, React Router, and `localStorage`.

## Install

```bash
npm install
```

## Run

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Project Structure

```text
learnova-lost-map/
|- public/
|  `- assets/
|     `- living-map.png
|- src/
|  |- components/   Shared UI, animation, map, fog, bonus, and QR guards
|  |- data/         Game config, QR access keys, world metadata
|  |- hooks/        Shared state hooks
|  |- lib/          localStorage helpers, clipboard helpers
|  |- pages/        Route pages for world challenges, fog traps, bonuses, final gate, reveal, and admin
|  |- types/        Shared TypeScript types
|  |- index.css     Global styles
|  |- main.tsx      App entry
|  `- router.tsx    Router setup
|- package.json
|- tailwind.config.ts
`- vite.config.ts
```

## Animation System Overview

The app uses lightweight CSS and React-state-driven animations only.

Main animation areas:

- `/map`
  - animated Core of Learno
  - fog state overlays
  - energy streams from restored worlds to the Core
  - one-time newly restored world animation
- challenge success
  - guardian code accepted flow
  - stream restoration feedback
- `/final-gate`
  - Fourfold Spark convergence
- `/reveal`
  - staged restoration sequence

Animation sources:

- `tailwind.config.ts`
- `src/components/CoreVisual.tsx`
- `src/components/EnergyStream.tsx`
- `src/components/FogOverlay.tsx`

## Map Artwork

The map artwork lives at:

- `public/assets/living-map.png`

To replace it:

1. Keep the file name `living-map.png`
2. Replace the image in `public/assets/`
3. Rebuild the app

If the artwork is missing or fails to load, the map falls back to the CSS-based digital layout automatically.

## World Unlock Animation

The app stores the most recent unlocked world in:

- `learnova-lost-map.last-unlocked-world`

Helpers live in:

- `src/lib/team-state.ts`

Used helpers:

- `setLastUnlockedWorld()`
- `getLastUnlockedWorld()`
- `clearLastUnlockedWorld()`

Flow:

1. A challenge is completed with the correct guardian code.
2. The world is unlocked in `TeamState`.
3. `lastUnlockedWorld` is stored.
4. When the team returns to `/map`, the restore animation plays once.
5. The stored value is cleared.

## QR Access

Stage pages are protected by QR keys.

QR access config lives in:

- `src/data/qr-access.ts`

Shared route metadata lives in:

- `src/data/game-config.ts`

If a user opens a puzzle directly without its QR parameter, the page shows a QR-required message and returns them to the map.

## Secret Codes

Main world codes are defined in the challenge pages:

- `src/pages/EducationChallengePage.tsx`
- `src/pages/EntrepreneurshipChallengePage.tsx`
- `src/pages/EntertainmentChallengePage.tsx`
- `src/pages/ExplorationChallengePage.tsx`

Look for the `correctCode` prop.

## Edit Challenge Text

Challenge copy is stored route-by-route in `src/pages/`.

Worlds:

- `EducationChallengePage.tsx`
- `EntrepreneurshipChallengePage.tsx`
- `EntertainmentChallengePage.tsx`
- `ExplorationChallengePage.tsx`

Fog traps:

- `FogPerfectAnswerPage.tsx`
- `FogShinyIdeaPage.tsx`
- `FogEmptyPerformancePage.tsx`
- `FogRushPathPage.tsx`
- `FogLoneHeroPage.tsx`

Bonus quests:

- `BonusBadgeConstellationPage.tsx`
- `BonusWonderLogPage.tsx`
- `BonusPrototypeFlamePage.tsx`
- `BonusAntiDimnessOathPage.tsx`

Endgame:

- `FinalGatePage.tsx`
- `RevealPage.tsx`

## Admin Dashboard

Admin route:

- `/admin`

Main facilitator features:

- overview cards for team, score, progress, hints, and final gate
- world status controls
- fog trap controls
- bonus quest controls
- score controls
- reset / unlock / lock controls
- export and import team state
- QR route list with copy buttons

Admin source:

- `src/pages/AdminPage.tsx`

## Export / Import Team State

Helpers live in:

- `src/lib/team-state.ts`

Available helpers:

- `exportTeamState()`
- `importTeamState(json)`

Facilitator workflow:

1. Open `/admin`
2. Use `Export Team State JSON` before risky changes
3. Use file import or pasted JSON import when restoring a saved session

## Manual Recovery During Live Play

If a QR code fails or a guardian code flow is interrupted:

1. Open `/admin`
2. Use `Unlock` for the specific world
3. If you want the restore animation to still play, use `Mark Newly Unlocked`
4. If the issue affects final progression, use `Complete Final Gate` or `Reset Final Gate`

Use these only as facilitator recovery tools.

## Reset Game Safely

Recommended:

1. Export state from `/admin`
2. Confirm reset
3. Use `Reset Team`

Direct browser reset:

- delete `learnova-lost-map.team-state` from `localStorage`

## QR Routes To Print

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

## Acceptance Notes

This version supports:

- persistent team progress in `localStorage`
- animated map states for locked and restored worlds
- one-time world restore animation on return to `/map`
- guardian-code world unlock flow
- fog trap completion tracking
- bonus scoring once per quest
- Final Gate progression
- cinematic Reveal flow
- facilitator recovery tools in `/admin`
