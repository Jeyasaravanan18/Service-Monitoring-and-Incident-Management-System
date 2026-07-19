import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { SLOTarget } from "../models/index.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { resolveWorkspaceId } from "../utils/workspace.js";

const sloSchema = z.object({
  serviceId: z.string(),
  name: z.string().min(2),
  objective: z.number().min(0).max(100),
  windowDays: z.number().min(1).max(365).default(30),
  errorBudgetBurnRate: z.number().min(0).default(0),
});

const router = Router();

router.get("/", requireAuth, asyncHandler(async (req, res) => {
  const targets = await SLOTarget.find({ workspaceId: { $in: req.auth.workspaceIds || [] } }).sort({ createdAt: -1 }).lean();
  res.json({ success: true, data: targets });
}));

router.post("/", requireAuth, requireRole(["super-admin", "admin"]), asyncHandler(async (req, res) => {
  const payload = sloSchema.parse(req.body);
  const workspaceId = resolveWorkspaceId(req);

  const target = await SLOTarget.create({ ...payload, workspaceId });
  res.status(201).json({ success: true, data: target });
}));

router.patch("/:id", requireAuth, requireRole(["super-admin", "admin"]), asyncHandler(async (req, res) => {
  const payload = sloSchema.partial().parse(req.body);
  const workspaceId = resolveWorkspaceId(req);
  
  const target = await SLOTarget.findOneAndUpdate({ _id: req.params.id, workspaceId }, { $set: payload }, { new: true });
  if (!target) throw new ApiError(404, "SLO target not found");
  res.json({ success: true, data: target });
}));

router.delete("/:id", requireAuth, requireRole(["super-admin", "admin"]), asyncHandler(async (req, res) => {
  const workspaceId = resolveWorkspaceId(req);
  const target = await SLOTarget.findOneAndDelete({ _id: req.params.id, workspaceId });
  if (!target) throw new ApiError(404, "SLO target not found");
  res.json({ success: true, data: target });
}));

export default router;
