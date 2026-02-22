import { NextResponse } from "next/server";

/**
 * Health check endpoint for load balancers and AWS App Runner.
 * GET /api/health returns 200 when the app is ready to serve traffic.
 */
export async function GET() {
  return NextResponse.json(
    { status: "ok", service: "gymbuddy-ai" },
    { status: 200 }
  );
}
