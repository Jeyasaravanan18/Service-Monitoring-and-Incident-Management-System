import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Server, BellRing, Flame, Activity } from "lucide-react";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    } else {
      setQuery("");
    }
  }, [open]);

  if (!open) return null;

  const routes = [
    { name: "Services", path: "/app/services", icon: Server },
    { name: "Alerts", path: "/app/alerts", icon: BellRing },
    { name: "Incidents", path: "/app/incidents", icon: Flame },
    { name: "Logs", path: "/app/logs", icon: Activity },
    { name: "Settings", path: "/app/workspaces" },
    { name: "Teams", path: "/app/teams" },
    { name: "Status Pages", path: "/app/status" },
  ];

  const filtered = routes.filter((r) => r.name.toLowerCase().includes(query.toLowerCase()));

  const handleSelect = (path) => {
    navigate(path);
    setOpen(false);
  };

  return (
    <div 
      className="modal-backdrop" 
      onClick={() => setOpen(false)}
      style={{
        position: "fixed", top: 0, left: 0, width: "100%", height: "100%", 
        background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)", zIndex: 9999,
        display: "flex", justifyContent: "center", paddingTop: "10vh"
      }}
    >
      <div 
        className="modal-content panel" 
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 600, padding: 0, height: "fit-content",
          border: "1px solid var(--color-brand)",
          boxShadow: "var(--shadow-glow-strong)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", padding: "16px 24px", borderBottom: "1px solid var(--color-border-strong)" }}>
          <Search size={20} style={{ color: "var(--color-brand)", marginRight: 16 }} />
          <input
            ref={inputRef}
            className="search"
            style={{ width: "100%", background: "transparent", border: "none", fontSize: 18, padding: 0 }}
            placeholder="Search commands, pages... (Try 'services')"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div style={{ padding: "12px 0", maxHeight: 400, overflowY: "auto" }}>
          {filtered.length === 0 ? (
            <div style={{ padding: "16px 24px", color: "var(--color-text-soft)" }}>No results found for "{query}"</div>
          ) : (
            filtered.map((route, idx) => {
              const Icon = route.icon;
              return (
                <div 
                  key={idx}
                  onClick={() => handleSelect(route.path)}
                  style={{
                    padding: "12px 24px",
                    cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 12,
                    color: "var(--color-text)",
                    borderLeft: "3px solid transparent"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--color-surface-alt)";
                    e.currentTarget.style.borderLeftColor = "var(--color-brand)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.borderLeftColor = "transparent";
                  }}
                >
                  {Icon && <Icon size={16} />}
                  <span>{route.name}</span>
                </div>
              );
            })
          )}
        </div>
        <div style={{ padding: "8px 24px", borderTop: "1px solid var(--color-border-strong)", fontSize: 12, color: "var(--color-text-soft)", display: "flex", justifyContent: "space-between" }}>
          <span>Use <kbd style={{ background: "var(--color-surface-alt)", padding: "2px 6px", borderRadius: 4 }}>Ctrl+K</kbd> to toggle</span>
          <span><kbd style={{ background: "var(--color-surface-alt)", padding: "2px 6px", borderRadius: 4 }}>ESC</kbd> to close</span>
        </div>
      </div>
    </div>
  );
}
