import { NextRequest, NextResponse } from "next/server";
import { isBodySizeAcceptable } from "@/lib/apiSecurity";
import { applyWeekProgression } from "@/lib/weekProgression";
import type { GeneratedPlan } from "@/types";

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

export async function POST(request: NextRequest) {
  try {
    if (!isBodySizeAcceptable(request)) {
      return NextResponse.json(
        { error: "Request body too large" },
        { status: 413 }
      );
    }
    const body = await request.json().catch(() => null);
    if (body == null || !validatePlan(body)) {
      return NextResponse.json(
        { error: "Invalid plan: missing or invalid plan object" },
        { status: 400 }
      );
    }
    const nextPlan = applyWeekProgression(body as GeneratedPlan);
    return NextResponse.json(nextPlan);
  } catch (e) {
    console.error("next-week error:", e);
    return NextResponse.json(
      { error: "Failed to generate next week plan" },
      { status: 500 }
    );
  }
}
