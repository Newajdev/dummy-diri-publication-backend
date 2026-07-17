import { mkdir } from "node:fs/promises";
import path from "node:path";
import QRCode from "qrcode";
import { Article } from "../generated/prisma/client.js";
import { env } from "../config/env.js";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/app-error.js";
import { deleteFile, publicFileUrl, uploadsRoot } from "../utils/files.js";
import { uniqueSlug } from "../utils/slug.js";
import { extractPdfText } from "../utils/pdf-text.js";

export class ArticleService {
  async create(
    title: string,
    pdf: Express.Multer.File,
    audio: Express.Multer.File,
  ): Promise<Article> {
    const slug = await uniqueSlug(title);
    const content = await extractPdfText(pdf.path);
    const article = await prisma.article.create({
      data: {
        title,
        slug,
        pdfUrl: publicFileUrl("pdf", pdf.filename),
        audioUrl: publicFileUrl("audio", audio.filename),
        qrCodeUrl: "",
        content,
      },
    });
    try {
      const filename = `${slug}.png`;
      await mkdir(path.join(uploadsRoot, "qr"), { recursive: true });
      await QRCode.toFile(
        path.join(uploadsRoot, "qr", filename),
        `${env.FRONTEND_URL}/article/${slug}`,
        { width: 600, margin: 2, color: { dark: "#171717", light: "#ffffff" } },
      );
      return await prisma.article.update({
        where: { id: article.id },
        data: { qrCodeUrl: publicFileUrl("qr", filename) },
      });
    } catch (error) {
      await prisma.article.delete({ where: { id: article.id } });
      await deleteFile("pdf", article.pdfUrl);
      await deleteFile("audio", article.audioUrl);
      throw error;
    }
  }
  list(): Promise<Article[]> {
    return prisma.article.findMany({ orderBy: { createdAt: "desc" } });
  }
  async bySlug(slug: string): Promise<Article> {
    const article = await prisma.article.findUnique({ where: { slug } });
    if (!article) throw new AppError(404, "Article not found.");
    return article;
  }
  async remove(id: string): Promise<void> {
    const article = await prisma.article.findUnique({ where: { id } });
    if (!article) throw new AppError(404, "Article not found.");
    await prisma.article.delete({ where: { id } });
    await Promise.all([
      deleteFile("pdf", article.pdfUrl),
      deleteFile("audio", article.audioUrl),
      deleteFile("qr", article.qrCodeUrl),
    ]);
  }
}
