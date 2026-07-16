import path from "node:path";
import multer from "multer";
import { AppError } from "../utils/app-error.js";
import { uploadsRoot } from "../utils/files.js";

const allowed = { pdf: ["application/pdf"], audio: ["audio/mpeg", "audio/wav", "audio/x-wav"] } as const;
const storage = multer.diskStorage({
  destination: (_req, file, callback) => callback(null, path.join(uploadsRoot, file.fieldname === "pdf" ? "pdf" : "audio")),
  filename: (_req, file, callback) => callback(null, `${Date.now()}-${crypto.randomUUID()}${path.extname(file.originalname).toLowerCase()}`),
});
const fileFilter: multer.Options["fileFilter"] = (_req, file, callback) => {
  const category = file.fieldname === "pdf" ? "pdf" : "audio";
  if (allowed[category].includes(file.mimetype as never)) callback(null, true);
  else callback(new AppError(415, category === "pdf" ? "Only PDF files are allowed." : "Only MP3 or WAV audio is allowed."));
};
export const uploadArticleFiles = multer({ storage, fileFilter, limits: { fileSize: 100 * 1024 * 1024, files: 2 } }).fields([
  { name: "pdf", maxCount: 1 }, { name: "audio", maxCount: 1 },
]);
