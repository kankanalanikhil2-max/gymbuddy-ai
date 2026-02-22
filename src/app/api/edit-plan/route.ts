import { NextRequest, NextResponse } from "next/server";
import { isBodySizeAcceptable } from "@/lib/apiSecurity";
import { applyPlanEdits } from "@/lib/planEdits";
import type { GeneratedPlan, PlanEdits } from "@/types";

const MAX_DAYS = 7;

function validatePlan(body: unknown): body is GeneratedPlan {
  if (!body || typeof body !== "object") return false;
  const p = body as Record<string, unknown>;
  const plan = p.plan as { days?: unknown } | undefined;
  if (!plan || typeof plan !== "object" || !Array.isArray(plan.days)) return false;
  if (plan.days.length < 1 || plan.days.length > MAX_DAYS) return false;
  if (typeof p.versionId !== "string" || p.versionId.length > 128) return false;
  return true;
}

function validateEdits(edits: unknown): edits is PlanEdits {
  if (!edits || typeof edits !== "object") return false;
  const e = edits as Record<string, unknown>;
  if (e.removeDayIndexes != null) {
    if (!Array.isArray(e.removeDayIndexes) || e.removeDayIndexes.length > MAX_DAYS) return false;
    if (!e.removeDayIndexes.every((i) => typeof i === "number" && Number.isInteger(i) && i >= 0)) return false;
  }
  if (e.addDays != null && (typeof e.addDays !== "number" || e.addDays < 0 || e.addDays > 1))
    return false;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    if (!isBodySizeAcceptable(request)) {
      return NextResponse.json(
        { error: "Request body too large" },
        { status: 413 }
      );
    }
    const body = await request.json().catch(() => null);
    const { plan: submittedPlan, edits } = body ?? {};
    if (!validatePlan(submittedPlan)) {
      return NextResponse.json(
        { error: "Invalid plan: missing or invalid plan object" },
        { status: 400 }
      );
    }
    if (!validateEdits(edits)) {
      return NextResponse.json(
        { error: "Invalid edits: removeDayIndexes (number[]) and/or addDays (0 or 1)" },
        { status: 400 }
      );
    }
    const updated = applyPlanEdits(submittedPlan as GeneratedPlan, edits as PlanEdits);
    if (updated.plan.days.length > 7) {
      return NextResponse.json(
        { error: "A week has at most 7 days." },
        { status: 400 }
      );
    }
    return NextResponse.json(updated);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to edit plan";
    console.error("edit-plan error:", e);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
