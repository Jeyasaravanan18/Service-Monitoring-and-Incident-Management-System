import mongoose from "mongoose";

const escalationPolicySchema = new mongoose.Schema(
  {
    workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace", required: true, index: true },
    name: { type: String, required: true },
    steps: [
      {
        delayMinutes: Number,
        targetType: String,
        targetId: String,
      },
    ],
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.EscalationPolicy || mongoose.model("EscalationPolicy", escalationPolicySchema);
