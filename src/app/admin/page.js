"use client";
import React, { useState, useEffect, useCallback } from "react";

const ADMIN_TOKEN_KEY = "ss_admin_token";

function StatusBadge({ status }) {
  const colors = {
    awaiting_payment: "bg-gray-100 text-gray-600",
    confirmed: "bg-blue-50 text-blue-700",
    processing: "bg-amber-50 text-amber-700",
    shipped: "bg-purple-50 text-purple-700",
    delivered: "bg-emerald-50 text-emerald-700",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${colors[status] || colors.confirmed}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {status?.replace("_", " ")}
    </span>
  );
}

function Stat({ label, value, icon, accent }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-white ${accent || "bg-slate-700"}`}>
          <span className="text-sm">{icon}</span>
        </div>
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-2xl font-bold text-slate-900 tracking-tight">{value}</p>
    </div>
  );
}

export default function AdminPage() {
  const [token, setToken] = useState("");
  const [authed, setAuthed] = useState(false);
  const [authMode, setAuthMode] = useState(null); // null = loading, "setup", "login"
  const [authForm, setAuthForm] = useState({ email: "", password: "", name: "" });
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [tab, setTab] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [overview, setOverview] = useState(null);
  const [orders, setOrders] = useState({ orders: [], total: 0, page: 1, pages: 1 });
  const [clients, setClients] = useState({ clients: [], total: 0, page: 1, pages: 1 });
  const [syncingId, setSyncingId] = useState(null);
  const [syncResults, setSyncResults] = useState({});
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [trackingForm, setTrackingForm] = useState({});
  const [statusUpdating, setStatusUpdating] = useState(null);
  const [toast, setToast] = useState(null);

  // Check if admin exists + restore session
  useEffect(() => {
    (async () => {
      const saved = sessionStorage.getItem(ADMIN_TOKEN_KEY);
      if (saved) { setToken(saved); setAuthed(true); return; }
      try {
        const res = await fetch("/api/admin?tab=status");
        const data = await res.json();
        setAuthMode(data.data?.adminExists ? "login" : "setup");
      } catch {
        setAuthMode("login");
      }
    })();
  }, []);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const apiFetch = useCallback(async (path, opts = {}) => {
    const res = await fetch(path, {
      ...opts,
      headers: { "x-admin-token": token, "Content-Type": "application/json", ...opts.headers },
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    });
    return res.json();
  }, [token]);

  const fetchTab = useCallback(async (t, page = 1) => {
    setLoading(true);
    const params = new URLSearchParams({ tab: t, page, limit: 50 });
    if (search) params.set("search", search);
    if (t === "orders" && statusFilter) params.set("status", statusFilter);
    const data = await apiFetch(`/api/admin?${params}`);
    if (data.success) {
      if (t === "overview") setOverview(data.data);
      if (t === "orders") setOrders(data.data);
      if (t === "clients") setClients(data.data);
    }
    setLoading(false);
  }, [apiFetch, search, statusFilter]);

  useEffect(() => { if (authed) fetchTab(tab); }, [authed, tab, fetchTab]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: authMode, ...authForm }),
      });
      const data = await res.json();
      if (data.success && data.token) {
        sessionStorage.setItem(ADMIN_TOKEN_KEY, data.token);
        setToken(data.token);
        setAuthed(true);
      } else {
        setAuthError(data.error || "Authentication failed");
      }
    } catch {
      setAuthError("Failed to connect to server");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleCrmSync = async (orderId) => {
    setSyncingId(orderId);
    const data = await apiFetch("/api/admin", { method: "POST", body: { action: "crm_sync", orderId } });
    setSyncResults(p => ({ ...p, [orderId]: data.success ? "synced" : (data.error || "failed") }));
    if (data.success) showToast("CRM synced successfully");
    else showToast(data.error || "CRM sync failed", "error");
    setSyncingId(null);
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    setStatusUpdating(orderId);
    const data = await apiFetch("/api/admin", { method: "POST", body: { action: "update_status", orderId, status: newStatus } });
    if (data.success) { showToast(`Status → ${newStatus}`); fetchTab("orders"); }
    setStatusUpdating(null);
  };

  const handleTracking = async (orderId) => {
    const t = trackingForm[orderId];
    if (!t?.trackingNumber) return;
    const data = await apiFetch("/api/admin", { method: "POST", body: { action: "update_tracking", orderId, ...t } });
    if (data.success) { showToast("Tracking saved"); fetchTab("orders"); setTrackingForm(p => ({ ...p, [orderId]: {} })); }
  };

  const handleMarkDelivered = async (orderId) => {
    const data = await apiFetch("/api/admin", { method: "POST", body: { action: "mark_delivered", orderId } });
    if (data.success) { showToast("Marked as delivered"); fetchTab("orders"); }
  };

  // ── Auth Gate ──
  if (!authed) {
    const isSetup = authMode === "setup";
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <form onSubmit={handleAuth} className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          <div className="text-center mb-6">
            <div className={`w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center ${isSetup ? "bg-emerald-600" : "bg-slate-900"}`}>
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isSetup
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                }
              </svg>
            </div>
            <h1 className="text-lg font-bold text-slate-900">
              {isSetup ? "Create Admin Account" : "SwaddleShawls Admin"}
            </h1>
            <p className="text-sm text-slate-500">
              {isSetup ? "Set up your credentials for the first time" : "Sign in to manage your store"}
            </p>
          </div>
          {authError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-red-700 text-sm text-center font-medium">{authError}</p>
            </div>
          )}
          {isSetup && (
            <input type="text" value={authForm.name} onChange={e => setAuthForm(p => ({ ...p, name: e.target.value }))}
              placeholder="Your Name" className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 outline-none text-sm mb-3" />
          )}
          <input type="email" value={authForm.email} onChange={e => setAuthForm(p => ({ ...p, email: e.target.value }))}
            placeholder="Email" required className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 outline-none text-sm mb-3" />
          <input type="password" value={authForm.password} onChange={e => setAuthForm(p => ({ ...p, password: e.target.value }))}
            placeholder={isSetup ? "Choose a password (min. 6 chars)" : "Password"} required minLength={6}
            className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 outline-none text-sm mb-4" />
          <button type="submit" disabled={authLoading}
            className={`w-full py-3 text-white font-bold rounded-xl transition-colors text-sm disabled:opacity-50 ${isSetup ? "bg-emerald-600 hover:bg-emerald-500" : "bg-slate-900 hover:bg-slate-800"}`}>
            {authLoading ? "Please wait..." : isSetup ? "Create Admin Account" : "Sign In"}
          </button>
          {authMode === null && (
            <div className="flex justify-center mt-4"><div className="w-5 h-5 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin" /></div>
          )}
        </form>
      </main>
    );
  }

  // ── Main Admin UI ──
  const tabs = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "orders", label: "Orders", icon: "📦" },
    { id: "clients", label: "Clients", icon: "👤" },
  ];

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold border ${toast.type === "error" ? "bg-red-50 text-red-700 border-red-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center">
              <span className="text-white text-xs font-bold">SS</span>
            </div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">Admin</h1>
          </div>
          <button onClick={() => { sessionStorage.removeItem(ADMIN_TOKEN_KEY); setAuthed(false); setToken(""); setAuthMode("login"); }}
            className="text-xs text-slate-400 hover:text-slate-600 font-medium">Sign Out</button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-white rounded-xl p-1 shadow-sm border border-slate-100 w-fit">
          {tabs.map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); setSearch(""); setStatusFilter(""); }}
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${tab === t.id ? "bg-slate-900 text-white shadow" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"}`}>
              <span className="mr-1.5">{t.icon}</span>{t.label}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW ── */}
        {tab === "overview" && overview && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Stat label="Total Orders" value={overview.totalOrders} icon="📦" accent="bg-blue-600" />
              <Stat label="Revenue" value={`$${overview.totalRevenue.toFixed(2)}`} icon="💰" accent="bg-emerald-600" />
              <Stat label="Clients" value={overview.totalClients} icon="👤" accent="bg-purple-600" />
              <Stat label="Confirmed" value={overview.statusCounts?.confirmed || 0} icon="✓" accent="bg-amber-600" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
              {Object.entries(overview.statusCounts || {}).map(([s, c]) => (
                <div key={s} className="bg-white rounded-lg border border-slate-100 px-4 py-3 text-center">
                  <p className="text-xs text-slate-400 uppercase mb-1">{s.replace("_"," ")}</p>
                  <p className="text-xl font-bold text-slate-900">{c}</p>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100"><h3 className="font-semibold text-slate-900 text-sm">Recent Orders</h3></div>
              {(overview.recentOrders || []).map(o => (
                <div key={o._id} className="px-5 py-3 border-b border-slate-50 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div>
                    <span className="font-mono text-sm font-bold text-slate-800">{o.orderNumber}</span>
                    <span className="text-slate-400 text-xs ml-3">{o.customerName}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-slate-700">${o.total?.toFixed(2)}</span>
                    <StatusBadge status={o.status} />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── ORDERS ── */}
        {tab === "orders" && (
          <>
            <div className="flex flex-wrap gap-3 mb-6">
              <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === "Enter" && fetchTab("orders")}
                placeholder="Search orders..." className="px-4 py-2.5 rounded-lg bg-white border border-slate-200 text-sm w-64 focus:ring-2 focus:ring-slate-200 outline-none" />
              <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setTimeout(() => fetchTab("orders"), 0); }}
                className="px-3 py-2.5 rounded-lg bg-white border border-slate-200 text-sm">
                <option value="">All Statuses</option>
                {["awaiting_payment","confirmed","processing","shipped","delivered"].map(s => <option key={s} value={s}>{s.replace("_"," ")}</option>)}
              </select>
              <button onClick={() => fetchTab("orders")} className="px-4 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800">
                {loading ? "Loading..." : "Search"}
              </button>
            </div>
            <div className="text-xs text-slate-400 mb-3 font-medium">{orders.total} orders · Page {orders.page}/{orders.pages}</div>
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
              {(orders.orders || []).map(o => (
                <div key={o._id}>
                  <button onClick={() => setExpandedOrder(expandedOrder === o._id ? null : o._id)}
                    className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-bold text-slate-800">{o.orderNumber}</span>
                          <span className="text-xs px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">{o.paymentMethod}</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5 truncate">{o.customerName} · {o.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-sm font-semibold text-slate-700">${o.total?.toFixed(2)}</span>
                      <StatusBadge status={o.status} />
                      {syncResults[o._id] === "synced" && <span className="text-emerald-500 text-xs font-bold">✓ CRM</span>}
                      <svg className={`w-4 h-4 text-slate-400 transition-transform ${expandedOrder === o._id ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>
                  {expandedOrder === o._id && (
                    <div className="px-5 pb-5 border-t border-slate-100 bg-slate-50">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        {/* Items */}
                        <div>
                          <h4 className="text-xs font-bold uppercase text-slate-400 mb-2">Items</h4>
                          {o.items?.map((item, i) => (
                            <div key={i} className="flex justify-between text-sm py-1">
                              <span className="text-slate-700">{item.productName} × {item.quantity}</span>
                              <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                        {/* Shipping */}
                        <div>
                          <h4 className="text-xs font-bold uppercase text-slate-400 mb-2">Shipping</h4>
                          {o.shippingAddress ? (
                            <p className="text-sm text-slate-600">
                              {[o.shippingAddress.street, o.shippingAddress.city, o.shippingAddress.state, o.shippingAddress.zip, o.shippingAddress.country].filter(Boolean).join(", ") || "—"}
                            </p>
                          ) : <p className="text-sm text-slate-400">No address</p>}
                          {o.trackingNumber && <p className="text-sm text-purple-600 mt-1 font-mono">{o.trackingCarrier}: {o.trackingNumber}</p>}
                          <p className="text-xs text-slate-400 mt-1">Created: {new Date(o.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                      {/* Actions */}
                      <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-200">
                        <button onClick={() => handleCrmSync(o._id)} disabled={syncingId === o._id}
                          className="px-3 py-2 text-xs font-bold rounded-lg bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 disabled:opacity-50">
                          {syncingId === o._id ? "Syncing..." : "↑ Sync CRM"}
                        </button>
                        {o.status === "confirmed" && (
                          <button onClick={() => handleStatusUpdate(o._id, "processing")} disabled={statusUpdating === o._id}
                            className="px-3 py-2 text-xs font-bold rounded-lg bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100">
                            → Processing
                          </button>
                        )}
                        {(o.status === "processing" || o.status === "confirmed") && (
                          <div className="flex items-center gap-1.5">
                            <input placeholder="Carrier" value={trackingForm[o._id]?.trackingCarrier || ""} onChange={e => setTrackingForm(p => ({ ...p, [o._id]: { ...p[o._id], trackingCarrier: e.target.value } }))}
                              className="px-2 py-1.5 rounded border border-slate-200 text-xs w-20" />
                            <input placeholder="Tracking #" value={trackingForm[o._id]?.trackingNumber || ""} onChange={e => setTrackingForm(p => ({ ...p, [o._id]: { ...p[o._id], trackingNumber: e.target.value } }))}
                              className="px-2 py-1.5 rounded border border-slate-200 text-xs w-32" />
                            <button onClick={() => handleTracking(o._id)} className="px-3 py-1.5 text-xs font-bold rounded-lg bg-purple-50 border border-purple-200 text-purple-700 hover:bg-purple-100">
                              Ship
                            </button>
                          </div>
                        )}
                        {o.status === "shipped" && (
                          <button onClick={() => handleMarkDelivered(o._id)}
                            className="px-3 py-2 text-xs font-bold rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100">
                            ✓ Mark Delivered
                          </button>
                        )}
                      </div>
                      {syncResults[o._id] && syncResults[o._id] !== "synced" && (
                        <p className="text-xs text-red-500 mt-2 font-medium">Error: {syncResults[o._id]}</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
              {(!orders.orders || orders.orders.length === 0) && !loading && (
                <div className="px-5 py-12 text-center text-slate-400 text-sm">No orders found</div>
              )}
            </div>
          </>
        )}

        {/* ── CLIENTS ── */}
        {tab === "clients" && (
          <>
            <div className="flex gap-3 mb-6">
              <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === "Enter" && fetchTab("clients")}
                placeholder="Search clients..." className="px-4 py-2.5 rounded-lg bg-white border border-slate-200 text-sm w-64 focus:ring-2 focus:ring-slate-200 outline-none" />
              <button onClick={() => fetchTab("clients")} className="px-4 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800">
                {loading ? "Loading..." : "Search"}
              </button>
            </div>
            <div className="text-xs text-slate-400 mb-3 font-medium">{clients.total} clients</div>
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-5 py-3 text-xs font-bold uppercase text-slate-400">Name</th>
                    <th className="text-left px-5 py-3 text-xs font-bold uppercase text-slate-400">Email</th>
                    <th className="text-left px-5 py-3 text-xs font-bold uppercase text-slate-400">Phone</th>
                    <th className="text-right px-5 py-3 text-xs font-bold uppercase text-slate-400">Orders</th>
                    <th className="text-right px-5 py-3 text-xs font-bold uppercase text-slate-400">Total Spend</th>
                    <th className="text-left px-5 py-3 text-xs font-bold uppercase text-slate-400">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(clients.clients || []).map(c => (
                    <tr key={c._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3 font-medium text-slate-900">{c.name}</td>
                      <td className="px-5 py-3 text-slate-500">{c.email}</td>
                      <td className="px-5 py-3 text-slate-500">{c.phone || "—"}</td>
                      <td className="px-5 py-3 text-right font-semibold">{c.orderCount}</td>
                      <td className="px-5 py-3 text-right font-semibold text-emerald-600">${c.totalSpend?.toFixed(2)}</td>
                      <td className="px-5 py-3 text-slate-400 text-xs">{new Date(c.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(!clients.clients || clients.clients.length === 0) && !loading && (
                <div className="px-5 py-12 text-center text-slate-400 text-sm">No clients found</div>
              )}
            </div>
          </>
        )}

        {loading && (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-3 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
          </div>
        )}
      </div>
    </main>
  );
}
