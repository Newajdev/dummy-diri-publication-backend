import { unlink } from "node:fs/promises";
import path from "node:path";
import { AppError } from "./app-error.js";

export const uploadsRoot = path.resolve(process.cwd(), "uploads");
export const publicFileUrl = (
  category: "pdf" | "audio" | "qr",
  filename: string,
): string => `/uploads/${category}/${filename}`;
export const safeFilename = (fileUrl: string): string => {
  const filename = path.basename(fileUrl);
  if (!filename || filename !== path.basename(filename))
    throw new AppError(400, "Unsafe file path.");
  return filename;
};
export async function deleteFile(
  category: "pdf" | "audio" | "qr",
  fileUrl: string,
): Promise<void> {
  try {
    await unlink(path.join(uploadsRoot, category, safeFilename(fileUrl)));
  } catch (error: unknown) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
}
