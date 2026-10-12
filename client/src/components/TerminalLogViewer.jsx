import React, { useEffect, useState, useRef, useMemo } from "react";
import { apiGet } from "../lib/api.js";
import { Topbar, PageHeader } from "./Layout.jsx";
import { Terminal, Copy, Check, Pause, Play, RefreshCw, Filter, Search } from "lucide-react";

export function TerminalLogViewer() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isPaused, setIsPaused] = useState(false);
  const [copied, setCopied] = useState(false);

  const endRef = useRef(null);

  const fetchLogs = () => {
    setLoading(true);
    apiGet("/logs")
      .then((res) => {
        const data = res.data || [];
        setLogs([...data].reverse());
        setError("");
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    if (!isPaused && endRef.current) {
      endRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, isPaused]);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchSeverity = filterSeverity === "all" || (log.severity || "").toLowerCase() === filterSeverity;
      const matchSearch = !searchQuery || 
        (log.message || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (log.environment || "").toLowerCase().includes(searchQuery.toLowerCase());
      return matchSeverity && matchSearch;
    });
  }, [logs, filterSeverity, searchQuery]);

  const handleCopyAll = () => {
    const text = filteredLogs.map(l => `[${new Date(l.occurredAt).toISOString()}] [${(l.severity || "INFO").toUpperCase()}] ${l.message}`).join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getLogBadge = (severity) => {
    const s = (severity || "info").toLowerCase();
    switch (s) {
      case "critical":
        return { color: "#fb7185", bg: "rgba(244, 63, 94, 0.15)", border: "rgba(244, 63, 94, 0.3)" };
      case "error":
        return { color: "#f87171", bg: "rgba(239, 68, 68, 0.15)", border: "rgba(239, 68, 68, 0.3)" };
      case "warn":
        return { color: "#fbbf24", bg: "rgba(245, 158, 11, 0.15)", border: "rgba(245, 158, 11, 0.3)" };
      case "info":
        return { color: "#34d399", bg: "rgba(16, 185, 129, 0.15)", border: "rgba(16, 185, 129, 0.3)" };
      case "debug":
        return { color: "#38bdf8", bg: "rgba(56, 189, 248, 0.15)", border: "rgba(56, 189, 248, 0.3)" };
      default:
        return { color: "#94a3b8", bg: "rgba(255, 255, 255, 0.05)", border: "rgba(255, 255, 255, 0.1)" };
    }
  };

  return (
    <>
      <Topbar />
      <PageHeader
        title="Live Log Stream"
        copy="Real-time distributed system telemetry, service output, and audit trail events."
        action={
          <div className="button-row">
            <button 
              className="button"
              onClick={() => setIsPaused(!isPaused)}
              title={isPaused ? "Resume live auto-scroll" : "Pause auto-scroll"}
            >
              {isPaused ? <Play size={14} style={{ color: "var(--color-success)" }} /> : <Pause size={14} />}
              <span>{isPaused ? "Resume Stream" : "Pause Stream"}</span>
            </button>
            <button className="button" onClick={fetchLogs} title="Refresh logs">
              <RefreshCw size={14} className={loading ? "spin" : ""} />
              <span>Refresh</span>
            </button>
            <button className="button" onClick={handleCopyAll} title="Copy filtered logs">
              {copied ? <Check size={14} style={{ color: "var(--color-success)" }} /> : <Copy size={14} />}
              <span>{copied ? "Copied" : "Copy Logs"}</span>
            </button>
          </div>
        }
      />
      
      {error && <div className="alert-banner alert-banner--error">{error}</div>}

      {/* Terminal Shell Container */}
      <div 
        style={{
          background: "#080c14",
          border: "1px solid var(--color-border-strong)",
          borderRadius: "var(--radius-md)",
          boxShadow: "var(--shadow-xl)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          height: "calc(100vh - 230px)",
        }}
      >
        {/* Terminal Header */}
        <div 
          style={{
            padding: "10px 16px",
            background: "#0d1322",
            borderBottom: "1px solid var(--color-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          {/* Mac window dots */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ display: "flex", gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#ef4444", display: "inline-block" }} />
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#f59e0b", display: "inline-block" }} />
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#10b981", display: "inline-block" }} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: "var(--color-text-soft)", fontFamily: "'JetBrains Mono', monospace" }}>
              <Terminal size={14} style={{ color: "var(--color-brand)" }} />
              <span>smimp-agent://telemetry/stdout</span>
            </div>
          </div>

          {/* Quick Filter Toolbar */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Search filter input */}
            <div style={{ position: "relative" }}>
              <Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--color-muted)" }} />
              <input
                type="text"
                placeholder="Filter logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  height: "30px",
                  padding: "4px 10px 4px 28px",
                  fontSize: 12,
                  width: "180px",
                  background: "var(--color-surface)",
                  borderRadius: "var(--radius-sm)",
                  fontFamily: "'JetBrains Mono', monospace"
                }}
              />
            </div>

            {/* Severity Pill Selector */}
            <div style={{ display: "flex", gap: 4 }}>
              {["all", "critical", "error", "warn", "info"].map((sev) => (
                <button
                  key={sev}
                  onClick={() => setFilterSeverity(sev)}
                  style={{
                    padding: "3px 8px",
                    borderRadius: "4px",
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    fontFamily: "'JetBrains Mono', monospace",
                    background: filterSeverity === sev ? "var(--color-brand-muted)" : "transparent",
                    color: filterSeverity === sev ? "var(--color-brand)" : "var(--color-muted)",
                    border: filterSeverity === sev ? "1px solid rgba(56, 189, 248, 0.4)" : "1px solid transparent",
                    transition: "all 0.15s"
                  }}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Terminal Log Output Window */}
        <div 
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "16px 20px",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 12.5,
            lineHeight: 1.6,
            color: "#e2e8f0",
          }}
        >
          <div style={{ color: "var(--color-muted)", marginBottom: 12, borderBottom: "1px dashed rgba(255,255,255,0.06)", paddingBottom: 8 }}>
            [SMIMP Kernel v2.4.0-release] Telemetry pipeline synced. Showing {filteredLogs.length} events.
          </div>

          {filteredLogs.length === 0 ? (
            <div style={{ padding: "40px 0", textAlign: "center", color: "var(--color-muted)" }}>
              No log records match current filters.
            </div>
          ) : (
            filteredLogs.map((log, index) => {
              const badgeStyle = getLogBadge(log.severity);
              return (
                <div 
                  key={log._id || index}
                  style={{
                    display: "flex",
                    gap: 12,
                    alignItems: "flex-start",
                    padding: "3px 0",
                    borderBottom: "1px solid rgba(255, 255, 255, 0.02)",
                  }}
                >
                  <span style={{ color: "var(--color-faint)", minWidth: 32, userSelect: "none", textAlign: "right" }}>
                    {index + 1}
                  </span>
                  <span style={{ color: "var(--color-muted)", minWidth: 140, flexShrink: 0 }}>
                    {new Date(log.occurredAt).toLocaleTimeString()}
                  </span>
                  <span 
                    style={{
                      padding: "1px 6px",
                      borderRadius: 3,
                      fontSize: 10,
                      fontWeight: 700,
                      background: badgeStyle.bg,
                      color: badgeStyle.color,
                      border: `1px solid ${badgeStyle.border}`,
                      minWidth: 70,
                      textAlign: "center",
                      flexShrink: 0,
                    }}
                  >
                    {(log.severity || "INFO").toUpperCase()}
                  </span>
                  <span style={{ color: "var(--color-brand)", minWidth: 80, flexShrink: 0 }}>
                    [{log.environment || "prod"}]
                  </span>
                  <span style={{ color: "#f8fafc", flex: 1, wordBreak: "break-all" }}>
                    {log.message}
                  </span>
                </div>
              );
            })
          )}
          <div ref={endRef} />
        </div>
      </div>
    </>
  );
}
