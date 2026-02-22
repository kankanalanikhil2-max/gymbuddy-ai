import type { GeneratedPlan, PlanDay, ExerciseEntry } from "@/types";

/** Bump rep range slightly (e.g. "8-10" -> "9-11", "5" -> "6"). */
function bumpReps(reps: string): string {
  const match = reps.match(/^(\d+)(?:\s*-\s*(\d+))?$/);
  if (!match) return reps;
  const low = parseInt(match[1], 10);
  const high = match[2] ? parseInt(match[2], 10) : low;
  if (high > low) return `${low + 1}-${high + 1}`;
  return String(low + 1);
}

/** Add one set to the first main exercise per day; keep limitations and structure. */
function applyProgressionToDay(day: PlanDay): PlanDay {
  if (day.main.length === 0) return day;
  const [first, ...rest] = day.main;
  const updatedFirst: ExerciseEntry = {
    ...first,
    sets: first.sets + 1,
    reps: bumpReps(first.reps),
  };
  return {
    ...day,
    main: [updatedFirst, ...rest],
  };
}

/**
 * Create next week's plan: increment weekNumber, add one set + slight rep bump to first main exercise per day.
 * Returns a new GeneratedPlan with new versionId; profile, nutrition, whyThisFits unchanged.
 */
export function applyWeekProgression(plan: GeneratedPlan): GeneratedPlan {
  const currentWeek = plan.weekNumber ?? 1;
  const nextWeek = currentWeek + 1;

  const newPlan = {
    ...plan.plan,
    days: plan.plan.days.map(applyProgressionToDay),
    title: plan.plan.title.replace(
      /Week\s*\d+/i,
      `Week ${nextWeek}`
    ),
    progressionNotes: `Week ${nextWeek}: Slight volume increase on main lifts. Keep form strict.`,
  };

  return {
    ...plan,
    plan: newPlan,
    weekNumber: nextWeek,
    versionId: `v_${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
}
