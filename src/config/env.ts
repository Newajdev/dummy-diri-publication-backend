import { z } from "zod";

const schema = z.object({
  PORT: z.string().default("5000"),
  FRONTEND_URL: z.string(),
  BACKEND_URL: z.string(),
  DATABASE_URL: z.string(),
  CORS_ORIGINS: z.string()
});

export const env = schema.parse(process.env);