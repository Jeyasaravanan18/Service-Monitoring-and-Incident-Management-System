import { verifyAccessToken } from "../utils/tokens.js";
import { ApiError } from "../utils/apiError.js";

function resolveActiveWorkspaceRole(auth) {
  const requestedWorkspaceId = auth?.workspaceId || auth?.workspaceIds?.[0] || null;
  const workspaceRole = (auth?.workspaceRoles || []).find((item) => String(item.workspaceId) === String(requestedWorkspaceId))?.role || null;
  return {
    activeWorkspaceId: requestedWorkspaceId,
    activeWorkspaceRole: workspaceRole,
  };
}

export function requireAuth(req, _res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return next(new ApiError(401, "Authentication required"));
  }

  try {
    const auth = verifyAccessToken(token);
    const workspaceId = req.headers["x-workspace-id"] || req.query.workspaceId || auth.workspaceIds?.[0] || null;
    const { activeWorkspaceId, activeWorkspaceRole } = resolveActiveWorkspaceRole({ ...auth, workspaceId });
    req.auth = {
      ...auth,
      workspaceId: activeWorkspaceId,
      activeWorkspaceRole,
    };
    next();
  } catch {
    next(new ApiError(401, "Invalid or expired token"));
  }
}

export function requireRole(roles) {
  return (req, _res, next) => {
    const userRoles = req.auth?.roles || [];
    const activeWorkspaceRole = req.auth?.activeWorkspaceRole || null;
    if (!roles.some((role) => userRoles.includes(role) || activeWorkspaceRole === role)) {
      return next(new ApiError(403, "Insufficient permissions"));
    }
    next();
  };
}
