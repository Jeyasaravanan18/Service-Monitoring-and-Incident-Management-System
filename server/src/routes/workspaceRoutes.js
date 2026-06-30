import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { Team, User, Workspace } from "../models/index.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { recordAuditLog } from "../services/auditService.js";
import { resolveWorkspaceId } from "../utils/workspace.js";

const workspaceSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  plan: z.string().default("starter"),
});

const router = Router();

router.get("/", requireAuth, asyncHandler(async (req, res) => {
  const workspaces = await Workspace.find({ _id: { $in: req.auth.workspaceIds || [] } }).sort({ createdAt: -1 }).lean();
  res.json({ success: true, data: workspaces });
}));

router.post("/", requireAuth, requireRole(["super-admin", "admin"]), asyncHandler(async (req, res) => {
  const payload = workspaceSchema.parse(req.body);
  const workspace = await Workspace.create(payload);
  await User.findByIdAndUpdate(req.auth.sub, { $addToSet: { workspaceIds: workspace._id } });
  await recordAuditLog({
    workspaceId: workspace._id,
    actorId: req.auth.sub,
    action: "workspace.create",
    resourceType: "workspace",
    resourceId: workspace._id,
    details: payload,
  });
  res.status(201).json({ success: true, data: workspace });
}));

router.get("/:id", requireAuth, asyncHandler(async (req, res) => {
  const workspaceId = resolveWorkspaceId(req);
  if (String(workspaceId) !== String(req.params.id)) throw new ApiError(403, "Workspace access denied");
  const workspace = await Workspace.findById(req.params.id).lean();
  if (!workspace) throw new ApiError(404, "Workspace not found");
  const teams = await Team.find({ workspaceId: workspace._id }).sort({ createdAt: -1 }).lean();
  res.json({ success: true, data: { ...workspace, teams } });
}));

router.patch("/:id", requireAuth, requireRole(["super-admin", "admin"]), asyncHandler(async (req, res) => {
  const workspaceId = resolveWorkspaceId(req);
  if (String(workspaceId) !== String(req.params.id)) throw new ApiError(403, "Workspace access denied");
  const payload = workspaceSchema.partial().parse(req.body);
  const workspace = await Workspace.findByIdAndUpdate(req.params.id, { $set: payload }, { new: true });
  if (!workspace) throw new ApiError(404, "Workspace not found");
  await recordAuditLog({
    workspaceId: workspace._id,
    actorId: req.auth.sub,
    action: "workspace.update",
    resourceType: "workspace",
    resourceId: workspace._id,
    details: payload,
  });
  res.json({ success: true, data: workspace });
}));

export default router;
