import { Alert, EscalationPolicy } from "../models/index.js";
import { createWorkspaceNotification } from "./notificationService.js";
import { emitRealtime } from "./realtimeService.js";

export async function escalateAlert(alert, reason = "Escalation policy triggered") {
  const policy = await EscalationPolicy.findOne({ workspaceId: alert.workspaceId, active: true }).lean();
  const updated = await Alert.findByIdAndUpdate(alert._id, { $set: { status: "escalated", summary: `${alert.summary} ${reason}`.trim() } }, { new: true });

  await createWorkspaceNotification({
    workspaceId: alert.workspaceId,
    type: "alert.escalated",
    title: alert.title,
    body: reason,
    meta: { alertId: alert._id.toString(), policy: policy?.name || null },
  });

  emitRealtime("alert:escalated", { alertId: alert._id, workspaceId: alert.workspaceId, reason, policy: policy?.name || null });
  return updated;
}

export async function scheduleEscalation(alert) {
  const policy = await EscalationPolicy.findOne({ workspaceId: alert.workspaceId, active: true }).lean();
  if (!policy?.steps?.length) return null;
  const firstStep = policy.steps.slice().sort((a, b) => (a.delayMinutes || 0) - (b.delayMinutes || 0))[0];
  if (!firstStep) return null;

  const delayMs = Math.max(1, firstStep.delayMinutes || 0) * 60 * 1000;
  setTimeout(async () => {
    const latest = await Alert.findById(alert._id).lean();
    if (!latest || ["resolved", "escalated"].includes(latest.status)) return;
    await escalateAlert(latest, `Escalated after ${firstStep.delayMinutes || 0} minutes without acknowledgement`);
  }, delayMs);

  return firstStep;
}
