import { z } from "zod";
import { AppError } from "../utils/app-error.js";

const uploadSchema = z.object({ title: z.string().trim().min(3, "Title must be at least 3 characters.").max(160, "Title must be 160 characters or fewer.") });
export function validateArticleInput(input: unknown): { title: string } {
  const parsed = uploadSchema.safeParse(input);
  if (!parsed.success) throw new AppError(422, "Validation failed.", parsed.error.issues.map((issue) => issue.message));
  return parsed.data;
}
