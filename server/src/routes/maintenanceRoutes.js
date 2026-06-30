import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { MaintenanceWindow } from "../models/index.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { resolveWorkspaceId } from "../utils/workspace.js";

const maintenanceSchema = z.object({
  serviceId: z.string().optional().nullable(),
  name: z.string().min(2),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  reason: z.string().optional().default(""),
  active: z.boolean().default(true),
});

const router = Router();

router.get("/", requireAuth, asyncHandler(async (req, res) => {
  const windows = await MaintenanceWindow.find({ workspaceId: { $in: req.auth.workspaceIds || [] } }).sort({ startsAt: 1 }).lean();
  res.json({ success: true, data: windows });
}));

router.post("/", requireAuth, requireRole(["super-admin", "admin"]), asyncHandler(async (req, res) => {
  const payload = maintenanceSchema.parse(req.body);
  const workspaceId = resolveWorkspaceId(req);
  const window = await MaintenanceWindow.create({
    workspaceId,
    serviceId: payload.serviceId,
    name: payload.name,
    startsAt: new Date(payload.startsAt),
    endsAt: new Date(payload.endsAt),
    reason: payload.reason,
    active: payload.active,
  });
  res.status(201).json({ success: true, data: window });
}));

router.patch("/:id", requireAuth, requireRole(["super-admin", "admin"]), asyncHandler(async (req, res) => {
  const payload = maintenanceSchema.partial().parse(req.body);
  const workspaceId = resolveWorkspaceId(req);
  const update = { ...payload };
  if (payload.startsAt) update.startsAt = new Date(payload.startsAt);
  if (payload.endsAt) update.endsAt = new Date(payload.endsAt);
  const window = await MaintenanceWindow.findOneAndUpdate({ _id: req.params.id, workspaceId }, { $set: update }, { new: true });
  if (!window) throw new ApiError(404, "Maintenance window not found");
  res.json({ success: true, data: window });
}));

router.delete("/:id", requireAuth, requireRole(["super-admin", "admin"]), asyncHandler(async (req, res) => {
  const workspaceId = resolveWorkspaceId(req);
  const window = await MaintenanceWindow.findOneAndDelete({ _id: req.params.id, workspaceId });
  if (!window) throw new ApiError(404, "Maintenance window not found");
  res.json({ success: true, data: window });
}));

export default router;
