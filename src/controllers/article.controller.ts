import { Request, Response } from "express";
import { ArticleService } from "../services/article.service.js";
import { AppError } from "../utils/app-error.js";
import { deleteFile } from "../utils/files.js";
import { validateArticleInput } from "../validators/article.validator.js";

const service = new ArticleService();
const filesFrom = (request: Request): Record<string, Express.Multer.File[]> => (request.files && !Array.isArray(request.files) ? request.files : {});
export class ArticleController {
  async create(req: Request, res: Response): Promise<void> {
    const files = filesFrom(req); const pdf = files.pdf?.[0]; const audio = files.audio?.[0];
    if (!pdf || !audio) throw new AppError(422, "Both PDF and audio files are required.");
    try {
      if (pdf.size > 50 * 1024 * 1024) throw new AppError(422, "PDF files cannot exceed 50 MB.");
      const { title } = validateArticleInput(req.body); const article = await service.create(title, pdf, audio);
      res.status(201).json({ success: true, message: "Article uploaded successfully.", data: article });
    } catch (error) {
      await Promise.all([deleteFile("pdf", `/uploads/pdf/${pdf.filename}`), deleteFile("audio", `/uploads/audio/${audio.filename}`)]);
      throw error;
    }
  }
  async list(_req: Request, res: Response): Promise<void> { res.json({ success: true, message: "Articles retrieved successfully.", data: await service.list() }); }
  async getBySlug(req: Request, res: Response): Promise<void> { res.json({ success: true, message: "Article retrieved successfully.", data: await service.bySlug(req.params.slug) }); }
  async remove(req: Request, res: Response): Promise<void> { await service.remove(req.params.id); res.json({ success: true, message: "Article deleted successfully.", data: {} }); }
}
