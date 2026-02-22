// Profile collected during onboarding
export type Goal = "fat_loss" | "muscle_gain" | "strength";
export type DaysPerWeek = 1 | 2 | 3 | 4 | 5 | 6 | 7;
export type SessionMinutes = 20 | 30 | 45 | 60;
export type Experience = "beginner" | "intermediate";
export type Equipment = "full_gym" | "dumbbells" | "bands" | "bodyweight";
export type Limitation = "knee" | "lower_back" | "shoulder";
export type DietPreference = "veg" | "non_veg" | "eggetarian";
export type MealsPerDay = 2 | 3 | 4;

export interface Profile {
  goal: Goal;
  daysPerWeek: DaysPerWeek;
  sessionMinutes: SessionMinutes;
  experience: Experience;
  equipment: Equipment;
  limitations: Limitation[];
  dietPreference: DietPreference;
  mealsPerDay: MealsPerDay;
}

// Plan template (stored in /data/plans)
export interface ExerciseEntry {
  name: string;
  sets: number;
  reps: string; // e.g. "8-10" or "10"
  restSec: number;
  notes?: string;
}

export interface PlanDay {
  dayName: string;
  focus: string;
  warmup: ExerciseEntry[];
  main: ExerciseEntry[];
  accessories: ExerciseEntry[];
  cooldown: ExerciseEntry[];
}

export interface PlanTemplate {
  title: string;
  tags: {
    goal: Goal;
    days: DaysPerWeek;
    experience: Experience;
    equipment: Equipment;
  };
  days: PlanDay[];
  progressionNotes: string;
}

// Nutrition template (stored in /data/nutrition)
export interface NutritionTemplate {
  title: string;
  goal: Goal | "any";
  dietPreference: DietPreference | "any";
  plateMethod: string;
  hydration: string;
  sampleMeals: string[];
  grocerySuggestions: string[];
  disclaimer: string;
  /** Protein sources that match diet (e.g. veg: lentils, tofu). Optional. */
  proteinSources?: string[];
  /** Short meal ideas. Optional. */
  mealIdeas?: string[];
}

// Full generated plan returned by the rules engine
export interface GeneratedPlan {
  profile: Profile;
  plan: PlanTemplate;
  nutrition: NutritionTemplate;
  whyThisFits: string[];
  createdAt: string; // ISO
  versionId: string;
  /** Week number (1-based). Default 1 when omitted. */
  weekNumber?: number;
  /** Set when this plan was created by editing another plan. */
  originalVersionId?: string;
  /** Set when this plan was created by editing; same as versionId. */
  editedVersionId?: string;
  /** Human-readable summary of edit (e.g. "Removed Day 3; Added Day 4 (Conditioning)"). */
  editSummary?: string;
}

/** Edit plan request: remove days by index and/or add up to one extra day. */
export interface PlanEdits {
  /** Zero-based indexes of days to remove. */
  removeDayIndexes?: number[];
  /** Number of days to add (0 or 1). */
  addDays?: number;
}

/** Completion state per plan version: array of booleans, one per day index. */
export type CompletionState = boolean[];
