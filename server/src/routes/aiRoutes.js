import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AIInsight, Alert, Incident, LogEntry, Service, CheckResult } from "../models/index.js";
import { summarizeIncident, summarizeServiceTrends } from "../services/aiService.js";
import { requireAuth } from "../middleware/auth.js";
import { resolveWorkspaceId } from "../utils/workspace.js";

const router = Router();

router.get("/incident/:id", requireAuth, asyncHandler(async (req, res) => {
  const incident = await Incident.findById(req.params.id).lean();
  if (!incident) return res.json({ success: true, data: null });
  const workspaceId = resolveWorkspaceId(req);
  if (String(incident.workspaceId) !== String(workspaceId)) {
    return res.json({ success: true, data: null });
  }
  const [service, alerts, logs] = await Promise.all([
    incident.serviceId ? Service.findById(incident.serviceId).lean() : null,
    Alert.find({ incidentId: incident._id }).sort({ createdAt: -1 }).limit(10).lean(),
    LogEntry.find({ incidentId: incident._id }).sort({ occurredAt: -1 }).limit(10).lean(),
  ]);
  const summary = await summarizeIncident({ incident, alerts, logs, service });
  const insight = await AIInsight.create({
    workspaceId: incident.workspaceId,
    serviceId: incident.serviceId,
    incidentId: incident._id,
    type: "incident-summary",
    title: `Incident summary for ${incident.title}`,
    body: summary,
    evidence: { alertCount: alerts.length, logCount: logs.length },
  });
  res.json({ success: true, data: { summary, insight } });
}));

router.get("/service/:id", requireAuth, asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id).lean();
  if (!service) return res.json({ success: true, data: null });
  const workspaceId = resolveWorkspaceId(req);
  if (String(service.workspaceId) !== String(workspaceId)) {
    return res.json({ success: true, data: null });
  }
  const [checks, logs] = await Promise.all([
    CheckResult.find({ serviceId: service._id }).sort({ checkedAt: -1 }).limit(10).lean(),
    LogEntry.find({ serviceId: service._id }).sort({ occurredAt: -1 }).limit(10).lean(),
  ]);
  const summary = await summarizeServiceTrends({ service, checks, logs });
  const insight = await AIInsight.create({
    workspaceId: service.workspaceId,
    serviceId: service._id,
    type: "service-trend",
    title: `Service trend summary for ${service.name}`,
    body: summary.summary,
    evidence: summary,
  });
  res.json({ success: true, data: { ...summary, insight } });
}));

router.get("/insights", requireAuth, asyncHandler(async (req, res) => {
  const workspaceId = resolveWorkspaceId(req);
  const insights = await AIInsight.find({ workspaceId }).sort({ createdAt: -1 }).limit(20).lean();
  res.json({ success: true, data: insights });
}));

export default router;
