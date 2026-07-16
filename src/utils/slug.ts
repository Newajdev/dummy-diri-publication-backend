import slugify from "slugify";
import { prisma } from "../prisma/client.js";

export async function uniqueSlug(title: string): Promise<string> {
  const base = slugify(title, { lower: true, strict: true, trim: true }) || "article";
  let slug = base; let suffix = 2;
  while (await prisma.article.findUnique({ where: { slug }, select: { id: true } })) slug = `${base}-${suffix++}`;
  return slug;
}
