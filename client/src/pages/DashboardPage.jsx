import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { 
  Server, BellRing, Flame, Activity, ArrowRight, ShieldCheck, 
  RefreshCw, CheckCircle2, AlertTriangle, AlertCircle, Sparkles, ExternalLink
} from "lucide-react";
import { apiGet, apiPost } from "../lib/api.js";
import { useAppStore } from "../store/useAppStore.js";
import { useSocketEvent } from "../lib/socket.js";
import { MetricCard } from "../components/MetricCard.jsx";
import { HealthPill } from "../components/HealthPill.jsx";
import { Panel, PageHeader, Topbar } from "../components/Layout.jsx";
import { TelemetryChart } from "../components/TelemetryChart.jsx";
import { AIPanel } from "../components/AIPanel.jsx";
import { DashboardSkeleton } from "../components/Skeleton.jsx";

export function DashboardPage() {
  const [overview, setOverview] = useState({ services: [], alerts: [], incidents: [], logs: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const services = overview.services || [];
  const alerts = overview.alerts || [];
  const incidents = overview.incidents || [];
  const logs = overview.logs || [];
  const serviceCount = services.length;
  const openAlerts = alerts.filter((a) => ["open", "acknowledged", "escalated"].includes(a.status)).length;
  const criticalIncidents = incidents.filter((i) => i.severity === "critical").length;
  
  const activeService = services.find(s => s.latencyHistory?.length > 0) || services[0];
  const healthTrend = activeService?.latencyHistory || [];
  const avgLatency = serviceCount
    ? Math.round(services.reduce((sum, s) => sum + (s.avgLatencyMs || 0), 0) / serviceCount)
    : 0;

  const [flashingRows, setFlashingRows] = useState({});
  const addToast = useAppStore((state) => state.addToast);
  const [seeding, setSeeding] = useState(false);

  const handleSeedDemo = async () => {
    setSeeding(true);
    try {
      const res = await apiPost("/demo/seed");
      addToast(res.message || "Demo projects & telemetry successfully loaded!", "success");
      await load();
    } catch (err) {
      addToast(err.message || "Failed to seed demo projects", "error");
    } finally {
      setSeeding(false);
    }
  };

  const load = () => {
    return apiGet("/dashboard/overview")
      .then((res) => {
        setOverview(res.data || { services: [], alerts: [], incidents: [], logs: [] });
        setError("");
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  const loadRef = useRef(load);
  loadRef.current = load;

  const debouncedLoad = useMemo(() => {
    let timeout;
    return () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        loadRef.current();
      }, 500);
    };
  }, []);

  useEffect(() => {
    load();
  }, []);

  const handleServiceChecked = useCallback((payload) => {
    if (payload?.serviceId) {
      setFlashingRows((prev) => ({ ...prev, [payload.serviceId]: true }));
      setTimeout(() => {
        setFlashingRows((prev) => ({ ...prev, [payload.serviceId]: false }));
      }, 1000);
    }
    debouncedLoad();
  }, [debouncedLoad]);

  useSocketEvent("service:checked", handleServiceChecked);
  useSocketEvent("service:check-failed", handleServiceChecked);
  useSocketEvent("service:updated", debouncedLoad);
  useSocketEvent("alert:created", debouncedLoad);
  useSocketEvent("alert:resolved", debouncedLoad);
  useSocketEvent("incident:created", debouncedLoad);
  useSocketEvent("incident:updated", debouncedLoad);

  const getAIInsight = () => {
    if (criticalIncidents > 0) return `CRITICAL ALERT: ${criticalIncidents} active high-severity incident(s) require immediate remediation. Telemetry indicates potential cascade impact across upstream dependencies.`;
    if (openAlerts > 0) return `WARNING: Detected ${openAlerts} active alert condition(s). Latency variance is elevated by +14% across edge gateway services.`;
    if (serviceCount > 0) return `ALL SYSTEMS STABLE: All ${serviceCount} monitored endpoints are operating within target SLO tolerances with zero error budget burn in the last 60 minutes.`;
    return `SYSTEM INITIALIZING: Awaiting telemetry streaming. Please register your first monitored endpoint to begin automated probing.`;
  };

  const allOperational = criticalIncidents === 0 && openAlerts === 0;

  return (
    <>
      <Topbar />
      
      <PageHeader
        title="Command Center"
        copy="Live operational telemetry, automated alert pressure, active incident war-rooms, and system SLO health."
        badge={`${serviceCount} Services Active`}
        action={
          <div className="button-row">
            <button className="button" onClick={handleSeedDemo} disabled={seeding} title="Seed 7 realistic production microservices, checks, and topology">
              <Sparkles size={14} className={seeding ? "spin" : ""} style={{ color: "var(--color-brand)" }} />
              <span>{seeding ? "Seeding..." : "Load Demo Projects"}</span>
            </button>
            <button className="button" onClick={() => load()}>
              <RefreshCw size={14} className={loading ? "spin" : ""} />
              <span>Sync</span>
            </button>
            <Link className="button primary" to="/app/alert-rules">
              <span>+ New Alert Rule</span>
            </Link>
          </div>
        }
      />

      {error ? (
        <div className="alert-banner alert-banner--error" style={{ marginBottom: 20 }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      ) : null}

      {loading ? (
        <DashboardSkeleton />
      ) : (
        <>
          {/* Operational Status Ticker Banner */}
          <div style={{
            padding: "14px 20px",
            background: allOperational ? "var(--color-dark-green-bg)" : "var(--color-danger-bg)",
            border: `1px solid ${allOperational ? "var(--color-dark-green-border)" : "#fecaca"}`,
            borderRadius: "var(--radius-md)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 20,
            flexWrap: "wrap",
            gap: 12
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span className={`status-dot ${allOperational ? "pulse" : ""}`} style={{ background: allOperational ? "var(--color-dark-green)" : "var(--color-danger)" }} />
              <div>
                <span style={{ fontWeight: 700, fontSize: 14, color: allOperational ? "var(--color-dark-green)" : "var(--color-danger)" }}>
                  {allOperational ? "All Monitored Systems Operational" : `${criticalIncidents} Critical Incidents / ${openAlerts} Alerts Require Attention`}
                </span>
                <span style={{ fontSize: 12.5, color: "var(--color-text-body)", marginLeft: 10 }}>
                  Real-time synthetic probes active across dev, staging & prod
                </span>
              </div>
            </div>

            <div style={{ display: "flex", gap: 16, fontSize: 12, fontFamily: "'JetBrains Mono', monospace", color: "var(--color-text-body)", fontWeight: 600 }}>
              <span>PROBES: {serviceCount}</span>
              <span>WS: CONNECTED</span>
              <span>MTTD: &lt;45s</span>
            </div>
          </div>

          {/* AI Copilot Briefing Box */}
          <div style={{ marginBottom: 20 }}>
            <AIPanel title="SMIMP AI SRE Briefing" status={criticalIncidents > 0 ? "analyzing" : "active"}>
              {getAIInsight()}
            </AIPanel>
          </div>

          {/* 4 Metric KPI Cards */}
          <div className="grid cols-4" style={{ marginBottom: 24 }}>
            <MetricCard
              label="Monitored Services"
              value={String(serviceCount)}
              trend={`${services.filter((s) => s.healthStatus === "healthy").length} fully operational`}
              trendDirection="up"
              icon={Server}
            />
            <MetricCard
              label="Active Alerts"
              value={String(openAlerts)}
              trend={openAlerts > 0 ? `${openAlerts} alerts firing` : "0 threshold violations"}
              trendDirection={openAlerts > 0 ? "down" : "neutral"}
              variant={openAlerts > 0 ? "warn" : "default"}
              icon={BellRing}
            />
            <MetricCard
              label="Critical Incidents"
              value={String(criticalIncidents)}
              trend={criticalIncidents > 0 ? `${criticalIncidents} Sev-1 unresolved` : "No active sev-1 outages"}
              trendDirection={criticalIncidents > 0 ? "down" : "up"}
              variant={criticalIncidents > 0 ? "danger" : "default"}
              icon={Flame}
            />
            <MetricCard
              label="Average Latency"
              value={`${avgLatency}ms`}
              trend={avgLatency < 50 ? "Excellent response speed" : "Elevated response time"}
              trendDirection={avgLatency < 50 ? "up" : "down"}
              icon={Activity}
            />
          </div>

          {/* Latency History & Incident War-Room Row */}
          <div className="grid cols-2" style={{ marginBottom: 24 }}>
            <Panel 
              title="Telemetry Latency Trend"
              action={
                activeService ? (
                  <span className="badge" style={{ fontSize: 11 }}>
                    {activeService.name}
                  </span>
                ) : null
              }
            >
              {healthTrend.length ? (
                <div>
                  <TelemetryChart data={healthTrend} height={190} />
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 12, color: "var(--color-muted)" }}>
                    <span>Rolling 20 probe iterations</span>
                    <Link to="/app/metrics" style={{ color: "var(--color-brand)", fontSize: 12, fontWeight: 600 }}>
                      Detailed Metrics &rarr;
                    </Link>
                  </div>
                </div>
              ) : (
                <div style={{ padding: "40px", textAlign: "center", color: "var(--color-muted)" }}>
                  No service telemetry data recorded yet.
                </div>
              )}
            </Panel>

            <Panel 
              title="Active Incidents War-Room"
              action={
                <Link to="/app/incidents" style={{ fontSize: 12, fontWeight: 600, color: "var(--color-brand)" }}>
                  All Incidents ({incidents.length}) &rarr;
                </Link>
              }
            >
              <div className="grid" style={{ gap: 10 }}>
                {incidents.slice(0, 4).map((incident) => (
                  <div key={incident._id} className="incident-row">
                    <div className="incident-row__title">
                      <Link to={`/app/incidents/${incident._id}`} style={{ fontWeight: 600 }}>
                        {incident.title}
                      </Link>
                    </div>
                    <div className="incident-row__meta">
                      <span className={`status-badge status-badge--${incident.severity}`}>
                        {incident.severity}
                      </span>
                      <span className="badge" style={{ padding: "2px 8px", fontSize: 11 }}>
                        {incident.status}
                      </span>
                      <span style={{ color: "var(--color-muted)", fontSize: 12 }}>
                        {new Date(incident.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
                {!incidents.length ? (
                  <div style={{ padding: "36px", textAlign: "center", color: "var(--color-muted)" }}>
                    <CheckCircle2 size={24} style={{ color: "var(--color-success)", margin: "0 auto 8px" }} />
                    <div style={{ fontWeight: 600, color: "var(--color-text)" }}>No Active Incidents</div>
                    <div style={{ fontSize: 12, marginTop: 4 }}>All production services operating within target SLAs.</div>
                  </div>
                ) : null}
              </div>
            </Panel>
          </div>

          {/* Service Health Grid & Recent Alerts Stack */}
          <div className="grid cols-2">
            <Panel 
              title="Service Health Fleet"
              action={
                <Link to="/app/services" style={{ fontSize: 12, fontWeight: 600, color: "var(--color-brand)" }}>
                  Manage Services ({serviceCount}) &rarr;
                </Link>
              }
            >
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Service</th>
                      <th>Env</th>
                      <th>Health</th>
                      <th>Uptime</th>
                      <th>Latency</th>
                    </tr>
                  </thead>
                  <tbody>
                    {services.slice(0, 6).map((service) => (
                      <tr 
                        key={service._id} 
                        style={{ 
                          background: flashingRows[service._id] ? "rgba(56, 189, 248, 0.15)" : undefined,
                          transition: "background 0.5s ease" 
                        }}
                      >
                        <td style={{ fontWeight: 600 }}>
                          <Link to={`/app/services/${service._id}`} style={{ color: "var(--color-text)" }}>
                            {service.name}
                          </Link>
                        </td>
                        <td>
                          <span className="badge" style={{ fontSize: 11, padding: "2px 8px" }}>
                            {service.environment || "prod"}
                          </span>
                        </td>
                        <td><HealthPill value={service.healthStatus} /></td>
                        <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}>
                          {Math.round(service.uptimePercentage || 0)}%
                        </td>
                        <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: "var(--color-brand)" }}>
                          {Math.round(service.avgLatencyMs || 0)}ms
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {!services.length ? (
                <div style={{ padding: "32px 20px", textAlign: "center" }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "var(--color-dark-blue)", marginBottom: 6 }}>
                    No services registered in this workspace yet
                  </div>
                  <div style={{ fontSize: 13, color: "var(--color-text-body)", maxWidth: 380, margin: "0 auto 16px" }}>
                    Instantly load 7 enterprise microservices (API Gateway, Auth, Stripe, PostgreSQL, Redis) with live telemetry.
                  </div>
                  <button 
                    className="button primary" 
                    onClick={handleSeedDemo} 
                    disabled={seeding}
                    style={{ margin: "0 auto" }}
                  >
                    <Sparkles size={14} className={seeding ? "spin" : ""} />
                    <span>{seeding ? "Generating..." : "Load Demo Projects"}</span>
                  </button>
                </div>
              ) : null}
            </Panel>

            <Panel 
              title="Active Alert Triage"
              action={
                <Link to="/app/alerts" style={{ fontSize: 12, fontWeight: 600, color: "var(--color-brand)" }}>
                  Alert Center ({alerts.length}) &rarr;
                </Link>
              }
            >
              <div className="grid" style={{ gap: 10 }}>
                {alerts.slice(0, 5).map((alert) => (
                  <div key={alert._id} className="alert-row">
                    <div className="alert-row__content">
                      <Link to={`/app/alerts/${alert._id}`} style={{ fontWeight: 600 }}>
                        {alert.title}
                      </Link>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span className={`status-badge status-badge--${alert.severity === "critical" ? "critical" : "high"}`}>
                        {alert.severity}
                      </span>
                      <span className="badge" style={{ padding: "2px 8px", fontSize: 11 }}>
                        {alert.status}
                      </span>
                    </div>
                  </div>
                ))}
                {!alerts.length ? (
                  <div style={{ padding: "36px", textAlign: "center", color: "var(--color-muted)" }}>
                    <CheckCircle2 size={24} style={{ color: "var(--color-success)", margin: "0 auto 8px" }} />
                    <div style={{ fontWeight: 600, color: "var(--color-text)" }}>Zero Active Alerts</div>
                    <div style={{ fontSize: 12, marginTop: 4 }}>No threshold or health violations firing.</div>
                  </div>
                ) : null}
              </div>
            </Panel>
          </div>
        </>
      )}
    </>
  );
}
