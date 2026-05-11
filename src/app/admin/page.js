"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  LayoutDashboard,
  PackageSearch,
  UsersRound,
  LogOut,
  ChevronDown,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Truck,
  CreditCard,
  DollarSign,
  TrendingUp,
  RefreshCcw,
  ShieldCheck,
  AlertCircle,
  Lock,
  ArrowRight
} from "lucide-react";

const ADMIN_TOKEN_KEY = "ss_admin_token";

function StatusBadge({ status }) {
  const styles = {
    awaiting_payment: "bg-stone-100 text-stone-500 border border-stone-200",
    confirmed: "bg-blue-50 text-blue-700 border border-blue-100",
    processing: "bg-amber-50 text-amber-700 border border-amber-100",
    shipped: "bg-stone-800 text-stone-50 border border-stone-900",
    delivered: "bg-emerald-50 text-emerald-700 border border-emerald-100",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${styles[status] || styles.confirmed}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {status?.replace("_", " ")}
    </span>
  );
}

function Stat({ label, value, icon, accent }) {
  return (
    <div className="bg-white border border-stone-200 rounded-xl p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[11px] font-bold text-stone-400 uppercase tracking-widest">{label}</span>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${accent}`}>
          {icon}
        </div>
      </div>
      <p className="text-3xl font-bold text-stone-800 tracking-tight">{value}</p>
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
    if (data.success) { showToast("Tracking saved & Email sent"); fetchTab("orders"); setTrackingForm(p => ({ ...p, [orderId]: {} })); }
  };

  const handleMarkDelivered = async (orderId) => {
    const data = await apiFetch("/api/admin", { method: "POST", body: { action: "mark_delivered", orderId } });
    if (data.success) { showToast("Marked as delivered"); fetchTab("orders"); }
  };

  const handleSyncStripe = async () => {
    setLoading(true);
    const data = await apiFetch("/api/admin", { method: "POST", body: { action: "sync_stripe" } });
    if (data.success) { showToast(data.message || "Stripe sync complete"); fetchTab("orders"); }
    else { showToast(data.error || "Sync failed", "error"); setLoading(false); }
  };

  const handleResendConfirmation = async (orderId) => {
    const data = await apiFetch("/api/admin", { method: "POST", body: { action: "resend_confirmation", orderId } });
    if (data.success) showToast("Receipt resent successfully");
    else showToast(data.error || "Failed to resend receipt", "error");
  };

  // ── Auth Gate ──
  if (!authed) {
    const isSetup = authMode === "setup";
    return (
      <main className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-4 font-sans text-stone-800">
        <form onSubmit={handleAuth} className="w-full max-w-md bg-white rounded-[2rem] shadow-xl shadow-stone-200/50 border border-stone-200 p-10">
          <div className="text-center mb-10">
            <div className={`w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center ${isSetup ? "bg-stone-800 text-white" : "bg-stone-100 text-stone-800"}`}>
              {isSetup ? <ShieldCheck className="w-8 h-8" /> : <Lock className="w-8 h-8" />}
            </div>
            <h1 className="text-2xl font-serif text-stone-900">
              {isSetup ? "Initialize Vault" : "SwaddleShawls"}
            </h1>
            <p className="text-sm text-stone-500 mt-2 uppercase tracking-widest font-semibold">
              {isSetup ? "Create the master administrative identity." : "Admin Portal"}
            </p>
          </div>
          
          {authError && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-6 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              <p className="text-red-700 text-sm font-medium">{authError}</p>
            </div>
          )}
          
          <div className="space-y-4">
            {isSetup && (
              <input type="text" value={authForm.name} onChange={e => setAuthForm(p => ({ ...p, name: e.target.value }))}
                placeholder="Operator Name" className="w-full px-5 py-4 rounded-xl bg-stone-50 border border-stone-200 focus:border-stone-400 focus:bg-white outline-none text-sm transition-all placeholder:text-stone-400" />
            )}
            <input type="email" value={authForm.email} onChange={e => setAuthForm(p => ({ ...p, email: e.target.value }))}
              placeholder="Email Address" required className="w-full px-5 py-4 rounded-xl bg-stone-50 border border-stone-200 focus:border-stone-400 focus:bg-white outline-none text-sm transition-all placeholder:text-stone-400" />
            <input type="password" value={authForm.password} onChange={e => setAuthForm(p => ({ ...p, password: e.target.value }))}
              placeholder={isSetup ? "Master Password" : "Password"} required minLength={6}
              className="w-full px-5 py-4 rounded-xl bg-stone-50 border border-stone-200 focus:border-stone-400 focus:bg-white outline-none text-sm transition-all placeholder:text-stone-400" />
            
            <button type="submit" disabled={authLoading || authMode === null}
              className="w-full py-4 mt-4 text-white font-bold tracking-widest uppercase rounded-xl transition-all text-xs disabled:opacity-50 bg-stone-800 hover:bg-stone-900 shadow-md hover:shadow-lg flex items-center justify-center gap-2">
              {authLoading ? <RefreshCcw className="w-4 h-4 animate-spin" /> : null}
              {isSetup ? "Secure & Initialize" : "Sign In"}
            </button>
          </div>
        </form>
      </main>
    );
  }

  // ── Main Admin UI ──
  const tabs = [
    { id: "overview", label: "Overview", icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: "orders", label: "Orders", icon: <PackageSearch className="w-4 h-4" /> },
    { id: "clients", label: "Clients", icon: <UsersRound className="w-4 h-4" /> },
  ];

  return (
    <main className="min-h-screen bg-[#FAF7F2] text-stone-800 font-sans flex flex-col selection:bg-stone-200">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5">
          <div className={`px-5 py-4 rounded-2xl shadow-xl border text-sm font-bold flex items-center gap-3 ${toast.type === "error" ? "bg-red-50 text-red-700 border-red-200" : "bg-stone-800 text-stone-50 border-stone-900"}`}>
            {toast.type === "error" ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5 text-stone-300" />}
            {toast.msg}
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-10 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src="/SwaddleShawlsSymbolLogo.png" alt="SwaddleShawls Logo" className="w-10 h-10 object-contain drop-shadow-sm" />
            <div>
              <h1 className="text-xl font-serif text-stone-900 tracking-tight font-bold">SwaddleShawls</h1>
              <p className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">Admin Portal</p>
            </div>
          </div>
          
          <button onClick={() => { sessionStorage.removeItem(ADMIN_TOKEN_KEY); window.location.href = "/"; }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest bg-stone-100 text-stone-600 hover:text-stone-900 hover:bg-stone-200 transition-all">
            <span>Sign Out</span>
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      <div className="flex-grow max-w-[1600px] w-full mx-auto px-6 lg:px-10 py-10">
        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-10 bg-white p-1.5 rounded-2xl border border-stone-200 shadow-sm w-fit">
          {tabs.map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); setSearch(""); setStatusFilter(""); }}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === t.id ? "bg-stone-800 text-white shadow-md" : "text-stone-500 hover:text-stone-800 hover:bg-stone-50"}`}>
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW ── */}
        {tab === "overview" && overview && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              <Stat label="Total Orders" value={overview.totalOrders} icon={<PackageSearch className="w-5 h-5 text-blue-600" />} accent="bg-blue-50" />
              <Stat label="Gross Revenue" value={`$${overview.totalRevenue.toFixed(2)}`} icon={<DollarSign className="w-5 h-5 text-emerald-600" />} accent="bg-emerald-50" />
              <Stat label="Total Clients" value={overview.totalClients} icon={<UsersRound className="w-5 h-5 text-purple-600" />} accent="bg-purple-50" />
              <Stat label="Pending Fulfillment" value={overview.statusCounts?.confirmed || 0} icon={<Clock className="w-5 h-5 text-amber-600" />} accent="bg-amber-50" />
            </div>
            
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Status Breakdown */}
              <div className="lg:col-span-1 bg-white rounded-2xl border border-stone-200 p-6 h-fit shadow-sm">
                <h3 className="font-bold text-stone-800 text-base mb-6 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-stone-400" /> Pipeline Status
                </h3>
                <div className="space-y-4">
                  {Object.entries(overview.statusCounts || {}).map(([s, c]) => (
                    <div key={s} className="flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-stone-300 group-hover:bg-stone-800 transition-colors" />
                        <p className="text-sm text-stone-500 font-medium capitalize">{s.replace("_"," ")}</p>
                      </div>
                      <p className="text-base font-bold text-stone-800">{c}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Orders List */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
                <div className="px-6 py-5 border-b border-stone-100 bg-stone-50/50">
                  <h3 className="font-bold text-stone-800 text-base flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-stone-400" /> Recent Transactions
                  </h3>
                </div>
                <div className="divide-y divide-stone-100">
                  {(overview.recentOrders || []).map(o => (
                    <div key={o._id} className="px-6 py-4 flex items-center justify-between hover:bg-stone-50 transition-colors">
                      <div className="flex flex-col gap-1">
                        <span className="font-mono text-sm font-bold text-stone-800">{o.orderNumber}</span>
                        <span className="text-stone-500 text-xs font-medium">{o.customerName}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <StatusBadge status={o.status} />
                        <span className="text-sm font-bold text-stone-800 w-20 text-right">${o.total?.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                  {(!overview.recentOrders || overview.recentOrders.length === 0) && (
                    <div className="px-6 py-12 text-center text-stone-400 text-sm">No recent orders.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── ORDERS ── */}
        {tab === "orders" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row flex-wrap gap-4 mb-8 bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
              <div className="relative flex-grow max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === "Enter" && fetchTab("orders")}
                  placeholder="Search order number or email..." 
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-stone-50 border border-stone-200 text-sm text-stone-800 focus:border-stone-400 focus:bg-white outline-none transition-all placeholder:text-stone-400" />
              </div>
              <div className="relative">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setTimeout(() => fetchTab("orders"), 0); }}
                  className="pl-11 pr-10 py-3 rounded-xl bg-stone-50 border border-stone-200 text-sm text-stone-800 appearance-none cursor-pointer focus:border-stone-400 focus:bg-white outline-none transition-all">
                  <option value="">All Statuses</option>
                  {["awaiting_payment","confirmed","processing","shipped","delivered"].map(s => <option key={s} value={s}>{s.replace("_"," ")}</option>)}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
              </div>
              <button onClick={() => fetchTab("orders")} 
                className="px-8 py-3 bg-stone-800 text-white rounded-xl text-sm font-bold hover:bg-stone-900 transition-colors flex items-center justify-center gap-2 min-w-[120px] shadow-sm">
                {loading ? <RefreshCcw className="w-4 h-4 animate-spin" /> : "Search"}
              </button>
              <button onClick={handleSyncStripe} disabled={loading}
                className="px-6 py-3 ml-auto bg-stone-100 text-stone-700 border border-stone-200 rounded-xl text-sm font-bold hover:bg-stone-200 transition-colors flex items-center justify-center gap-2 shadow-sm">
                <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Sync Stripe
              </button>
            </div>

            <div className="flex items-center justify-between mb-4 px-2">
              <p className="text-[11px] font-bold text-stone-400 uppercase tracking-widest">{orders.total} Orders Found</p>
              <p className="text-[11px] font-bold text-stone-400 uppercase tracking-widest">Page {orders.page} of {orders.pages}</p>
            </div>

            <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
              <div className="divide-y divide-stone-100">
                {(orders.orders || []).map(o => (
                  <div key={o._id} className="group">
                    <button onClick={() => setExpandedOrder(expandedOrder === o._id ? null : o._id)}
                      className="w-full px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-stone-50 transition-all text-left gap-4">
                      <div className="flex items-center gap-5 min-w-0">
                        <div className="w-12 h-12 rounded-2xl bg-stone-50 border border-stone-100 flex items-center justify-center shrink-0">
                          <PackageSearch className="w-5 h-5 text-stone-400" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <span className="font-mono text-base font-bold text-stone-800">{o.orderNumber}</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-stone-100 text-stone-500">{o.paymentMethod}</span>
                          </div>
                          <p className="text-sm text-stone-500 truncate font-medium">{o.customerName} <span className="mx-2 text-stone-300">|</span> {o.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 shrink-0 pl-17 sm:pl-0">
                        <span className="text-base font-bold text-stone-800 w-24 sm:text-right">${o.total?.toFixed(2)}</span>
                        <div className="w-32 flex justify-end"><StatusBadge status={o.status} /></div>
                        {syncResults[o._id] === "synced" && <span className="text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-full bg-emerald-50 border border-emerald-100 uppercase tracking-wider">✓ CRM</span>}
                        <div className="w-8 h-8 rounded-full bg-stone-50 flex items-center justify-center text-stone-400 group-hover:bg-stone-100 group-hover:text-stone-800 transition-colors">
                          <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${expandedOrder === o._id ? "rotate-180" : ""}`} />
                        </div>
                      </div>
                    </button>
                    
                    {expandedOrder === o._id && (
                      <div className="px-6 pb-6 border-t border-stone-100 bg-stone-50/50">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
                          {/* Items */}
                          <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm">
                            <h4 className="text-[11px] font-bold uppercase tracking-widest text-stone-400 mb-4 flex items-center gap-2">
                              <PackageSearch className="w-4 h-4" /> Line Items
                            </h4>
                            <div className="space-y-3">
                              {o.items?.map((item, i) => (
                                <div key={i} className="flex justify-between items-center text-sm">
                                  <div className="flex gap-3 items-center">
                                    <span className="w-6 h-6 rounded bg-stone-100 flex items-center justify-center text-[11px] font-bold text-stone-600">{item.quantity}</span>
                                    <span className="text-stone-700 font-medium">{item.productName}</span>
                                  </div>
                                  <span className="font-bold text-stone-800">${(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          {/* Shipping Details */}
                          <div className="bg-white rounded-2xl p-5 border border-stone-200 relative overflow-hidden shadow-sm">
                            <Truck className="absolute -right-4 -bottom-4 w-32 h-32 text-stone-50 pointer-events-none" />
                            <h4 className="text-[11px] font-bold uppercase tracking-widest text-stone-400 mb-4 flex items-center gap-2">
                              <Truck className="w-4 h-4" /> Shipping Info
                            </h4>
                            {o.shippingAddress ? (
                              <p className="text-sm text-stone-600 leading-relaxed font-medium">
                                {[o.shippingAddress.street, o.shippingAddress.city, o.shippingAddress.state, o.shippingAddress.zip, o.shippingAddress.country].filter(Boolean).join(", ") || "No structured address provided."}
                              </p>
                            ) : <p className="text-sm text-stone-400 italic">No address provided</p>}
                            
                            {o.trackingNumber && (
                              <div className="mt-4 p-3 rounded-xl bg-stone-50 border border-stone-100 inline-block relative z-10">
                                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">{o.trackingCarrier}</p>
                                <p className="text-sm font-mono text-stone-800">{o.trackingNumber}</p>
                              </div>
                            )}
                            <p className="text-[10px] text-stone-400 mt-4 font-bold uppercase tracking-widest relative z-10">
                              Placed: {new Date(o.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        
                        {/* Action Bar */}
                        <div className="flex flex-wrap items-center gap-3 mt-6 pt-6 border-t border-stone-200">
                          <button onClick={() => handleCrmSync(o._id)} disabled={syncingId === o._id}
                            className="px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-xl bg-blue-50 border border-blue-100 text-blue-700 hover:bg-blue-100 transition-colors disabled:opacity-50 flex items-center gap-2">
                            {syncingId === o._id ? <RefreshCcw className="w-3.5 h-3.5 animate-spin" /> : <RefreshCcw className="w-3.5 h-3.5" />}
                            Sync CRM
                          </button>
                          
                          <button onClick={() => handleResendConfirmation(o._id)}
                            className="px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-xl bg-stone-100 border border-stone-200 text-stone-600 hover:bg-stone-200 transition-colors">
                            Resend Receipt
                          </button>
                          
                          {o.status === "confirmed" && (
                            <button onClick={() => handleStatusUpdate(o._id, "processing")} disabled={statusUpdating === o._id}
                              className="px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-xl bg-amber-50 border border-amber-100 text-amber-700 hover:bg-amber-100 transition-colors">
                              Begin Processing
                            </button>
                          )}
                          
                          {(o.status === "processing" || o.status === "confirmed") && (
                            <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-stone-200 ml-auto flex-wrap shadow-sm">
                              <input placeholder="Carrier (UPS, USPS)" value={trackingForm[o._id]?.trackingCarrier || ""} onChange={e => setTrackingForm(p => ({ ...p, [o._id]: { ...p[o._id], trackingCarrier: e.target.value } }))}
                                className="px-3 py-2 rounded-lg bg-stone-50 border border-stone-100 text-xs text-stone-800 w-32 focus:border-stone-300 focus:bg-white outline-none placeholder:text-stone-400" />
                              <input placeholder="Tracking Number" value={trackingForm[o._id]?.trackingNumber || ""} onChange={e => setTrackingForm(p => ({ ...p, [o._id]: { ...p[o._id], trackingNumber: e.target.value } }))}
                                className="px-3 py-2 rounded-lg bg-stone-50 border border-stone-100 text-xs text-stone-800 w-48 font-mono focus:border-stone-300 focus:bg-white outline-none placeholder:text-stone-400" />
                              <button onClick={() => handleTracking(o._id)} 
                                className="px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-lg bg-stone-800 text-white hover:bg-stone-900 transition-colors flex items-center gap-2 shadow-sm">
                                <Truck className="w-3.5 h-3.5" /> Dispatch
                              </button>
                            </div>
                          )}
                          
                          {o.status === "shipped" && (
                            <button onClick={() => handleMarkDelivered(o._id)}
                              className="px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 hover:bg-emerald-100 transition-colors ml-auto flex items-center gap-2">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Mark Delivered
                            </button>
                          )}
                        </div>
                        
                        {syncResults[o._id] && syncResults[o._id] !== "synced" && (
                          <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl">
                            <p className="text-xs text-red-700 font-bold flex items-center gap-2">
                              <AlertCircle className="w-4 h-4" /> CRM Error: {syncResults[o._id]}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                {(!orders.orders || orders.orders.length === 0) && !loading && (
                  <div className="px-6 py-20 flex flex-col items-center justify-center text-stone-400 gap-4">
                    <PackageSearch className="w-12 h-12 opacity-20" />
                    <p className="text-sm font-medium">No orders found matching criteria.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── CLIENTS ── */}
        {tab === "clients" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row flex-wrap gap-4 mb-8 bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
              <div className="relative flex-grow max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === "Enter" && fetchTab("clients")}
                  placeholder="Search client email..." 
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-stone-50 border border-stone-200 text-sm text-stone-800 focus:border-stone-400 focus:bg-white outline-none transition-all placeholder:text-stone-400" />
              </div>
              <button onClick={() => fetchTab("clients")} 
                className="px-8 py-3 bg-stone-800 text-white rounded-xl text-sm font-bold hover:bg-stone-900 transition-colors flex items-center justify-center gap-2 min-w-[120px] shadow-sm">
                {loading ? <RefreshCcw className="w-4 h-4 animate-spin" /> : "Search"}
              </button>
            </div>

            <div className="flex items-center justify-between mb-4 px-2">
              <p className="text-[11px] font-bold text-stone-400 uppercase tracking-widest">{clients.total} Clients Found</p>
            </div>

            <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left whitespace-nowrap">
                  <thead className="bg-stone-50 border-b border-stone-100 text-[10px] uppercase tracking-widest text-stone-500 font-bold">
                    <tr>
                      <th className="px-6 py-5">Email / Identity</th>
                      <th className="px-6 py-5">Phone</th>
                      <th className="px-6 py-5 text-center">Orders</th>
                      <th className="px-6 py-5 text-right">Total Spend</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {(clients.clients || []).map(c => (
                      <tr key={c._id} className="hover:bg-stone-50 transition-colors group">
                        <td className="px-6 py-5 font-medium text-stone-800 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 group-hover:bg-stone-800 group-hover:text-white transition-colors">
                            <UsersRound className="w-4 h-4" />
                          </div>
                          {c.email}
                        </td>
                        <td className="px-6 py-5 text-stone-500">{c.phone || "—"}</td>
                        <td className="px-6 py-5 text-center">
                          <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-1 rounded-lg bg-stone-100 text-stone-600 font-bold border border-stone-200">
                            {c.orderCount}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right font-bold text-stone-800 tracking-tight">
                          ${c.totalSpend?.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                    {(!clients.clients || clients.clients.length === 0) && !loading && (
                      <tr>
                        <td colSpan={4} className="px-6 py-20 text-center text-stone-400">
                          <div className="flex flex-col items-center gap-4">
                            <UsersRound className="w-12 h-12 opacity-20" />
                            <p className="text-sm font-medium">No clients found in the database.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
