import { z } from "zod";

const schema = z.object({
  PORT: z.coerce.number().default(4000),
  FRONTEND_URL: z.string().url(),
  BACKEND_URL: z.string().url(),
  DATABASE_URL: z.string().url(),
  CORS_ORIGINS: z.string().default("http://localhost:3000"),
});

export const env = schema.parse(process.env);
