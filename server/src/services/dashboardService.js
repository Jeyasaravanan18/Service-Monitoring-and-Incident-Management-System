import { Alert, Incident, Service, LogEntry } from "../models/index.js";
import { computeHealthScore } from "../utils/health.js";

export async function getDashboardOverview(workspaceId) {
  const [services, alerts, incidents, logs] = await Promise.all([
    Service.find({ workspaceId }).sort({ name: 1 }).lean(),
    Alert.find({ workspaceId }).sort({ createdAt: -1 }).limit(10).lean(),
    Incident.find({ workspaceId }).sort({ createdAt: -1 }).limit(10).lean(),
    LogEntry.find({ workspaceId }).sort({ occurredAt: -1 }).limit(10).lean(),
  ]);

  const servicesWithScore = services.map((service) => ({
    ...service,
    healthScore: computeHealthScore(service),
  }));

  return {
    services: servicesWithScore,
    alerts,
    incidents,
    logs,
    summary: {
      totalServices: services.length,
      healthyServices: services.filter((s) => s.healthStatus === "healthy").length,
      degradedServices: services.filter((s) => s.healthStatus === "degraded").length,
      criticalServices: services.filter((s) => s.healthStatus === "critical").length,
      openAlerts: alerts.filter((a) => ["open", "acknowledged", "escalated"].includes(a.status)).length,
      openIncidents: incidents.filter((i) => !["resolved", "postmortem"].includes(i.status)).length,
    },
  };
}
