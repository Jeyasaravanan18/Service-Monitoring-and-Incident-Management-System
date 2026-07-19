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
  
  const steps = policy.steps.slice().sort((a, b) => (a.delayMinutes || 0) - (b.delayMinutes || 0));
  
  for (const step of steps) {
    const targetTimeMs = new Date(alert.createdAt).getTime() + (step.delayMinutes || 0) * 60 * 1000;
    const delayMs = Math.max(0, targetTimeMs - Date.now());

    setTimeout(async () => {
      const latest = await Alert.findById(alert._id).lean();
      if (!latest || ["resolved", "acknowledged"].includes(latest.status)) return;
      // Note: we don't abort if it's "escalated" because we want subsequent steps to run
      await escalateAlert(latest, `Escalated to step after ${step.delayMinutes || 0} minutes`);
    }, delayMs);
  }

  return steps[0];
}

export async function recoverPendingEscalations() {
  const alerts = await Alert.find({ status: { $in: ["open", "escalated"] } }).lean();
  for (const alert of alerts) {
    await scheduleEscalation(alert);
  }
}
