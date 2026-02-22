/**
 * Resize a base plan (typically 3 days) to match requested days (1–7).
 * Used by generatePlan so output always has plan.days.length === profile.daysPerWeek.
 */
import type { PlanTemplate, PlanDay, ExerciseEntry, Profile } from "@/types";
import { applyLimitationSubstitutions } from "./limitations";

function adaptDayForResize(day: PlanDay, profile: Profile): PlanDay {
  const sessionShort = profile.sessionMinutes <= 30;
  const limitations = profile.limitations ?? [];
  const accessories =
    sessionShort && day.accessories.length > 0
      ? day.accessories.slice(0, -1)
      : [...day.accessories];
  const mapEx = (list: ExerciseEntry[]) =>
    list.map((ex) => ({
      ...ex,
      name: applyLimitationSubstitutions(ex.name, limitations),
    }));
  return {
    ...day,
    warmup: mapEx(day.warmup),
    main: mapEx(day.main),
    accessories: mapEx(accessories),
    cooldown: mapEx(day.cooldown),
  };
}

export type ExtraDayFocus = "Conditioning & Core" | "Upper Focus" | "Lower Focus" | "Active Recovery";

/** Build an extra day (conditioning, upper, lower, or active recovery). Exported for use in planEdits. */
export function buildExtraDay(
  profile: Profile,
  dayNumber: number,
  focus: ExtraDayFocus
): PlanDay {
  const { equipment, sessionMinutes } = profile;
  const sessionShort = sessionMinutes <= 30;
  const isBodyweight = equipment === "bodyweight" || equipment === "bands";

  const warmup: ExerciseEntry[] = [
    { name: "Arm circles", sets: 1, reps: "10 each", restSec: 0, notes: "30 sec" },
    { name: "Leg swings", sets: 1, reps: "8 each", restSec: 30 },
  ];
  const cooldown: ExerciseEntry[] = [
    { name: "Full body stretch", sets: 1, reps: "60 sec", restSec: 0 },
  ];

  let main: ExerciseEntry[];
  let accessories: ExerciseEntry[];

  if (focus === "Active Recovery") {
    return adaptDayForResize(
      {
        dayName: `Day ${dayNumber}`,
        focus: "Active Recovery",
        warmup: [
          { name: "Neck rolls", sets: 1, reps: "5 each", restSec: 0 },
          { name: "Hip circles", sets: 1, reps: "8 each", restSec: 30 },
        ],
        main: [
          { name: "Light walk or bike", sets: 1, reps: "10-15 min", restSec: 0, notes: "Easy pace" },
          { name: "Bodyweight squat (slow)", sets: 2, reps: "10", restSec: 60 },
          { name: "Band pull-aparts", sets: 2, reps: "15", restSec: 45 },
        ],
        accessories: [
          { name: "Plank", sets: 1, reps: "30 sec", restSec: 0 },
          { name: "Hip flexor stretch", sets: 1, reps: "45 sec each", restSec: 0 },
        ],
        cooldown: [
          { name: "Full body stretch", sets: 1, reps: "5 min", restSec: 0 },
        ],
      },
      profile
    );
  }

  if (focus === "Conditioning & Core") {
    main = isBodyweight
      ? [
          { name: "Bodyweight squat", sets: 3, reps: "12", restSec: 45 },
          { name: "Push-up (or knee)", sets: 3, reps: "8-12", restSec: 45 },
          { name: "Glute bridge", sets: 3, reps: "12", restSec: 45 },
        ]
      : [
          { name: "Dumbbell Goblet Squat", sets: 3, reps: "10-12", restSec: 60 },
          { name: "Dumbbell Row", sets: 3, reps: "10 each", restSec: 60 },
          { name: "Push-up or Dumbbell Press", sets: 3, reps: "8-10", restSec: 60 },
        ];
    accessories = sessionShort
      ? [{ name: "Plank", sets: 2, reps: "30 sec", restSec: 30 }]
      : [
          { name: "Plank", sets: 2, reps: "45 sec", restSec: 30 },
          { name: "Dead bug", sets: 2, reps: "10 each", restSec: 30 },
        ];
  } else if (focus === "Upper Focus") {
    main = isBodyweight
      ? [
          { name: "Push-up (or knee)", sets: 3, reps: "8-12", restSec: 60 },
          { name: "Inverted row", sets: 3, reps: "8-10", restSec: 60 },
          { name: "Pike push-up", sets: 2, reps: "6-10", restSec: 45 },
        ]
      : [
          { name: "Dumbbell Bench Press", sets: 3, reps: "8-10", restSec: 60 },
          { name: "Dumbbell Row", sets: 3, reps: "10 each", restSec: 60 },
          { name: "Dumbbell Shoulder Press", sets: 2, reps: "10", restSec: 45 },
        ];
    accessories = [
      { name: "Plank", sets: 2, reps: "30 sec", restSec: 30 },
    ];
  } else {
    // Lower Focus
    main = isBodyweight
      ? [
          { name: "Bodyweight squat", sets: 3, reps: "12", restSec: 60 },
          { name: "Glute bridge", sets: 3, reps: "12", restSec: 45 },
          { name: "Lunges", sets: 3, reps: "8 each", restSec: 45 },
        ]
      : [
          { name: "Dumbbell Goblet Squat", sets: 3, reps: "10-12", restSec: 60 },
          { name: "Romanian Deadlift (Dumbbell)", sets: 3, reps: "10", restSec: 60 },
          { name: "Dumbbell Lunge", sets: 2, reps: "8 each", restSec: 45 },
        ];
    accessories = sessionShort
      ? [{ name: "Dead bug", sets: 2, reps: "10 each", restSec: 30 }]
      : [
          { name: "Glute Bridge", sets: 2, reps: "12", restSec: 45 },
          { name: "Dead bug", sets: 2, reps: "10 each", restSec: 30 },
        ];
  }

  return adaptDayForResize(
    {
      dayName: `Day ${dayNumber}`,
      focus,
      warmup,
      main,
      accessories,
      cooldown,
    },
    profile
  );
}

/**
 * Resize plan to exactly requestedDays (1–7).
 * - 1 day: full body (use day 3 from base, or merge)
 * - 2 days: full body A/B (day 1 + day 2, or day 1 + day 3)
 * - 3 days: use base as-is
 * - 4 days: base 3 + Conditioning & Core
 * - 5 days: base 3 + Conditioning + Upper Focus
 * - 6 days: base 3 + Conditioning + Upper + Lower
 * - 7 days: base 3 + Conditioning + Upper + Lower + Active Recovery
 */
export function resizePlanToDays(
  basePlan: PlanTemplate,
  requestedDays: number,
  profile: Profile
): PlanDay[] {
  const baseDays = basePlan.days;
  if (requestedDays <= 0 || requestedDays > 7) return baseDays;

  if (requestedDays === 1) {
    const fullBodyDay = baseDays.length >= 3 ? baseDays[2] : baseDays[0];
    return [adaptDayForResize({ ...fullBodyDay, dayName: "Day 1" }, profile)];
  }

  if (requestedDays === 2) {
    const day1 = adaptDayForResize({ ...baseDays[0], dayName: "Day 1" }, profile);
    const day2 = adaptDayForResize({ ...baseDays[1], dayName: "Day 2" }, profile);
    return [day1, day2];
  }

  if (requestedDays === 3) {
    return baseDays.map((d, i) =>
      adaptDayForResize({ ...d, dayName: `Day ${i + 1}` }, profile)
    );
  }

  const extraFocuses: ("Conditioning & Core" | "Upper Focus" | "Lower Focus" | "Active Recovery")[] = [
    "Conditioning & Core",
    "Upper Focus",
    "Lower Focus",
    "Active Recovery",
  ];
  let days = baseDays.map((d, i) =>
    adaptDayForResize({ ...d, dayName: `Day ${i + 1}` }, profile)
  );
  let nextNum = 4;
  for (let i = 0; i < requestedDays - 3 && i < extraFocuses.length; i++) {
    days.push(buildExtraDay(profile, nextNum, extraFocuses[i]));
    nextNum++;
  }
  return days.map((d, i) => ({ ...d, dayName: `Day ${i + 1}` }));
}
