import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { db, siteSettingsTable } from "@workspace/db";
import { GetSiteSettingsResponse, UpdateSiteSettingsResponse, UpdateSiteSettingsBody } from "@workspace/api-zod";
import { sql } from "drizzle-orm";

const router: IRouter = Router();

function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!(req.session as any)?.adminAuthenticated) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}

async function getOrCreateSettings() {
  const rows = await db.select().from(siteSettingsTable).limit(1);
  if (rows.length > 0) return rows[0];
  const [created] = await db.insert(siteSettingsTable).values({}).returning();
  return created;
}

router.get("/site-settings", async (_req, res): Promise<void> => {
  const s = await getOrCreateSettings();
  res.json(GetSiteSettingsResponse.parse({
    id: s.id,
    homepageBannerUrl: s.homepageBannerUrl,
    updatedAt: s.updatedAt.toISOString(),
  }));
});

router.put("/admin/site-settings", requireAdmin, async (req, res): Promise<void> => {
  const parsed = UpdateSiteSettingsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const existing = await getOrCreateSettings();
  const [updated] = await db
    .update(siteSettingsTable)
    .set({ homepageBannerUrl: parsed.data.homepageBannerUrl ?? null, updatedAt: new Date() })
    .where(sql`${siteSettingsTable.id} = ${existing.id}`)
    .returning();
  res.json(UpdateSiteSettingsResponse.parse({
    id: updated.id,
    homepageBannerUrl: updated.homepageBannerUrl,
    updatedAt: updated.updatedAt.toISOString(),
  }));
});

export default router;
