import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { db, articlesTable, articleTagsTable, tagsTable, countriesTable } from "@workspace/db";
import {
  ListArticlesResponse,
  GetArticleBySlugResponse,
  AdminListArticlesResponse,
  CreateArticleBody,
  UpdateArticleBody,
  UpdateArticleResponse,
  DeleteArticleParams,
} from "@workspace/api-zod";
import { eq, and, sql, desc } from "drizzle-orm";

const router: IRouter = Router();

function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!(req.session as any)?.adminAuthenticated) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}

async function fetchArticles(whereConditions?: any) {
  const rows = await db
    .select({
      id: articlesTable.id,
      title: articlesTable.title,
      slug: articlesTable.slug,
      coverImage: articlesTable.coverImage,
      content: articlesTable.content,
      countryId: articlesTable.countryId,
      countryName: countriesTable.name,
      countrySlug: countriesTable.slug,
      author: articlesTable.author,
      status: articlesTable.status,
      publishedAt: articlesTable.publishedAt,
      createdAt: articlesTable.createdAt,
      updatedAt: articlesTable.updatedAt,
    })
    .from(articlesTable)
    .leftJoin(countriesTable, eq(articlesTable.countryId, countriesTable.id))
    .where(whereConditions)
    .orderBy(desc(articlesTable.createdAt));

  const ids = rows.map((r) => r.id);
  let tagsByArticle: Record<number, { id: number; name: string; slug: string }[]> = {};
  if (ids.length > 0) {
    const at = await db
      .select({
        articleId: articleTagsTable.articleId,
        tagId: tagsTable.id,
        tagName: tagsTable.name,
        tagSlug: tagsTable.slug,
      })
      .from(articleTagsTable)
      .innerJoin(tagsTable, eq(articleTagsTable.tagId, tagsTable.id))
      .where(sql`${articleTagsTable.articleId} = ANY(ARRAY[${sql.raw(ids.join(","))}]::int[])`);
    for (const r of at) {
      if (!tagsByArticle[r.articleId]) tagsByArticle[r.articleId] = [];
      tagsByArticle[r.articleId].push({ id: r.tagId, name: r.tagName, slug: r.tagSlug });
    }
  }

  return rows.map((r) => ({
    ...r,
    publishedAt: r.publishedAt ? r.publishedAt.toISOString() : null,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
    tags: tagsByArticle[r.id] ?? [],
  }));
}

router.get("/articles", async (req, res): Promise<void> => {
  const country = req.query.country as string | undefined;
  const tag = req.query.tag as string | undefined;
  const limit = req.query.limit ? Number(req.query.limit) : undefined;

  const conditions: any[] = [eq(articlesTable.status, "published")];
  if (country) conditions.push(eq(countriesTable.slug, country));
  let articles = await fetchArticles(and(...conditions));
  if (tag) articles = articles.filter((a) => a.tags.some((t) => t.slug === tag));
  if (limit) articles = articles.slice(0, limit);

  res.json(ListArticlesResponse.parse(articles));
});

router.get("/articles/:slug", async (req, res): Promise<void> => {
  const slug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;
  const articles = await fetchArticles(and(eq(articlesTable.slug, slug), eq(articlesTable.status, "published")));
  const article = articles[0];
  if (!article) {
    res.status(404).json({ error: "Article not found" });
    return;
  }
  res.json(GetArticleBySlugResponse.parse(article));
});

router.get("/admin/articles", requireAdmin, async (_req, res): Promise<void> => {
  const articles = await fetchArticles();
  res.json(AdminListArticlesResponse.parse(articles));
});

router.post("/admin/articles", requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateArticleBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { tagIds, ...data } = parsed.data;
  const status = data.status ?? "draft";
  const [created] = await db
    .insert(articlesTable)
    .values({
      title: data.title,
      slug: data.slug,
      coverImage: data.coverImage ?? null,
      content: data.content,
      countryId: data.countryId ?? null,
      author: data.author ?? null,
      status,
      publishedAt: status === "published" ? new Date() : null,
    })
    .returning();

  if (tagIds && tagIds.length > 0) {
    await db.insert(articleTagsTable).values(tagIds.map((tagId) => ({ articleId: created.id, tagId })));
  }

  const fetched = await fetchArticles(eq(articlesTable.id, created.id));
  res.status(201).json(GetArticleBySlugResponse.parse(fetched[0]));
});

router.patch("/admin/articles/:id", requireAdmin, async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const parsed = UpdateArticleBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { tagIds, ...data } = parsed.data as any;
  const updateData: any = { ...data };
  if (data.status === "published") {
    const [existing] = await db.select({ publishedAt: articlesTable.publishedAt }).from(articlesTable).where(eq(articlesTable.id, id));
    if (existing && !existing.publishedAt) updateData.publishedAt = new Date();
  }
  const [updated] = await db.update(articlesTable).set(updateData).where(eq(articlesTable.id, id)).returning();
  if (!updated) {
    res.status(404).json({ error: "Article not found" });
    return;
  }
  if (tagIds !== undefined) {
    await db.delete(articleTagsTable).where(eq(articleTagsTable.articleId, id));
    if (tagIds.length > 0) {
      await db.insert(articleTagsTable).values(tagIds.map((tagId: number) => ({ articleId: id, tagId })));
    }
  }
  const fetched = await fetchArticles(eq(articlesTable.id, id));
  res.json(UpdateArticleResponse.parse(fetched[0]));
});

router.delete("/admin/articles/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = DeleteArticleParams.safeParse({ id: req.params.id });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  await db.delete(articlesTable).where(eq(articlesTable.id, params.data.id));
  res.sendStatus(204);
});

export default router;
