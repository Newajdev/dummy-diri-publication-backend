import { execFile } from "node:child_process";
import { mkdir, readFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { AppError } from "./app-error.js";
import { normalizeBanglaText } from "./bangla-text.js";

const run = promisify(execFile);
const maxOcrPages = 20;

async function commandAvailable(command: string): Promise<boolean> {
  try {
    await run(command, ["-v"]);
    return true;
  } catch {
    return false;
  }
}

/** Renders a PDF locally and uses the installed Tesseract Bengali model as a fallback. */
export async function extractTextWithOcr(pdfPath: string): Promise<string> {
  if (
    !(await commandAvailable("pdftoppm")) ||
    !(await commandAvailable("tesseract"))
  ) {
    throw new AppError(
      422,
      "This PDF needs OCR. Install Poppler and Tesseract OCR with the Bengali (ben) language pack on the server.",
    );
  }

  const workspace = path.join(
    tmpdir(),
    `qr-publication-ocr-${crypto.randomUUID()}`,
  );
  const prefix = path.join(workspace, "page");
  try {
    await mkdir(workspace, { recursive: true });
    await run("pdftoppm", [
      "-png",
      "-r",
      "220",
      "-f",
      "1",
      "-l",
      String(maxOcrPages),
      pdfPath,
      prefix,
    ]);
    const images = (await readdir(workspace))
      .filter((file) => file.endsWith(".png"))
      .sort();
    if (!images.length)
      throw new AppError(422, "The PDF has no pages available for OCR.");

    const pages: string[] = [];
    for (const [index, image] of images.entries()) {
      const output = path.join(workspace, `text-${index}`);
      await run("tesseract", [
        path.join(workspace, image),
        output,
        "-l",
        "ben+eng",
        "--psm",
        "6",
      ]);
      pages.push(await readFile(`${output}.txt`, "utf8"));
    }
    const text = normalizeBanglaText(pages.join("\n\n").trim());
    if (!text)
      throw new AppError(422, "OCR could not find readable text in this PDF.");
    return text;
  } catch (error: unknown) {
    if (error instanceof AppError) throw error;
    console.error("PDF OCR fallback failed:", error);
    throw new AppError(
      422,
      "OCR failed. Verify that Tesseract has the Bengali (ben) language pack installed.",
    );
  } finally {
    await rm(workspace, { recursive: true, force: true });
  }
}
