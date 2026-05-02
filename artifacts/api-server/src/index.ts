import app from "./app";
import { logger } from "./lib/logger";
import { ensureCanonicalTags } from "./lib/seed-tags";
import { ensurePgExtensions } from "./lib/seed-extensions";

const rawPort = process.env["PORT"] ?? "8080";
const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");

  ensurePgExtensions().catch((err) => logger.warn({ err }, "Extension seed failed"));
  ensureCanonicalTags().catch((err) => logger.warn({ err }, "Tag seed failed"));
});
