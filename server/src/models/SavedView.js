import mongoose from "mongoose";

const savedViewSchema = new mongoose.Schema(
  {
    workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace", required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: { type: String, required: true },
    type: { type: String, required: true },
    filters: { type: Object, default: {} },
    pinned: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.SavedView || mongoose.model("SavedView", savedViewSchema);
