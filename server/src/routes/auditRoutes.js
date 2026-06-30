import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AuditLog } from "../models/index.js";
import { requireAuth } from "../middleware/auth.js";
import { resolveWorkspaceId } from "../utils/workspace.js";

const router = Router();

router.get("/", requireAuth, asyncHandler(async (req, res) => {
  const workspaceId = resolveWorkspaceId(req);
  const filter = { workspaceId };
  if (req.query.action) filter.action = req.query.action;
  if (req.query.resourceType) filter.resourceType = req.query.resourceType;
  if (req.query.actorId) filter.actorId = req.query.actorId;
  const limit = Math.min(Number(req.query.limit || 200) || 200, 500);
  const logs = await AuditLog.find(filter).sort({ createdAt: -1 }).limit(limit).lean();
  res.json({ success: true, data: logs });
}));

router.get("/export", requireAuth, asyncHandler(async (req, res) => {
  const workspaceId = resolveWorkspaceId(req);
  const filter = { workspaceId };
  if (req.query.action) filter.action = req.query.action;
  if (req.query.resourceType) filter.resourceType = req.query.resourceType;
  if (req.query.actorId) filter.actorId = req.query.actorId;
  const limit = Math.min(Number(req.query.limit || 500) || 500, 1000);
  const rows = await AuditLog.find(filter).sort({ createdAt: -1 }).limit(limit).lean();
  const columns = ["createdAt", "action", "resourceType", "resourceId", "actorId"];
  const csv = [
    columns.join(","),
    ...rows.map((row) =>
      columns
        .map((column) => {
          const value = row[column] == null ? "" : String(row[column]);
          return `"${value.replace(/"/g, '""')}"`;
        })
        .join(",")
    ),
  ].join("\n");

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", 'attachment; filename="audit-logs.csv"');
  res.send(csv);
}));

export default router;
