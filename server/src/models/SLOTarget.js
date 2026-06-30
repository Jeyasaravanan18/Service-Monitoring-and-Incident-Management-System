import mongoose from "mongoose";

const sloTargetSchema = new mongoose.Schema(
  {
    workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace", required: true, index: true },
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: "Service", required: true, index: true },
    name: { type: String, required: true },
    objective: { type: Number, required: true },
    windowDays: { type: Number, default: 30 },
    errorBudgetBurnRate: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.SLOTarget || mongoose.model("SLOTarget", sloTargetSchema);
