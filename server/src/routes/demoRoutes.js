import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { requireAuth } from "../middleware/auth.js";
import { resolveWorkspaceId } from "../utils/workspace.js";
import { seedWorkspaceDemoData, ensureDemoAccounts } from "../services/demoService.js";
import { Service } from "../models/index.js";

const router = Router();

// Seed demo services and operational telemetry for the user's active workspace
router.post("/seed", requireAuth, asyncHandler(async (req, res) => {
  const workspaceId = resolveWorkspaceId(req);
  const result = await seedWorkspaceDemoData(workspaceId, req.auth?.sub);
  res.json({ success: true, ...result });
}));

// Check demo status for the active workspace
router.get("/status", requireAuth, asyncHandler(async (req, res) => {
  const workspaceId = resolveWorkspaceId(req);
  const count = await Service.countDocuments({ workspaceId });
  res.json({ success: true, data: { serviceCount: count, hasData: count > 0 } });
}));

// Public endpoint to initialize/verify demo accounts on the platform
router.post("/init-accounts", asyncHandler(async (_req, res) => {
  await ensureDemoAccounts();
  res.json({ success: true, message: "Demo accounts verified and initialized." });
}));

export default router;
