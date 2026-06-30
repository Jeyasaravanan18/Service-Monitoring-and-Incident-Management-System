import mongoose from "mongoose";

const alertRuleSchema = new mongoose.Schema(
  {
    workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace", required: true, index: true },
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: "Service" },
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ["uptime", "latency", "failure", "status-code", "keyword", "slo-burn"],
      required: true,
    },
    threshold: { type: Number, required: true },
    enabled: { type: Boolean, default: true },
    severity: { type: String, enum: ["low", "medium", "high", "critical"], default: "high" },
    notifyChannels: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.models.AlertRule || mongoose.model("AlertRule", alertRuleSchema);
