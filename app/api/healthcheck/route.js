import { NextResponse } from "next/server";

// health check
// GET /api/healthcheck
export async function GET(req) {
    return NextResponse.json({ status: "ok" }, { status: 200 });
}
