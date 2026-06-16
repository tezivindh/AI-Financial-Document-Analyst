import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "AI Financial Analyst Backend Running",
    timestamp: new Date().toISOString(),
  });
}
