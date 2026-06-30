import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { LogEntry } from "../models/index.js";
import { ingestLog } from "../services/logService.js";
import { requireAuth } from "../middleware/auth.js";
import { requireIngestionAccess } from "../middleware/ingestionAuth.js";
import { resolveRequestWorkspaceId, resolveWorkspaceId } from "../utils/workspace.js";

const router = Router();

router.get("/", requireAuth, asyncHandler(async (req, res) => {
  const workspaceId = resolveWorkspaceId(req);
  const filter = { workspaceId };
  if (req.query.serviceId) filter.serviceId = req.query.serviceId;
  if (req.query.environment) filter.environment = req.query.environment;
  if (req.query.severity) filter.severity = req.query.severity;
  if (req.query.incidentId) filter.incidentId = req.query.incidentId;
  if (req.query.keyword) filter.message = { $regex: req.query.keyword, $options: "i" };
  const limit = Math.min(Number(req.query.limit || 100) || 100, 500);
  const logs = await LogEntry.find(filter).sort({ occurredAt: -1 }).limit(limit).lean();
  res.json({ success: true, data: logs });
}));

router.post("/ingest", requireIngestionAccess("logs:write", ["super-admin", "admin", "engineer"]), asyncHandler(async (req, res) => {
  const workspaceId = resolveRequestWorkspaceId(req);
  const log = await ingestLog(workspaceId, req.body);
  res.status(201).json({ success: true, data: log });
}));

export default router;
