/**
 * Deterministic substitutions for limitations.
 * Applied to exercise names (case-insensitive match).
 */
export const LIMITATION_SUBSTITUTIONS: Record<
  string,
  { from: string; to: string }[]
> = {
  knee: [
    { from: "Back Squat", to: "Goblet Squat" },
    { from: "Barbell Squat", to: "Goblet Squat" },
    { from: "Lunges", to: "Step-ups" },
    { from: "Dumbbell Lunge", to: "Dumbbell Step-up" },
  ],
  lower_back: [
    { from: "Deadlift", to: "Hip Thrust" },
    { from: "Romanian Deadlift (Dumbbell)", to: "Glute Bridge" },
    { from: "Romanian Deadlift", to: "Hip Thrust" },
  ],
  shoulder: [
    { from: "Overhead Press", to: "Incline Press" },
    { from: "Dumbbell Overhead Press", to: "Incline Dumbbell Press" },
  ],
};

export function applyLimitationSubstitutions(
  exerciseName: string,
  limitations: string[]
): string {
  let name = exerciseName;
  for (const lim of limitations) {
    const subs = LIMITATION_SUBSTITUTIONS[lim];
    if (!subs) continue;
    for (const { from, to } of subs) {
      if (name.toLowerCase().includes(from.toLowerCase())) {
        name = to;
        break;
      }
    }
  }
  return name;
}
