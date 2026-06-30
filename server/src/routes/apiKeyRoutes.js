import crypto from "crypto";
import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiKey } from "../models/index.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { resolveWorkspaceId } from "../utils/workspace.js";

const apiKeySchema = z.object({
  name: z.string().min(2),
  scopes: z.array(z.string()).default([]),
});

function hashKey(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

const router = Router();

router.get("/", requireAuth, asyncHandler(async (req, res) => {
  const keys = await ApiKey.find({ workspaceId: { $in: req.auth.workspaceIds || [] } }).sort({ createdAt: -1 }).lean();
  res.json({ success: true, data: keys });
}));

router.post("/", requireAuth, requireRole(["super-admin", "admin"]), asyncHandler(async (req, res) => {
  const payload = apiKeySchema.parse(req.body);
  const workspaceId = resolveWorkspaceId(req);
  const plainKey = `pf_${crypto.randomBytes(24).toString("hex")}`;
  const key = await ApiKey.create({
    workspaceId,
    ...payload,
    keyHash: hashKey(plainKey),
  });
  res.status(201).json({
    success: true,
    data: {
      ...key.toObject(),
      plainKey,
    },
  });
}));

router.patch("/:id", requireAuth, requireRole(["super-admin", "admin"]), asyncHandler(async (req, res) => {
  const payload = apiKeySchema.partial().parse(req.body);
  const workspaceId = resolveWorkspaceId(req);
  const key = await ApiKey.findOneAndUpdate({ _id: req.params.id, workspaceId }, { $set: payload }, { new: true });
  if (!key) throw new ApiError(404, "API key not found");
  res.json({ success: true, data: key });
}));

router.delete("/:id", requireAuth, requireRole(["super-admin", "admin"]), asyncHandler(async (req, res) => {
  const workspaceId = resolveWorkspaceId(req);
  const key = await ApiKey.findOneAndDelete({ _id: req.params.id, workspaceId });
  if (!key) throw new ApiError(404, "API key not found");
  res.json({ success: true, data: key });
}));

export default router;
