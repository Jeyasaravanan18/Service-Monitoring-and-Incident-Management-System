import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { DeploymentEvent } from "../models/index.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const deploymentSchema = z.object({
  serviceId: z.string(),
  title: z.string().min(2),
  environment: z.enum(["dev", "staging", "prod"]).default("prod"),
  sha: z.string().optional().default(""),
  deployedAt: z.string().datetime(),
  metadata: z.record(z.any()).default({}),
});

const router = Router();

router.get("/", requireAuth, asyncHandler(async (req, res) => {
  const deployments = await DeploymentEvent.find({ workspaceId: { $in: req.auth.workspaceIds || [] } }).sort({ deployedAt: -1 }).lean();
  res.json({ success: true, data: deployments });
}));

router.post("/", requireAuth, requireRole(["super-admin", "admin", "engineer"]), asyncHandler(async (req, res) => {
  const payload = deploymentSchema.parse(req.body);
  const workspaceId = req.auth.workspaceIds?.[0] || req.headers["x-workspace-id"];
  if (!workspaceId) throw new ApiError(400, "Workspace context required");

  const deployment = await DeploymentEvent.create({
    ...payload,
    workspaceId,
    deployedAt: new Date(payload.deployedAt),
  });
  res.status(201).json({ success: true, data: deployment });
}));

router.patch("/:id", requireAuth, requireRole(["super-admin", "admin", "engineer"]), asyncHandler(async (req, res) => {
  const payload = deploymentSchema.partial().parse(req.body);
  const workspaceId = req.auth.workspaceIds?.[0] || req.headers["x-workspace-id"];
  
  const update = { ...payload };
  if (payload.deployedAt) update.deployedAt = new Date(payload.deployedAt);
  const deployment = await DeploymentEvent.findOneAndUpdate({ _id: req.params.id, workspaceId }, { $set: update }, { new: true });
  if (!deployment) throw new ApiError(404, "Deployment not found");
  res.json({ success: true, data: deployment });
}));

router.delete("/:id", requireAuth, requireRole(["super-admin", "admin"]), asyncHandler(async (req, res) => {
  const workspaceId = req.auth.workspaceIds?.[0] || req.headers["x-workspace-id"];
  const deployment = await DeploymentEvent.findOneAndDelete({ _id: req.params.id, workspaceId });
  if (!deployment) throw new ApiError(404, "Deployment not found");
  res.json({ success: true, data: deployment });
}));

export default router;
