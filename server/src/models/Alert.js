import mongoose from "mongoose";

const alertSchema = new mongoose.Schema(
  {
    workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace", required: true, index: true },
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: "Service" },
    ruleId: { type: mongoose.Schema.Types.ObjectId, ref: "AlertRule" },
    incidentId: { type: mongoose.Schema.Types.ObjectId, ref: "Incident" },
    title: { type: String, required: true },
    status: { type: String, enum: ["open", "acknowledged", "resolved", "snoozed", "escalated"], default: "open" },
    severity: { type: String, enum: ["low", "medium", "high", "critical"], default: "high" },
    dedupeKey: { type: String, index: true },
    summary: { type: String, default: "" },
    meta: { type: Object, default: {} },
  },
  { timestamps: true }
);

// Compound index for workspace alert queries sorted by time
alertSchema.index({ workspaceId: 1, createdAt: -1 });
alertSchema.index({ serviceId: 1, status: 1 });

export default mongoose.models.Alert || mongoose.model("Alert", alertSchema);
