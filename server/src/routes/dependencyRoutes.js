import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ServiceDependency } from "../models/index.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { resolveWorkspaceId } from "../utils/workspace.js";

const dependencySchema = z.object({
  serviceId: z.string(),
  dependsOnServiceId: z.string(),
  relationType: z.string().default("hard"),
});

const router = Router();

router.get("/", requireAuth, asyncHandler(async (req, res) => {
  const dependencies = await ServiceDependency.find({ workspaceId: { $in: req.auth.workspaceIds || [] } }).sort({ createdAt: -1 }).lean();
  res.json({ success: true, data: dependencies });
}));

router.post("/", requireAuth, requireRole(["super-admin", "admin", "engineer"]), asyncHandler(async (req, res) => {
  const payload = dependencySchema.parse(req.body);
  const workspaceId = resolveWorkspaceId(req);
  const dependency = await ServiceDependency.create({ ...payload, workspaceId });
  res.status(201).json({ success: true, data: dependency });
}));

router.delete("/:id", requireAuth, requireRole(["super-admin", "admin"]), asyncHandler(async (req, res) => {
  const workspaceId = resolveWorkspaceId(req);
  const dependency = await ServiceDependency.findOneAndDelete({ _id: req.params.id, workspaceId });
  if (!dependency) throw new ApiError(404, "Dependency not found");
  res.json({ success: true, data: dependency });
}));

export default router;
