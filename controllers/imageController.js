// import multer from "multer";
// import path from "path";
// import fs from "fs";
// import moment from "moment";

// const imagecontroller = multer.diskStorage({
//   destination: function (req, file, cb) {
//     const currentYear = moment().format("YYYY");
//     const documentType = req.body.documentType || "general";

//     const uploadPath = path.join(
//       process.cwd(),
//       "uploads",
//       currentYear,
//       documentType
//     );

//     fs.mkdirSync(uploadPath, { recursive: true });

//     cb(null, uploadPath);
//   },
//   filename: function (req, file, cb) {
//     const uniqueName = Date.now() + "-" + file.originalname;
//     cb(null, uniqueName);
//   },
// });

// export default imagecontroller;



// backend/controllers/imageController.js (or config/imageController.js)
import multer from "multer";
import path from "path";
import fs from "fs";
import moment from "moment";

// Multer disk storage engine with dynamic folder logic
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const currentYear = moment().format("YYYY");
    const documentType = req.body.documentType || "general";

    const uploadPath = path.join(process.cwd(), "uploads", currentYear, documentType);

    // Make sure upload folder exists
    fs.mkdir(uploadPath, { recursive: true }, (err) => {
      if (err) return cb(err, uploadPath);
      cb(null, uploadPath);
    });
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

// Export multer upload middleware with validation
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB size limit
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
});

export default upload;
