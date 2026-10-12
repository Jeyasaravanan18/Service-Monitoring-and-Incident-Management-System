import React from "react";
import { Link } from "react-router-dom";
import { 
  Activity, Server, ShieldCheck, Zap, BrainCircuit, Network, 
  ArrowRight, CheckCircle2, Bell, Radio, Cpu, Layers, Terminal, Lock
} from "lucide-react";

export function LandingPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#ffffff", color: "var(--color-text)", overflowX: "hidden" }}>
      {/* Subtle hairline geometric grid backdrop */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 600,
        backgroundImage: "radial-gradient(#e2e8f0 1px, transparent 1px)",
        backgroundSize: "28px 28px",
        opacity: 0.7,
        pointerEvents: "none",
        zIndex: 0,
      }} />

      {/* Modern Minimal Floating Header */}
      <header style={{
        position: "sticky",
        top: 16,
        maxWidth: 1160,
        margin: "0 auto",
        padding: "12px 24px",
        background: "rgba(255, 255, 255, 0.96)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderRadius: "var(--radius-pill)",
        border: "1px solid var(--color-border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        zIndex: 50,
        boxShadow: "0 4px 20px -2px rgba(15, 43, 92, 0.06)"
      }}>
        {/* Brand Lockup */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 30,
            height: 30,
            borderRadius: "var(--radius-xs)",
            background: "var(--color-dark-blue)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <Activity size={18} color="#ffffff" strokeWidth={2.5} />
          </div>
          <span style={{ fontWeight: 800, fontSize: 19, letterSpacing: "-0.03em", color: "var(--color-dark-blue)" }}>
            SMIMP
          </span>
          <span className="badge" style={{ padding: "2px 7px", fontSize: 10 }}>
            v2.4
          </span>
        </div>

        {/* Navigation Links */}
        <nav style={{ display: "flex", alignItems: "center", gap: 28, fontSize: 13.5, fontWeight: 600 }}>
          <a href="#features" style={{ color: "var(--color-text-body)" }}>Capabilities</a>
          <a href="#telemetry" style={{ color: "var(--color-text-body)" }}>Live Probes</a>
          <a href="#integrations" style={{ color: "var(--color-text-body)" }}>Ecosystem</a>
          <Link to="/status/demo" style={{ color: "var(--color-dark-green)", display: "flex", alignItems: "center", gap: 6 }}>
            <span className="status-dot pulse" />
            Public Status
          </Link>
        </nav>

        {/* CTA Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Link 
            to="/auth/login" 
            style={{ 
              fontSize: 13.5, 
              fontWeight: 700, 
              color: "var(--color-dark-blue)", 
              padding: "8px 14px",
              textDecoration: "none"
            }}
          >
            Sign In
          </Link>
          <Link 
            className="button black" 
            to="/auth/register" 
            style={{ height: 38, padding: "0 18px", fontSize: 13, borderRadius: "var(--radius-pill)" }}
          >
            Deploy Console &rarr;
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: 1160, margin: "0 auto", padding: "64px 20px 80px", position: "relative", zIndex: 1 }}>
        
        {/* Hero Section */}
        <section style={{ textAlign: "center", maxWidth: 860, margin: "0 auto 72px" }}>
          {/* Operational Status Pill */}
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "5px 14px",
            background: "var(--color-dark-green-bg)",
            border: "1px solid var(--color-dark-green-border)",
            borderRadius: "var(--radius-pill)",
            fontSize: 12.5,
            fontWeight: 700,
            color: "var(--color-dark-green)",
            marginBottom: 24
          }}>
            <span className="status-dot pulse" />
            <span>Operational Reliability Engine • 99.99% Availability SLA</span>
          </div>

          <h1 style={{
            fontSize: "clamp(36px, 5.5vw, 58px)",
            fontWeight: 800,
            lineHeight: 1.12,
            letterSpacing: "-0.035em",
            marginBottom: 20,
            color: "var(--color-dark-blue)"
          }}>
            Mission-Critical Telemetry & <br />
            <span style={{ color: "var(--color-text-body)" }}>
              Autonomous Incident Command
            </span>
          </h1>

          <p style={{
            fontSize: 17,
            color: "var(--color-text-body)",
            lineHeight: 1.6,
            maxWidth: 680,
            margin: "0 auto 36px"
          }}>
            Synthetic service probing, automated alert correlation, real-time dependency topology meshes, and grounded AI incident diagnostics in one minimal cockpit.
          </p>

          <div className="button-row" style={{ justifyContent: "center", gap: 14 }}>
            <Link 
              className="button black" 
              to="/auth/register" 
              style={{ padding: "12px 28px", fontSize: 15, height: "auto", borderRadius: "var(--radius-sm)" }}
            >
              Start Monitoring Free
              <ArrowRight size={17} />
            </Link>
            <Link 
              className="button" 
              to="/app" 
              style={{ padding: "12px 24px", fontSize: 15, height: "auto", borderRadius: "var(--radius-sm)", borderColor: "var(--color-border)" }}
            >
              <Activity size={17} style={{ color: "var(--color-dark-blue)" }} />
              Live Console Preview
            </Link>
          </div>
        </section>

        {/* Interactive Telemetry Cockpit Mockup */}
        <section id="telemetry" style={{ marginBottom: 90 }}>
          <div style={{
            background: "#ffffff",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-lg)",
            boxShadow: "0 20px 40px -10px rgba(15, 43, 92, 0.08), 0 1px 3px rgba(15, 43, 92, 0.04)",
            overflow: "hidden"
          }}>
            {/* Top Minimalist Header Bar */}
            <div style={{
              padding: "14px 24px",
              background: "#f8fafc",
              borderBottom: "1px solid var(--color-border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#ef4444" }} />
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#f59e0b" }} />
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#10b981" }} />
                <span style={{ marginLeft: 12, fontSize: 12.5, color: "var(--color-dark-blue)", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>
                  cluster-prod-us-east // live-telemetry-stream
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span className="status-dot pulse" />
                <span style={{ fontSize: 11.5, fontWeight: 700, color: "var(--color-dark-green)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  All Probes Healthy
                </span>
              </div>
            </div>

            {/* Inner Dashboard Preview Grid */}
            <div style={{ padding: "28px" }}>
              <div className="grid cols-4" style={{ marginBottom: 24, gap: 16 }}>
                <div className="metric-card" style={{ padding: 16, minHeight: "auto", border: "1px solid var(--color-border)" }}>
                  <div className="metric-label" style={{ fontSize: 11 }}>Active Services</div>
                  <div className="metric-value" style={{ fontSize: 26, margin: 0 }}>48 / 48</div>
                  <div className="trend" style={{ color: "var(--color-dark-green)", fontSize: 11.5, fontWeight: 700 }}>100% Operational</div>
                </div>
                <div className="metric-card" style={{ padding: 16, minHeight: "auto", border: "1px solid var(--color-border)" }}>
                  <div className="metric-label" style={{ fontSize: 11 }}>Avg Probe Latency</div>
                  <div className="metric-value" style={{ fontSize: 26, margin: 0 }}>14.2ms</div>
                  <div className="trend" style={{ color: "var(--color-dark-green)", fontSize: 11.5, fontWeight: 700 }}>-3.1ms variance</div>
                </div>
                <div className="metric-card" style={{ padding: 16, minHeight: "auto", border: "1px solid var(--color-border)" }}>
                  <div className="metric-label" style={{ fontSize: 11 }}>Active Incidents</div>
                  <div className="metric-value" style={{ fontSize: 26, margin: 0, color: "var(--color-dark-blue)" }}>0</div>
                  <div className="trend" style={{ color: "var(--color-text-soft)", fontSize: 11.5 }}>0 Critical / 0 Degraded</div>
                </div>
                <div className="metric-card" style={{ padding: 16, minHeight: "auto", border: "1px solid var(--color-border)" }}>
                  <div className="metric-label" style={{ fontSize: 11 }}>SLO Compliance</div>
                  <div className="metric-value" style={{ fontSize: 26, margin: 0, color: "var(--color-dark-green)" }}>99.996%</div>
                  <div className="trend" style={{ color: "var(--color-dark-green)", fontSize: 11.5, fontWeight: 700 }}>Budget Burn 0.01%</div>
                </div>
              </div>

              {/* Probes Table Preview */}
              <div className="table-container" style={{ background: "#ffffff", border: "1px solid var(--color-border)" }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Endpoint Service</th>
                      <th>Environment</th>
                      <th>Health Status</th>
                      <th>Latency</th>
                      <th>Probe Interval</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ fontWeight: 700, color: "var(--color-dark-blue)" }}>payment-gateway-api</td>
                      <td><span className="badge" style={{ fontSize: 11 }}>prod</span></td>
                      <td><span className="status healthy">Operational</span></td>
                      <td style={{ fontFamily: "'JetBrains Mono', monospace", color: "var(--color-text-body)", fontWeight: 600 }}>12ms</td>
                      <td style={{ color: "var(--color-text-soft)", fontSize: 12 }}>Every 30s</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 700, color: "var(--color-dark-blue)" }}>auth-oauth2-service</td>
                      <td><span className="badge" style={{ fontSize: 11 }}>prod</span></td>
                      <td><span className="status healthy">Operational</span></td>
                      <td style={{ fontFamily: "'JetBrains Mono', monospace", color: "var(--color-text-body)", fontWeight: 600 }}>16ms</td>
                      <td style={{ color: "var(--color-text-soft)", fontSize: 12 }}>Every 30s</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 700, color: "var(--color-dark-blue)" }}>distributed-redis-cluster</td>
                      <td><span className="badge" style={{ fontSize: 11 }}>prod</span></td>
                      <td><span className="status healthy">Operational</span></td>
                      <td style={{ fontFamily: "'JetBrains Mono', monospace", color: "var(--color-text-body)", fontWeight: 600 }}>7ms</td>
                      <td style={{ color: "var(--color-text-soft)", fontSize: 12 }}>Every 15s</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Matrix */}
        <section id="features" style={{ marginBottom: 90 }}>
          <div style={{ textAlign: "center", marginBottom: 44 }}>
            <h2 style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.03em", color: "var(--color-dark-blue)", marginBottom: 10 }}>
              Engineered for Mission-Critical Engineering Teams
            </h2>
            <p style={{ color: "var(--color-text-body)", fontSize: 15.5, maxWidth: 600, margin: "0 auto" }}>
              Comprehensive observability primitives tailored for modern site reliability engineering.
            </p>
          </div>

          <div className="grid cols-3" style={{ gap: 20 }}>
            <div className="panel" style={{ padding: 26, background: "#ffffff", border: "1px solid var(--color-border)" }}>
              <div style={{ width: 40, height: 40, borderRadius: "var(--radius-xs)", background: "var(--color-dark-blue-bg)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-dark-blue)", marginBottom: 18 }}>
                <Activity size={20} />
              </div>
              <h3 style={{ fontSize: 17, marginBottom: 8, color: "var(--color-dark-blue)" }}>Sub-Minute Synthetic Probing</h3>
              <p style={{ color: "var(--color-text-body)", fontSize: 13.5, lineHeight: 1.6 }}>
                Automated HTTP, HTTPS, and API assertions with custom auth headers, expected payload keywords, and automated jitter rejection.
              </p>
            </div>

            <div className="panel" style={{ padding: 26, background: "#ffffff", border: "1px solid var(--color-border)" }}>
              <div style={{ width: 40, height: 40, borderRadius: "var(--radius-xs)", background: "var(--color-dark-blue-bg)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-dark-blue)", marginBottom: 18 }}>
                <BrainCircuit size={20} />
              </div>
              <h3 style={{ fontSize: 17, marginBottom: 8, color: "var(--color-dark-blue)" }}>AI Root-Cause Diagnosis</h3>
              <p style={{ color: "var(--color-text-body)", fontSize: 13.5, lineHeight: 1.6 }}>
                Grounded telemetry models correlate concurrent alert pressure, recent deployments, and log spikes to synthesize incident postmortems.
              </p>
            </div>

            <div className="panel" style={{ padding: 26, background: "#ffffff", border: "1px solid var(--color-border)" }}>
              <div style={{ width: 40, height: 40, borderRadius: "var(--radius-xs)", background: "var(--color-dark-blue-bg)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-dark-blue)", marginBottom: 18 }}>
                <Network size={20} />
              </div>
              <h3 style={{ fontSize: 17, marginBottom: 8, color: "var(--color-dark-blue)" }}>Dependency Topology Mesh</h3>
              <p style={{ color: "var(--color-text-body)", fontSize: 13.5, lineHeight: 1.6 }}>
                Trace downstream blast radiuses in real time. Map hard vs. soft upstream dependencies before deploying breaking service changes.
              </p>
            </div>

            <div className="panel" style={{ padding: 26, background: "#ffffff", border: "1px solid var(--color-border)" }}>
              <div style={{ width: 40, height: 40, borderRadius: "var(--radius-xs)", background: "var(--color-dark-green-bg)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-dark-green)", marginBottom: 18 }}>
                <Radio size={20} />
              </div>
              <h3 style={{ fontSize: 17, marginBottom: 8, color: "var(--color-dark-blue)" }}>Branded Public Status Pages</h3>
              <p style={{ color: "var(--color-text-body)", fontSize: 13.5, lineHeight: 1.6 }}>
                Maintain user trust during degradation events with automated public uptime dashboards and subscriber notification channels.
              </p>
            </div>

            <div className="panel" style={{ padding: 26, background: "#ffffff", border: "1px solid var(--color-border)" }}>
              <div style={{ width: 40, height: 40, borderRadius: "var(--radius-xs)", background: "var(--color-dark-blue-bg)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-dark-blue)", marginBottom: 18 }}>
                <Bell size={20} />
              </div>
              <h3 style={{ fontSize: 17, marginBottom: 8, color: "var(--color-dark-blue)" }}>Dynamic Escalation Policies</h3>
              <p style={{ color: "var(--color-text-body)", fontSize: 13.5, lineHeight: 1.6 }}>
                On-call paging tiers with multi-step fallbacks, snooze windows, and automated alert deduplication to prevent notification fatigue.
              </p>
            </div>

            <div className="panel" style={{ padding: 26, background: "#ffffff", border: "1px solid var(--color-border)" }}>
              <div style={{ width: 40, height: 40, borderRadius: "var(--radius-xs)", background: "var(--color-dark-green-bg)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-dark-green)", marginBottom: 18 }}>
                <ShieldCheck size={20} />
              </div>
              <h3 style={{ fontSize: 17, marginBottom: 8, color: "var(--color-dark-blue)" }}>Audit Trails & Governance</h3>
              <p style={{ color: "var(--color-text-body)", fontSize: 13.5, lineHeight: 1.6 }}>
                Enterprise RBAC roles with workspace isolation, encrypted credentials, and immutable audit logs for compliance audits.
              </p>
            </div>
          </div>
        </section>

        {/* Ecosystem Integrations */}
        <section id="integrations" style={{ textAlign: "center", marginBottom: 80 }}>
          <h4 style={{ color: "var(--color-dark-blue)", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 28 }}>
            Seamless Ecosystem Integrations
          </h4>
          <div style={{
            display: "flex",
            justifyContent: "center",
            gap: 36,
            flexWrap: "wrap",
            alignItems: "center",
            fontSize: 14,
            fontWeight: 700,
            color: "var(--color-text-body)"
          }}>
            <span>KUBERNETES</span>
            <span>PROMETHEUS</span>
            <span>AWS CLOUDWATCH</span>
            <span>SLACK WEBHOOKS</span>
            <span>DATADOG</span>
            <span>PAGERDUTY</span>
            <span>DOCKER</span>
          </div>
        </section>

        {/* Bottom CTA Card */}
        <section style={{
          background: "#ffffff",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-xl)",
          padding: "54px 36px",
          textAlign: "center",
          boxShadow: "0 10px 30px -5px rgba(15, 43, 92, 0.06)"
        }}>
          <h2 style={{ fontSize: 34, fontWeight: 800, marginBottom: 12, color: "var(--color-dark-blue)" }}>
            Elevate your reliability posture today
          </h2>
          <p style={{ color: "var(--color-text-body)", fontSize: 16, maxWidth: 520, margin: "0 auto 28px" }}>
            Join operations teams that monitor uptime and resolve incidents with SMIMP.
          </p>
          <div className="button-row" style={{ justifyContent: "center" }}>
            <Link 
              className="button black" 
              to="/auth/register" 
              style={{ padding: "12px 32px", fontSize: 15, height: "auto", borderRadius: "var(--radius-sm)" }}
            >
              Start Free Today &rarr;
            </Link>
          </div>
        </section>
      </main>

      {/* Clean Minimal Footer */}
      <footer style={{
        borderTop: "1px solid var(--color-border)",
        padding: "32px 24px",
        background: "#ffffff",
        color: "var(--color-text-body)",
        fontSize: 13
      }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 24,
              height: 24,
              borderRadius: "var(--radius-xs)",
              background: "var(--color-dark-blue)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <Activity size={14} color="#ffffff" strokeWidth={2.5} />
            </div>
            <span style={{ fontWeight: 800, color: "var(--color-dark-blue)", fontSize: 15 }}>SMIMP</span>
            <span style={{ color: "var(--color-text-soft)" }}>&copy; {new Date().getFullYear()} Observability Platform.</span>
          </div>
          <div style={{ display: "flex", gap: 24 }}>
            <Link to="/auth/login" style={{ color: "var(--color-text-body)" }}>Sign In</Link>
            <Link to="/auth/register" style={{ color: "var(--color-text-body)" }}>Create Account</Link>
            <Link to="/status/demo" style={{ color: "var(--color-dark-green)", fontWeight: 600 }}>Public Status</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
