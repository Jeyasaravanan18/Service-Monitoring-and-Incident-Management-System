import mongoose from "mongoose";

const statusPageConfigSchema = new mongoose.Schema(
  {
    workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace", required: true, index: true },
    title: { type: String, required: true },
    subdomain: { type: String, required: true },
    public: { type: Boolean, default: true },
    serviceIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Service" }],
  },
  { timestamps: true }
);

export default mongoose.models.StatusPageConfig || mongoose.model("StatusPageConfig", statusPageConfigSchema);
