import type {
  Profile,
  PlanTemplate,
  PlanDay,
  ExerciseEntry,
  NutritionTemplate,
  GeneratedPlan,
} from "@/types";
import { applyLimitationSubstitutions } from "./limitations";
import { resizePlanToDays } from "./planResize";
import { sanitizeNutritionForDiet } from "./nutritionSanitize";
import fs from "fs";
import path from "path";

const PLANS_DIR = path.join(process.cwd(), "data", "plans");
const NUTRITION_DIR = path.join(process.cwd(), "data", "nutrition");

// Base templates are 3-day; we resize to 1–7 in resizePlanToDays so plan.days.length === profile.daysPerWeek.
const PLAN_FILES: Record<string, string> = {
  fat_loss_3_beginner_dumbbells: "fat_loss_3_beginner_dumbbells.json",
  muscle_gain_3_beginner_dumbbells: "muscle_gain_3_beginner_dumbbells.json",
  strength_3_beginner_full_gym: "strength_3_beginner_full_gym.json",
  bodyweight_3_beginner: "bodyweight_3_beginner.json",
};

function loadPlanTemplate(key: string): PlanTemplate {
  const file = PLAN_FILES[key];
  if (!file) throw new Error(`Unknown plan key: ${key}`);
  const filePath = path.join(PLANS_DIR, file);
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as PlanTemplate;
}

function loadNutritionTemplate(filename: string): NutritionTemplate {
  const filePath = path.join(NUTRITION_DIR, filename);
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as NutritionTemplate;
}

function listNutritionFiles(): string[] {
  return fs.readdirSync(NUTRITION_DIR).filter((f) => f.endsWith(".json"));
}

/**
 * Pick best base plan template by goal + experience + equipment.
 * Base templates are 3-day; we then resize to profile.daysPerWeek (1–7).
 */
function selectPlanKey(profile: Profile): string {
  const { goal, experience, equipment } = profile;
  if (equipment === "full_gym" && goal === "strength")
    return "strength_3_beginner_full_gym";
  if (equipment === "dumbbells" && goal === "fat_loss")
    return "fat_loss_3_beginner_dumbbells";
  if (equipment === "dumbbells" && goal === "muscle_gain")
    return "muscle_gain_3_beginner_dumbbells";
  if (equipment === "bodyweight") return "bodyweight_3_beginner";
  if (equipment === "bands") return "bodyweight_3_beginner";
  return "bodyweight_3_beginner";
}

/** Deep clone plan and apply session time (drop 1 accessory if <= 30 min) and limitations. */
function adaptPlan(
  plan: PlanTemplate,
  profile: Profile
): PlanTemplate {
  const sessionShort = profile.sessionMinutes <= 30;
  const limitations = profile.limitations ?? [];

  const adaptDay = (day: PlanDay): PlanDay => {
    const accessories =
      sessionShort && day.accessories.length > 0
        ? day.accessories.slice(0, -1)
        : [...day.accessories];

    const mapExercises = (list: ExerciseEntry[]) =>
      list.map((ex) => ({
        ...ex,
        name: applyLimitationSubstitutions(ex.name, limitations),
      }));

    return {
      ...day,
      warmup: mapExercises(day.warmup),
      main: mapExercises(day.main),
      accessories: mapExercises(accessories),
      cooldown: mapExercises(day.cooldown),
    };
  };

  return {
    ...plan,
    days: plan.days.map(adaptDay),
  };
}

/**
 * Select nutrition template by goal + dietPreference.
 * Prefer exact diet match (veg/eggetarian/non_veg) so output never mixes in forbidden items.
 * Fallback: same goal + "any" diet, then strength_any.
 */
function selectNutrition(profile: Profile): NutritionTemplate {
  const files = listNutritionFiles();
  const goal = profile.goal;
  const diet = profile.dietPreference;

  const exactMatch = (filename: string) => {
    const t = loadNutritionTemplate(filename);
    return t.goal === goal && t.dietPreference === diet;
  };
  const goalAndAnyDiet = (filename: string) => {
    const t = loadNutritionTemplate(filename);
    return (t.goal === goal || t.goal === "any") && t.dietPreference === "any";
  };

  for (const f of files) {
    if (exactMatch(f)) return loadNutritionTemplate(f);
  }
  for (const f of files) {
    if (goalAndAnyDiet(f)) return loadNutritionTemplate(f);
  }
  const anyFile = files.find((f) => f.includes("strength_any") || f.includes("_any"));
  if (anyFile) return loadNutritionTemplate(anyFile);
  return loadNutritionTemplate(files[0]);
}

/** Split pattern description for whyThisFits. */
function getSplitDescription(days: number): string {
  if (days === 1) return "1 day: full body.";
  if (days === 2) return "2 days: full body A/B for balance.";
  if (days === 3) return "3 days: full body / push-pull-legs style.";
  if (days === 4) return "4 days: upper/lower split with conditioning.";
  if (days === 5) return "5 days: upper/lower plus conditioning and extra focus days.";
  if (days === 6) return "6 days: structured split with conditioning and recovery.";
  if (days === 7) return "7 days: 6 training days plus 1 active recovery day.";
  return "";
}

/** Build "why this fits you" bullets from applied rules. */
function buildWhyThisFits(
  profile: Profile,
  planKey: string,
  sessionShort: boolean,
  hasLimitations: boolean,
  daysCount: number
): string[] {
  const bullets: string[] = [];
  bullets.push(`Plan chosen for your goal: ${profile.goal.replace("_", " ")}.`);
  bullets.push(
    `Scheduled for ${profile.daysPerWeek} days per week to match your availability. ${getSplitDescription(daysCount)}`
  );
  bullets.push(
    `Equipment set to ${profile.equipment.replace("_", " ")}—exercises match what you have.`
  );
  if (profile.sessionMinutes <= 30)
    bullets.push(
      "Session time is 30 min or less—one accessory block per day was removed so you can finish on time."
    );
  if (hasLimitations)
    bullets.push(
      "Some exercises were swapped for joint-friendly alternatives based on your limitations."
    );
  if (planKey === "bodyweight_3_beginner")
    bullets.push(
      "Using our bodyweight fallback plan so you can train with no equipment."
    );
  return bullets;
}

/** Rules-based plan generator. Returns full GeneratedPlan. plan.days.length === profile.daysPerWeek. */
export function generatePlan(profile: Profile): GeneratedPlan {
  const planKey = selectPlanKey(profile);
  const basePlan = loadPlanTemplate(planKey);
  const adapted = adaptPlan(basePlan, profile);
  const requestedDays = profile.daysPerWeek;
  const resizedDays = resizePlanToDays(adapted, requestedDays, profile);

  const plan: PlanTemplate = {
    ...adapted,
    days: resizedDays,
    title: `${adapted.title.split(" – ")[0]} – ${requestedDays} Days – ${profile.experience} – ${profile.equipment.replace("_", " ")}`,
    tags: {
      ...adapted.tags,
      days: requestedDays,
    },
  };

  let nutrition = selectNutrition(profile);
  nutrition = sanitizeNutritionForDiet(nutrition, profile.dietPreference); // veg/eggetarian: no meat/fish/eggs in output
  const sessionShort = profile.sessionMinutes <= 30;
  const hasLimitations =
    Array.isArray(profile.limitations) && profile.limitations.length > 0;

  const whyThisFits = buildWhyThisFits(
    profile,
    planKey,
    sessionShort,
    hasLimitations,
    plan.days.length
  );

  const createdAt = new Date().toISOString();
  const versionId = `v_${Date.now()}`;

  if (plan.days.length !== profile.daysPerWeek) {
    throw new Error(
      `Plan days length ${plan.days.length} does not match profile.daysPerWeek ${profile.daysPerWeek}`
    );
  }

  return {
    profile,
    plan,
    nutrition,
    whyThisFits,
    createdAt,
    versionId,
  };
}
