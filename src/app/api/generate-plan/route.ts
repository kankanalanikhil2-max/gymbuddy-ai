import { NextRequest, NextResponse } from "next/server";
import { isBodySizeAcceptable } from "@/lib/apiSecurity";
import { generatePlan } from "@/lib/generatePlan";
import type { Profile } from "@/types";

const ALLOWED_LIMITATIONS = ["knee", "lower_back", "shoulder"] as const;

function validateProfile(body: unknown): body is Profile {
  if (!body || typeof body !== "object") return false;
  const p = body as Record<string, unknown>;
  const goals = ["fat_loss", "muscle_gain", "strength"];
  const days = [1, 2, 3, 4, 5, 6, 7];
  const session = [20, 30, 45, 60];
  const exp = ["beginner", "intermediate"];
  const equip = ["full_gym", "dumbbells", "bands", "bodyweight"];
  const diet = ["veg", "non_veg", "eggetarian"];
  const meals = [2, 3, 4];
  if (!goals.includes(p.goal as string)) return false;
  if (!days.includes(p.daysPerWeek as number)) return false;
  if (!session.includes(p.sessionMinutes as number)) return false;
  if (!exp.includes(p.experience as string)) return false;
  if (!equip.includes(p.equipment as string)) return false;
  if (!Array.isArray(p.limitations)) return false;
  if (!p.limitations.every((x) => typeof x === "string" && ALLOWED_LIMITATIONS.includes(x as typeof ALLOWED_LIMITATIONS[number])))
    return false;
  if (!diet.includes(p.dietPreference as string)) return false;
  if (!meals.includes(p.mealsPerDay as number)) return false;
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
    if (body == null || !validateProfile(body)) {
      return NextResponse.json(
        { error: "Invalid profile: missing or invalid fields" },
        { status: 400 }
      );
    }
    const plan = generatePlan(body as Profile);
    return NextResponse.json(plan);
  } catch (e) {
    console.error("generate-plan error:", e);
    return NextResponse.json(
      { error: "Failed to generate plan" },
      { status: 500 }
    );
  }
}
