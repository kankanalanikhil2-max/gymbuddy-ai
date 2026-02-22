# GymBuddy AI

A production-ready web app that generates personalized workout and nutrition plans based on your goal, schedule, equipment, and limitations. Built with Next.js (App Router), TypeScript, and Tailwind CSS. Designed to run locally or on **AWS App Runner**.

## Features

- **Landing page** – Dark theme, hero CTA, features, how it works, FAQ
- **Onboarding wizard** – 6-step flow: goal, schedule (1–7 days/week, session length), experience & equipment, limitations, diet, summary. Full keyboard navigation and accessibility.
- **Plan dashboard** – Workouts | Nutrition | Progress tabs; “Why this fits you” panel; Edit plan; Regenerate plan
- **Edit plan** – Remove days or add one extra day (max 7 days/week). Edits create a new plan version.
- **Completion tracking** – Mark each day completed; progress persisted per plan in the browser.
- **Next week plan** – When all days are complete, generate the next week with light progression.
- **History** – List and open past plans (browser storage).
- **Rules-based generator** – Templates in `/data`; no external APIs. Nutrition respects diet (veg/eggetarian).

## Tech stack

- Next.js 16 (App Router), TypeScript, Tailwind CSS
- Data: JSON templates in `/data/plans` and `/data/nutrition`; APIs: `generate-plan`, `edit-plan`, `next-week`, `health`
- Persistence: browser localStorage (MVP); repository interface ready for a backend store

## Prerequisites

- **Node.js 20+** (see [.nvmrc](.nvmrc) for version)
- npm (or yarn/pnpm)

## Quick start

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/gymbuddy-ai.git
cd gymbuddy-ai

# Install dependencies
npm install

# Run in development
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Production build

```bash
npm run build
npm start
```

Runs the app in production on port 3000 (override with `PORT`).

## Health check

For load balancers and AWS App Runner:

- **GET /api/health** – Returns `200` and `{ "status": "ok", "service": "gymbuddy-ai" }` when the app is ready.

Configure App Runner’s health check to use this path (e.g. `/api/health`).

## Docker (for AWS App Runner or any container host)

```bash
docker build -t gymbuddy-ai .
docker run -p 3000:3000 gymbuddy-ai
```

The image uses Next.js `standalone` output and includes the `/data` folder required by the plan/nutrition APIs. See [DEPLOYMENT.md](DEPLOYMENT.md) for AWS App Runner steps.

## Environment variables

No secrets are required for the current build. All data is stored in the browser. If you add server-side features later, use `.env.local` and never commit secrets (see [.env.example](.env.example)).

## Project structure

```
├── data/
│   ├── plans/          # Workout template JSONs
│   └── nutrition/      # Nutrition template JSONs
├── src/
│   ├── app/
│   │   ├── api/        # generate-plan, edit-plan, next-week, health
│   │   ├── onboarding/, plan/, history/
│   │   ├── layout.tsx, page.tsx
│   ├── components/
│   ├── lib/
│   └── types/
├── Dockerfile
├── next.config.js      # output: "standalone" for Docker
├── .nvmrc              # Node 20
└── README.md
```

## API

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/generate-plan | Body: `Profile`. Returns `GeneratedPlan`. |
| POST | /api/edit-plan | Body: `{ plan, edits }`. Returns new `GeneratedPlan`. |
| POST | /api/next-week | Body: `GeneratedPlan`. Returns next week plan. |
| GET | /api/health | Health check; returns 200 when ready. |

## Pushing to GitHub

1. Create a **new repository** on GitHub (do not initialize with a README if you already have one).
2. From your project folder:

```bash
git init
git add .
git commit -m "Initial commit: GymBuddy AI production-ready"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/gymbuddy-ai.git
git push -u origin main
```

3. For a fresh clone elsewhere: `git clone https://github.com/YOUR_USERNAME/gymbuddy-ai.git` then `npm install` and `npm run dev` or `npm run build && npm start`.

## Deploying to AWS App Runner

See **[DEPLOYMENT.md](DEPLOYMENT.md)** for step-by-step instructions (container from GitHub, Dockerfile, health check, and env vars).

## Disclaimer

Workout and nutrition content is for general guidance only. Users should consult a healthcare or nutrition professional for personalized advice.
