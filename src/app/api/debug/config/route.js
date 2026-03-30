import { NextResponse } from "next/server";

// Returns debug/testing flags for the frontend.
// Only exposes the TESTING flag — nothing sensitive.
export async function GET() {
    return NextResponse.json({
        debug: process.env.TESTING === "TRUE",
    });
}
