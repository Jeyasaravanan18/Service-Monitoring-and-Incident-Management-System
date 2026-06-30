import { AuditLog } from "../models/index.js";
import logger from "../config/logger.js";

/**
 * Record an audit log entry.
 * Non-blocking — errors are logged but do not propagate to callers.
 */
export async function recordAuditLog({
  workspaceId,
  actorId,
  action,
  resourceType,
  resourceId,
  details = {},
  req = null,
}) {
  try {
    await AuditLog.create({
      workspaceId,
      actorId,
      action,
      resourceType,
      resourceId: String(resourceId),
      details,
      ip: req ? (req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "") : "",
      userAgent: req ? (req.headers["user-agent"] || "") : "",
    });
  } catch (err) {
    // Audit log errors should never break the main request
    logger.error("Failed to write audit log for action %s: %s", action, err.message);
  }
}
