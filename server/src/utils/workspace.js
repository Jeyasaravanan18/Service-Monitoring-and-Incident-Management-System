import { ApiError } from "./apiError.js";

export function resolveWorkspaceId(req) {
  const allowed = req.auth?.workspaceIds || [];
  const requested = req.query.workspaceId || req.headers["x-workspace-id"] || allowed[0] || null;
  if (!requested) {
    throw new ApiError(400, "Workspace context required");
  }
  if (!allowed.map(String).includes(String(requested))) {
    throw new ApiError(403, "Workspace access denied");
  }
  return requested;
}

export function resolveRequestWorkspaceId(req) {
  if (req.apiKeyAuth?.workspaceId) {
    return req.apiKeyAuth.workspaceId;
  }
  return resolveWorkspaceId(req);
}
