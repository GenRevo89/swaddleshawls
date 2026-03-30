import { NextResponse } from "next/server";
import { getReceiptStatus } from "@/lib/surge";

// GET — Server-side proxy for BasaltSurge receipt status polling.
// The browser must never call Surge directly (APIM key is secret).
export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const receiptId = searchParams.get("receiptId");

        if (!receiptId) {
            return NextResponse.json(
                { error: "missing_receiptId" },
                { status: 400 }
            );
        }

        const data = await getReceiptStatus(receiptId);
        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error("Error checking receipt status:", error);
        return NextResponse.json(
            { error: "Failed to check receipt status" },
            { status: 500 }
        );
    }
}
