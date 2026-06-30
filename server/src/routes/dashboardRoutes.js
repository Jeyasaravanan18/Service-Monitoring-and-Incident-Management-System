import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getDashboardOverview } from "../services/dashboardService.js";
import { requireAuth } from "../middleware/auth.js";
import { resolveWorkspaceId } from "../utils/workspace.js";

const router = Router();

router.get("/overview", requireAuth, asyncHandler(async (req, res) => {
  const workspaceId = resolveWorkspaceId(req);
  const data = await getDashboardOverview(workspaceId);
  res.json({ success: true, data });
}));

export default router;
