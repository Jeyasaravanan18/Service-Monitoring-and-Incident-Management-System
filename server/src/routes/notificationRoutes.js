import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { Notification } from "../models/index.js";
import { requireAuth } from "../middleware/auth.js";
import { resolveWorkspaceId } from "../utils/workspace.js";

const patchSchema = z.object({
  readAt: z.string().datetime().nullable().optional(),
});

const router = Router();

router.get("/", requireAuth, asyncHandler(async (req, res) => {
  const workspaceId = resolveWorkspaceId(req);
  const notifications = await Notification.find({ workspaceId }).sort({ createdAt: -1 }).lean();
  res.json({ success: true, data: notifications });
}));

router.patch("/read-all", requireAuth, asyncHandler(async (req, res) => {
  const workspaceId = resolveWorkspaceId(req);
  const result = await Notification.updateMany(
    { workspaceId, readAt: { $exists: false } },
    { $set: { readAt: new Date() } }
  );
  res.json({ success: true, data: { matchedCount: result.matchedCount || 0, modifiedCount: result.modifiedCount || 0 } });
}));

router.patch("/:id", requireAuth, asyncHandler(async (req, res) => {
  const payload = patchSchema.parse(req.body);
  const update = {};
  if (payload.readAt !== undefined) update.readAt = payload.readAt ? new Date(payload.readAt) : new Date();
  const workspaceId = resolveWorkspaceId(req);
  const notification = await Notification.findOneAndUpdate({ _id: req.params.id, workspaceId }, { $set: update }, { new: true });
  if (!notification) throw new ApiError(404, "Notification not found");
  res.json({ success: true, data: notification });
}));

export default router;
