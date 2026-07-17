import cors from "cors";
import express from "express";
import path from "node:path";
import { env } from "./config/env.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import articleRoutes from "./routes/article.routes.js";
import { uploadsRoot } from "./utils/files.js";
export const app = express();
app.use(cors({ origin: env.CORS_ORIGINS }));
app.use(express.json());
app.get("/", (_, res) => {
  res.json({
    success: true,
    message: "DIRI Publication API is running",
  });
});
app.use("/uploads", express.static(path.resolve(uploadsRoot)));
app.use("/api/articles", articleRoutes);
app.use(errorHandler);
