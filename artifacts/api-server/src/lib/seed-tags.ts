import { pool } from "@workspace/db";
import { logger } from "./logger";

const CANONICAL_TAGS: { slug: string; name: string }[] = [
  { slug: "culture", name: "Culture" },
  { slug: "esg", name: "ESG" },
  { slug: "economy", name: "Economy" },
  { slug: "education", name: "Education" },
  { slug: "energy", name: "Energy" },
  { slug: "fashion", name: "Fashion" },
  { slug: "food", name: "Food" },
  { slug: "healthcare", name: "Healthcare" },
  { slug: "hospitality", name: "Hospitality" },
  { slug: "industry", name: "Industry" },
  { slug: "investment", name: "Investment" },
  { slug: "lifestyle", name: "Lifestyle" },
  { slug: "marketing", name: "Marketing" },
  { slug: "media", name: "Media" },
  { slug: "online", name: "Online" },
  { slug: "public-sector", name: "PublicSector" },
  { slug: "retail", name: "Retail" },
  { slug: "sport", name: "Sport" },
  { slug: "technology", name: "Technology" },
  { slug: "transport", name: "Transport" },
  { slug: "women", name: "Women" },
  { slug: "youth", name: "Youth" },
];

export async function ensureCanonicalTags(): Promise<void> {
  try {
    const slugs = CANONICAL_TAGS.map((t) => t.slug);
    const names = CANONICAL_TAGS.map((t) => t.name);
    const result = await pool.query(
      `INSERT INTO tags (slug, name)
       SELECT * FROM UNNEST($1::text[], $2::text[])
       ON CONFLICT (slug) DO NOTHING`,
      [slugs, names],
    );
    if (result.rowCount && result.rowCount > 0) {
      logger.info({ inserted: result.rowCount }, "Seeded canonical tags");
    }
  } catch (err) {
    logger.warn({ err }, "Failed to seed canonical tags");
  }
}
