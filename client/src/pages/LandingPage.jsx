import React from "react";
import { Link } from "react-router-dom";

const features = [
  {
    icon: "[ UP ]",
    title: "Uptime Monitoring",
    desc: "HTTP health checks with configurable intervals. Track latency and uptime across all global endpoints.",
  },
  {
    icon: "[ AL ]",
    title: "Smart Alerting",
    desc: "Rule-based threshold alerting on latency and error rate. Automatic deduplication prevents alert storms.",
  },
  {
    icon: "[ IN ]",
    title: "Incident Control",
    desc: "Auto-create incidents from alert breaches. Track status through investigation to resolution.",
  },
  {
    icon: "[ AI ]",
    title: "AI-Assisted Diagnostics",
    desc: "AI correlates logs and metrics to identify probable root causes instantly.",
  },
  {
    icon: "[ SL ]",
    title: "SLO Tracking",
    desc: "Define Service Level Objectives. Burn-rate telemetry notifies you before error budget depletion.",
  },
  {
    icon: "[ DP ]",
    title: "Dependency Graph",
    desc: "Map upstream and downstream dependencies. Isolate cascading failure blast radius.",
  },
];

const stats = [
  { value: "< 10ms", label: "Check latency" },
  { value: "99.99%", label: "Uptime tracked" },
  { value: "0ms", label: "Real-time sync" },
  { value: "∞", label: "Monitored endpoints" },
];

export function LandingPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)", paddingBottom: 64 }}>
      {/* Topbar HUD */}
      <header style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 40px",
        background: "rgba(0,0,0,0.8)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid var(--color-border-strong)",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div className="brand-mark" />
          <span style={{ fontWeight: 800, fontSize: 18, color: "#fff", letterSpacing: "0.1em", textTransform: "uppercase", textShadow: "var(--shadow-glow)" }}>
            Service Monitoring & Incident Management Platform
          </span>
        </div>
        <nav style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Link className="button" to="/auth/login">Access Terminal</Link>
          <Link className="button primary" to="/auth/register">Initialize Core</Link>
        </nav>
      </header>

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        
        {/* Cinematic Hero */}
        <section className="hero" style={{ marginTop: 40, marginBottom: 40 }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "4px 12px",
            background: "rgba(6, 182, 212, 0.1)",
            border: "1px solid var(--color-brand)",
            color: "var(--color-brand)",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            marginBottom: 24,
            boxShadow: "var(--shadow-glow)"
          }}>
            SYSTEM: ONLINE // VERSION: 1.0.0
          </div>

          <h1>
            Forging Observability<br />Through AI
          </h1>

          <p>
            Command your infrastructure. Our platform correlates telemetry streams with advanced AI diagnostics to neutralize incidents before they escalate.
          </p>

          <div className="button-row" style={{ justifyContent: "center", gap: 20 }}>
            <Link className="button primary" style={{ padding: "16px 32px", fontSize: 14 }} to="/auth/register">
              Boot Sequence &gt;
            </Link>
            <Link className="button" style={{ padding: "16px 32px", fontSize: 14 }} to="/auth/login">
              Authenticate
            </Link>
          </div>
        </section>

        {/* Telemetry Stats */}
        <section className="grid cols-4" style={{ marginBottom: 40 }}>
          {stats.map((stat) => (
            <div key={stat.label} className="panel" style={{ textAlign: "center", padding: "32px 16px" }}>
              <div className="metric-value" style={{ fontSize: 36, color: "var(--color-brand)", textShadow: "var(--shadow-glow)", marginBottom: 8 }}>
                {stat.value}
              </div>
              <div className="metric-label" style={{ margin: 0, color: "var(--color-text)" }}>
                {stat.label}
              </div>
            </div>
          ))}
        </section>

        {/* Feature Grid HUD */}
        <section className="grid cols-3">
          {features.map((feature) => (
            <div key={feature.title} className="panel">
              <div style={{
                color: "var(--color-brand)",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 14,
                marginBottom: 16,
                textShadow: "var(--shadow-glow)"
              }}>
                {feature.icon}
              </div>
              <h3 style={{ borderBottom: "none", paddingBottom: 0, marginBottom: 8, fontSize: 16 }}>
                {feature.title}
              </h3>
              <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "var(--color-text-soft)", lineHeight: 1.6 }}>
                {feature.desc}
              </p>
            </div>
          ))}
        </section>

      </main>
    </div>
  );
}
