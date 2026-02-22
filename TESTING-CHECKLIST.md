# GymBuddy AI – Feature & Button Testing Checklist

Use this list to test every feature and interactive element in the app.

---

## 1. Landing Page (`/`)

| # | Feature / Button | What to test |
|---|------------------|---------------|
| 1.1 | **Navbar – Logo** | Click "GymBuddy AI" → stays on `/` or scrolls to top. |
| 1.2 | **Navbar – How it works** | Click → page scrolls to `#how-it-works`. |
| 1.3 | **Navbar – Features** | Click → page scrolls to `#features`. |
| 1.4 | **Navbar – FAQ** | Click → page scrolls to `#faq`. |
| 1.5 | **Navbar – Find my plan** | Click → navigates to `/onboarding`. |
| 1.6 | **Hero – Find my plan** | Click → navigates to `/onboarding`. |
| 1.7 | **Hero – See example plan** | Click → navigates to `/plan` (shows plan if one exists, else empty state). |
| 1.8 | **Final CTA – Find my plan** | Click → navigates to `/onboarding`. |

---

## 2. Onboarding (`/onboarding`)

| # | Feature / Button | What to test |
|---|------------------|---------------|
| 2.1 | **Back link** | Click "← Back" → navigates to `/`. |
| 2.2 | **Stepper** | Steps 1–6 show correctly; current step highlighted. |
| 2.3 | **Step 0 – Goal** | Select **Fat loss** / **Muscle gain** / **Strength** (radio); selection persists when moving Next/Back. |
| 2.4 | **Step 1 – Days per week** | Select **1, 2, 3, 4, 5, 6, or 7**; selection persists. |
| 2.5 | **Step 1 – Session length** | Select **20 / 30 / 45 / 60 min**; selection persists. |
| 2.6 | **Step 2 – Experience** | Select **Beginner** / **Intermediate**; selection persists. |
| 2.7 | **Step 2 – Equipment** | Select **Full gym** / **Dumbbells** / **Bands** / **Bodyweight**; selection persists. |
| 2.8 | **Step 3 – Limitations** | **None** clears all; **Knee** / **Lower back** / **Shoulder** toggle on/off; can select multiple or none. |
| 2.9 | **Step 4 – Diet preference** | Select **Veg** / **Non veg** / **Eggetarian**; selection persists. |
| 2.10 | **Step 4 – Meals per day** | Select **2** / **3** / **4**; selection persists. |
| 2.11 | **Step 5 – Summary** | All chosen values displayed correctly. |
| 2.12 | **Generate Plan** | Click → loading state → redirect to `/plan?version=<id>`; plan appears with correct number of days and content. |
| 2.13 | **Back button** | At step > 0, click Back → previous step; at step 0, disabled. |
| 2.14 | **Next button** | At step < 5, click Next → next step. |
| 2.15 | **Profile prefill** | After generating once, revisit onboarding → saved profile pre-fills (if stored). |

---

## 3. Plan Dashboard (`/plan`, `/plan?version=...`, `/plan?tab=...`)

| # | Feature / Button | What to test |
|---|------------------|---------------|
| 3.1 | **AppNav – Logo / GymBuddy AI** | Click → navigates to `/plan`. |
| 3.2 | **AppNav – Dashboard** | Click → stays on plan (or goes to `/plan`). |
| 3.3 | **AppNav – History** | Click → navigates to `/history`. |
| 3.4 | **Progress indicator** | "X/Y days completed" matches marked-complete count; updates when toggling "Mark completed". |
| 3.5 | **Edit plan** | Click → Edit plan modal opens. |
| 3.6 | **Tabs – Workouts** | Click → shows workout day cards. |
| 3.7 | **Tabs – Nutrition** | Click → shows nutrition guide content. |
| 3.8 | **Tabs – Progress** | Click → shows "View full progress" link. |
| 3.9 | **Day card – Expand / collapse** | Click day row → expands to show Warm-up, Main, Accessories, Cooldown; click again → collapses. |
| 3.10 | **Mark completed (checkbox)** | Check/uncheck → day shows "Done" badge and opacity; count and Progress page stats update (after navigating to History). |
| 3.11 | **View Nutrition Guide (sidebar)** | Click → switches to Nutrition tab. |
| 3.12 | **Regenerate Plan** | Click → navigates to `/onboarding` with profile saved for prefill. |
| 3.13 | **Progress tab – View full progress** | Click → navigates to `/history`. |
| 3.14 | **Empty state – No plan found** | When no plan in storage, "Go to onboarding" → `/onboarding`. |
| 3.15 | **URL – version query** | `/plan?version=<id>` loads that plan; default (no version) loads latest. |
| 3.16 | **URL – tab query** | `/plan?tab=nutrition` or `?tab=progress` opens that tab. |

### Edit Plan Modal

| # | Feature / Button | What to test |
|---|------------------|---------------|
| 3.17 | **Remove day (trash icon)** | Click on a day → marks for removal (highlight); click again → unmarks; cannot remove last remaining day. |
| 3.18 | **Add Day** | Click → adds one day (enabled only when add count < 1); added day type differs from existing (e.g. Upper/Lower/Conditioning). |
| 3.19 | **Edit summary text** | Shows correct "Remove Day X" / "Add 1 day (…)" before save. |
| 3.20 | **Cancel** | Click → modal closes without saving. |
| 3.21 | **Save as new version** | Click → loading → new plan saved and redirect to `/plan?version=<newId>`; plan has updated days (removed/added as chosen). |
| 3.22 | **Error state** | If save fails, error message shown in modal. |

### Next Week Modal (when all days completed)

| # | Feature / Button | What to test |
|---|------------------|---------------|
| 3.23 | **Modal appearance** | When all days in current plan are marked complete, modal appears ("Nice work — generate next week's plan?"). |
| 3.24 | **Not now** | Click → modal closes. |
| 3.25 | **Generate Week N** | Click → loading → new plan created (week number + 1, progression applied), saved, redirect to `/plan?version=<newId>`. |

---

## 4. History / Progress Page (`/history`)

| # | Feature / Button | What to test |
|---|------------------|---------------|
| 4.1 | **AppNav – Dashboard** | Click → `/plan`. |
| 4.2 | **AppNav – History** | Click → `/history` (current page). |
| 4.3 | **Tabs – Workouts** | Click → navigates to `/plan`. |
| 4.4 | **Tabs – Nutrition** | Click → navigates to `/plan?tab=nutrition`. |
| 4.5 | **Tabs – Progress** | Active tab on this page. |
| 4.6 | **Key Statistics – Plans Created** | Number equals total saved plans. |
| 4.7 | **Key Statistics – Workouts Completed** | Number equals total completed days across all plans (from "Mark completed"). |
| 4.8 | **Key Statistics – Current plan** | "X/Y days" matches completion for the most recent plan. |
| 4.9 | **Active plan card** | Green border; "View Current" → `/plan?version=<activeVersionId>`. |
| 4.10 | **Active plan – Remove from history (trash)** | Click → plan removed from list; stats update; cannot navigate to that version afterward. |
| 4.11 | **Past plan card** | "View Details" → `/plan?version=<thatVersionId>`. |
| 4.12 | **Past plan – Remove from history (trash)** | Click → plan removed from list. |
| 4.13 | **Empty state** | No plans → "Find my plan" → `/onboarding`. |

---

## 5. API & Data Flows (integration)

| # | Feature | What to test |
|---|---------|---------------|
| 5.1 | **POST /api/generate-plan** | Valid profile (1–7 days, goal, equipment, etc.) → 200, plan with `plan.days.length === profile.daysPerWeek`; veg/eggetarian → no meat/eggs in nutrition. |
| 5.2 | **POST /api/edit-plan** | Valid plan + edits (remove indexes, addDays 0 or 1) → 200, new plan version; at least one day must remain. |
| 5.3 | **POST /api/next-week** | Valid plan → 200, new plan with incremented week and progression. |
| 5.4 | **LocalStorage – Plans** | Generated and edited plans persist; History and Plan page read correct data. |
| 5.5 | **LocalStorage – Profile** | Saved profile pre-fills onboarding. |
| 5.6 | **LocalStorage – Completion** | Mark completed per plan version; Workouts Completed and Current plan on History reflect it. |

---

## 6. Cross-Cutting

| # | Feature | What to test |
|---|---------|---------------|
| 6.1 | **Responsive layout** | Plan/History sidebars hide on small screens; nav and main content usable. |
| 6.2 | **No broken links** | Every link and button navigates or performs the expected action (no 404, no dead clicks). |
| 6.3 | **Validation** | Onboarding: required selections; API: invalid body → 400 with clear error. |
| 6.4 | **Loading states** | Generate Plan, Save as new version, Generate Week N show loading and then result or error. |

---

## Quick reference – All buttons and links

- **Landing:** Logo, How it works, Features, FAQ, Find my plan (×2), See example plan, Final CTA Find my plan.
- **Onboarding:** Back, Goal (×3), Days (×7), Session (×4), Experience (×2), Equipment (×4), None, Limitations (×3), Diet (×3), Meals (×3), Generate Plan, Back, Next.
- **Plan:** AppNav (Logo, Dashboard, History), Edit plan, Workouts/Nutrition/Progress tabs, each day expand/collapse, each Mark completed checkbox, View Nutrition Guide, Regenerate Plan, View full progress, Go to onboarding (empty state); Edit modal: trash per day, Add Day, Cancel, Save as new version; Next week modal: Not now, Generate Week N.
- **History:** AppNav (Dashboard, History), Workouts/Nutrition/Progress tab links, View Current, View Details, Remove (trash) per plan, Find my plan (empty state).
