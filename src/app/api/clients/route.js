import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Client from "@/models/Client";

// GET — Fetch client profile by email (requires auth — called after login)
export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const email = searchParams.get("email");

        if (!email) {
            return NextResponse.json({ error: "Email query parameter is required" }, { status: 400 });
        }

        await connectToDatabase();
        const client = await Client.findOne({ email: email.toLowerCase().trim() });

        if (!client) {
            return NextResponse.json({ success: true, data: null }, { status: 200 });
        }

        return NextResponse.json({ success: true, data: client }, { status: 200 });
    } catch (error) {
        console.error("Error fetching client:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}

// POST — Update client profile (password not changed here)
export async function POST(req) {
    try {
        const body = await req.json();
        const { email, name, phone, avatar, bio, address, dateOfBirth, goals } = body;

        if (!email || !name) {
            return NextResponse.json({ error: "Email and name are required" }, { status: 400 });
        }

        await connectToDatabase();

        const updateData = { name: name.trim() };
        if (phone !== undefined) updateData.phone = phone;
        if (avatar !== undefined) updateData.avatar = avatar;
        if (bio !== undefined) updateData.bio = bio;
        if (address !== undefined) updateData.address = address;
        if (dateOfBirth !== undefined) updateData.dateOfBirth = dateOfBirth;
        if (goals !== undefined) updateData.goals = goals;

        const client = await Client.findOneAndUpdate(
            { email: email.toLowerCase().trim() },
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!client) {
            return NextResponse.json({ error: "Client not found" }, { status: 404 });
        }

        return NextResponse.json(
            { success: true, message: "Profile saved!", data: client },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error saving client profile:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}
