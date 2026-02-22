"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/Button";
import { Stepper } from "@/components/Stepper";
import { Card } from "@/components/Card";
import { OptionGroup } from "@/components/OptionGroup";
import type { Profile, Goal, DaysPerWeek, SessionMinutes, Experience, Equipment, Limitation, DietPreference, MealsPerDay } from "@/types";
import { localStorageRepository } from "@/lib/planRepository";

const STEPS = [
  { id: "goal", label: "Goal" },
  { id: "schedule", label: "Schedule" },
  { id: "level", label: "Level" },
  { id: "limits", label: "Limits" },
  { id: "diet", label: "Diet" },
  { id: "summary", label: "Summary" },
];

const defaultProfile: Profile = {
  goal: "fat_loss",
  daysPerWeek: 3,
  sessionMinutes: 30,
  experience: "beginner",
  equipment: "dumbbells",
  limitations: [],
  dietPreference: "veg",
  mealsPerDay: 3,
};

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<Profile>(defaultProfile);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorageRepository.getProfile();
    if (saved) setProfile(saved);
  }, []);

  const update = (patch: Partial<Profile>) => setProfile((p) => ({ ...p, ...patch }));

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(typeof data?.error === "string" ? data.error : "Failed to generate plan");
      }
      const plan = data;
      if (!plan?.versionId || !plan?.plan?.days || !Array.isArray(plan.plan.days)) {
        throw new Error("Invalid plan response");
      }
      try {
        localStorageRepository.saveProfile(profile);
        localStorageRepository.savePlan(plan);
      } catch {
        // Storage may be full or unavailable; still navigate so user sees their plan
      }
      router.push(`/plan?version=${plan.versionId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const toggleLimitation = (l: Limitation) => {
    setProfile((p) => ({
      ...p,
      limitations: p.limitations.includes(l)
        ? p.limitations.filter((x) => x !== l)
        : [...p.limitations, l],
    }));
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-12 px-4">
      <main id="main-content" className="mx-auto max-w-2xl" tabIndex={-1} aria-label="Set up your plan">
        <div className="mb-8 flex items-center justify-between">
          <Link href="/" className="text-accent hover:underline">
            ← Back
          </Link>
          <span className="text-neutral-500" aria-live="polite">Step {step + 1} of {STEPS.length}</span>
        </div>

        <Stepper steps={STEPS} currentStep={step}>
          {step === 0 && (
            <Card>
              <h3 id="goal-heading" className="text-lg font-semibold text-white">What’s your main goal?</h3>
              <div className="mt-4 flex flex-col gap-2" role="radiogroup" aria-labelledby="goal-heading">
                {(["fat_loss", "muscle_gain", "strength"] as Goal[]).map((g) => (
                  <label
                    key={g}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition focus-within:ring-2 focus-within:ring-accent focus-within:ring-offset-2 focus-within:ring-offset-[var(--bg)] ${profile.goal === g ? "border-accent bg-accent-muted" : "border-surface-border hover:border-neutral-500"}`}
                  >
                    <input
                      type="radio"
                      name="goal"
                      value={g}
                      checked={profile.goal === g}
                      onChange={() => update({ goal: g })}
                      className="sr-only"
                      aria-label={`Goal: ${g.replace("_", " ")}`}
                    />
                    <span className="capitalize text-white">{g.replace("_", " ")}</span>
                  </label>
                ))}
              </div>
            </Card>
          )}

          {step === 1 && (
            <Card>
              <h3 className="text-lg font-semibold text-white">How often can you train?</h3>
              <div className="mt-4 space-y-4">
                <div>
                  <p id="days-label" className="mb-2 text-sm text-neutral-400">Days per week</p>
                  <OptionGroup
                    aria-label="Days per week"
                    options={([1, 2, 3, 4, 5, 6, 7] as DaysPerWeek[]).map((d) => ({ value: d, label: String(d) }))}
                    value={profile.daysPerWeek}
                    onChange={(d) => update({ daysPerWeek: d })}
                    className="flex flex-wrap gap-2"
                  />
                </div>
                <div>
                  <p className="mb-2 text-sm text-neutral-400">Session length (minutes)</p>
                  <OptionGroup
                    aria-label="Session length in minutes"
                    options={([20, 30, 45, 60] as SessionMinutes[]).map((m) => ({ value: m, label: `${m} min` }))}
                    value={profile.sessionMinutes}
                    onChange={(m) => update({ sessionMinutes: m })}
                    className="flex flex-wrap gap-2"
                  />
                </div>
              </div>
            </Card>
          )}

          {step === 2 && (
            <Card>
              <h3 className="text-lg font-semibold text-white">Experience & equipment</h3>
              <div className="mt-4 space-y-4">
                <div>
                  <p className="mb-2 text-sm text-neutral-400">Experience</p>
                  <OptionGroup
                    aria-label="Experience level"
                    options={(["beginner", "intermediate"] as Experience[]).map((e) => ({ value: e, label: e.charAt(0).toUpperCase() + e.slice(1) }))}
                    value={profile.experience}
                    onChange={(e) => update({ experience: e })}
                    className="flex gap-2"
                  />
                </div>
                <div>
                  <p className="mb-2 text-sm text-neutral-400">Equipment</p>
                  <OptionGroup
                    aria-label="Equipment available"
                    options={(["full_gym", "dumbbells", "bands", "bodyweight"] as Equipment[]).map((eq) => ({ value: eq, label: eq.replace("_", " ") }))}
                    value={profile.equipment}
                    onChange={(eq) => update({ equipment: eq })}
                    className="flex flex-wrap gap-2"
                  />
                </div>
              </div>
            </Card>
          )}

          {step === 3 && (
            <Card>
              <h3 id="limits-heading" className="text-lg font-semibold text-white">Any limitations?</h3>
              <p className="mt-1 text-sm text-neutral-400">We’ll swap in safer alternatives. Choose None if you have none. Use arrow keys to move, Enter or Space to toggle.</p>
              <div className="mt-4 flex flex-wrap gap-2" role="group" aria-labelledby="limits-heading">
                <button
                  type="button"
                  onClick={() => update({ limitations: [] })}
                  aria-pressed={profile.limitations.length === 0}
                  className={`rounded-lg border px-4 py-2 text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)] ${profile.limitations.length === 0 ? "border-accent bg-accent-muted text-accent" : "border-surface-border text-neutral-400 hover:border-neutral-500"}`}
                >
                  None
                </button>
                {(["knee", "lower_back", "shoulder"] as Limitation[]).map((l) => (
                  <button
                    key={l}
                    type="button"
                    aria-pressed={profile.limitations.includes(l)}
                    onClick={() => toggleLimitation(l)}
                    className={`rounded-lg border px-4 py-2 text-sm capitalize transition focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)] ${profile.limitations.includes(l) ? "border-accent bg-accent-muted text-accent" : "border-surface-border text-neutral-400 hover:border-neutral-500"}`}
                  >
                    {l.replace("_", " ")}
                  </button>
                ))}
              </div>
            </Card>
          )}

          {step === 4 && (
            <Card>
              <h3 className="text-lg font-semibold text-white">Diet & meals</h3>
              <div className="mt-4 space-y-4">
                <div>
                  <p className="mb-2 text-sm text-neutral-400">Diet preference</p>
                  <OptionGroup
                    aria-label="Diet preference"
                    options={(["veg", "non_veg", "eggetarian"] as DietPreference[]).map((d) => ({ value: d, label: d.replace("_", " ") }))}
                    value={profile.dietPreference}
                    onChange={(d) => update({ dietPreference: d })}
                    className="flex flex-wrap gap-2"
                  />
                </div>
                <div>
                  <p className="mb-2 text-sm text-neutral-400">Meals per day</p>
                  <OptionGroup
                    aria-label="Meals per day"
                    options={([2, 3, 4] as MealsPerDay[]).map((m) => ({ value: m, label: String(m) }))}
                    value={profile.mealsPerDay}
                    onChange={(m) => update({ mealsPerDay: m })}
                    className="flex gap-2"
                  />
                </div>
              </div>
            </Card>
          )}

          {step === 5 && (
            <Card>
              <h3 className="text-lg font-semibold text-white">Summary</h3>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-neutral-400">Goal</dt>
                  <dd className="text-white capitalize">{profile.goal.replace("_", " ")}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-neutral-400">Days/week</dt>
                  <dd className="text-white">{profile.daysPerWeek}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-neutral-400">Session</dt>
                  <dd className="text-white">{profile.sessionMinutes} min</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-neutral-400">Experience</dt>
                  <dd className="text-white capitalize">{profile.experience}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-neutral-400">Equipment</dt>
                  <dd className="text-white">{profile.equipment.replace("_", " ")}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-neutral-400">Limitations</dt>
                  <dd className="text-white">
                    {profile.limitations.length ? profile.limitations.map((l) => l.replace("_", " ")).join(", ") : "None"}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-neutral-400">Diet</dt>
                  <dd className="text-white">{profile.dietPreference.replace("_", " ")} · {profile.mealsPerDay} meals</dd>
                </div>
              </dl>
              {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
              <div className="mt-6">
                <Button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="w-full py-3"
                >
                  {loading ? "Generating…" : "Generate Plan"}
                </Button>
              </div>
            </Card>
          )}
        </Stepper>

        <div className="mt-8 flex justify-between">
          <Button
            variant="ghost"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            aria-label="Previous step"
          >
            Back
          </Button>
          {step < 5 && (
            <Button onClick={() => setStep((s) => Math.min(5, s + 1))} aria-label="Next step">
              Next
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}
