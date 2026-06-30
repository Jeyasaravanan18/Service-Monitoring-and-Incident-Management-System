import mongoose from "mongoose";

const logEntrySchema = new mongoose.Schema(
  {
    workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace", required: true, index: true },
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: "Service" },
    incidentId: { type: mongoose.Schema.Types.ObjectId, ref: "Incident" },
    severity: { type: String, enum: ["debug", "info", "warn", "error", "fatal"], default: "info" },
    message: { type: String, required: true },
    environment: { type: String, enum: ["dev", "staging", "prod"], default: "prod" },
    metadata: { type: Object, default: {} },
    occurredAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.LogEntry || mongoose.model("LogEntry", logEntrySchema);
