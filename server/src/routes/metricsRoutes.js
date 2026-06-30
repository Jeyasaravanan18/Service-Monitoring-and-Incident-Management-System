import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Metric } from "../models/index.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { requireIngestionAccess } from "../middleware/ingestionAuth.js";
import { resolveRequestWorkspaceId, resolveWorkspaceId } from "../utils/workspace.js";

const metricSchema = z.object({
  serviceId: z.string().optional().nullable(),
  name: z.string().min(2),
  value: z.number(),
  unit: z.string().optional().default(""),
  recordedAt: z.string().datetime().optional(),
  tags: z.record(z.any()).default({}),
});

const router = Router();

router.get("/", requireAuth, asyncHandler(async (req, res) => {
  const metrics = await Metric.find({ workspaceId: { $in: req.auth.workspaceIds || [] } }).sort({ recordedAt: -1 }).lean();
  res.json({ success: true, data: metrics });
}));

router.post("/", requireIngestionAccess("metrics:write", ["super-admin", "admin", "engineer"]), asyncHandler(async (req, res) => {
  const payload = metricSchema.parse(req.body);
  const workspaceId = resolveRequestWorkspaceId(req);
  const metric = await Metric.create({
    workspaceId,
    ...payload,
    recordedAt: payload.recordedAt ? new Date(payload.recordedAt) : new Date(),
  });
  res.status(201).json({ success: true, data: metric });
}));

export default router;
