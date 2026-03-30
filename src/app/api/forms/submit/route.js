import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Contact from "@/models/Contact";

export async function POST(req) {
    try {
        const formData = await req.formData();

        const data = {};
        for (const [key, value] of formData.entries()) {
            data[key] = value;
        }

        await connectToDatabase();

        await Contact.create({
            name: data.full_name || data.name || "Unknown",
            email: data.email || "",
            category: data.inquiry_type || data.form_slug || "General",
            message: data.message || "",
        });

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error("Error submitting form:", error);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}
