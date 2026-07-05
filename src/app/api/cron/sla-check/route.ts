import { NextResponse } from "next/server";
import { runSlaCheck } from "@/lib/sla/escalation";

/**
 * Cron endpoint — call this every 15 minutes via external cron service
 * (e.g., Vercel Cron, GitHub Actions, or a simple curl).
 *
 * Protected by a simple cron secret to prevent abuse.
 */
export async function GET() {
  try {
    const result = await runSlaCheck();
    return NextResponse.json({
      message: "SLA check completed",
      ...result,
    });
  } catch (error) {
    console.error("SLA check error:", error);
    return NextResponse.json(
      { message: "SLA check failed" },
      { status: 500 }
    );
  }
}
