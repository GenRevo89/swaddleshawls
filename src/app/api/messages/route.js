import { NextResponse } from "next/server";
import { getMessages, receiveMessage, getContactByEmail } from "@/lib/crm";

// GET /api/messages?email=...&conversation_id=...
// Without conversation_id: returns all messages grouped into conversations
// With conversation_id: returns messages for that specific thread
export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const email = searchParams.get("email");
        const conversationId = searchParams.get("conversation_id");

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        // Resolve contact
        const contactResult = await getContactByEmail(email.toLowerCase().trim());
        let contactId = null;
        if (Array.isArray(contactResult) && contactResult.length > 0) {
            contactId = contactResult[0]._id || contactResult[0].id;
        } else if (contactResult && (contactResult._id || contactResult.id)) {
            contactId = contactResult._id || contactResult.id;
        }

        // Fetch messages
        const params = {};
        if (conversationId) {
            params.conversation_id = conversationId;
        } else if (contactId) {
            params.contactId = contactId;
        } else {
            params.email = email.toLowerCase().trim();
        }

        const messages = await getMessages(params);
        const list = Array.isArray(messages) ? messages : messages?.data || [];

        if (conversationId) {
            // Return thread messages directly
            return NextResponse.json({ success: true, data: list }, { status: 200 });
        }

        // Group into conversations
        const convMap = {};
        for (const msg of list) {
            const cid = msg.conversation_id || msg.conversationId || "default";
            if (!convMap[cid]) {
                convMap[cid] = {
                    conversation_id: cid,
                    subject: msg.subject || "General",
                    lastMessage: msg.body || msg.message || "",
                    lastDate: msg.createdAt || msg.created_at,
                    messageCount: 0,
                    messages: [],
                };
            }
            convMap[cid].messages.push(msg);
            convMap[cid].messageCount++;
            // Update latest
            const msgDate = new Date(msg.createdAt || msg.created_at || 0);
            const curDate = new Date(convMap[cid].lastDate || 0);
            if (msgDate > curDate) {
                convMap[cid].lastMessage = msg.body || msg.message || "";
                convMap[cid].lastDate = msg.createdAt || msg.created_at;
                if (msg.subject) convMap[cid].subject = msg.subject;
            }
        }

        // Sort conversations by most recent first
        const conversations = Object.values(convMap).sort(
            (a, b) => new Date(b.lastDate || 0) - new Date(a.lastDate || 0)
        );

        return NextResponse.json({ success: true, data: conversations }, { status: 200 });
    } catch (error) {
        console.error("Error fetching messages:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch messages" },
            { status: 500 }
        );
    }
}

// POST /api/messages — Client sends a message (inbound to CRM)
export async function POST(req) {
    try {
        const body = await req.json();
        const { email, subject, message, conversation_id } = body;

        if (!email || !message) {
            return NextResponse.json(
                { error: "Email and message are required" },
                { status: 400 }
            );
        }

        // Use provided conversation_id or generate a new one for new conversations
        const cid = conversation_id || `shop_${Date.now().toString(36)}`;

        const result = await receiveMessage({
            email: email.toLowerCase().trim(),
            body: message,
            subject: subject || "Message from Client Portal",
            conversation_id: cid,
            metadata: { source: "surgeshop-portal" },
        });

        return NextResponse.json(
            { success: true, message: "Message sent!", data: result, conversation_id: cid },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error sending message:", error);
        return NextResponse.json(
            { success: false, error: "Failed to send message" },
            { status: 500 }
        );
    }
}
