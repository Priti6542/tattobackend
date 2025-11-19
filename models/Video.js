import mongoose from "mongoose";

const VideoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  fileUrl: { type: String, required: true },
  category: { type: String, default: "podcast" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Video", VideoSchema);
