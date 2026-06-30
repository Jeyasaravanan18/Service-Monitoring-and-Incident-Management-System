import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { Alert, Incident, Service, StatusPageConfig } from "../models/index.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { resolveWorkspaceId } from "../utils/workspace.js";

const statusSchema = z.object({
  title: z.string().min(2),
  subdomain: z.string().min(2),
  public: z.boolean().default(true),
  serviceIds: z.array(z.string()).default([]),
});

const router = Router();

router.get("/", requireAuth, asyncHandler(async (req, res) => {
  const pages = await StatusPageConfig.find({ workspaceId: { $in: req.auth.workspaceIds || [] } }).sort({ createdAt: -1 }).lean();
  res.json({ success: true, data: pages });
}));

router.get("/public/:subdomain", asyncHandler(async (req, res) => {
  const page = await StatusPageConfig.findOne({ subdomain: req.params.subdomain }).lean();
  if (!page) throw new ApiError(404, "Status page not found");
  if (!page.public) throw new ApiError(403, "Status page is private");
  const [services, incidents, alerts] = await Promise.all([
    Service.find({ _id: { $in: page.serviceIds || [] } }).lean(),
    Incident.find({ workspaceId: page.workspaceId }).sort({ createdAt: -1 }).limit(10).lean(),
    Alert.find({ workspaceId: page.workspaceId }).sort({ createdAt: -1 }).limit(10).lean(),
  ]);
  res.json({ success: true, data: { ...page, services, incidents, alerts } });
}));

router.post("/", requireAuth, requireRole(["super-admin", "admin"]), asyncHandler(async (req, res) => {
  const payload = statusSchema.parse(req.body);
  const workspaceId = resolveWorkspaceId(req);
  const page = await StatusPageConfig.create({ ...payload, workspaceId });
  res.status(201).json({ success: true, data: page });
}));

router.patch("/:id", requireAuth, requireRole(["super-admin", "admin"]), asyncHandler(async (req, res) => {
  const payload = statusSchema.partial().parse(req.body);
  const workspaceId = resolveWorkspaceId(req);
  const page = await StatusPageConfig.findOneAndUpdate({ _id: req.params.id, workspaceId }, { $set: payload }, { new: true });
  if (!page) throw new ApiError(404, "Status page not found");
  res.json({ success: true, data: page });
}));

router.delete("/:id", requireAuth, requireRole(["super-admin", "admin"]), asyncHandler(async (req, res) => {
  const workspaceId = resolveWorkspaceId(req);
  const page = await StatusPageConfig.findOneAndDelete({ _id: req.params.id, workspaceId });
  if (!page) throw new ApiError(404, "Status page not found");
  res.json({ success: true, data: page });
}));

export default router;
