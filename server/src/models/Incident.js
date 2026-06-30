import mongoose from "mongoose";

const incidentSchema = new mongoose.Schema(
  {
    workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace", required: true, index: true },
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: "Service" },
    alertIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Alert" }],
    title: { type: String, required: true },
    status: { type: String, enum: ["open", "investigating", "monitoring", "resolved", "postmortem"], default: "open" },
    severity: { type: String, enum: ["low", "medium", "high", "critical"], default: "high" },
    summary: { type: String, default: "" },
    rootCauseTag: { type: String, default: "" },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    responderIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    notes: [{ body: String, authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, createdAt: Date }],
  },
  { timestamps: true }
);

incidentSchema.index({ workspaceId: 1, createdAt: -1 });
incidentSchema.index({ serviceId: 1, status: 1 });

export default mongoose.models.Incident || mongoose.model("Incident", incidentSchema);
