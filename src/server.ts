import { mkdir } from "node:fs/promises";
import path from "node:path";
import { app } from "./app.js";
import { env } from "./config/env.js";
import { uploadsRoot } from "./utils/files.js";
async function start(): Promise<void> {
  await Promise.all(
    ["pdf", "audio", "qr"].map((dir) =>
      mkdir(path.join(uploadsRoot, dir), { recursive: true }),
    ),
  );
  app.listen(env.port, () => console.log(`API listening at ${env.backendUrl}`));
}
void start();
