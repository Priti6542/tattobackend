import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import Video from "../models/Video.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join("uploads", new Date().getFullYear().toString(), req.body.category || "podcast");
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage, limits: { fileSize: 100 * 1024 * 1024 }, fileFilter: (req, file, cb) => {
  if (file.mimetype.startsWith("video/")) cb(null, true);
  else cb(new Error("Only videos are allowed"), false);
}});

router.get("/", async (req, res) => {
  try {
    const videos = await Video.find({ category: req.query.category || "podcast" });
    res.json({ success: true, data: videos });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/upload", upload.array("videos"), async (req, res) => {
  try {
    if (!req.files.length) return res.status(400).json({ status: "error", message: "No videos uploaded" });

    const year = new Date().getFullYear();
    const category = req.body.category || "podcast";
    const { title, description } = req.body;
    const uploadedVideos = [];

    for (const file of req.files) {
      const fileUrl = path.join("uploads", year.toString(), category, file.filename).replace(/\\/g, "/");
      const newVideo = new Video({
        title,
        description,
        fileUrl,
        category,
      });
      await newVideo.save();
      uploadedVideos.push(newVideo);
    }

    res.json({ status: "success", data: uploadedVideos });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const video = await Video.findByIdAndDelete(req.params.id);
    if (video && video.fileUrl) {
      const filePath = path.join(process.cwd(), video.fileUrl);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    res.json({ success: true, message: "Video deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put("/:id", upload.single("video"), async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ success: false, message: "Video not found" });

    if (req.file) {
      const oldFilePath = path.join(process.cwd(), video.fileUrl);
      if (fs.existsSync(oldFilePath)) fs.unlinkSync(oldFilePath);

      video.fileUrl = path.join("uploads", new Date().getFullYear().toString(), req.body.category || "podcast", req.file.filename).replace(/\\/g, "/");
    }
    if (req.body.title) video.title = req.body.title;
    if (req.body.description) video.description = req.body.description;

    await video.save();
    res.json({ success: true, data: video });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
