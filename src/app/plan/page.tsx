"use client";

import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useMemo, useState, useEffect, Suspense, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { AppNav } from "@/components/AppNav";
import {
  IconCalendar,
  IconDumbbell,
  IconChart,
  IconCheck,
  IconApple,
  IconRefresh,
  IconChevronDown,
  IconChevronRight,
  IconTrash,
  IconPencil,
} from "@/components/Icons";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { localStorageRepository } from "@/lib/planRepository";
import type { GeneratedPlan, PlanEdits, CompletionState } from "@/types";
import type { PlanDay, ExerciseEntry } from "@/types";

type Tab = "workouts" | "nutrition" | "progress";
const TABS: Tab[] = ["workouts", "nutrition", "progress"];

function estimateMinutes(day: PlanDay): number {
  const totalSets =
    day.warmup.reduce((s, e) => s + e.sets, 0) +
    day.main.reduce((s, e) => s + e.sets, 0) +
    day.accessories.reduce((s, e) => s + e.sets, 0) +
    day.cooldown.reduce((s, e) => s + e.sets, 0);
  const rest = day.main.reduce((s, e) => s + e.sets * (e.restSec || 60), 0);
  return Math.round(totalSets * 1.5 + rest / 60) || 45;
}

function PlanContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const versionId = searchParams.get("version");

  const [plan, allPlans] = useMemo(() => {
    try {
      const list = localStorageRepository.getAllPlans();
      const target = versionId
        ? list.find((p) => p?.versionId === versionId)
        : list[0];
      return [target ?? null, Array.isArray(list) ? list : []];
    } catch {
      return [null, []];
    }
  }, [versionId]);

  const [completion, setCompletionState] = useState<CompletionState>([]);
  useEffect(() => {
    if (!plan?.versionId) return;
    const stored = localStorageRepository.getCompletion(plan.versionId);
    const len = plan?.plan?.days?.length ?? 0;
    if (stored && stored.length === len) {
      setCompletionState(stored);
    } else {
      setCompletionState(Array(len).fill(false));
    }
  }, [plan?.versionId, plan?.plan?.days?.length]);

  const setCompletion = useCallback(
    (index: number, value: boolean) => {
      if (!plan?.versionId) return;
      try {
        const next = [...completion];
        next[index] = value;
        setCompletionState(next);
        localStorageRepository.setCompletion(plan.versionId, next);
      } catch {
        setCompletionState((prev) => prev);
      }
    },
    [plan?.versionId, completion]
  );

  const tabParam = searchParams.get("tab");
  const initialTab: Tab =
    tabParam === "nutrition" || tabParam === "progress" ? tabParam : "workouts";
  const [tab, setTab] = useState<Tab>(initialTab);
  const [expandedDay, setExpandedDay] = useState<number>(0);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editRemoveSet, setEditRemoveSet] = useState<Set<number>>(new Set());
  const [editAddDays, setEditAddDays] = useState(0);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [nextWeekModalOpen, setNextWeekModalOpen] = useState(false);
  const [nextWeekLoading, setNextWeekLoading] = useState(false);
  const [nextWeekError, setNextWeekError] = useState<string | null>(null);

  const totalDays = plan?.plan?.days?.length ?? 0;
  const completedCount = completion.filter(Boolean).length;
  const allComplete = totalDays > 0 && completedCount === totalDays;

  useEffect(() => {
    if (allComplete && totalDays > 0) {
      setNextWeekModalOpen(true);
      setNextWeekError(null);
    }
  }, [allComplete, totalDays]);

  const handleEditSave = async () => {
    if (!plan) return;
    setEditLoading(true);
    setEditError(null);
    try {
      const removeDayIndexes = [...editRemoveSet].sort((a, b) => a - b);
      const edits: PlanEdits = {
        removeDayIndexes: removeDayIndexes.length ? removeDayIndexes : undefined,
        addDays: editAddDays || undefined,
      };
      const res = await fetch("/api/edit-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, edits }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(typeof data?.error === "string" ? data.error : "Edit failed");
      const updated = data as GeneratedPlan;
      if (!updated?.versionId || !updated?.plan?.days) throw new Error("Invalid response");
      try {
        localStorageRepository.savePlan(updated);
      } catch {
        // still navigate so user sees the new plan in memory
      }
      setEditModalOpen(false);
      setEditRemoveSet(new Set());
      setEditAddDays(0);
      router.push(`/plan?version=${updated.versionId}`);
    } catch (e) {
      setEditError(e instanceof Error ? e.message : "Failed to save edits");
      setEditModalOpen(true);
    } finally {
      setEditLoading(false);
    }
  };

  const handleGenerateNextWeek = async () => {
    if (!plan) return;
    setNextWeekLoading(true);
    try {
      const res = await fetch("/api/next-week", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(plan),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(typeof data?.error === "string" ? data.error : "Failed to generate");
      const nextPlan = data as GeneratedPlan;
      if (!nextPlan?.versionId) throw new Error("Invalid response");
      try {
        localStorageRepository.savePlan(nextPlan);
      } catch {
        // still redirect
      }
      setNextWeekModalOpen(false);
      router.push(`/plan?version=${nextPlan.versionId}`);
    } catch (e) {
      setNextWeekModalOpen(false);
      setNextWeekError(e instanceof Error ? e.message : "Failed to generate next week");
    } finally {
      setNextWeekLoading(false);
    }
  };

  if (!plan) {
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <AppNav />
        <main id="main-content" className="py-20 px-4 text-center" tabIndex={-1} aria-label="No plan">
          <p className="text-neutral-400">No plan found. Generate one first.</p>
          <Link href="/onboarding" className="mt-4 inline-block">
            <Button>Go to onboarding</Button>
          </Link>
        </main>
      </div>
    );
  }

  const { profile, plan: template, nutrition, whyThisFits } = plan;
  const days = Array.isArray(template?.days) ? template.days : [];
  const weekNum = plan.weekNumber ?? 1;
  const programTitle =
    weekNum > 1
      ? `Week ${weekNum}: ${template?.title?.split("–")[0]?.trim() || profile.goal.replace("_", " ")}`
      : template?.title || `Week ${weekNum}: ${profile.goal.replace("_", " ")}`;

  const daysAfterRemoval = days.length - editRemoveSet.size;
  const totalDaysAfterEdit = daysAfterRemoval + editAddDays;
  const atMaxDays = totalDaysAfterEdit >= 7;
  const canAddDay = editAddDays < 1 && daysAfterRemoval < 7;
  const editSummaryParts: string[] = [];
  if (editRemoveSet.size > 0)
    editSummaryParts.push(`Remove ${[...editRemoveSet].sort((a, b) => a - b).map((i) => `Day ${i + 1}`).join(", ")}`);
  if (editAddDays > 0) editSummaryParts.push("Add 1 day (Conditioning & Core)");
  const editSummary = editSummaryParts.length ? editSummaryParts.join("; ") : "No changes";

  const editModalRef = useFocusTrap(editModalOpen, () => {
    setEditModalOpen(false);
    setEditRemoveSet(new Set());
    setEditAddDays(0);
    setEditError(null);
  });
  const nextWeekModalRef = useFocusTrap(nextWeekModalOpen, () => {
    setNextWeekModalOpen(false);
    setNextWeekError(null);
  });

  const handleTabKeyDown = useCallback(
    (e: React.KeyboardEvent, index: number) => {
      let nextIndex = index;
      if (e.key === "ArrowLeft" || e.key === "Home") {
        e.preventDefault();
        nextIndex = e.key === "Home" ? 0 : Math.max(0, index - 1);
      } else if (e.key === "ArrowRight" || e.key === "End") {
        e.preventDefault();
        nextIndex = e.key === "End" ? TABS.length - 1 : Math.min(TABS.length - 1, index + 1);
      } else return;
      const nextTab = TABS[nextIndex];
      setTab(nextTab);
      // Move focus to the newly selected tab so keyboard user stays in the tablist
      requestAnimationFrame(() => {
        document.getElementById(`tab-${nextTab}`)?.focus();
      });
    },
    []
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <AppNav />

      <main id="main-content" className="mx-auto max-w-6xl px-4 py-8" tabIndex={-1} aria-label="Your plan">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-neutral-500">Current Program</p>
            <h1 className="mt-1 text-3xl font-bold text-white">{programTitle}</h1>
          </div>
          <div className="flex items-center gap-3">
            {tab === "workouts" && totalDays > 0 && (
              <p className="text-sm text-neutral-400">
                <span className="font-medium text-accent">{completedCount}</span>/{totalDays} days completed
              </p>
            )}
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => {
                setEditModalOpen(true);
                setEditRemoveSet(new Set());
                setEditAddDays(0);
                setEditError(null);
              }}
            >
              <IconPencil />
              Edit plan
            </Button>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge className="flex items-center gap-1.5">
            <IconChart className="text-neutral-500" />
            {profile.goal.replace("_", " ")}
          </Badge>
          <Badge className="flex items-center gap-1.5">
            <IconCalendar className="text-neutral-500" />
            {profile.daysPerWeek} Days/Week
          </Badge>
          <Badge className="flex items-center gap-1.5">
            <IconDumbbell className="text-neutral-500" />
            {profile.equipment === "full_gym" ? "Full Gym" : profile.equipment === "dumbbells" ? "Dumbbells Only" : profile.equipment.replace("_", " ")}
          </Badge>
          <Badge className="flex items-center gap-1.5">
            <IconChart className="text-neutral-500" />
            {profile.experience.charAt(0).toUpperCase() + profile.experience.slice(1)}
          </Badge>
        </div>

        <div
          className="mt-6 flex gap-6 border-b border-surface-border"
          role="tablist"
          aria-label="Plan sections"
        >
          {TABS.map((t, index) => (
            <button
              key={t}
              type="button"
              role="tab"
              id={`tab-${t}`}
              aria-selected={tab === t}
              aria-controls={`panel-${t}`}
              tabIndex={tab === t ? 0 : -1}
              onClick={() => setTab(t)}
              onKeyDown={(e) => handleTabKeyDown(e, index)}
              className={`border-b-2 pb-3 text-sm font-medium capitalize transition ${tab === t ? "border-accent text-white" : "border-transparent text-neutral-400 hover:text-white"}`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="mt-8 flex gap-8">
          <div className="min-w-0 flex-1">
            <div role="tabpanel" id="panel-workouts" aria-labelledby="tab-workouts" hidden={tab !== "workouts"}>
            {tab === "workouts" && (
              <div className="space-y-3">
                {days.map((day, index) => {
                  const isExpanded = expandedDay === index;
                  const mins = estimateMinutes(day);
                  const isCompleted = completion[index] === true;
                  return (
                    <Card
                      key={`${day.dayName}-${index}`}
                      className={`overflow-hidden p-0 transition ${isCompleted ? "opacity-75" : ""}`}
                    >
                      <div className="flex items-center gap-3 p-4">
                        <label className="flex shrink-0 cursor-pointer items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isCompleted}
                            onChange={(e) => setCompletion(index, e.target.checked)}
                            className="h-4 w-4 rounded border-surface-border bg-surface text-accent focus:ring-accent"
                            aria-label={`Mark ${day.dayName} as completed`}
                          />
                          <span className="text-sm text-neutral-400">Mark completed</span>
                        </label>
                        <button
                          type="button"
                          aria-expanded={isExpanded}
                          aria-controls={`day-content-${index}`}
                          id={`day-toggle-${index}`}
                          onClick={() => setExpandedDay(isExpanded ? -1 : index)}
                          className="flex flex-1 items-center justify-between text-left hover:bg-white/[0.02]"
                        >
                          <span className="font-semibold text-white">
                            {day.dayName.toUpperCase()} {day.focus}
                            {isCompleted && (
                              <Badge className="ml-2 border-accent/50 bg-accent/20 text-accent">Done</Badge>
                            )}
                          </span>
                          <span className="flex items-center gap-2 text-sm text-neutral-400">
                            {mins} mins
                            {isExpanded ? (
                              <IconChevronDown className="text-neutral-400" aria-hidden />
                            ) : (
                              <IconChevronRight className="text-neutral-400" aria-hidden />
                            )}
                          </span>
                        </button>
                      </div>
                      {isExpanded && (
                        <div id={`day-content-${index}`} className="border-t border-surface-border px-4 pb-4 pt-2" aria-labelledby={`day-toggle-${index}`}>
                          <DaySections day={day} />
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}
            </div>
            <div role="tabpanel" id="panel-nutrition" aria-labelledby="tab-nutrition" hidden={tab !== "nutrition"}>
            {tab === "nutrition" && (
              <div className="space-y-6">
                <Card>
                  <h3 className="text-lg font-semibold text-white">{nutrition.title}</h3>
                  <p className="mt-2 text-sm text-neutral-400">{nutrition.disclaimer}</p>
                </Card>
                <Card>
                  <h4 className="font-semibold text-white">Plate method</h4>
                  <p className="mt-2 text-sm text-neutral-300">{nutrition.plateMethod}</p>
                </Card>
                <Card>
                  <h4 className="font-semibold text-white">Hydration</h4>
                  <p className="mt-2 text-sm text-neutral-300">{nutrition.hydration}</p>
                </Card>
                <Card>
                  <h4 className="font-semibold text-white">Sample meals</h4>
                  <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-neutral-300">
                    {nutrition.sampleMeals.map((m, i) => (
                      <li key={i}>{m}</li>
                    ))}
                  </ul>
                </Card>
                <Card>
                  <h4 className="font-semibold text-white">Grocery suggestions</h4>
                  <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-neutral-300">
                    {nutrition.grocerySuggestions.map((g, i) => (
                      <li key={i}>{g}</li>
                    ))}
                  </ul>
                </Card>
              </div>
            )}

            </div>
            <div role="tabpanel" id="panel-progress" aria-labelledby="tab-progress" hidden={tab !== "progress"}>
            {tab === "progress" && (
              <Card>
                <p className="text-neutral-400">View your progress and plan history.</p>
                <Link href="/history" className="mt-4 inline-block">
                  <Button variant="outline">View full progress</Button>
                </Link>
              </Card>
            )}
            </div>
          </div>

          <aside className="hidden w-80 shrink-0 lg:block" aria-label="Plan summary">
            <div className="sticky top-24 space-y-6">
              <Card className="border-accent/20 bg-surface">
                <h3 className="font-semibold text-white">Why this fits you</h3>
                <ul className="mt-3 space-y-2">
                  {whyThisFits.map((bullet, i) => (
                    <li key={i} className="flex gap-2 text-sm text-neutral-300">
                      <IconCheck className="mt-0.5 shrink-0" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </Card>

              <Card className="border-accent/20 bg-surface">
                <h3 className="flex items-center gap-2 font-semibold text-white">
                  <IconApple />
                  Nutrition Goals
                </h3>
                <dl className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-neutral-400">Daily Calories</dt>
                    <dd className="text-white">
                      {profile.goal === "fat_loss" ? "~2,000" : profile.goal === "muscle_gain" ? "~2,600" : "~2,400"} kcal
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-neutral-400">Protein Goal</dt>
                    <dd className="text-white">
                      {profile.goal === "muscle_gain" ? "160–180g" : "120–150g"}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-neutral-400">Diet Type</dt>
                    <dd className="text-white capitalize">{profile.dietPreference.replace("_", " ")}</dd>
                  </div>
                </dl>
                <button
                  type="button"
                  onClick={() => setTab("nutrition")}
                  className="mt-4 w-full rounded-lg border border-surface-border bg-surface-elevated py-2 text-sm font-medium text-white hover:border-accent/50"
                  aria-label="Switch to Nutrition tab"
                >
                  View Nutrition Guide
                </button>
              </Card>

              <Button
                className="w-full gap-2 py-3"
                onClick={() => {
                  localStorageRepository.saveProfile(profile);
                  router.push("/onboarding");
                }}
              >
                <IconRefresh />
                Regenerate Plan
              </Button>
            </div>
          </aside>
        </div>
      </main>

      {/* Edit plan modal */}
      {editModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-plan-title"
          ref={editModalRef}
        >
          <Card className="max-h-[90vh] w-full max-w-lg overflow-y-auto">
            <h3 id="edit-plan-title" className="text-lg font-semibold text-white">Edit plan</h3>
            <p className="mt-1 text-sm text-neutral-400">Remove days or add one extra day. Changes create a new plan version.</p>
            <ul className="mt-4 space-y-2">
              {days.map((day, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between rounded-lg border border-surface-border bg-surface px-3 py-2"
                >
                  <span className="text-white">{day.dayName} – {day.focus}</span>
                  <button
                    type="button"
                    disabled={days.length - editRemoveSet.size <= 1 && !editRemoveSet.has(index)}
                    onClick={() =>
                      setEditRemoveSet((prev) => {
                        const next = new Set(prev);
                        if (next.has(index)) next.delete(index);
                        else if (days.length - next.size > 1) next.add(index);
                        return next;
                      })
                    }
                    className={`rounded p-1 disabled:opacity-50 ${editRemoveSet.has(index) ? "bg-red-500/20 text-red-400" : "text-neutral-400 hover:bg-white/10 hover:text-white"}`}
                    title="Remove this day"
                    aria-label={`Remove ${day.dayName}`}
                  >
                    <IconTrash aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-4">
              <Button
                variant="secondary"
                disabled={!canAddDay}
                onClick={() => setEditAddDays((d) => (d < 1 && daysAfterRemoval < 7 ? 1 : 0))}
              >
                {editAddDays >= 1 ? "Added 1 day" : "Add Day"}
              </Button>
              {atMaxDays && (
                <p className="mt-2 text-sm text-amber-400">
                  A week has 7 days maximum. Remove a day first to add a different one.
                </p>
              )}
            </div>
            <p className="mt-3 text-sm text-neutral-400">Edit summary: {editSummary}</p>
            {editError && <p className="mt-2 text-sm text-red-400">{editError}</p>}
            <div className="mt-6 flex gap-3">
              <Button variant="ghost" onClick={() => setEditModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditSave} disabled={editLoading}>
                {editLoading ? "Saving…" : "Save as new version"}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Next week modal */}
      {nextWeekModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="next-week-title"
          ref={nextWeekModalRef}
        >
          <Card className="w-full max-w-md">
            <h3 id="next-week-title" className="text-lg font-semibold text-white">Nice work — generate next week&apos;s plan?</h3>
            <p className="mt-2 text-sm text-neutral-400">
              We&apos;ll create Week {weekNum + 1} with a slight progression (e.g. one extra set or rep range bump) while keeping your preferences.
            </p>
            {nextWeekError && <p className="mt-2 text-sm text-red-400">{nextWeekError}</p>}
            <div className="mt-6 flex gap-3">
              <Button variant="ghost" onClick={() => { setNextWeekModalOpen(false); setNextWeekError(null); }}>
                Not now
              </Button>
              <Button onClick={handleGenerateNextWeek} disabled={nextWeekLoading}>
                {nextWeekLoading ? "Generating…" : `Generate Week ${weekNum + 1}`}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

function DaySections({ day }: { day: PlanDay }) {
  const mainAndAccessories = [...day.main, ...day.accessories];
  return (
    <div className="space-y-6">
      <ExerciseBlock title="WARM-UP" exercises={day.warmup} />
      <ExerciseBlock title="MAIN WORKOUT" exercises={mainAndAccessories} />
      <ExerciseBlock title="COOLDOWN" exercises={day.cooldown} />
    </div>
  );
}

function ExerciseBlock({
  title,
  exercises,
}: {
  title: string;
  exercises: ExerciseEntry[];
}) {
  if (!exercises.length) return null;
  return (
    <div>
      <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
        {title}
      </h4>
      <ul className="mt-2 space-y-3">
        {exercises.map((ex, i) => (
          <li key={i} className="flex items-start justify-between gap-4 border-b border-surface-border pb-3 last:border-0 last:pb-0">
            <div>
              <p className="font-medium text-white">{ex.name}</p>
              {ex.notes && (
                <p className="mt-0.5 text-sm text-neutral-400">{ex.notes}</p>
              )}
            </div>
            <div className="shrink-0 text-right text-sm text-neutral-500">
              <span>{ex.sets} sets</span>
              <span className="mx-1.5">·</span>
              <span>{ex.reps} reps</span>
              {ex.restSec > 0 && (
                <>
                  <span className="mx-1.5">·</span>
                  <span>{ex.restSec}s rest</span>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function PlanPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
          <p className="text-neutral-400">Loading…</p>
        </div>
      }
    >
      <PlanContent />
    </Suspense>
  );
}
