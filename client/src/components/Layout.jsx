import React from "react";
import { useEffect, useMemo, useState, useRef } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { navGroups } from "../data/navigation.js";
import { apiGet, apiPost } from "../lib/api.js";
import { persistSession, useAppStore } from "../store/useAppStore.js";
import { disconnectSocket } from "../lib/socket.js";
import { 
  Menu, Search, Bell, Plus, User, ChevronDown, CheckCircle2, 
  AlertTriangle, AlertCircle, Building2, LogOut, Settings, ExternalLink,
  ShieldCheck, Activity, Radio
} from "lucide-react";
import { CommandPalette } from "./CommandPalette.jsx";

export function ToastContainer() {
  const toasts = useAppStore((state) => state.toasts);
  const removeToast = useAppStore((state) => state.removeToast);

  if (!toasts.length) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => {
        let Icon = CheckCircle2;
        let color = "#10b981";
        if (toast.type === "error" || toast.type === "danger") {
          Icon = AlertCircle;
          color = "#f43f5e";
        } else if (toast.type === "warn" || toast.type === "warning") {
          Icon = AlertTriangle;
          color = "#f59e0b";
        }
        return (
          <div 
            key={toast.id} 
            className={`toast toast-${toast.type}`} 
            onClick={() => removeToast(toast.id)}
            style={{ borderColor: color }}
          >
            <Icon size={18} style={{ color, flexShrink: 0 }} />
            <span style={{ flex: 1 }}>{toast.message}</span>
          </div>
        );
      })}
    </div>
  );
}

export function AppShell({ children }) {
  const user = useAppStore((state) => state.user);
  const workspaceId = useAppStore((state) => state.workspaceId);
  const setWorkspaceId = useAppStore((state) => state.setWorkspaceId);
  const sidebarOpen = useAppStore((state) => state.sidebarOpen);
  const setSidebarOpen = useAppStore((state) => state.setSidebarOpen);

  const [workspaces, setWorkspaces] = useState([]);

  const activeRole = useMemo(() => {
    return (
      user?.workspaceRoles?.find(
        (item) => String(item.workspaceId) === String(workspaceId)
      )?.role ||
      user?.roles?.[0] ||
      "viewer"
    );
  }, [user, workspaceId]);

  useEffect(() => {
    if (!user) return;
    let mounted = true;
    apiGet("/workspaces")
      .then((response) => {
        if (mounted) setWorkspaces(response.data || []);
      })
      .catch(() => {
        if (mounted) setWorkspaces([]);
      });
    return () => {
      mounted = false;
    };
  }, [user]);

  const workspaceOptions = useMemo(() => {
    if (workspaces.length) return workspaces;
    return (user?.workspaceIds || []).map((id) => ({
      _id: id,
      name: `Workspace ${String(id).slice(-4)}`,
    }));
  }, [user, workspaces]);

  const visibleGroups = useMemo(
    () =>
      navGroups.map((group) => ({
        ...group,
        items: group.items.filter(
          (item) =>
            !item.roles ||
            item.roles.includes(activeRole) ||
            activeRole === "super-admin"
        ),
      })),
    [activeRole]
  );

  return (
    <div className="app-shell">
      <div 
        className={`sidebar-backdrop ${sidebarOpen ? "open" : ""}`} 
        onClick={() => setSidebarOpen(false)}
      />
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        {/* Brand Header */}
        <Link 
          to="/app" 
          className="brand" 
          onClick={() => setSidebarOpen(false)} 
        >
          <div className="brand-mark" />
          <div>
            <div className="brand-title">SMIMP</div>
          </div>
          <span className="brand-version">v2.4 PRO</span>
        </Link>
        
        {/* Workspace Selector */}
        <div style={{ padding: "16px 16px 12px 16px", borderBottom: "1px solid var(--color-border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, fontSize: 11, fontWeight: 700, color: "var(--color-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            <Building2 size={13} />
            Workspace
          </div>
          <div style={{ position: "relative" }}>
            <select
              style={{
                width: "100%",
                background: "var(--color-surface-elevated)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-sm)",
                padding: "8px 30px 8px 12px",
                fontSize: 13,
                fontWeight: 600,
                color: "var(--color-text)",
                appearance: "none",
                cursor: "pointer",
              }}
              value={workspaceId || ""}
              onChange={(event) => {
                const nextWorkspaceId = event.target.value || null;
                setWorkspaceId(nextWorkspaceId);
                const session = JSON.parse(
                  localStorage.getItem("smimp-user") || "null"
                );
                if (session) {
                  persistSession({ ...session, workspaceId: nextWorkspaceId });
                }
              }}
            >
              {workspaceOptions.map((workspace) => (
                <option key={workspace._id} value={workspace._id}>
                  {workspace.name}
                </option>
              ))}
            </select>
            <ChevronDown size={14} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--color-muted)" }} />
          </div>
        </div>

        {/* Navigation Sections */}
        <nav style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
          {visibleGroups.map((group) => (
            <div className="nav-section" key={group.label}>
              <div className="nav-label">{group.label}</div>
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === "/app"}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `nav-item ${isActive ? "active" : ""}`
                    }
                  >
                    <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      {Icon && <span className="nav-item-icon"><Icon size={16} strokeWidth={1.75} /></span>}
                      <span>{item.label}</span>
                    </span>
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Operational Footer Bar */}
        <div style={{ 
          padding: "14px 18px", 
          borderTop: "1px solid var(--color-border)", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between",
          background: "var(--color-surface-elevated)" 
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span className="status-dot pulse" />
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--color-dark-green)", letterSpacing: "0.02em" }}>
              Telemetry Active
            </span>
          </div>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--color-muted)" }}>
            99.99%
          </span>
        </div>
      </aside>

      <main className="main">{children}</main>
      <CommandPalette />
      <ToastContainer />
    </div>
  );
}

export function Topbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAppStore((state) => state.user);
  const logout = useAppStore((state) => state.logout);
  const sidebarOpen = useAppStore((state) => state.sidebarOpen);
  const setSidebarOpen = useAppStore((state) => state.setSidebarOpen);

  const [profileOpen, setProfileOpen] = useState(false);
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [recentAlerts, setRecentAlerts] = useState([]);

  const menuRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    let mounted = true;
    apiGet("/alerts")
      .then((response) => {
        if (mounted) {
          const active = (response.data || []).filter(a => a.status === "open");
          setRecentAlerts(active);
        }
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, [user]);

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setProfileOpen(false);
        setQuickCreateOpen(false);
        setNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignout = async () => {
    const session = JSON.parse(localStorage.getItem("smimp-user") || "null");
    try {
      await apiPost("/auth/logout", {
        refreshToken: session?.refreshToken || null,
      });
    } catch {
      // Local fallback
    }
    disconnectSocket();
    logout();
    navigate("/auth/login");
  };

  const currentPathSegment = location.pathname.split("/").filter(Boolean)[1] || "dashboard";
  const formattedPageName = currentPathSegment
    .split("-")
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return (
    <header className="topbar" ref={menuRef}>
      <div className="topbar-left">
        <button 
          className="button hamburger-btn" 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{ padding: "6px 10px", background: "var(--color-surface-elevated)" }}
          aria-label="Toggle Sidebar"
        >
          <Menu size={18} strokeWidth={1.75} />
        </button>

        {/* Global Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--color-muted)" }}>
          <span style={{ fontWeight: 600, color: "var(--color-brand)" }}>SMIMP</span>
          <span>/</span>
          <span style={{ fontWeight: 700, color: "var(--color-text)" }}>{formattedPageName}</span>
        </div>

        {/* Live System Status Indicator */}
        <div className="system-status-indicator" style={{ marginLeft: 8 }}>
          <span className="status-dot pulse" />
          <span>Systems Operational</span>
        </div>
      </div>

      {/* Global Search / Command Palette Trigger */}
      <div 
        className="search" 
        style={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between", 
          cursor: "pointer", 
          color: "var(--color-muted)",
          maxWidth: 320
        }}
        onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
          <Search size={15} />
          Search or jump to...
        </span>
        <kbd style={{ 
          background: "var(--color-surface-hover)", 
          padding: "2px 7px", 
          borderRadius: 4, 
          fontSize: 11, 
          fontFamily: "'JetBrains Mono', monospace",
          color: "var(--color-text-soft)",
          border: "1px solid var(--color-border)"
        }}>
          Ctrl K
        </kbd>
      </div>

      <div className="topbar-right">
        {/* Quick Action Button & Dropdown */}
        <div style={{ position: "relative" }}>
          <button 
            className="button black" 
            style={{ height: "36px", padding: "0 14px", gap: 6 }}
            onClick={() => {
              setQuickCreateOpen(!quickCreateOpen);
              setProfileOpen(false);
              setNotificationsOpen(false);
            }}
            title="Create Resource"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span style={{ fontSize: 13 }}>Create</span>
          </button>
          {quickCreateOpen && (
            <div style={{
              position: "absolute",
              top: "44px",
              right: 0,
              width: "200px",
              background: "var(--color-surface-elevated)",
              border: "1px solid var(--color-border-strong)",
              borderRadius: "var(--radius-sm)",
              boxShadow: "var(--shadow-lg)",
              zIndex: 100,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column"
            }}>
              <button 
                style={{ padding: "10px 14px", textAlign: "left", fontSize: 13, fontWeight: 500, borderBottom: "1px solid var(--color-border)", color: "var(--color-text)" }}
                onClick={() => { setQuickCreateOpen(false); navigate("/app/services"); }}
              >
                + Monitored Service
              </button>
              <button 
                style={{ padding: "10px 14px", textAlign: "left", fontSize: 13, fontWeight: 500, borderBottom: "1px solid var(--color-border)", color: "var(--color-text)" }}
                onClick={() => { setQuickCreateOpen(false); navigate("/app/alert-rules"); }}
              >
                + Alert Rule
              </button>
              <button 
                style={{ padding: "10px 14px", textAlign: "left", fontSize: 13, fontWeight: 500, borderBottom: "1px solid var(--color-border)", color: "var(--color-text)" }}
                onClick={() => { setQuickCreateOpen(false); navigate("/app/incidents"); }}
              >
                + Declare Incident
              </button>
              <button 
                style={{ padding: "10px 14px", textAlign: "left", fontSize: 13, fontWeight: 500, color: "var(--color-text)" }}
                onClick={() => { setQuickCreateOpen(false); navigate("/app/maintenance"); }}
              >
                + Maintenance Window
              </button>
            </div>
          )}
        </div>

        {/* Notifications Alert Bell */}
        <div style={{ position: "relative" }}>
          <button 
            className="button" 
            style={{ height: "36px", width: "36px", padding: 0, position: "relative" }}
            onClick={() => {
              setNotificationsOpen(!notificationsOpen);
              setProfileOpen(false);
              setQuickCreateOpen(false);
            }}
            aria-label="Notifications"
          >
            <Bell size={16} />
            {recentAlerts.length > 0 && (
              <span style={{
                position: "absolute",
                top: "6px",
                right: "6px",
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "var(--color-danger)",
                boxShadow: "0 0 8px var(--color-danger)"
              }} />
            )}
          </button>
          {notificationsOpen && (
            <div style={{
              position: "absolute",
              top: "44px",
              right: 0,
              width: "320px",
              background: "var(--color-surface-elevated)",
              border: "1px solid var(--color-border-strong)",
              borderRadius: "var(--radius-sm)",
              boxShadow: "var(--shadow-xl)",
              zIndex: 100,
              overflow: "hidden"
            }}>
              <div style={{ padding: "12px 16px", fontWeight: 700, borderBottom: "1px solid var(--color-border)", fontSize: 13, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>Active Alerts</span>
                <span className="badge" style={{ padding: "2px 8px", fontSize: 11, background: "var(--color-danger-bg)", color: "var(--color-danger)" }}>
                  {recentAlerts.length} Active
                </span>
              </div>
              <div style={{ maxHeight: "260px", overflowY: "auto" }}>
                {recentAlerts.length === 0 ? (
                  <div style={{ padding: "24px 16px", textAlign: "center", color: "var(--color-muted)", fontSize: 13 }}>
                    <CheckCircle2 size={24} style={{ color: "var(--color-success)", margin: "0 auto 8px" }} />
                    <div>All systems running smoothly.</div>
                    <div style={{ fontSize: 11, marginTop: 4 }}>No open alerts triggered.</div>
                  </div>
                ) : (
                  recentAlerts.map(alert => (
                    <div 
                      key={alert._id} 
                      style={{ padding: "12px 16px", borderBottom: "1px solid var(--color-border)", cursor: "pointer", transition: "background 0.2s" }}
                      onClick={() => { setNotificationsOpen(false); navigate(`/app/alerts/${alert._id}`); }}
                    >
                      <div style={{ fontWeight: 600, fontSize: 13, color: "var(--color-text)" }}>{alert.title}</div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 4 }}>
                        <span className={`status-badge status-badge--${alert.severity === "critical" ? "critical" : "high"}`} style={{ fontSize: 10 }}>
                          {alert.severity}
                        </span>
                        <span style={{ color: "var(--color-muted)", fontSize: 11 }}>{alert.status}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {recentAlerts.length > 0 && (
                <div style={{ padding: "10px", textAlign: "center", borderTop: "1px solid var(--color-border)", background: "var(--color-surface)" }}>
                  <Link 
                    to="/app/alerts" 
                    onClick={() => setNotificationsOpen(false)}
                    style={{ fontSize: 12, fontWeight: 600, color: "var(--color-brand)" }}
                  >
                    View Alert Center &rarr;
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Profile Pill & Menu */}
        <div style={{ position: "relative" }}>
          <button 
            className="button"
            style={{ height: "36px", display: "flex", alignItems: "center", gap: 8, padding: "6px 12px" }}
            onClick={() => {
              setProfileOpen(!profileOpen);
              setQuickCreateOpen(false);
              setNotificationsOpen(false);
            }}
          >
            <div style={{
              width: "22px",
              height: "22px",
              borderRadius: "50%",
              background: "var(--gradient-brand)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              fontWeight: 800,
              color: "#020617"
            }}>
              {(user?.name || "U").charAt(0).toUpperCase()}
            </div>
            <span style={{ fontSize: 13, fontWeight: 600 }}>{user?.name || "Guest"}</span>
            <ChevronDown size={13} style={{ color: "var(--color-muted)" }} />
          </button>
          {profileOpen && (
            <div style={{
              position: "absolute",
              top: "44px",
              right: 0,
              width: "220px",
              background: "var(--color-surface-elevated)",
              border: "1px solid var(--color-border-strong)",
              borderRadius: "var(--radius-sm)",
              boxShadow: "var(--shadow-xl)",
              zIndex: 100,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column"
            }}>
              <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--color-border)", background: "var(--color-surface)" }}>
                <div style={{ fontSize: 11, color: "var(--color-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Signed in as</div>
                <div style={{ fontWeight: 700, fontSize: 13, color: "var(--color-text)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {user?.email || "guest@smimp.io"}
                </div>
                <div style={{ marginTop: 6 }}>
                  <span className="badge" style={{ padding: "2px 8px", fontSize: 10, background: "var(--color-brand-muted)", color: "var(--color-brand)" }}>
                    {user?.roles?.[0] || "operator"}
                  </span>
                </div>
              </div>
              <button 
                style={{ padding: "10px 16px", textAlign: "left", fontSize: 13, borderBottom: "1px solid var(--color-border)", display: "flex", alignItems: "center", gap: 10, color: "var(--color-text)" }}
                onClick={() => { setProfileOpen(false); navigate("/app/profile"); }}
              >
                <Settings size={15} style={{ color: "var(--color-muted)" }} />
                Account Settings
              </button>
              <button 
                style={{ padding: "10px 16px", textAlign: "left", fontSize: 13, display: "flex", alignItems: "center", gap: 10, color: "var(--color-danger)" }}
                onClick={() => { setProfileOpen(false); handleSignout(); }}
              >
                <LogOut size={15} />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export function PageHeader({ title, copy, action, badge }) {
  return (
    <div className="page-header-container">
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
          <h1 className="page-title">{title}</h1>
          {badge && <span className="badge">{badge}</span>}
        </div>
        {copy ? <p className="page-copy">{copy}</p> : null}
      </div>
      {action && <div className="button-row">{action}</div>}
    </div>
  );
}

export function Panel({ title, children, className = "", action }) {
  return (
    <section className={`panel ${className}`}>
      {title ? (
        <div className="panel-header">
          <h3 className="panel-title">{title}</h3>
          {action && <div>{action}</div>}
        </div>
      ) : null}
      {children}
    </section>
  );
}
