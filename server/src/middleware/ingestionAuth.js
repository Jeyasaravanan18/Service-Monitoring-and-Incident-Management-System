import { ApiError } from "../utils/apiError.js";
import { verifyAccessToken, hashToken } from "../utils/tokens.js";
import { ApiKey } from "../models/index.js";

function extractApiKey(req) {
  const header = req.headers["x-api-key"];
  if (header) return String(header).trim();

  const authorization = req.headers.authorization || "";
  if (authorization.startsWith("ApiKey ")) return authorization.slice(7).trim();

  return "";
}

export function requireIngestionAccess(requiredScope, allowedRoles = []) {
  return async (req, _res, next) => {
    try {
      const apiKey = extractApiKey(req);
      if (apiKey) {
        const record = await ApiKey.findOne({ keyHash: hashToken(apiKey), revokedAt: null }).lean();
        if (!record) {
          throw new ApiError(401, "Invalid API key");
        }
        const scopes = record.scopes || [];
        if (requiredScope && !scopes.includes(requiredScope) && !scopes.includes("*")) {
          throw new ApiError(403, "API key scope denied");
        }
        await ApiKey.updateOne({ _id: record._id }, { $set: { lastUsedAt: new Date() } });
        req.apiKeyAuth = {
          apiKeyId: record._id.toString(),
          workspaceId: record.workspaceId.toString(),
          scopes,
        };
        return next();
      }

      const authorization = req.headers.authorization || "";
      if (!authorization.startsWith("Bearer ")) {
        throw new ApiError(401, "Authentication required");
      }

      const token = authorization.slice(7);
      req.auth = verifyAccessToken(token);
      if (allowedRoles.length) {
        const roles = req.auth?.roles || [];
        if (!allowedRoles.some((role) => roles.includes(role))) {
          throw new ApiError(403, "Insufficient permissions");
        }
      }
      return next();
    } catch (error) {
      return next(error instanceof ApiError ? error : new ApiError(401, "Authentication required"));
    }
  };
}
