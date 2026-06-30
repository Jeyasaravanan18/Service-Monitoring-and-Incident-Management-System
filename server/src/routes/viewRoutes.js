import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { SavedView } from "../models/index.js";
import { requireAuth } from "../middleware/auth.js";
import { resolveWorkspaceId } from "../utils/workspace.js";

const viewSchema = z.object({
  userId: z.string().optional().nullable(),
  name: z.string().min(2),
  type: z.string().min(2),
  filters: z.record(z.any()).default({}),
  pinned: z.boolean().default(false),
});

const router = Router();

router.get("/", requireAuth, asyncHandler(async (req, res) => {
  const views = await SavedView.find({ workspaceId: { $in: req.auth.workspaceIds || [] } }).sort({ createdAt: -1 }).lean();
  res.json({ success: true, data: views });
}));

router.post("/", requireAuth, asyncHandler(async (req, res) => {
  const payload = viewSchema.parse(req.body);
  const workspaceId = resolveWorkspaceId(req);
  const view = await SavedView.create({ ...payload, workspaceId });
  res.status(201).json({ success: true, data: view });
}));

router.patch("/:id", requireAuth, asyncHandler(async (req, res) => {
  const payload = viewSchema.partial().parse(req.body);
  const workspaceId = resolveWorkspaceId(req);
  const view = await SavedView.findOneAndUpdate({ _id: req.params.id, workspaceId }, { $set: payload }, { new: true });
  if (!view) throw new ApiError(404, "Saved view not found");
  res.json({ success: true, data: view });
}));

router.delete("/:id", requireAuth, asyncHandler(async (req, res) => {
  const workspaceId = resolveWorkspaceId(req);
  const view = await SavedView.findOneAndDelete({ _id: req.params.id, workspaceId });
  if (!view) throw new ApiError(404, "Saved view not found");
  res.json({ success: true, data: view });
}));

export default router;
