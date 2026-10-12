import React from "react";
import { Link } from "react-router-dom";
import { 
  Activity, Server, ShieldCheck, Zap, BrainCircuit, Network, 
  ArrowRight, CheckCircle2, Bell, Radio, Cpu, Layers, Terminal, Lock
} from "lucide-react";

export function LandingPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)", color: "var(--color-text)", overflowX: "hidden" }}>
      {/* Glow Backdrops */}
      <div style={{
        position: "absolute",
        top: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: "1000px",
        height: "500px",
        background: "radial-gradient(circle at 50% 0%, rgba(56, 189, 248, 0.15) 0%, rgba(99, 102, 241, 0.08) 50%, transparent 80%)",
        pointerEvents: "none",
        zIndex: 0,
      }} />

      {/* Floating Modern Header */}
      <header style={{
        position: "sticky",
        top: 16,
        maxWidth: 1200,
        margin: "0 auto",
        padding: "12px 28px",
        background: "rgba(13, 19, 34, 0.75)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderRadius: "var(--radius-pill)",
        border: "1px solid var(--color-border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        zIndex: 50,
        boxShadow: "var(--shadow-md)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div className="brand-mark" style={{ width: 28, height: 28 }} />
          <span style={{ fontWeight: 800, fontSize: 19, letterSpacing: "-0.03em", color: "#ffffff" }}>
            SMIMP
          </span>
          <span className="badge" style={{ padding: "2px 8px", fontSize: 10, background: "var(--color-brand-muted)", color: "var(--color-brand)" }}>
            PLATFORM
          </span>
        </div>

        <nav style={{ display: "flex", alignItems: "center", gap: 28, fontSize: 14, fontWeight: 600 }}>
          <a href="#features" style={{ color: "var(--color-text-soft)" }}>Features</a>
          <a href="#telemetry" style={{ color: "var(--color-text-soft)" }}>Telemetry</a>
          <a href="#integrations" style={{ color: "var(--color-text-soft)" }}>Integrations</a>
          <Link to="/status/demo" style={{ color: "var(--color-text-soft)", display: "flex", alignItems: "center", gap: 6 }}>
            <span className="status-dot" style={{ width: 6, height: 6 }} />
            Public Status
          </Link>
        </nav>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link 
            to="/auth/login" 
            style={{ 
              fontSize: 14, 
              fontWeight: 600, 
              color: "var(--color-text)", 
              padding: "8px 16px" 
            }}
          >
            Sign In
          </Link>
          <Link 
            className="button primary" 
            to="/auth/register" 
            style={{ height: 38, padding: "0 20px", fontSize: 13.5 }}
          >
            Deploy Console &rarr;
          </Link>
        </div>
      </header>

      {/* Main Content Container */}
      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "64px 24px 80px", position: "relative", zIndex: 1 }}>
        
        {/* Hero Section */}
        <section style={{ textAlign: "center", maxWidth: 900, margin: "0 auto 80px" }}>
          {/* Announcement pill */}
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 16px",
            background: "rgba(56, 189, 248, 0.1)",
            border: "1px solid rgba(56, 189, 248, 0.25)",
            borderRadius: "var(--radius-pill)",
            fontSize: 13,
            fontWeight: 600,
            color: "var(--color-brand)",
            marginBottom: 28
          }}>
            <Zap size={14} />
            <span>SMIMP 2.4 — Autonomous Incident Correlation & AI SRE Copilot</span>
          </div>

          <h1 style={{
            fontSize: "clamp(38px, 6vw, 64px)",
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: "-0.04em",
            marginBottom: 24,
            color: "#ffffff"
          }}>
            Zero-Blindspot Telemetry & <br />
            <span style={{
              background: "linear-gradient(135deg, #38bdf8 0%, #818cf8 50%, #c084fc 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}>
              Autonomous Incident Command
            </span>
          </h1>

          <p style={{
            fontSize: 18,
            color: "var(--color-text-soft)",
            lineHeight: 1.6,
            maxWidth: 720,
            margin: "0 auto 36px"
          }}>
            Real-time synthetic service probing, automated alert deduplication, dependency topology mapping, and grounded AI root-cause diagnostics in one unified cockpit.
          </p>

          <div className="button-row" style={{ justifyContent: "center", gap: 16 }}>
            <Link 
              className="button primary" 
              to="/auth/register" 
              style={{ padding: "14px 32px", fontSize: 16, height: "auto" }}
            >
              Start Monitoring Free
              <ArrowRight size={18} />
            </Link>
            <Link 
              className="button" 
              to="/app" 
              style={{ padding: "14px 28px", fontSize: 16, height: "auto" }}
            >
              <Activity size={18} style={{ color: "var(--color-brand)" }} />
              Live Dashboard Preview
            </Link>
          </div>
        </section>

        {/* Live Interactive Telemetry Cockpit Mockup */}
        <section id="telemetry" style={{ marginBottom: 100 }}>
          <div style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border-strong)",
            borderRadius: "var(--radius-lg)",
            boxShadow: "var(--shadow-xl), 0 0 60px rgba(56, 189, 248, 0.08)",
            overflow: "hidden"
          }}>
            {/* Terminal Top Window Bar */}
            <div style={{
              padding: "12px 20px",
              background: "#080c14",
              borderBottom: "1px solid var(--color-border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#ef4444" }} />
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#f59e0b" }} />
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#10b981" }} />
                <span style={{ marginLeft: 12, fontSize: 12, color: "var(--color-muted)", fontFamily: "'JetBrains Mono', monospace" }}>
                  smimp-cluster-prod-us-east // telemetry-stream
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span className="status-dot pulse" />
                <span style={{ fontSize: 11, fontWeight: 700, color: "#34d399", textTransform: "uppercase" }}>
                  All Probes Active
                </span>
              </div>
            </div>

            {/* Inner Dashboard Preview Grid */}
            <div style={{ padding: "28px" }}>
              <div className="grid cols-4" style={{ marginBottom: 24 }}>
                <div className="metric-card" style={{ padding: 16, minHeight: "auto" }}>
                  <div className="metric-label" style={{ fontSize: 11 }}>Active Services</div>
                  <div className="metric-value" style={{ fontSize: 26, margin: 0 }}>42 / 42</div>
                  <div className="trend" style={{ color: "var(--color-success)", fontSize: 11 }}>100% Operational</div>
                </div>
                <div className="metric-card" style={{ padding: 16, minHeight: "auto" }}>
                  <div className="metric-label" style={{ fontSize: 11 }}>Global Avg Latency</div>
                  <div className="metric-value" style={{ fontSize: 26, margin: 0 }}>18.4ms</div>
                  <div className="trend" style={{ color: "var(--color-success)", fontSize: 11 }}>-2.1ms vs 24h</div>
                </div>
                <div className="metric-card" style={{ padding: 16, minHeight: "auto" }}>
                  <div className="metric-label" style={{ fontSize: 11 }}>Active Incidents</div>
                  <div className="metric-value" style={{ fontSize: 26, margin: 0, color: "var(--color-text)" }}>0</div>
                  <div className="trend" style={{ color: "var(--color-muted)", fontSize: 11 }}>0 Critical / 0 Degraded</div>
                </div>
                <div className="metric-card" style={{ padding: 16, minHeight: "auto" }}>
                  <div className="metric-label" style={{ fontSize: 11 }}>SLO Compliance</div>
                  <div className="metric-value" style={{ fontSize: 26, margin: 0, color: "#34d399" }}>99.994%</div>
                  <div className="trend" style={{ color: "var(--color-success)", fontSize: 11 }}>Budget Burn 0.02%</div>
                </div>
              </div>

              {/* Service Probes Table Preview */}
              <div className="table-container" style={{ background: "var(--color-surface-elevated)" }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Endpoint Service</th>
                      <th>Environment</th>
                      <th>Health Status</th>
                      <th>Latency</th>
                      <th>Last Check</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ fontWeight: 600 }}>payment-gateway-api</td>
                      <td><span className="badge" style={{ fontSize: 11, padding: "2px 8px" }}>prod</span></td>
                      <td><span className="status healthy">Operational</span></td>
                      <td style={{ fontFamily: "'JetBrains Mono', monospace", color: "var(--color-brand)" }}>14ms</td>
                      <td style={{ color: "var(--color-muted)", fontSize: 12 }}>3 seconds ago</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 600 }}>auth-oauth2-service</td>
                      <td><span className="badge" style={{ fontSize: 11, padding: "2px 8px" }}>prod</span></td>
                      <td><span className="status healthy">Operational</span></td>
                      <td style={{ fontFamily: "'JetBrains Mono', monospace", color: "var(--color-brand)" }}>19ms</td>
                      <td style={{ color: "var(--color-muted)", fontSize: 12 }}>5 seconds ago</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 600 }}>distributed-redis-cluster</td>
                      <td><span className="badge" style={{ fontSize: 11, padding: "2px 8px" }}>prod</span></td>
                      <td><span className="status healthy">Operational</span></td>
                      <td style={{ fontFamily: "'JetBrains Mono', monospace", color: "var(--color-brand)" }}>8ms</td>
                      <td style={{ color: "var(--color-muted)", fontSize: 12 }}>2 seconds ago</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Matrix */}
        <section id="features" style={{ marginBottom: 100 }}>
          <div style={{ textAlign: "center", marginBottom: 50 }}>
            <h2 style={{ fontSize: 36, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 12 }}>
              Engineered for Mission-Critical Reliability
            </h2>
            <p style={{ color: "var(--color-text-soft)", fontSize: 16, maxWidth: 640, margin: "0 auto" }}>
              Everything your SRE and Platform teams need to maintain five-nines uptime without context switching.
            </p>
          </div>

          <div className="grid cols-3" style={{ gap: 24 }}>
            <div className="panel" style={{ padding: 28 }}>
              <div style={{ width: 44, height: 44, borderRadius: "var(--radius-sm)", background: "rgba(56, 189, 248, 0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-brand)", marginBottom: 20 }}>
                <Activity size={22} />
              </div>
              <h3 style={{ fontSize: 18, marginBottom: 10 }}>Sub-Minute Synthetic Probing</h3>
              <p style={{ color: "var(--color-text-soft)", fontSize: 14.5, lineHeight: 1.6 }}>
                Configure HTTP, HTTPS, and API assertions with custom auth headers, expected payload keywords, and automated jitter filtering.
              </p>
            </div>

            <div className="panel" style={{ padding: 28 }}>
              <div style={{ width: 44, height: 44, borderRadius: "var(--radius-sm)", background: "rgba(168, 85, 247, 0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#c084fc", marginBottom: 20 }}>
                <BrainCircuit size={22} />
              </div>
              <h3 style={{ fontSize: 18, marginBottom: 10 }}>AI Root-Cause Diagnosis</h3>
              <p style={{ color: "var(--color-text-soft)", fontSize: 14.5, lineHeight: 1.6 }}>
                Grounded telemetry AI models analyze correlated alerts, recent commits, and log anomalies to generate verified incident postmortems.
              </p>
            </div>

            <div className="panel" style={{ padding: 28 }}>
              <div style={{ width: 44, height: 44, borderRadius: "var(--radius-sm)", background: "rgba(99, 102, 241, 0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#818cf8", marginBottom: 20 }}>
                <Network size={22} />
              </div>
              <h3 style={{ fontSize: 18, marginBottom: 10 }}>Dependency Topology Mesh</h3>
              <p style={{ color: "var(--color-text-soft)", fontSize: 14.5, lineHeight: 1.6 }}>
                Trace downstream blast radiuses in real time. Understand which service failures cascade into user-facing outage events.
              </p>
            </div>

            <div className="panel" style={{ padding: 28 }}>
              <div style={{ width: 44, height: 44, borderRadius: "var(--radius-sm)", background: "rgba(16, 185, 129, 0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#34d399", marginBottom: 20 }}>
                <Radio size={22} />
              </div>
              <h3 style={{ fontSize: 18, marginBottom: 10 }}>Branded Public Status Pages</h3>
              <p style={{ color: "var(--color-text-soft)", fontSize: 14.5, lineHeight: 1.6 }}>
                Keep customers informed during degradation events with automated public uptime dashboards and subscriber notification webhooks.
              </p>
            </div>

            <div className="panel" style={{ padding: 28 }}>
              <div style={{ width: 44, height: 44, borderRadius: "var(--radius-sm)", background: "rgba(245, 158, 11, 0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fbbf24", marginBottom: 20 }}>
                <Bell size={22} />
              </div>
              <h3 style={{ fontSize: 18, marginBottom: 10 }}>Dynamic Escalation Policies</h3>
              <p style={{ color: "var(--color-text-soft)", fontSize: 14.5, lineHeight: 1.6 }}>
                On-call paging schedules with multi-tier fallback rules, snooze windows, and automated deduplication to prevent notification fatigue.
              </p>
            </div>

            <div className="panel" style={{ padding: 28 }}>
              <div style={{ width: 44, height: 44, borderRadius: "var(--radius-sm)", background: "rgba(244, 63, 94, 0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fb7185", marginBottom: 20 }}>
                <ShieldCheck size={22} />
              </div>
              <h3 style={{ fontSize: 18, marginBottom: 10 }}>Audit Trail & Role Governance</h3>
              <p style={{ color: "var(--color-text-soft)", fontSize: 14.5, lineHeight: 1.6 }}>
                Enterprise RBAC permissions with workspace isolation, immutable audit logs, and SOC 2 compliant operational histories.
              </p>
            </div>
          </div>
        </section>

        {/* Integrations Banner */}
        <section id="integrations" style={{ textAlign: "center", marginBottom: 100 }}>
          <h4 style={{ color: "var(--color-muted)", fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 32 }}>
            Seamless Ecosystem Integrations
          </h4>
          <div style={{
            display: "flex",
            justifyContent: "center",
            gap: 40,
            flexWrap: "wrap",
            alignItems: "center",
            fontSize: 16,
            fontWeight: 800,
            color: "var(--color-text-soft)",
            opacity: 0.8
          }}>
            <span>KUBERNETES</span>
            <span>PROMETHEUS</span>
            <span>AMAZON AWS</span>
            <span>SLACK</span>
            <span>DATADOG</span>
            <span>PAGERDUTY</span>
            <span>DOCKER</span>
          </div>
        </section>

        {/* Bottom CTA Card */}
        <section style={{
          background: "linear-gradient(135deg, rgba(56, 189, 248, 0.12) 0%, rgba(99, 102, 241, 0.12) 100%)",
          border: "1px solid var(--color-border-strong)",
          borderRadius: "var(--radius-xl)",
          padding: "60px 40px",
          textAlign: "center",
          boxShadow: "var(--shadow-xl)"
        }}>
          <h2 style={{ fontSize: 38, fontWeight: 800, marginBottom: 16 }}>
            Ready to upgrade your incident management?
          </h2>
          <p style={{ color: "var(--color-text-soft)", fontSize: 16, maxWidth: 560, margin: "0 auto 32px" }}>
            Join hundreds of engineering teams that protect uptime and resolve incidents 4x faster with SMIMP.
          </p>
          <div className="button-row" style={{ justifyContent: "center" }}>
            <Link 
              className="button primary" 
              to="/auth/register" 
              style={{ padding: "14px 36px", fontSize: 16, height: "auto" }}
            >
              Start Free Today &rarr;
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: "1px solid var(--color-border)",
        padding: "36px 24px",
        background: "var(--color-surface)",
        color: "var(--color-muted)",
        fontSize: 13
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div className="brand-mark" style={{ width: 22, height: 22 }} />
            <span style={{ fontWeight: 800, color: "#ffffff", fontSize: 15 }}>SMIMP</span>
            <span>&copy; {new Date().getFullYear()} Observability Platform. All rights reserved.</span>
          </div>
          <div style={{ display: "flex", gap: 24 }}>
            <Link to="/auth/login" style={{ color: "var(--color-text-soft)" }}>Sign In</Link>
            <Link to="/auth/register" style={{ color: "var(--color-text-soft)" }}>Create Account</Link>
            <Link to="/status/demo" style={{ color: "var(--color-text-soft)" }}>Public Status</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
