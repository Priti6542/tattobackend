import multer from "multer";
import path from "path";
import fs from "fs";
import moment from "moment";

const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const year = moment().format("YYYY");
    const category = req.body.category || "podcast";
    const uploadPath = path.join(process.cwd(), "uploads", year, category);

    fs.mkdir(uploadPath, { recursive: true }, (err) => {
      cb(err, uploadPath);
    });
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({
  storage: videoStorage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("video/")) cb(null, true);
    else cb(new Error("Only videos are allowed"), false);
  },
});

export default upload;
