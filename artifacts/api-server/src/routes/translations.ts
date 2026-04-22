import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { db, translationsTable } from "@workspace/db";
import { ListTranslationsResponse, ListTranslationsResponseItem as Translation, UpsertTranslationBody } from "@workspace/api-zod";
import { eq, sql } from "drizzle-orm";

const router: IRouter = Router();

function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!(req.session as any)?.adminAuthenticated) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}

router.get("/translations", async (_req, res): Promise<void> => {
  const rows = await db.select().from(translationsTable);
  res.json(ListTranslationsResponse.parse(rows.map((r) => ({ key: r.key, en: r.en, ru: r.ru }))));
});

router.put("/admin/translations", requireAdmin, async (req, res): Promise<void> => {
  const parsed = UpsertTranslationBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const { key, en, ru } = parsed.data;
  const [row] = await db
    .insert(translationsTable)
    .values({ key, en, ru })
    .onConflictDoUpdate({ target: translationsTable.key, set: { en, ru, updatedAt: new Date() } })
    .returning();
  res.json(Translation.parse({ key: row.key, en: row.en, ru: row.ru }));
});

export default router;
