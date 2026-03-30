import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Contact from "@/models/Contact";

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, category, message } = body;

    // Validate inputs
    if (!name || !email || !category || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Connect to database
    await connectToDatabase();

    // Create a new contact inquiry
    const inquiry = await Contact.create({
      name,
      email,
      category,
      message,
    });

    return NextResponse.json(
      { success: true, message: "Message received successfully!", data: inquiry },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error submitting contact form:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
