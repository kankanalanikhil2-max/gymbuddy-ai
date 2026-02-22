import type {
  GeneratedPlan,
  PlanEdits,
  PlanTemplate,
  PlanDay,
  ExerciseEntry,
  Profile,
} from "@/types";
import { applyLimitationSubstitutions } from "./limitations";
import { buildExtraDay, type ExtraDayFocus } from "./planResize";

/** Adapt a single day: apply limitation substitutions and optionally drop one accessory if session is short. */
function adaptDay(day: PlanDay, profile: Profile): PlanDay {
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

const ADDABLE_FOCUSES: ExtraDayFocus[] = ["Conditioning & Core", "Upper Focus", "Lower Focus"];

/** Map an existing day's focus string to one of our addable focus categories. */
function focusToCategory(focus: string): ExtraDayFocus | null {
  const f = focus.toLowerCase();
  if (f.includes("upper") || f.includes("push") || f.includes("pull")) return "Upper Focus";
  if (f.includes("lower") || f.includes("leg") || f.includes("hinge")) return "Lower Focus";
  if (f.includes("conditioning") || f.includes("core") || f.includes("full body") || f.includes("circuit")) return "Conditioning & Core";
  if (f.includes("recovery")) return "Active Recovery";
  return null;
}

/** Pick a focus for the new day that differs from the current plan: choose the category with fewest existing days. */
function pickFocusForAddedDay(existingDays: PlanDay[]): ExtraDayFocus {
  const counts: Record<ExtraDayFocus, number> = {
    "Conditioning & Core": 0,
    "Upper Focus": 0,
    "Lower Focus": 0,
    "Active Recovery": 0,
  };
  for (const day of existingDays) {
    const cat = focusToCategory(day.focus);
    if (cat && cat in counts) counts[cat]++;
  }
  let best: ExtraDayFocus = "Conditioning & Core";
  let minCount = counts["Conditioning & Core"];
  for (const focus of ADDABLE_FOCUSES) {
    if (counts[focus] < minCount) {
      minCount = counts[focus];
      best = focus;
    }
  }
  return best;
}

/** Renumber day names to Day 1, Day 2, ... */
function renumberDays(days: PlanDay[]): PlanDay[] {
  return days.map((d, i) => ({ ...d, dayName: `Day ${i + 1}` }));
}

/**
 * Apply plan edits: remove days by index, add up to one extra day.
 * Returns a new GeneratedPlan with new versionId, originalVersionId, editSummary.
 */
export function applyPlanEdits(
  plan: GeneratedPlan,
  edits: PlanEdits
): GeneratedPlan {
  const { plan: template, profile } = plan;
  let days = [...template.days];

  const removeIndexes = [...(edits.removeDayIndexes ?? [])]
    .filter((i) => i >= 0 && i < days.length)
    .sort((a, b) => b - a);

  const toRemove = new Set(removeIndexes);
  days = days.filter((_, i) => !toRemove.has(i));

  if (days.length === 0) {
    throw new Error("At least one workout day must remain.");
  }

  const addCount = Math.min(edits.addDays ?? 0, 1);
  if (days.length + addCount > 7) {
    throw new Error("A week has at most 7 days. Remove a day first if you want to add a different one.");
  }

  let addedFocus: ExtraDayFocus | null = null;
  for (let i = 0; i < addCount; i++) {
    addedFocus = pickFocusForAddedDay(days);
    const extraDay = buildExtraDay(profile, days.length + 1, addedFocus);
    days.push(extraDay);
  }

  days = renumberDays(days);

  const editSummaryParts: string[] = [];
  if (removeIndexes.length > 0) {
    const removed = removeIndexes.sort((a, b) => a - b).map((i) => `Day ${i + 1}`).join(", ");
    editSummaryParts.push(`Removed ${removed}`);
  }
  if (addCount > 0 && addedFocus) {
    editSummaryParts.push(`Added Day ${days.length} (${addedFocus})`);
  }
  const editSummary = editSummaryParts.join("; ") || "No structural changes";

  const newVersionId = `v_${Date.now()}`;
  const createdAt = new Date().toISOString();

  const newPlan: PlanTemplate = {
    ...template,
    days,
    title: template.title,
  };

  return {
    ...plan,
    plan: newPlan,
    versionId: newVersionId,
    createdAt,
    originalVersionId: plan.versionId,
    editedVersionId: newVersionId,
    editSummary,
  };
}
