import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { Team } from "../models/index.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { recordAuditLog } from "../services/auditService.js";
import { resolveWorkspaceId } from "../utils/workspace.js";

const teamSchema = z.object({
  name: z.string().min(2),
  memberIds: z.array(z.string()).default([]),
});

const router = Router();

router.get("/", requireAuth, asyncHandler(async (req, res) => {
  const workspaceId = resolveWorkspaceId(req);
  const teams = await Team.find({ workspaceId }).sort({ createdAt: -1 }).lean();
  res.json({ success: true, data: teams });
}));

router.post("/", requireAuth, requireRole(["super-admin", "admin"]), asyncHandler(async (req, res) => {
  const payload = teamSchema.parse(req.body);
  const workspaceId = resolveWorkspaceId(req);
  const team = await Team.create({ ...payload, workspaceId });
  await recordAuditLog({
    workspaceId,
    actorId: req.auth.sub,
    action: "team.create",
    resourceType: "team",
    resourceId: team._id,
    details: payload,
  });
  res.status(201).json({ success: true, data: team });
}));

router.patch("/:id", requireAuth, requireRole(["super-admin", "admin"]), asyncHandler(async (req, res) => {
  const payload = teamSchema.partial().parse(req.body);
  const workspaceId = resolveWorkspaceId(req);
  const team = await Team.findOneAndUpdate({ _id: req.params.id, workspaceId }, { $set: payload }, { new: true });
  if (!team) throw new ApiError(404, "Team not found");
  await recordAuditLog({
    workspaceId: team.workspaceId,
    actorId: req.auth.sub,
    action: "team.update",
    resourceType: "team",
    resourceId: team._id,
    details: payload,
  });
  res.json({ success: true, data: team });
}));

router.delete("/:id", requireAuth, requireRole(["super-admin", "admin"]), asyncHandler(async (req, res) => {
  const workspaceId = resolveWorkspaceId(req);
  const team = await Team.findOneAndDelete({ _id: req.params.id, workspaceId });
  if (!team) throw new ApiError(404, "Team not found");
  await recordAuditLog({
    workspaceId: team.workspaceId,
    actorId: req.auth.sub,
    action: "team.delete",
    resourceType: "team",
    resourceId: team._id,
    details: { name: team.name },
  });
  res.json({ success: true, data: team });
}));

export default router;
