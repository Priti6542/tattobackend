import mongoose from "mongoose";

const imageSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  fileUrl: { type: String, required: true },
  documentType: { type: String, default: "tattoo" },
  uploadedAt: { type: Date, default: Date.now },
});

export default mongoose.model("Image", imageSchema);
