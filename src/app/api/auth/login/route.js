import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Client from "@/models/Client";

// POST — Login with email and password
export async function POST(req) {
    try {
        const body = await req.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json(
                { error: "Email and password are required" },
                { status: 400 }
            );
        }

        await connectToDatabase();

        const client = await Client.findOne({ email: email.toLowerCase().trim() }).select("+password");
        if (!client) {
            return NextResponse.json(
                { error: "No account found with this email" },
                { status: 401 }
            );
        }

        // Detect passwordless account (created via checkout)
        // password can be undefined, null, or "" — all mean no password set
        // A bcrypt hash always starts with "$2" and is 60 chars
        if (!client.password || client.password.length < 10) {
            return NextResponse.json(
                { error: "PASSWORD_REQUIRED", message: "This account was created at checkout. Please set a password to continue." },
                { status: 403 }
            );
        }

        const isMatch = await client.comparePassword(password);
        if (!isMatch) {
            return NextResponse.json(
                { error: "Incorrect password" },
                { status: 401 }
            );
        }

        return NextResponse.json(
            { success: true, message: "Welcome back!", data: client },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error logging in:", error);
        return NextResponse.json(
            { success: false, error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
