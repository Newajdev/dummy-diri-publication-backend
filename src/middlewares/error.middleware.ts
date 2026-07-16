import { ErrorRequestHandler } from "express";
import multer from "multer";
import { AppError } from "../utils/app-error.js";

export const errorHandler: ErrorRequestHandler = (error: unknown, _req, res, _next) => {
  if (!(error instanceof AppError)) {
    console.error("Unhandled API error:", error);
  }
  const appError = error instanceof AppError ? error : error instanceof multer.MulterError
    ? new AppError(422, error.code === "LIMIT_FILE_SIZE" ? "A file exceeds the allowed upload size." : error.message)
    : new AppError(500, "An unexpected server error occurred.");
  res.status(appError.statusCode).json({ success: false, message: appError.message, errors: appError.errors });
};
