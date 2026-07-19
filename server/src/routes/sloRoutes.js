import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { SLOTarget, CheckResult } from "../models/index.js";
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
  
  // Compute errorBudgetBurnRate for each target
  const now = new Date();
  const enhancedTargets = await Promise.all(targets.map(async (target) => {
    const windowDays = target.windowDays || 30;
    const since = new Date(now.getTime() - windowDays * 24 * 60 * 60 * 1000);
    
    const [totalChecks, failedChecks] = await Promise.all([
      CheckResult.countDocuments({ serviceId: target.serviceId, checkedAt: { $gte: since } }),
      CheckResult.countDocuments({ serviceId: target.serviceId, checkedAt: { $gte: since }, ok: false }),
    ]);

    let burnRate = 0;
    if (totalChecks > 0) {
      const actualErrorRate = failedChecks / totalChecks;
      const allowedErrorRate = Math.max(0, (100 - (target.objective || 100)) / 100);
      
      if (allowedErrorRate > 0) {
        burnRate = Math.round((actualErrorRate / allowedErrorRate) * 100) / 100;
      }
    }

    return { ...target, errorBudgetBurnRate: burnRate };
  }));

  res.json({ success: true, data: enhancedTargets });
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
