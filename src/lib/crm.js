// BasaltCRM API client
// Docs: https://crm.basalthq.com/public/llms.txt
// Auth: Bearer token via BASALT_CRM_KEY

const CRM_BASE = "https://crm.basalthq.com";
const CRM_KEY = process.env.BASALT_CRM_KEY;

async function crmFetch(path, options = {}) {
    if (!CRM_KEY) {
        console.warn("[CRM] Missing BASALT_CRM_KEY — skipping CRM call");
        return null;
    }

    const { method = "GET", body, params } = options;
    let url = `${CRM_BASE}${path}`;

    if (params) {
        const qs = new URLSearchParams(params).toString();
        url += `?${qs}`;
    }

    const headers = {
        Authorization: `Bearer ${CRM_KEY}`,
        "Content-Type": "application/json",
    };

    const res = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });

    const text = await res.text();
    let data;
    try {
        data = JSON.parse(text);
    } catch {
        data = text;
    }

    if (!res.ok) {
        console.error(`[CRM] ${method} ${path} failed (${res.status}):`, data);
        return null;
    }

    return data?.data || data;
}

// ── CONTACTS ──
// POST /api/v1/contacts — upserts by email
export async function upsertContact({ email, first_name, last_name, mobile_phone, tags }) {
    return crmFetch("/api/v1/contacts", {
        method: "POST",
        body: {
            email,
            first_name,
            last_name,
            ...(mobile_phone && { mobile_phone }),
            tags: tags || ["ecommerce", process.env.BRAND_CRM_TAG || "surgeshop"],
        },
    });
}

// ── ACCOUNTS ──
// POST /api/v1/accounts — upserts by name
export async function upsertAccount({ name, email, type }) {
    return crmFetch("/api/v1/accounts", {
        method: "POST",
        body: {
            name,
            email,
            type: type || "Customer",
        },
    });
}

// ── OPPORTUNITIES ──
// POST /api/v1/opportunities
export async function createOpportunity({ name, budget, sales_stage, close_date, description, type, currency, lead_source, expected_revenue, accountId, contactId }) {
    return crmFetch("/api/v1/opportunities", {
        method: "POST",
        body: {
            name,
            budget,
            currency: currency || "USD",
            lead_source: lead_source || "Website",
            ...(type && { type }),
            ...(sales_stage && { sales_stage }),
            ...(description && { description }),
            ...(expected_revenue && { expected_revenue }),
            ...(close_date && { close_date }),
            ...(accountId && { accountId }),
            ...(contactId && { contactId }),
        },
    });
}

// ── MESSAGES ──
// GET /api/v1/messages — list messages for a contact
export async function getMessages({ contactId, email, conversation_id }) {
    const params = {};
    if (contactId) params.contactId = contactId;
    if (email) params.email = email;
    if (conversation_id) params.conversation_id = conversation_id;

    return crmFetch("/api/v1/messages", { params });
}

// POST /api/v1/messages — send outbound
export async function sendMessage({ to, from, subject, body, channel, isHtml = true }) {
    return crmFetch("/api/v1/messages", {
        method: "POST",
        body: {
            to: typeof to === "string" ? { email: to } : to,
            from: from || { email: "support@swaddleshawls.com", name: "SwaddleShawls" },
            subject,
            body,
            isHtml,
            channel: channel || "email",
        },
    });
}

// POST /api/v1/messages/inbound — receive from client
export async function receiveMessage({ email, body, subject, conversation_id, metadata }) {
    return crmFetch("/api/v1/messages/inbound", {
        method: "POST",
        body: {
            email,
            body,
            subject,
            ...(conversation_id && { conversation_id }),
            ...(metadata && { metadata }),
        },
    });
}

// GET /api/v1/messages/threads/{threadId}
export async function getThread(threadId) {
    return crmFetch(`/api/v1/messages/threads/${threadId}`);
}

// ── CONTACTS LOOKUP ──
export async function getContactByEmail(email) {
    return crmFetch("/api/v1/contacts", { params: { email } });
}
