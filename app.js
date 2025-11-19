import express from "express";
import path from "path";
import cors from "cors";
import dotenv from "dotenv";

import imageRouter from "./routes/imageRoutes.js";
import videoRouter from "./routes/videoRoutes.js";
import authRouter from "./routes/authRoutes.js";

dotenv.config();

const app = express();

// Allowed frontend origins
const allowedOrigins = [
  "http://localhost:5173",          // local dev
  "https://tatto-ashy.vercel.app"  // deployed frontend (no trailing slash)
];

app.use(cors({
  origin: function(origin, callback){
    if(!origin) return callback(null, true); // allow Postman / server requests
    if(allowedOrigins.indexOf(origin) === -1){
      return callback(new Error("CORS policy violation"), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Mount routers
app.use("/api/images", imageRouter);
app.use("/api/videos", videoRouter);
app.use("/api/auth", authRouter);

// Health check
app.get("/", (req, res) => {
  res.send("Tattoo site backend operational");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;
