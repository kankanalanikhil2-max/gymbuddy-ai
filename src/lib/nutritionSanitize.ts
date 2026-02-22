/**
 * Ensure nutrition output respects diet preference: no meat/fish/eggs in veg,
 * no meat/fish in eggetarian. Scans text and replaces/removes forbidden items.
 */
import type { NutritionTemplate } from "@/types";
import type { DietPreference } from "@/types";

const FORBIDDEN_VEG: RegExp[] = [
  /\bchicken\b/gi,
  /\bfish\b/gi,
  /\bmeat\b/gi,
  /\bbeef\b/gi,
  /\bpork\b/gi,
  /\bturkey\b/gi,
  /\bseafood\b/gi,
  /\begg(s)?\b/gi,
];

const FORBIDDEN_EGGETARIAN: RegExp[] = [
  /\bchicken\b/gi,
  /\bfish\b/gi,
  /\bmeat\b/gi,
  /\bbeef\b/gi,
  /\bpork\b/gi,
  /\bturkey\b/gi,
  /\bseafood\b/gi,
];

function sanitizeText(text: string, forbidden: RegExp[]): string {
  let out = text;
  for (const re of forbidden) {
    out = out.replace(re, (match) => {
      if (match.toLowerCase() === "eggs" || match.toLowerCase() === "egg")
        return "tofu scramble or plant-based options";
      return "plant-based protein";
    });
  }
  return out.replace(/\s{2,}/g, " ").trim();
}

function sanitizeArray(arr: string[], forbidden: RegExp[]): string[] {
  return arr
    .map((s) => sanitizeText(s, forbidden))
    .filter((s) => s.length > 0 && !/^[\s,;]+$/.test(s));
}

/**
 * Returns a copy of the nutrition template with forbidden items removed/replaced
 * so veg never sees meat/fish/eggs and eggetarian never sees meat/fish.
 */
export function sanitizeNutritionForDiet(
  template: NutritionTemplate,
  dietPreference: DietPreference
): NutritionTemplate {
  if (dietPreference === "non_veg") return { ...template };

  const forbidden =
    dietPreference === "veg" ? FORBIDDEN_VEG : FORBIDDEN_EGGETARIAN;

  return {
    ...template,
    title: sanitizeText(template.title, forbidden),
    plateMethod: sanitizeText(template.plateMethod, forbidden),
    hydration: sanitizeText(template.hydration, forbidden),
    sampleMeals: sanitizeArray(template.sampleMeals, forbidden),
    grocerySuggestions: sanitizeArray(template.grocerySuggestions, forbidden),
    disclaimer: template.disclaimer,
    proteinSources: template.proteinSources
      ? sanitizeArray(template.proteinSources, forbidden)
      : undefined,
    mealIdeas: template.mealIdeas
      ? sanitizeArray(template.mealIdeas, forbidden)
      : undefined,
  };
}
