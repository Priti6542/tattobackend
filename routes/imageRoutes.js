import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import Image from "../models/Image.js";

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/2025/general";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// GET all images
router.get("/", async (req, res) => {
  try {
    const images = await Image.find();
    res.json({ success: true, data: images });
  } catch (err) {
    console.error("GET images error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST upload images
router.post("/upload", upload.array("documents"), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ status: "error", message: "No files uploaded" });
    }

    const uploadedImages = [];
    for (const file of req.files) {
      const fileUrl = `uploads/2025/general/${file.filename}`;
      const newImage = new Image({
        fileName: file.originalname,
        fileUrl: fileUrl,
        documentType: req.body.documentType || "tattoo",
      });
      await newImage.save();
      uploadedImages.push(newImage);
    }

    res.json({ status: "success", data: uploadedImages });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
});

// DELETE image
router.delete("/:id", async (req, res) => {
  try {
    const image = await Image.findByIdAndDelete(req.params.id);
    if (image && image.fileUrl) {
      const filePath = path.join(process.cwd(), image.fileUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    res.json({ success: true, message: "Image deleted" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT update image
router.put("/:id", upload.single("document"), async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    if (!image) {
      return res.status(404).json({ success: false, message: "Image not found" });
    }

    if (req.file) {
      const oldFilePath = path.join(process.cwd(), image.fileUrl);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }

      image.fileName = req.file.originalname;
      image.fileUrl = `uploads/2025/general/${req.file.filename}`;
    }

    await image.save();
    res.json({ success: true, data: image });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
