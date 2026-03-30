import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Client from "@/models/Client";

// POST — Set password on a passwordless account
export async function POST(req) {
    try {
        const body = await req.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
        }

        if (password.length < 6) {
            return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
        }

        await connectToDatabase();

        const client = await Client.findOne({ email: email.toLowerCase().trim() }).select("+password");
        if (!client) {
            return NextResponse.json({ error: "No account found with this email" }, { status: 404 });
        }

        if (client.password && client.password.length > 10) {
            return NextResponse.json({ error: "This account already has a password. Please sign in." }, { status: 409 });
        }

        // Explicitly hash and write — don't rely on pre-save hook
        const bcrypt = (await import("bcryptjs")).default;
        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(password, salt);

        await Client.updateOne(
            { _id: client._id },
            { $set: { password: hashed } }
        );

        // Re-fetch the client without password for response
        const updated = await Client.findById(client._id);

        return NextResponse.json(
            { success: true, message: "Password set! You can now sign in.", data: updated },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error setting password:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}
