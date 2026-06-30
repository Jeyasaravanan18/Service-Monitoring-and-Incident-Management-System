import { LogEntry } from "../models/index.js";

export async function ingestLog(workspaceId, payload) {
  return LogEntry.create({
    workspaceId,
    serviceId: payload.serviceId,
    incidentId: payload.incidentId,
    severity: payload.severity || "info",
    message: payload.message,
    environment: payload.environment || "prod",
    metadata: payload.metadata || {},
  });
}
