import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { db, siteBannersTable } from "@workspace/db";
import { ListBannersResponse, ListBannersResponseItem as Banner, CreateBannerBody, UpdateBannerBody } from "@workspace/api-zod";
import { asc, desc, eq } from "drizzle-orm";

const router: IRouter = Router();

function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!(req.session as any)?.adminAuthenticated) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}

function serialize(b: any) {
  return {
    id: b.id,
    imageUrl: b.imageUrl,
    title: b.title,
    titleRu: b.titleRu,
    subtitle: b.subtitle,
    subtitleRu: b.subtitleRu,
    linkUrl: b.linkUrl,
    sortOrder: b.sortOrder,
    isActive: b.isActive,
    updatedAt: b.updatedAt.toISOString(),
  };
}

router.get("/banners", async (_req, res): Promise<void> => {
  const rows = await db.select().from(siteBannersTable).where(eq(siteBannersTable.isActive, true)).orderBy(asc(siteBannersTable.sortOrder), desc(siteBannersTable.id));
  res.json(ListBannersResponse.parse(rows.map(serialize)));
});

router.get("/admin/banners", requireAdmin, async (_req, res): Promise<void> => {
  const rows = await db.select().from(siteBannersTable).orderBy(asc(siteBannersTable.sortOrder), desc(siteBannersTable.id));
  res.json(ListBannersResponse.parse(rows.map(serialize)));
});

router.post("/admin/banners", requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateBannerBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [created] = await db.insert(siteBannersTable).values({
    imageUrl: parsed.data.imageUrl,
    title: parsed.data.title ?? null,
    titleRu: parsed.data.titleRu ?? null,
    subtitle: parsed.data.subtitle ?? null,
    subtitleRu: parsed.data.subtitleRu ?? null,
    linkUrl: parsed.data.linkUrl ?? null,
    sortOrder: parsed.data.sortOrder ?? 0,
    isActive: parsed.data.isActive ?? true,
  }).returning();
  res.status(201).json(Banner.parse(serialize(created)));
});

router.patch("/admin/banners/:id", requireAdmin, async (req, res): Promise<void> => {
  const id = parseInt(String(req.params.id), 10);
  if (!Number.isInteger(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const parsed = UpdateBannerBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const updates: any = { updatedAt: new Date() };
  for (const k of ["imageUrl","title","titleRu","subtitle","subtitleRu","linkUrl","sortOrder","isActive"] as const) {
    if (parsed.data[k] !== undefined) updates[k] = parsed.data[k];
  }
  const [updated] = await db.update(siteBannersTable).set(updates).where(eq(siteBannersTable.id, id)).returning();
  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  res.json(Banner.parse(serialize(updated)));
});

router.delete("/admin/banners/:id", requireAdmin, async (req, res): Promise<void> => {
  const id = parseInt(String(req.params.id), 10);
  if (!Number.isInteger(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  await db.delete(siteBannersTable).where(eq(siteBannersTable.id, id));
  res.status(204).end();
});

export default router;
