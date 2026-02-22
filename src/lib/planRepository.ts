/**
 * Plan persistence abstraction.
 * MVP: localStorage. Later swap to DynamoDB by implementing the same interface server-side.
 */
import type { GeneratedPlan, Profile, CompletionState } from "@/types";

const PLANS_KEY = "gymbuddy_plans";
const PROFILE_KEY = "gymbuddy_profile";
const COMPLETION_KEY = "gymbuddy_completion";

/** Keys that must not be used for versionId to avoid prototype pollution. */
const DANGEROUS_KEYS = new Set(["__proto__", "constructor", "prototype"]);

function isSafeStorageKey(key: string): boolean {
  return typeof key === "string" && key.length > 0 && key.length <= 128 && !DANGEROUS_KEYS.has(key);
}

export interface PlanRepository {
  savePlan(plan: GeneratedPlan): void;
  getPlan(versionId: string): GeneratedPlan | null;
  getAllPlans(): GeneratedPlan[];
  deletePlan(versionId: string): void;
  saveProfile(profile: Profile): void;
  getProfile(): Profile | null;
  getCompletion(versionId: string): CompletionState | null;
  setCompletion(versionId: string, completed: CompletionState): void;
}

function getStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  return window.localStorage;
}

function safeParsePlans(raw: string | null): GeneratedPlan[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function safeParseProfile(raw: string | null): Profile | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Profile;
  } catch {
    return null;
  }
}

/** Client-side localStorage implementation. All methods guard against throw (SSR, quota, corrupt JSON). */
export const localStorageRepository: PlanRepository = {
  savePlan(plan) {
    try {
      const storage = getStorage();
      if (!storage) return;
      const list = safeParsePlans(storage.getItem(PLANS_KEY));
      const filtered = list.filter((p) => p.versionId !== plan.versionId);
      filtered.unshift(plan);
      storage.setItem(PLANS_KEY, JSON.stringify(filtered));
    } catch {
      // ignore (e.g. quota exceeded, private mode)
    }
  },

  getPlan(versionId) {
    try {
      const storage = getStorage();
      if (!storage) return null;
      const list = safeParsePlans(storage.getItem(PLANS_KEY));
      return list.find((p) => p.versionId === versionId) ?? null;
    } catch {
      return null;
    }
  },

  getAllPlans() {
    try {
      const storage = getStorage();
      if (!storage) return [];
      return safeParsePlans(storage.getItem(PLANS_KEY));
    } catch {
      return [];
    }
  },

  deletePlan(versionId) {
    try {
      const storage = getStorage();
      if (!storage) return;
      const list = safeParsePlans(storage.getItem(PLANS_KEY));
      const filtered = list.filter((p) => p.versionId !== versionId);
      storage.setItem(PLANS_KEY, JSON.stringify(filtered));
    } catch {
      // ignore
    }
  },

  saveProfile(profile) {
    try {
      const storage = getStorage();
      if (!storage) return;
      storage.setItem(PROFILE_KEY, JSON.stringify(profile));
    } catch {
      // ignore
    }
  },

  getProfile() {
    try {
      const storage = getStorage();
      if (!storage) return null;
      return safeParseProfile(storage.getItem(PROFILE_KEY));
    } catch {
      return null;
    }
  },

  getCompletion(versionId) {
    try {
      if (!isSafeStorageKey(versionId)) return null;
      const storage = getStorage();
      if (!storage) return null;
      const raw = storage.getItem(COMPLETION_KEY);
      let map: Record<string, unknown> = {};
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed != null && typeof parsed === "object" && !Array.isArray(parsed))
          map = parsed;
      }
      const value = map[versionId];
      if (!Array.isArray(value) || !value.every((x) => typeof x === "boolean")) return null;
      return value as CompletionState;
    } catch {
      return null;
    }
  },

  setCompletion(versionId, completed) {
    try {
      if (!isSafeStorageKey(versionId)) return;
      const storage = getStorage();
      if (!storage) return;
      const raw = storage.getItem(COMPLETION_KEY);
      let map: Record<string, CompletionState> = {};
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (parsed != null && typeof parsed === "object" && !Array.isArray(parsed)) {
            for (const k of Object.keys(parsed)) {
              if (isSafeStorageKey(k) && Array.isArray(parsed[k]) && (parsed[k] as unknown[]).every((x) => typeof x === "boolean"))
                map[k] = parsed[k] as CompletionState;
            }
          }
        } catch {
          // ignore corrupt
        }
      }
      map[versionId] = completed;
      storage.setItem(COMPLETION_KEY, JSON.stringify(map));
    } catch {
      // ignore
    }
  },
};
