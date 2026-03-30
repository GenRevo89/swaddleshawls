"use client";
import React, { useState, useRef, useEffect } from "react";

export default function Portal() {
    // Auth state
    const [authMode, setAuthMode] = useState("login"); // login | register | setPassword
    const [authEmail, setAuthEmail] = useState("");
    const [authPassword, setAuthPassword] = useState("");
    const [authName, setAuthName] = useState("");
    const [authLoading, setAuthLoading] = useState(false);
    const [authError, setAuthError] = useState("");

    // Logged-in state
    const [client, setClient] = useState(null);
    const [orders, setOrders] = useState(null);
    const [activeTab, setActiveTab] = useState("orders");

    // Messaging state
    const [conversations, setConversations] = useState([]);
    const [activeConvo, setActiveConvo] = useState(null); // conversation_id
    const [threadMessages, setThreadMessages] = useState([]);
    const [messagesLoading, setMessagesLoading] = useState(false);
    const [threadLoading, setThreadLoading] = useState(false);
    const [msgSubject, setMsgSubject] = useState("");
    const [msgBody, setMsgBody] = useState("");
    const [sendingMsg, setSendingMsg] = useState(false);
    const [msgStatus, setMsgStatus] = useState("");
    const [composingNew, setComposingNew] = useState(false);

    // Profile state
    const [editMode, setEditMode] = useState(false);
    const [profileForm, setProfileForm] = useState({
        name: "", phone: "", bio: "", dateOfBirth: "",
        address: { street: "", city: "", state: "", zip: "", country: "" },
        goals: [],
    });
    const [savingProfile, setSavingProfile] = useState(false);
    const [profileMessage, setProfileMessage] = useState("");
    const [goalInput, setGoalInput] = useState("");
    const fileInputRef = useRef(null);
    const threadEndRef = useRef(null);

    // Debug mode
    const [debugMode, setDebugMode] = useState(false);
    const [syncingOrderId, setSyncingOrderId] = useState(null);
    const [syncResult, setSyncResult] = useState({});
    const [expandedOrder, setExpandedOrder] = useState(null);

    // Fetch debug config
    useEffect(() => {
        fetch("/api/debug/config").then(r => r.json()).then(d => setDebugMode(!!d.debug)).catch(() => {});
    }, []);

    // ── SESSION PERSISTENCE ──
    useEffect(() => {
        try {
            const saved = sessionStorage.getItem("portal_session");
            if (saved) {
                const data = JSON.parse(saved);
                setClient(data);
                populateProfileForm(data);
                fetchOrders(data.email);
            }
        } catch { }
    }, []);

    useEffect(() => {
        threadEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [threadMessages]);

    const saveSession = (clientData) => {
        try { sessionStorage.setItem("portal_session", JSON.stringify(clientData)); } catch { }
    };

    const clearSession = () => {
        try { sessionStorage.removeItem("portal_session"); } catch { }
    };

    // ── AUTH HANDLERS ──
    const handleLogin = async (e) => {
        e.preventDefault();
        setAuthLoading(true);
        setAuthError("");

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: authEmail, password: authPassword }),
            });
            const data = await res.json();

            if (res.ok && data.success) {
                setClient(data.data);
                populateProfileForm(data.data);
                saveSession(data.data);
                await fetchOrders(data.data.email);
            } else if (data.error === "PASSWORD_REQUIRED") {
                setAuthMode("setPassword");
                setAuthPassword("");
                setAuthError(data.message || "Please set a password to continue.");
            } else {
                setAuthError(data.error || "Login failed");
            }
        } catch {
            setAuthError("Failed to connect to server");
        } finally {
            setAuthLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setAuthLoading(true);
        setAuthError("");

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: authEmail, password: authPassword, name: authName }),
            });
            const data = await res.json();

            if (res.ok && data.success) {
                setClient(data.data);
                populateProfileForm(data.data);
                saveSession(data.data);
                setOrders([]);
            } else {
                setAuthError(data.error || "Registration failed");
            }
        } catch {
            setAuthError("Failed to connect to server");
        } finally {
            setAuthLoading(false);
        }
    };

    const handleSetPassword = async (e) => {
        e.preventDefault();
        setAuthLoading(true);
        setAuthError("");

        try {
            const res = await fetch("/api/auth/set-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: authEmail, password: authPassword }),
            });
            const data = await res.json();

            if (res.ok && data.success) {
                // Auto-login after setting password
                setClient(data.data);
                populateProfileForm(data.data);
                saveSession(data.data);
                await fetchOrders(data.data.email);
            } else {
                setAuthError(data.error || "Failed to set password");
            }
        } catch {
            setAuthError("Failed to connect to server");
        } finally {
            setAuthLoading(false);
        }
    };

    const handleSignOut = () => {
        setClient(null);
        setOrders(null);
        setAuthEmail("");
        setAuthPassword("");
        setAuthName("");
        setAuthError("");
        setActiveTab("orders");
        setEditMode(false);
        setAuthMode("login");
        clearSession();
    };

    // ── DATA HELPERS ──
    const fetchOrders = async (email) => {
        try {
            const res = await fetch(`/api/orders?email=${encodeURIComponent(email)}`);
            const data = await res.json();
            if (res.ok && data.success) setOrders(data.data);
            else setOrders([]);
        } catch {
            setOrders([]);
        }
    };

    const fetchConversations = async (email) => {
        setMessagesLoading(true);
        try {
            const res = await fetch(`/api/messages?email=${encodeURIComponent(email)}`);
            const data = await res.json();
            if (res.ok && data.success) setConversations(data.data || []);
            else setConversations([]);
        } catch {
            setConversations([]);
        } finally {
            setMessagesLoading(false);
        }
    };

    const openThread = async (convo) => {
        setActiveConvo(convo.conversation_id);
        setComposingNew(false);
        setMsgStatus("");
        // If the conversation already has messages loaded, use them
        if (convo.messages && convo.messages.length > 0) {
            setThreadMessages(convo.messages);
            return;
        }
        // Otherwise fetch from API
        setThreadLoading(true);
        try {
            const res = await fetch(`/api/messages?email=${encodeURIComponent(client.email)}&conversation_id=${encodeURIComponent(convo.conversation_id)}`);
            const data = await res.json();
            if (res.ok && data.success) setThreadMessages(data.data || []);
            else setThreadMessages([]);
        } catch {
            setThreadMessages([]);
        } finally {
            setThreadLoading(false);
        }
    };

    const startNewConversation = () => {
        setActiveConvo(null);
        setThreadMessages([]);
        setComposingNew(true);
        setMsgSubject("");
        setMsgBody("");
        setMsgStatus("");
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!msgBody.trim()) return;
        setSendingMsg(true);
        setMsgStatus("");
        try {
            const payload = {
                email: client.email,
                subject: msgSubject || "Message from Portal",
                message: msgBody,
            };
            // If replying to existing thread, include conversation_id
            if (activeConvo) payload.conversation_id = activeConvo;

            const res = await fetch("/api/messages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setMsgBody("");
                setMsgStatus("Message sent!");
                setTimeout(() => setMsgStatus(""), 3000);

                // If new conversation, set the returned conversation_id as active
                if (!activeConvo && data.conversation_id) {
                    setActiveConvo(data.conversation_id);
                    setComposingNew(false);
                }

                // Refresh conversations list and current thread
                await fetchConversations(client.email);
                if (activeConvo || data.conversation_id) {
                    const cid = activeConvo || data.conversation_id;
                    const tRes = await fetch(`/api/messages?email=${encodeURIComponent(client.email)}&conversation_id=${encodeURIComponent(cid)}`);
                    const tData = await tRes.json();
                    if (tRes.ok && tData.success) setThreadMessages(tData.data || []);
                }
            } else {
                setMsgStatus(data.error || "Failed to send message");
            }
        } catch {
            setMsgStatus("Failed to connect to server");
        } finally {
            setSendingMsg(false);
        }
    };

    const populateProfileForm = (clientData) => {
        setProfileForm({
            name: clientData.name || "",
            phone: clientData.phone || "",
            bio: clientData.bio || "",
            dateOfBirth: clientData.dateOfBirth || "",
            address: clientData.address || { street: "", city: "", state: "", zip: "", country: "" },
            goals: clientData.goals || [],
        });
    };

    // ── PROFILE HANDLERS ──
    const handleAvatarChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) { alert("Image must be under 2MB"); return; }
        const reader = new FileReader();
        reader.onload = (ev) => setClient((prev) => ({ ...prev, avatar: ev.target.result }));
        reader.readAsDataURL(file);
    };

    // Phone formatter: +1 (XXX) XXX-XXXX
    const formatPhone = (value) => {
        const digits = value.replace(/\D/g, "").slice(0, 11);
        // If they start typing without country code, assume US
        const d = digits.length > 0 && digits[0] !== "1" ? "1" + digits : digits;
        if (d.length === 0) return "";
        if (d.length <= 1) return "+1";
        if (d.length <= 4) return `+1 (${d.slice(1)}`;
        if (d.length <= 7) return `+1 (${d.slice(1, 4)}) ${d.slice(4)}`;
        return `+1 (${d.slice(1, 4)}) ${d.slice(4, 7)}-${d.slice(7, 11)}`;
    };

    const handlePhoneChange = (e) => {
        setProfileForm({ ...profileForm, phone: formatPhone(e.target.value) });
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setSavingProfile(true);
        setProfileMessage("");
        try {
            const res = await fetch("/api/clients", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: client.email,
                    name: profileForm.name,
                    phone: profileForm.phone,
                    bio: profileForm.bio,
                    dateOfBirth: profileForm.dateOfBirth,
                    address: profileForm.address,
                    goals: profileForm.goals,
                    avatar: client?.avatar || "",
                }),
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setClient(data.data);
                setProfileMessage("Profile saved successfully!");
                setEditMode(false);
                setTimeout(() => setProfileMessage(""), 3000);
            } else {
                setProfileMessage(data.error || "Failed to save profile");
            }
        } catch {
            setProfileMessage("Failed to connect to server");
        } finally {
            setSavingProfile(false);
        }
    };

    const addGoal = () => {
        if (goalInput.trim() && !profileForm.goals.includes(goalInput.trim())) {
            setProfileForm((prev) => ({ ...prev, goals: [...prev.goals, goalInput.trim()] }));
            setGoalInput("");
        }
    };

    const removeGoal = (goal) => {
        setProfileForm((prev) => ({ ...prev, goals: prev.goals.filter((g) => g !== goal) }));
    };

    const statusColors = {
        confirmed: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
        processing: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
        shipped: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
        delivered: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
    };

    const handleCrmSync = async (order) => {
        const id = order._id;
        setSyncingOrderId(id);
        setSyncResult(prev => ({ ...prev, [id]: null }));
        try {
            const res = await fetch("/api/orders/confirm", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ receiptId: order.receiptId || order.orderNumber }),
            });
            const data = await res.json();
            setSyncResult(prev => ({ ...prev, [id]: res.ok ? "synced" : (data.error || "failed") }));
        } catch {
            setSyncResult(prev => ({ ...prev, [id]: "error" }));
        } finally {
            setSyncingOrderId(null);
        }
    };

    const initials = (profileForm.name || client?.email || "?")
        .split(" ").map((w) => w[0]).join("").substring(0, 2).toUpperCase();

    const isLoggedIn = client !== null;

    return (
        <main className="min-h-screen bg-sage-50 pt-32 pb-24 px-6">
            {/* Decorative background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
                <div className="absolute top-0 right-0 w-1/3 h-full bg-sage-100 -skew-x-12 opacity-40"></div>
            </div>

            <div className="max-w-4xl mx-auto relative" style={{ zIndex: 1 }}>
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-block px-3 py-1 bg-sage-100 text-sage-800 rounded-full text-sm font-bold mb-6 tracking-wider uppercase">
                        Client Portal
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
                        {isLoggedIn ? (
                            <>Welcome back, <span className="text-sage-600">{profileForm.name.split(" ")[0] || "Client"}</span></>
                        ) : (
                            <>Your <span className="text-sage-600">Dashboard</span></>
                        )}
                    </h1>
                    <p className="text-slate-600 max-w-xl mx-auto text-lg">
                        {isLoggedIn ? "Manage your orders and profile" : "Sign in to view your orders and manage your profile."}
                    </p>
                </div>

                {/* ── AUTH FORMS ── */}
                {!isLoggedIn && (
                    <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10 max-w-md mx-auto border border-slate-100">
                        {/* Sign In Header (hidden when in set-password mode) */}
                        {authMode !== "setPassword" && (
                            <div className="text-center mb-8">
                                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-sage-50 flex items-center justify-center">
                                    <svg className="w-7 h-7 text-sage-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-1">Client Login</h3>
                                <p className="text-slate-500 text-sm">Sign in to view your orders and manage your profile.</p>
                                <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
                                    <p className="text-blue-700 text-xs font-medium">This portal is available to clients with existing purchases. Your account is created automatically at checkout.</p>
                                </div>
                            </div>
                        )}

                        {/* Set Password Header */}
                        {authMode === "setPassword" && (
                            <div className="text-center mb-6">
                                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-amber-50 flex items-center justify-center">
                                    <svg className="w-7 h-7 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-1">Set Your Password</h3>
                                <p className="text-slate-500 text-sm">Your account was created at checkout.<br />Choose a password to secure it.</p>
                            </div>
                        )}

                        {authError && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-6">
                                <p className="text-red-700 text-sm text-center font-medium">{authError}</p>
                            </div>
                        )}

                        <form onSubmit={authMode === "login" ? handleLogin : handleSetPassword} className="space-y-5">
                            <div>
                                <label className="portal-label">Email Address</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                                        </svg>
                                    </div>
                                    <input type="email" required value={authEmail} onChange={(e) => setAuthEmail(e.target.value)}
                                        className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-sage-500 focus:bg-white focus:ring-2 focus:ring-sage-200 outline-none transition-all text-slate-900" style={{ paddingLeft: "2.5rem" }} placeholder="your@email.com" />
                                </div>
                            </div>
                            <div>
                                <label className="portal-label">Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                                        </svg>
                                    </div>
                                    <input type="password" required minLength={6} value={authPassword} onChange={(e) => setAuthPassword(e.target.value)}
                                        className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-sage-500 focus:bg-white focus:ring-2 focus:ring-sage-200 outline-none transition-all text-slate-900" style={{ paddingLeft: "2.5rem" }} placeholder={authMode === "setPassword" ? "Choose a password (min. 6 chars)" : "Enter your password"} />
                                </div>
                            </div>
                            <button type="submit" disabled={authLoading}
                                className="w-full py-3.5 bg-sage-600 text-white font-bold rounded-xl hover:bg-sage-500 transition-all duration-300 shadow-lg hover:shadow-sage-600/25 disabled:opacity-50 disabled:cursor-not-allowed tracking-wide text-sm">
                                {authLoading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        {authMode === "setPassword" ? "Setting password..." : "Signing in..."}
                                    </span>
                                ) : authMode === "setPassword" ? "Set Password & Sign In" : "Sign In"}
                            </button>
                        </form>

                        <p className="text-slate-500 text-xs text-center mt-6">
                            {authMode === "setPassword" && (
                                <button onClick={() => { setAuthMode("login"); setAuthError(""); setAuthPassword(""); }} className="text-sage-600 font-bold hover:text-sage-700">← Back to Sign In</button>
                            )}
                        </p>
                    </div>
                )}

                {/* ── LOGGED-IN DASHBOARD ── */}
                {isLoggedIn && (
                    <>
                        {/* Success Message */}
                        {profileMessage && (
                            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6">
                                <p className="text-emerald-700 text-center font-medium text-sm">{profileMessage}</p>
                            </div>
                        )}

                        {/* Tab Navigation */}
                        <div className="flex gap-2 mb-8 bg-white rounded-xl p-1.5 shadow-sm border border-slate-100">
                            <button onClick={() => setActiveTab("orders")}
                                className={`flex-1 py-3 px-4 rounded-lg font-bold text-sm tracking-wide transition-all duration-200 ${activeTab === "orders" ? "bg-sage-600 text-white shadow-lg" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"}`}>
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
                                    My Orders
                                </span>
                            </button>
                            <button onClick={() => setActiveTab("profile")}
                                className={`flex-1 py-3 px-4 rounded-lg font-bold text-sm tracking-wide transition-all duration-200 ${activeTab === "profile" ? "bg-sage-600 text-white shadow-lg" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"}`}>
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                                    My Profile
                                </span>
                            </button>
                            <button onClick={() => { setActiveTab("messages"); if (conversations.length === 0) fetchConversations(client.email); }}
                                className={`flex-1 py-3 px-4 rounded-lg font-bold text-sm tracking-wide transition-all duration-200 ${activeTab === "messages" ? "bg-sage-600 text-white shadow-lg" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"}`}>
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
                                    Messages
                                </span>
                            </button>
                        </div>

                        {/* Sign Out */}
                        <div className="flex justify-end mb-4">
                            <button onClick={handleSignOut}
                                className="text-slate-400 hover:text-slate-600 text-xs font-medium tracking-wide transition-colors flex items-center gap-1.5">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                                Sign Out
                            </button>
                        </div>

                        {/* ORDERS TAB */}
                        {activeTab === "orders" && (
                            <>
                                {orders && orders.length === 0 && (
                                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center">
                                        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-sage-50 flex items-center justify-center">
                                            <svg className="w-10 h-10 text-sage-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900 mb-2">No orders yet</h3>
                                        <p className="text-slate-500 max-w-sm mx-auto">Visit our <a href="/shop" className="text-sage-600 underline hover:text-sage-700">shop</a> to place your first order.</p>
                                    </div>
                                )}

                                {orders && orders.length > 0 && (
                                    <div className="space-y-4">
                                        <div className="text-sm text-slate-500 font-medium px-1">{orders.length} order{orders.length !== 1 ? "s" : ""}</div>
                                        {orders.map((order, index) => {
                                            const colors = statusColors[order.status] || statusColors.confirmed;
                                            const isExpanded = expandedOrder === order._id;
                                            return (
                                                <div key={order._id} className="bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-sage-200 transition-all portal-card-enter" style={{ animationDelay: `${index * 100}ms` }}>
                                                    {/* Clickable Summary Row */}
                                                    <button onClick={() => setExpandedOrder(isExpanded ? null : order._id)} className="w-full flex items-center justify-between p-6 md:p-8 text-left focus:outline-none group">
                                                        <div className="flex items-center gap-4 min-w-0">
                                                            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-sage-50 flex items-center justify-center">
                                                                <svg className="w-5 h-5 text-sage-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
                                                            </div>
                                                            <div className="min-w-0">
                                                                <h3 className="text-base font-bold text-slate-900 tracking-wide">
                                                                    <span className="text-sage-600 font-mono">{order.orderNumber}</span>
                                                                </h3>
                                                                <p className="text-slate-500 text-sm mt-0.5">
                                                                    {new Date(order.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                                                                    <span className="mx-2 text-slate-300">·</span>
                                                                    <span className="font-bold text-slate-800">${order.total.toFixed(2)}</span>
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3 flex-shrink-0">
                                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${colors.bg} ${colors.text} ${colors.border}`}>
                                                                <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                                                                {order.status}
                                                            </span>
                                                            <svg className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                                        </div>
                                                    </button>

                                                    {/* Expanded Details */}
                                                    {isExpanded && (
                                                        <div className="px-6 md:px-8 pb-6 md:pb-8 border-t border-slate-100">
                                                            <div className="bg-slate-50 rounded-xl overflow-hidden mt-5">
                                                                <div className="divide-y divide-slate-100">
                                                                    {order.items.map((item, i) => (
                                                                        <div key={i} className="flex justify-between items-center px-5 py-3.5">
                                                                            <div className="flex items-center gap-3">
                                                                                <div className="w-8 h-8 rounded-lg bg-sage-100 flex items-center justify-center">
                                                                                    <svg className="w-4 h-4 text-sage-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
                                                                                </div>
                                                                                <div>
                                                                                    <span className="text-slate-900 text-sm font-medium">{item.productName}</span>
                                                                                    <span className="text-slate-400 text-xs ml-2">× {item.quantity}</span>
                                                                                </div>
                                                                            </div>
                                                                            <span className="text-slate-700 text-sm font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                            <div className="flex justify-between items-center mt-5 pt-4 border-t border-slate-100">
                                                                <span className="text-slate-500 font-medium">Total</span>
                                                                <span className="text-2xl font-bold text-slate-900">${order.total.toFixed(2)}</span>
                                                            </div>
                                                            {debugMode && (
                                                                <div className="mt-4 pt-4 border-t border-dashed border-amber-200">
                                                                    <div className="flex items-center justify-between">
                                                                        <span className="text-amber-500/60 text-[10px] font-mono uppercase tracking-wider">Debug</span>
                                                                        {syncResult[order._id] === "synced" ? (
                                                                            <span className="text-emerald-600 text-xs font-bold">✓ Synced to CRM</span>
                                                                        ) : syncResult[order._id] && syncResult[order._id] !== "synced" ? (
                                                                            <span className="text-red-500 text-xs">{syncResult[order._id]}</span>
                                                                        ) : (
                                                                            <button
                                                                                onClick={(e) => { e.stopPropagation(); handleCrmSync(order); }}
                                                                                disabled={syncingOrderId === order._id}
                                                                                className="px-3 py-1.5 text-xs font-bold rounded-lg bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 transition-colors disabled:opacity-50"
                                                                            >
                                                                                {syncingOrderId === order._id ? "Syncing..." : "Sync CRM"}
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </>
                        )}

                        {/* PROFILE TAB */}
                        {activeTab === "profile" && (
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-10 portal-card-enter">
                                {/* Avatar Section */}
                                <div className="flex flex-col items-center mb-10">
                                    <div className="relative group mb-4">
                                        <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-sage-600/30 shadow-xl shadow-sage-600/10">
                                            {client?.avatar ? (
                                                <img src={client.avatar} alt="Profile" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-sage-600 to-sage-700 flex items-center justify-center text-white text-3xl font-bold">{initials}</div>
                                            )}
                                        </div>
                                        {editMode && (
                                            <button onClick={() => fileInputRef.current?.click()}
                                                className="absolute bottom-0 right-0 w-9 h-9 bg-sage-600 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-sage-500 transition-colors border-2 border-white">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                            </button>
                                        )}
                                        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                                    </div>
                                    <h2 className="text-xl font-bold text-slate-900">{profileForm.name || "New Client"}</h2>
                                    <p className="text-slate-500 text-sm">{client.email}</p>
                                    {client?.createdAt && (
                                        <p className="text-slate-500 text-xs mt-1">Member since {new Date(client.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long" })}</p>
                                    )}
                                </div>

                                {/* View Mode */}
                                {!editMode && (
                                    <div className="space-y-6">
                                        <div className="grid md:grid-cols-2 gap-5">
                                            <div className="bg-slate-50 rounded-xl border border-slate-100 p-5">
                                                <label className="text-xs text-slate-500 uppercase tracking-wider font-bold block mb-1">Phone</label>
                                                <p className="text-slate-900 font-medium">{profileForm.phone || "—"}</p>
                                            </div>
                                            <div className="bg-slate-50 rounded-xl border border-slate-100 p-5">
                                                <label className="text-xs text-slate-500 uppercase tracking-wider font-bold block mb-1">Date of Birth</label>
                                                <p className="text-slate-900 font-medium">{profileForm.dateOfBirth || "—"}</p>
                                            </div>
                                        </div>
                                        <div className="bg-slate-50 rounded-xl border border-slate-100 p-5">
                                            <label className="text-xs text-slate-500 uppercase tracking-wider font-bold block mb-1">Bio</label>
                                            <p className="text-slate-600">{profileForm.bio || "No bio yet."}</p>
                                        </div>
                                        <div className="bg-slate-50 rounded-xl border border-slate-100 p-5">
                                            <label className="text-xs text-slate-500 uppercase tracking-wider font-bold block mb-1">Address</label>
                                            <p className="text-slate-600">
                                                {[profileForm.address?.street, profileForm.address?.city, profileForm.address?.state, profileForm.address?.zip, profileForm.address?.country].filter(Boolean).join(", ") || "—"}
                                            </p>
                                        </div>
                                        {profileForm.goals?.length > 0 && (
                                            <div className="bg-slate-50 rounded-xl border border-slate-100 p-5">
                                                <label className="text-xs text-slate-500 uppercase tracking-wider font-bold block mb-2">Goals</label>
                                                <div className="flex flex-wrap gap-2">
                                                    {profileForm.goals.map((goal) => (
                                                        <span key={goal} className="px-3 py-1 bg-sage-100 border border-sage-200 rounded-full text-sage-700 text-xs font-medium">{goal}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        <button onClick={() => setEditMode(true)}
                                            className="w-full py-3.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all duration-200 tracking-wide text-sm shadow-lg">
                                            Edit Profile
                                        </button>
                                    </div>
                                )}

                                {/* Edit Mode */}
                                {editMode && (
                                    <form onSubmit={handleSaveProfile} className="space-y-5">
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div><label className="portal-label">Full Name</label><input type="text" required value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} className="portal-input" placeholder="John Doe" /></div>
                                            <div><label className="portal-label">Phone</label><input type="tel" value={profileForm.phone} onChange={handlePhoneChange} className="portal-input" placeholder="+1 (555) 000-0000" /></div>
                                        </div>
                                        <div><label className="portal-label">Date of Birth</label><input type="date" value={profileForm.dateOfBirth} onChange={(e) => setProfileForm({ ...profileForm, dateOfBirth: e.target.value })} className="portal-input" /></div>
                                        <div><label className="portal-label">Bio</label><textarea rows="3" value={profileForm.bio} onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })} className="portal-input resize-none" placeholder="Tell us about yourself..." /></div>
                                        <div>
                                            <label className="portal-label">Address</label>
                                            <div className="space-y-3">
                                                <input type="text" value={profileForm.address.street} onChange={(e) => setProfileForm({ ...profileForm, address: { ...profileForm.address, street: e.target.value } })} className="portal-input" placeholder="Street address" />
                                                <div className="grid grid-cols-2 gap-3">
                                                    <input type="text" value={profileForm.address.city} onChange={(e) => setProfileForm({ ...profileForm, address: { ...profileForm.address, city: e.target.value } })} className="portal-input" placeholder="City" />
                                                    <input type="text" value={profileForm.address.state} onChange={(e) => setProfileForm({ ...profileForm, address: { ...profileForm.address, state: e.target.value } })} className="portal-input" placeholder="State" />
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <input type="text" value={profileForm.address.zip} onChange={(e) => setProfileForm({ ...profileForm, address: { ...profileForm.address, zip: e.target.value } })} className="portal-input" placeholder="ZIP Code" />
                                                    <input type="text" value={profileForm.address.country} onChange={(e) => setProfileForm({ ...profileForm, address: { ...profileForm.address, country: e.target.value } })} className="portal-input" placeholder="Country" />
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="portal-label">Goals</label>
                                            <div className="flex gap-2 mb-3">
                                                <input type="text" value={goalInput} onChange={(e) => setGoalInput(e.target.value)}
                                                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addGoal(); } }}
                                                    className="portal-input flex-1" placeholder="e.g. Weight loss, Mental clarity..." />
                                                <button type="button" onClick={addGoal}
                                                    className="px-4 py-2 bg-sage-100 border border-sage-200 text-sage-700 rounded-xl text-sm font-bold hover:bg-sage-200 transition-colors">Add</button>
                                            </div>
                                            {profileForm.goals.length > 0 && (
                                                <div className="flex flex-wrap gap-2">
                                                    {profileForm.goals.map((goal) => (
                                                        <span key={goal} className="group px-3 py-1 bg-sage-100 border border-sage-200 rounded-full text-sage-700 text-xs font-medium flex items-center gap-1.5">
                                                            {goal}<button type="button" onClick={() => removeGoal(goal)} className="opacity-50 hover:opacity-100 transition-opacity">×</button>
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex gap-3 pt-2">
                                            <button type="button" onClick={() => setEditMode(false)} className="flex-1 py-3.5 bg-slate-100 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all text-sm tracking-wide">Cancel</button>
                                            <button type="submit" disabled={savingProfile} className="flex-1 py-3.5 bg-sage-600 text-white font-bold rounded-xl hover:bg-sage-500 transition-all shadow-lg disabled:opacity-50 text-sm tracking-wide">{savingProfile ? "Saving..." : "Save Profile"}</button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        )}

                        {/* MESSAGES TAB */}
                        {activeTab === "messages" && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4" style={{ minHeight: '480px' }}>
                                {/* Conversation List (Left Panel) */}
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 md:col-span-1 flex flex-col">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Conversations</h4>
                                        <button onClick={startNewConversation}
                                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-sage-100 border border-sage-200 text-sage-700 hover:bg-sage-200 transition-colors" title="New Conversation">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                                        </button>
                                    </div>

                                    {messagesLoading ? (
                                        <div className="space-y-3">
                                            {[1, 2, 3].map(i => (
                                                <div key={i} className="animate-pulse p-3 rounded-xl bg-slate-50">
                                                    <div className="h-4 bg-white/10 rounded w-3/4 mb-2"></div>
                                                    <div className="h-3 bg-white/5 rounded w-full"></div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : conversations.length === 0 ? (
                                        <div className="flex-1 flex items-center justify-center">
                                            <div className="text-center">
                                                <svg className="w-8 h-8 text-slate-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
                                                <p className="text-slate-500 text-xs">No conversations</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-2 overflow-y-auto flex-1">
                                            {conversations.map((convo) => (
                                                <button key={convo.conversation_id} onClick={() => openThread(convo)}
                                                    className={`w-full text-left p-3 rounded-xl transition-all duration-150 ${activeConvo === convo.conversation_id ? 'bg-sage-50 border border-sage-200' : 'bg-slate-50 border border-transparent hover:bg-slate-100'}`}>
                                                    <div className="flex items-start justify-between gap-2">
                                                        <h5 className="text-sm font-bold text-slate-900 truncate">{convo.subject || 'General'}</h5>
                                                        <span className="text-[10px] text-slate-500 shrink-0 mt-0.5">
                                                            {convo.messageCount || 0}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-slate-400 truncate mt-1">{convo.lastMessage || '...'}</p>
                                                    {convo.lastDate && (
                                                        <p className="text-[10px] text-slate-600 mt-1">
                                                            {new Date(convo.lastDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                        </p>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Thread View (Right Panel) */}
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 md:p-6 md:col-span-2 flex flex-col">
                                    {!activeConvo && !composingNew ? (
                                        /* No thread selected */
                                        <div className="flex-1 flex items-center justify-center">
                                            <div className="text-center">
                                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-sage-50 flex items-center justify-center">
                                                    <svg className="w-8 h-8 text-sage-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
                                                </div>
                                                <h4 className="text-slate-900 font-bold mb-1">Select a conversation</h4>
                                                <p className="text-slate-500 text-sm">Choose from the left or start a new one.</p>
                                            </div>
                                        </div>
                                    ) : (
                                        /* Active thread or new conversation */
                                        <>
                                            {/* Thread header */}
                                            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => { setActiveConvo(null); setComposingNew(false); setThreadMessages([]); }}
                                                        className="md:hidden w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 text-slate-400 hover:text-white">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                                                    </button>
                                                    <h4 className="text-sm font-bold text-slate-900">
                                                        {composingNew ? 'New Conversation' : (conversations.find(c => c.conversation_id === activeConvo)?.subject || 'Thread')}
                                                    </h4>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {threadMessages.length > 0 && (
                                                        <span className="text-xs text-slate-500">{threadMessages.length} message{threadMessages.length !== 1 ? 's' : ''}</span>
                                                    )}
                                                    {activeConvo && (
                                                        <button onClick={() => openThread({ conversation_id: activeConvo, messages: [] })}
                                                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors" title="Refresh thread">
                                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Messages */}
                                            <div className="flex-1 overflow-y-auto space-y-3 mb-4 min-h-0" style={{ maxHeight: '320px' }}>
                                                {threadLoading ? (
                                                    <div className="space-y-3">
                                                        {[1, 2].map(i => (
                                                            <div key={i} className="animate-pulse flex gap-3">
                                                                <div className="w-7 h-7 bg-white/10 rounded-full"></div>
                                                                <div className="flex-1"><div className="h-4 bg-white/10 rounded w-2/3 mb-1"></div><div className="h-3 bg-white/5 rounded w-1/2"></div></div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : threadMessages.length === 0 && !composingNew ? (
                                                    <p className="text-slate-500 text-sm text-center py-8">No messages in this thread.</p>
                                                ) : (
                                                    [...threadMessages].sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0)).map((msg, i) => {
                                                        const isInbound = msg.direction === 'INBOUND';
                                                        return (
                                                            <div key={msg._id || msg.id || i} className={`flex ${isInbound ? 'justify-end' : 'justify-start'}`}>
                                                                <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${isInbound ? 'bg-sage-50 border border-sage-200' : 'bg-slate-50 border border-slate-100'}`}>
                                                                    <span className={`text-[10px] font-bold ${isInbound ? 'text-sage-700' : 'text-slate-500'}`}>
                                                                        {isInbound ? 'You' : 'Shop Owner'}
                                                                    </span>
                                                                    <p className="text-slate-900 text-sm leading-relaxed mt-0.5">{msg.body || msg.message}</p>
                                                                    <p className="text-slate-600 text-[10px] mt-1">
                                                                        {msg.createdAt ? new Date(msg.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        );
                                                    })
                                                )}
                                                <div ref={threadEndRef} />
                                            </div>

                                            {/* Compose / Reply */}
                                            {msgStatus && (
                                                <div className={`rounded-lg p-2.5 mb-3 text-xs font-medium ${msgStatus.includes('sent') ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
                                                    {msgStatus}
                                                </div>
                                            )}
                                            <form onSubmit={handleSendMessage} className="space-y-2">
                                                {composingNew && (
                                                    <input type="text" value={msgSubject} onChange={(e) => setMsgSubject(e.target.value)}
                                                        className="portal-input w-full text-sm" placeholder="Subject" required />
                                                )}
                                                <div className="flex gap-2">
                                                    <input type="text" value={msgBody} onChange={(e) => setMsgBody(e.target.value)}
                                                        className="portal-input flex-1 text-sm" placeholder={composingNew ? 'Type your message...' : 'Reply...'} required />
                                                    <button type="submit" disabled={sendingMsg || !msgBody.trim()}
                                                        className="px-4 py-2.5 bg-sage-600 text-white font-bold rounded-xl hover:bg-sage-500 transition-all disabled:opacity-50 text-sm flex items-center gap-1.5 shrink-0">
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                                                        {sendingMsg ? '...' : 'Send'}
                                                    </button>
                                                </div>
                                            </form>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </main >
    );
}
