import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { EscalationPolicy } from "../models/index.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { resolveWorkspaceId } from "../utils/workspace.js";

const stepSchema = z.object({
  delayMinutes: z.number().min(0),
  targetType: z.string().min(2),
  targetId: z.string().min(1),
});

const policySchema = z.object({
  name: z.string().min(2),
  steps: z.array(stepSchema).default([]),
  active: z.boolean().default(true),
});

const router = Router();

router.get("/", requireAuth, asyncHandler(async (req, res) => {
  const policies = await EscalationPolicy.find({ workspaceId: { $in: req.auth.workspaceIds || [] } }).sort({ createdAt: -1 }).lean();
  res.json({ success: true, data: policies });
}));

router.post("/", requireAuth, requireRole(["super-admin", "admin"]), asyncHandler(async (req, res) => {
  const payload = policySchema.parse(req.body);
  const workspaceId = resolveWorkspaceId(req);

  const policy = await EscalationPolicy.create({ ...payload, workspaceId });
  res.status(201).json({ success: true, data: policy });
}));

router.patch("/:id", requireAuth, requireRole(["super-admin", "admin"]), asyncHandler(async (req, res) => {
  const payload = policySchema.partial().parse(req.body);
  const workspaceId = resolveWorkspaceId(req);
  
  const policy = await EscalationPolicy.findOneAndUpdate({ _id: req.params.id, workspaceId }, { $set: payload }, { new: true });
  if (!policy) throw new ApiError(404, "Escalation policy not found");
  res.json({ success: true, data: policy });
}));

router.delete("/:id", requireAuth, requireRole(["super-admin", "admin"]), asyncHandler(async (req, res) => {
  const workspaceId = resolveWorkspaceId(req);
  const policy = await EscalationPolicy.findOneAndDelete({ _id: req.params.id, workspaceId });
  if (!policy) throw new ApiError(404, "Escalation policy not found");
  res.json({ success: true, data: policy });
}));

export default router;
