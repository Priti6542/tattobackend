import express from "express";
import path from "path";
import cors from "cors";
import dotenv from "dotenv";

import imageRouter from "./routes/imageRoutes.js";
import videoRouter from "./routes/videoRoutes.js";
import authRouter from "./routes/authRoutes.js"; // Correctly import authRouter

dotenv.config();

const app = express();

app.use(cors({
  origin: "http://localhost:5173", // Your frontend origin
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploaded files
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Mount routers
app.use("/api/images", imageRouter);
app.use("/api/videos", videoRouter);
app.use("/api/auth", authRouter); // Mount authRouter here

// Health check endpoint
app.get("/", (req, res) => {
  res.send("Tattoo site backend operational");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;
