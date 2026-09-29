import { pool } from "@workspace/db";
import { logger } from "./logger";

/**
 * Idempotently ensures the PostgreSQL extensions we need are installed.
 *
 * - `pg_trgm` powers the trigram-similarity (fuzzy / typo-tolerant) search
 *   used by `/api/search`. Without it the search route silently falls back to
 *   plain `ilike` substring matching.
 *
 * Runs on every server boot. Safe to call repeatedly: `CREATE EXTENSION IF
 * NOT EXISTS` is a no-op when the extension already exists. Failures are
 * logged but never thrown — the app stays bootable even if the DB user lacks
 * SUPERUSER (the search route handles the missing-extension case gracefully).
 */
export async function ensurePgExtensions(): Promise<void> {
  try {
    await pool.query("CREATE EXTENSION IF NOT EXISTS pg_trgm");
    logger.info("pg_trgm extension ensured");
  } catch (err) {
    logger.warn({ err }, "Could not ensure pg_trgm extension (search will fall back to ilike)");
  }
}
