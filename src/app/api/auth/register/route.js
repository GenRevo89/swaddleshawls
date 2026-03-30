import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Client from "@/models/Client";

// POST — Register a new client
export async function POST(req) {
    try {
        const body = await req.json();
        const { email, password, name } = body;

        if (!email || !password || !name) {
            return NextResponse.json(
                { error: "Email, password, and name are required" },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: "Password must be at least 6 characters" },
                { status: 400 }
            );
        }

        await connectToDatabase();

        // Check if client already exists
        const existing = await Client.findOne({ email: email.toLowerCase().trim() });
        if (existing) {
            return NextResponse.json(
                { error: "An account with this email already exists. Please sign in." },
                { status: 409 }
            );
        }

        const client = await Client.create({
            email: email.toLowerCase().trim(),
            password,
            name: name.trim(),
        });

        return NextResponse.json(
            { success: true, message: "Account created!", data: client },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error registering client:", error);
        return NextResponse.json(
            { success: false, error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
