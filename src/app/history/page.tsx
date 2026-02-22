"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { AppNav } from "@/components/AppNav";
import { IconTrophy, IconFlame, IconBell, IconWeight, IconChevronRight, IconTrash } from "@/components/Icons";
import { localStorageRepository } from "@/lib/planRepository";
import type { GeneratedPlan } from "@/types";

const ACHIEVEMENTS = [
  {
    icon: IconBell,
    title: "Early Bird",
    desc: "Complete 5 workouts before 8 AM.",
  },
  {
    icon: IconFlame,
    title: "On Fire",
    desc: "Maintain a 3-week streak without missing a day.",
  },
  {
    icon: IconWeight,
    title: "Volume King",
    desc: "Lift 10,000 lbs total volume in your last plan.",
  },
];

export default function HistoryPage() {
  const [plans, setPlans] = useState<GeneratedPlan[]>(() => {
    try {
      const list = localStorageRepository.getAllPlans();
      return Array.isArray(list) ? list : [];
    } catch {
      return [];
    }
  });
  const activePlan = plans[0] ?? null;
  const pastPlans = plans.slice(1);

  const removeFromHistory = useCallback((versionId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    localStorageRepository.deletePlan(versionId);
    setPlans(localStorageRepository.getAllPlans());
  }, []);

  // Real stats from completion state
  const plansCreated = plans.length;
  const workoutsCompleted = plans.reduce((total, plan) => {
    const completed = localStorageRepository.getCompletion(plan.versionId);
    if (!completed) return total;
    return total + completed.filter(Boolean).length;
  }, 0);
  const currentPlanProgress = activePlan
    ? (() => {
        const completed = localStorageRepository.getCompletion(activePlan.versionId);
        const total = activePlan.plan.days.length;
        const done = completed ? completed.filter(Boolean).length : 0;
        return `${done}/${total} days`;
      })()
    : "—";

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <AppNav />

      <main id="main-content" className="mx-auto max-w-6xl px-4 py-8" tabIndex={-1} aria-label="Progress and history">
        <p className="text-sm text-neutral-500">Your Journey</p>
        <h1 className="mt-1 text-3xl font-bold text-white">Progress & History</h1>

        <nav className="mt-6 flex gap-6 border-b border-surface-border">
          <Link
            href="/plan"
            className="border-b-2 border-transparent pb-3 text-sm font-medium text-neutral-400 hover:text-white"
          >
            Workouts
          </Link>
          <Link
            href="/plan?tab=nutrition"
            className="border-b-2 border-transparent pb-3 text-sm font-medium text-neutral-400 hover:text-white"
          >
            Nutrition
          </Link>
          <span className="border-b-2 border-accent pb-3 text-sm font-medium text-white">
            Progress
          </span>
        </nav>

        <div className="mt-8 flex gap-8">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold text-white">Key Statistics</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Card>
                <p className="text-sm text-neutral-400">Plans Created</p>
                <p className="mt-1 text-2xl font-bold text-white">{plansCreated}</p>
              </Card>
              <Card>
                <p className="text-sm text-neutral-400">Workouts Completed</p>
                <p className="mt-1 text-2xl font-bold text-white">{workoutsCompleted}</p>
              </Card>
              <Card>
                <p className="text-sm text-neutral-400">Current plan</p>
                <p className="mt-1 text-2xl font-bold text-white">{currentPlanProgress}</p>
              </Card>
            </div>

            <h2 className="mt-10 text-lg font-semibold text-white">Previous Plans</h2>
            <div className="mt-4 space-y-3">
              {plans.length === 0 ? (
                <Card>
                  <p className="text-neutral-400">No plans yet. Generate your first plan to see it here.</p>
                  <Link href="/onboarding" className="mt-4 inline-block">
                    <Button>Find my plan</Button>
                  </Link>
                </Card>
              ) : (
                <>
                  {activePlan && (
                    <Card className="border-accent transition hover:border-accent/80">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <Link href={`/plan?version=${activePlan.versionId}`} className="min-w-0 flex-1">
                          <div>
                            <p className="text-xs text-neutral-500">
                              Active Plan • Started{" "}
                              {new Date(activePlan.createdAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </p>
                            <p className="mt-1 font-semibold text-white">
                              Week {activePlan.weekNumber ?? 1}: {activePlan.plan.title.split("–")[0]?.trim() || activePlan.plan.title}
                            </p>
                            <div className="mt-2 flex flex-wrap gap-2">
                              <Badge>{activePlan.profile.goal.replace("_", " ")}</Badge>
                              <Badge>{activePlan.profile.daysPerWeek} Days</Badge>
                              <Badge>{activePlan.profile.equipment.replace("_", " ")}</Badge>
                            </div>
                          </div>
                        </Link>
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/plan?version=${activePlan.versionId}`}
                            className="flex items-center gap-1 text-sm text-neutral-400 hover:text-accent"
                          >
                            View Current
                            <IconChevronRight />
                          </Link>
                          <button
                            type="button"
                            onClick={(e) => removeFromHistory(activePlan.versionId, e)}
                            className="rounded p-1.5 text-neutral-500 hover:bg-red-500/20 hover:text-red-400"
                            title="Remove from history"
                          >
                            <IconTrash />
                          </button>
                        </div>
                      </div>
                    </Card>
                  )}
                  {pastPlans.map((plan) => (
                    <Card key={plan.versionId} className="transition hover:border-accent/50">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <Link href={`/plan?version=${plan.versionId}`} className="min-w-0 flex-1">
                          <div>
                            <p className="text-xs text-neutral-500">
                              {new Date(plan.createdAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </p>
                            <p className="mt-1 font-semibold text-white">
                              Week {plan.weekNumber ?? 1}: {plan.plan.title.split("–")[0]?.trim() || plan.plan.title}
                            </p>
                            <div className="mt-2 flex flex-wrap gap-2">
                              <Badge>{plan.profile.goal.replace("_", " ")}</Badge>
                              <Badge>{plan.profile.daysPerWeek} Days</Badge>
                              <Badge>{plan.profile.equipment.replace("_", " ")}</Badge>
                            </div>
                          </div>
                        </Link>
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/plan?version=${plan.versionId}`}
                            className="flex items-center gap-1 text-sm text-neutral-400 hover:text-accent"
                          >
                            View Details
                            <IconChevronRight />
                          </Link>
                          <button
                            type="button"
                            onClick={(e) => removeFromHistory(plan.versionId, e)}
                            className="rounded p-1.5 text-neutral-500 hover:bg-red-500/20 hover:text-red-400"
                            title="Remove from history"
                          >
                            <IconTrash />
                          </button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </>
              )}
            </div>
          </div>

          <aside className="hidden w-80 shrink-0 space-y-6 lg:block">
            <div className="sticky top-24 space-y-6">
              <Card className="border-accent/20 bg-surface">
                <h3 className="flex items-center gap-2 font-semibold text-white">
                  <IconTrophy />
                  Achievements
                </h3>
                <ul className="mt-3 space-y-3">
                  {ACHIEVEMENTS.map((a) => (
                    <li key={a.title} className="flex gap-3 text-sm">
                      <a.icon className="mt-0.5 shrink-0" />
                      <div>
                        <p className="font-medium text-white">{a.title}</p>
                        <p className="mt-0.5 text-neutral-400">{a.desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </Card>

            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
