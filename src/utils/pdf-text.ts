import { readFile } from "node:fs/promises";
import { PDFParse } from "pdf-parse";
import { normalizeBanglaText } from "./bangla-text.js";
import { extractTextWithOcr } from "./ocr.js";

/** Extracts selectable text from a PDF. Scanned/image-only documents require OCR. */
export async function extractPdfText(filePath: string): Promise<string> {
  let parser: PDFParse | undefined;
  try {
    parser = new PDFParse({ data: await readFile(filePath) });
    const { text } = await parser.getText();
    const normalized = normalizeBanglaText(text.trim());
    if (normalized) return normalized;
  } catch (error: unknown) {
    console.error("PDF text extraction failed:", error);
  } finally {
    try { await parser?.destroy(); }
    catch (error: unknown) { console.warn("PDF parser cleanup failed:", error); }
  }
  return extractTextWithOcr(filePath);
}
