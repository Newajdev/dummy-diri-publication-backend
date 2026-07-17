import "dotenv/config";

function value(name: string, fallback?: string): string {
  const result = process.env[name] ?? fallback;
  if (!result) throw new Error(`Missing required environment variable: ${name}`);
  return result;
}

export const env = {
  databaseUrl: value("DATABASE_URL"),
  port: Number(process.env.PORT ?? 4000),
  frontendUrl: value("FRONTEND_URL", process.env.FRONTEND_URL ?? "http://localhost:3000"),
  backendUrl: value("BACKEND_URL", process.env.BACKEND_URL ?? "http://localhost:4000"),
  corsOrigins: (process.env.CORS_ORIGINS ?? "http://localhost:3000").split(",").map((origin) => origin.trim()).filter(Boolean),
};
