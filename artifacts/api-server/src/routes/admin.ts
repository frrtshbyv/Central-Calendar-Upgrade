import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { db, eventsTable, countriesTable, tagsTable, eventTagsTable, adminLogsTable } from "@workspace/db";
import {
  AdminListEventsResponse,
  AdminListEventsQueryParams,
  CreateEventBody,
  UpdateEventParams,
  UpdateEventBody,
  UpdateEventResponse,
  DeleteEventParams,
  PublishEventParams,
  PublishEventResponse,
  ArchiveEventParams,
  ArchiveEventResponse,
  AdminLoginBody,
  AdminLoginResponse,
  AdminLogoutResponse,
  AdminMeResponse,
  GetAdminLogsQueryParams,
  GetAdminLogsResponse,
} from "@workspace/api-zod";
import { eq, and, sql, asc, desc } from "drizzle-orm";
import { logger } from "../lib/logger";

const router: IRouter = Router();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@centralcalendar.org";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "CentralCalendar2024!";

const loginAttempts: Map<string, { count: number; lastAttempt: number }> = new Map();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const attempts = loginAttempts.get(ip);
  if (!attempts) return false;
  if (now - attempts.lastAttempt > 10 * 60 * 1000) {
    loginAttempts.delete(ip);
    return false;
  }
  return attempts.count >= 5;
}

function recordAttempt(ip: string): void {
  const now = Date.now();
  const attempts = loginAttempts.get(ip);
  if (!attempts || now - attempts.lastAttempt > 10 * 60 * 1000) {
    loginAttempts.set(ip, { count: 1, lastAttempt: now });
  } else {
    loginAttempts.set(ip, { count: attempts.count + 1, lastAttempt: now });
  }
}

function clearAttempts(ip: string): void {
  loginAttempts.delete(ip);
}

function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!(req.session as any)?.adminAuthenticated) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}

async function getEventsWithTagsAdmin(whereConditions?: any) {
  const events = await db
    .select({
      id: eventsTable.id,
      title: eventsTable.title,
      titleRu: eventsTable.titleRu,
      slug: eventsTable.slug,
      description: eventsTable.description,
      descriptionRu: eventsTable.descriptionRu,
      previewImage: eventsTable.previewImage,
      location: eventsTable.location,
      locationRu: eventsTable.locationRu,
      startDate: eventsTable.startDate,
      endDate: eventsTable.endDate,
      organizerLink: eventsTable.organizerLink,
      contactEmail: eventsTable.contactEmail,
      status: eventsTable.status,
      eventFormat: eventsTable.eventFormat,
      featured: eventsTable.featured,
      countryId: eventsTable.countryId,
      countryName: countriesTable.name,
      countrySlug: countriesTable.slug,
      createdAt: eventsTable.createdAt,
      updatedAt: eventsTable.updatedAt,
    })
    .from(eventsTable)
    .innerJoin(countriesTable, eq(eventsTable.countryId, countriesTable.id))
    .where(whereConditions)
    .orderBy(desc(eventsTable.createdAt));

  const eventIds = events.map((e) => e.id);
  let tagsByEvent: Record<number, { id: number; name: string; slug: string }[]> = {};

  if (eventIds.length > 0) {
    const eventTags = await db
      .select({
        eventId: eventTagsTable.eventId,
        tagId: tagsTable.id,
        tagName: tagsTable.name,
        tagSlug: tagsTable.slug,
      })
      .from(eventTagsTable)
      .innerJoin(tagsTable, eq(eventTagsTable.tagId, tagsTable.id))
      .where(sql`${eventTagsTable.eventId} = ANY(ARRAY[${sql.raw(eventIds.join(","))}]::int[])`);

    for (const et of eventTags) {
      if (!tagsByEvent[et.eventId]) tagsByEvent[et.eventId] = [];
      tagsByEvent[et.eventId].push({ id: et.tagId, name: et.tagName, slug: et.tagSlug });
    }
  }

  return events.map((e) => ({
    ...e,
    startDate: e.startDate.toISOString(),
    endDate: e.endDate ? e.endDate.toISOString() : null,
    createdAt: e.createdAt.toISOString(),
    updatedAt: e.updatedAt.toISOString(),
    tags: tagsByEvent[e.id] ?? [],
  }));
}

async function logAdminAction(action: string, eventId?: number, eventTitle?: string) {
  await db.insert(adminLogsTable).values({
    action,
    eventId: eventId ?? null,
    eventTitle: eventTitle ?? null,
  });
}

router.post("/admin/login", async (req, res): Promise<void> => {
  const ip = req.ip ?? "unknown";

  if (isRateLimited(ip)) {
    res.status(429).json({ error: "Too many login attempts. Try again in 10 minutes." });
    return;
  }

  const parsed = AdminLoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { email, password } = parsed.data;

  if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    recordAttempt(ip);
    req.log.warn({ ip }, "Failed admin login attempt");
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  clearAttempts(ip);
  (req.session as any).adminAuthenticated = true;
  (req.session as any).adminEmail = email;

  req.log.info({ ip }, "Admin logged in");
  res.json(AdminLoginResponse.parse({ success: true, message: "Logged in successfully" }));
});

router.post("/admin/logout", async (req, res): Promise<void> => {
  req.session.destroy(() => {});
  res.json(AdminLogoutResponse.parse({ success: true }));
});

router.get("/admin/me", async (req, res): Promise<void> => {
  const session = req.session as any;
  if (!session?.adminAuthenticated) {
    res.json(AdminMeResponse.parse({ authenticated: false, email: null }));
    return;
  }
  res.json(AdminMeResponse.parse({ authenticated: true, email: session.adminEmail ?? null }));
});

router.get("/admin/events", requireAdmin, async (req, res): Promise<void> => {
  const parsed = AdminListEventsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { status, country } = parsed.data;
  const conditions: any[] = [];

  if (status) conditions.push(eq(eventsTable.status, status));
  if (country) conditions.push(eq(countriesTable.slug, country));

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
  let events = await getEventsWithTagsAdmin(whereClause);

  if (parsed.data.tag) {
    events = events.filter((e) => e.tags.some((t) => t.slug === parsed.data.tag));
  }

  res.json(AdminListEventsResponse.parse(events));
});

router.post("/admin/events", requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateEventBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { tagIds, ...eventData } = parsed.data;

  const [created] = await db
    .insert(eventsTable)
    .values({
      ...eventData,
      startDate: new Date(eventData.startDate),
      endDate: eventData.endDate ? new Date(eventData.endDate) : null,
      status: eventData.status ?? "draft",
      featured: eventData.featured ?? false,
      previewImage: eventData.previewImage ?? null,
      organizerLink: eventData.organizerLink ?? null,
    })
    .returning();

  if (tagIds && tagIds.length > 0) {
    await db.insert(eventTagsTable).values(
      tagIds.map((tagId) => ({ eventId: created.id, tagId }))
    );
  }

  await logAdminAction("create_event", created.id, created.title);

  const [country] = await db
    .select({ name: countriesTable.name, slug: countriesTable.slug })
    .from(countriesTable)
    .where(eq(countriesTable.id, created.countryId));

  const tags = tagIds && tagIds.length > 0
    ? await db
        .select({ id: tagsTable.id, name: tagsTable.name, slug: tagsTable.slug })
        .from(tagsTable)
        .where(sql`${tagsTable.id} = ANY(ARRAY[${sql.raw(tagIds.join(","))}]::int[])`)
    : [];

  res.status(201).json({
    ...created,
    startDate: created.startDate.toISOString(),
    endDate: created.endDate ? created.endDate.toISOString() : null,
    createdAt: created.createdAt.toISOString(),
    updatedAt: created.updatedAt.toISOString(),
    countryName: country?.name ?? "",
    countrySlug: country?.slug ?? "",
    tags,
  });
});

router.patch("/admin/events/:id", requireAdmin, async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = UpdateEventParams.safeParse({ id: rawId });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateEventBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { tagIds, ...eventData } = parsed.data as any;

  const updateData: any = { ...eventData };
  if (updateData.startDate) updateData.startDate = new Date(updateData.startDate);
  if (updateData.endDate) updateData.endDate = new Date(updateData.endDate);

  const [updated] = await db
    .update(eventsTable)
    .set(updateData)
    .where(eq(eventsTable.id, params.data.id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Event not found" });
    return;
  }

  if (tagIds !== undefined) {
    await db.delete(eventTagsTable).where(eq(eventTagsTable.eventId, updated.id));
    if (tagIds.length > 0) {
      await db.insert(eventTagsTable).values(
        tagIds.map((tagId: number) => ({ eventId: updated.id, tagId }))
      );
    }
  }

  await logAdminAction("update_event", updated.id, updated.title);

  const [country] = await db
    .select({ name: countriesTable.name, slug: countriesTable.slug })
    .from(countriesTable)
    .where(eq(countriesTable.id, updated.countryId));

  const currentTagIds = tagIds !== undefined
    ? tagIds
    : (await db.select({ tagId: eventTagsTable.tagId }).from(eventTagsTable).where(eq(eventTagsTable.eventId, updated.id))).map((t) => t.tagId);

  const tags = currentTagIds.length > 0
    ? await db
        .select({ id: tagsTable.id, name: tagsTable.name, slug: tagsTable.slug })
        .from(tagsTable)
        .where(sql`${tagsTable.id} = ANY(ARRAY[${sql.raw(currentTagIds.join(","))}]::int[])`)
    : [];

  res.json(UpdateEventResponse.parse({
    ...updated,
    startDate: updated.startDate.toISOString(),
    endDate: updated.endDate ? updated.endDate.toISOString() : null,
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
    countryName: country?.name ?? "",
    countrySlug: country?.slug ?? "",
    tags,
  }));
});

router.delete("/admin/events/:id", requireAdmin, async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DeleteEventParams.safeParse({ id: rawId });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [event] = await db.select({ id: eventsTable.id, title: eventsTable.title }).from(eventsTable).where(eq(eventsTable.id, params.data.id));
  if (!event) {
    res.status(404).json({ error: "Event not found" });
    return;
  }

  await db.delete(eventsTable).where(eq(eventsTable.id, params.data.id));
  await logAdminAction("delete_event", event.id, event.title);

  res.sendStatus(204);
});

router.post("/admin/events/:id/publish", requireAdmin, async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = PublishEventParams.safeParse({ id: rawId });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [updated] = await db
    .update(eventsTable)
    .set({ status: "published" })
    .where(eq(eventsTable.id, params.data.id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Event not found" });
    return;
  }

  await logAdminAction("publish_event", updated.id, updated.title);

  const [country] = await db
    .select({ name: countriesTable.name, slug: countriesTable.slug })
    .from(countriesTable)
    .where(eq(countriesTable.id, updated.countryId));

  const tags = await db
    .select({ id: tagsTable.id, name: tagsTable.name, slug: tagsTable.slug })
    .from(eventTagsTable)
    .innerJoin(tagsTable, eq(eventTagsTable.tagId, tagsTable.id))
    .where(eq(eventTagsTable.eventId, updated.id));

  res.json(PublishEventResponse.parse({
    ...updated,
    startDate: updated.startDate.toISOString(),
    endDate: updated.endDate ? updated.endDate.toISOString() : null,
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
    countryName: country?.name ?? "",
    countrySlug: country?.slug ?? "",
    tags,
  }));
});

router.post("/admin/events/:id/archive", requireAdmin, async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = ArchiveEventParams.safeParse({ id: rawId });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [updated] = await db
    .update(eventsTable)
    .set({ status: "archived" })
    .where(eq(eventsTable.id, params.data.id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Event not found" });
    return;
  }

  await logAdminAction("archive_event", updated.id, updated.title);

  const [country] = await db
    .select({ name: countriesTable.name, slug: countriesTable.slug })
    .from(countriesTable)
    .where(eq(countriesTable.id, updated.countryId));

  const tags = await db
    .select({ id: tagsTable.id, name: tagsTable.name, slug: tagsTable.slug })
    .from(eventTagsTable)
    .innerJoin(tagsTable, eq(eventTagsTable.tagId, tagsTable.id))
    .where(eq(eventTagsTable.eventId, updated.id));

  res.json(ArchiveEventResponse.parse({
    ...updated,
    startDate: updated.startDate.toISOString(),
    endDate: updated.endDate ? updated.endDate.toISOString() : null,
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
    countryName: country?.name ?? "",
    countrySlug: country?.slug ?? "",
    tags,
  }));
});

router.post("/admin/events/:id/reject", requireAdmin, async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = Number(rawId);
  if (!Number.isInteger(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [updated] = await db
    .update(eventsTable)
    .set({ status: "rejected" })
    .where(eq(eventsTable.id, id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Event not found" });
    return;
  }

  await logAdminAction("reject_event", updated.id, updated.title);

  const [country] = await db
    .select({ name: countriesTable.name, slug: countriesTable.slug })
    .from(countriesTable)
    .where(eq(countriesTable.id, updated.countryId));

  const tags = await db
    .select({ id: tagsTable.id, name: tagsTable.name, slug: tagsTable.slug })
    .from(eventTagsTable)
    .innerJoin(tagsTable, eq(eventTagsTable.tagId, tagsTable.id))
    .where(eq(eventTagsTable.eventId, updated.id));

  res.json({
    ...updated,
    startDate: updated.startDate.toISOString(),
    endDate: updated.endDate ? updated.endDate.toISOString() : null,
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
    countryName: country?.name ?? "",
    countrySlug: country?.slug ?? "",
    tags,
  });
});

router.get("/admin/logs", requireAdmin, async (req, res): Promise<void> => {
  const parsed = GetAdminLogsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const limit = parsed.data.limit ? Number(parsed.data.limit) : 50;

  const logs = await db
    .select()
    .from(adminLogsTable)
    .orderBy(desc(adminLogsTable.timestamp))
    .limit(limit);

  res.json(GetAdminLogsResponse.parse(
    logs.map((l) => ({
      ...l,
      timestamp: l.timestamp.toISOString(),
    }))
  ));
});

export default router;
