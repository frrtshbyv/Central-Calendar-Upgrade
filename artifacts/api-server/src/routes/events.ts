import { Router, type IRouter } from "express";
import { db, eventsTable, countriesTable, tagsTable, eventTagsTable } from "@workspace/db";
import {
  ListEventsResponse,
  ListEventsQueryParams,
  GetFeaturedEventsResponse,
  GetUpcomingEventsResponse,
  GetUpcomingEventsQueryParams,
  GetCrossBorderEventsResponse,
  GetEventStatsResponse,
  GetEventBySlugParams,
  GetEventBySlugResponse,
  GetRelatedEventsParams,
  GetRelatedEventsResponse,
} from "@workspace/api-zod";
import { eq, and, gte, sql, like, or, ilike, desc, asc } from "drizzle-orm";

const router: IRouter = Router();

async function getEventsWithTags(whereConditions?: Parameters<typeof db.select>[0] extends never ? never : any) {
  const events = await db
    .select({
      id: eventsTable.id,
      title: eventsTable.title,
      slug: eventsTable.slug,
      description: eventsTable.description,
      previewImage: eventsTable.previewImage,
      location: eventsTable.location,
      startDate: eventsTable.startDate,
      endDate: eventsTable.endDate,
      organizerLink: eventsTable.organizerLink,
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
    .orderBy(asc(eventsTable.startDate));

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

router.get("/events", async (req, res): Promise<void> => {
  const parsed = ListEventsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { country, tag, featured, limit, offset } = parsed.data;
  const format = (req.query.format as string | undefined) ?? undefined;

  const conditions: any[] = [];

  conditions.push(eq(eventsTable.status, "published"));

  if (country) {
    conditions.push(eq(countriesTable.slug, country));
  }

  if (featured === "true") {
    conditions.push(eq(eventsTable.featured, true));
  }

  if (format) {
    conditions.push(eq(eventsTable.eventFormat, format));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  let events = await getEventsWithTags(whereClause);

  if (tag) {
    events = events.filter((e) => e.tags.some((t) => t.slug === tag));
  }

  if (offset) {
    events = events.slice(Number(offset));
  }
  if (limit) {
    events = events.slice(0, Number(limit));
  }

  res.json(ListEventsResponse.parse(events));
});

router.get("/events/featured", async (_req, res): Promise<void> => {
  const events = await getEventsWithTags(
    and(eq(eventsTable.status, "published"), eq(eventsTable.featured, true))
  );
  res.json(GetFeaturedEventsResponse.parse(events));
});

router.get("/events/upcoming", async (req, res): Promise<void> => {
  const parsed = GetUpcomingEventsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const now = new Date();
  let events = await getEventsWithTags(
    and(eq(eventsTable.status, "published"), gte(eventsTable.startDate, now))
  );

  if (parsed.data.limit) {
    events = events.slice(0, Number(parsed.data.limit));
  }

  res.json(GetUpcomingEventsResponse.parse(events));
});

router.get("/events/cross-border", async (_req, res): Promise<void> => {
  const events = await getEventsWithTags(
    and(eq(eventsTable.status, "published"), eq(countriesTable.slug, "cross-border"))
  );
  res.json(GetCrossBorderEventsResponse.parse(events));
});

router.get("/events/stats", async (_req, res): Promise<void> => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const [publishedCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(eventsTable)
    .where(eq(eventsTable.status, "published"));

  const [draftCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(eventsTable)
    .where(eq(eventsTable.status, "draft"));

  const [archivedCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(eventsTable)
    .where(eq(eventsTable.status, "archived"));

  const [upcomingThisMonth] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(eventsTable)
    .where(
      and(
        eq(eventsTable.status, "published"),
        gte(eventsTable.startDate, startOfMonth),
        sql`${eventsTable.startDate} <= ${endOfMonth}`
      )
    );

  const byCountry = await db
    .select({
      countryName: countriesTable.name,
      countrySlug: countriesTable.slug,
      count: sql<number>`count(*)::int`,
    })
    .from(eventsTable)
    .innerJoin(countriesTable, eq(eventsTable.countryId, countriesTable.id))
    .where(eq(eventsTable.status, "published"))
    .groupBy(countriesTable.id, countriesTable.name, countriesTable.slug);

  const tagCounts = await db
    .select({
      tagName: tagsTable.name,
      tagSlug: tagsTable.slug,
      count: sql<number>`count(*)::int`,
    })
    .from(eventTagsTable)
    .innerJoin(tagsTable, eq(eventTagsTable.tagId, tagsTable.id))
    .innerJoin(eventsTable, eq(eventTagsTable.eventId, eventsTable.id))
    .where(eq(eventsTable.status, "published"))
    .groupBy(tagsTable.id, tagsTable.name, tagsTable.slug);

  const stats = {
    totalPublished: publishedCount?.count ?? 0,
    totalDraft: draftCount?.count ?? 0,
    totalArchived: archivedCount?.count ?? 0,
    byCountry: byCountry.map((c) => ({ countryName: c.countryName, countrySlug: c.countrySlug, count: c.count })),
    byTag: tagCounts.map((t) => ({ tagName: t.tagName, tagSlug: t.tagSlug, count: t.count })),
    upcomingThisMonth: upcomingThisMonth?.count ?? 0,
  };

  res.json(GetEventStatsResponse.parse(stats));
});

router.get("/events/:slug", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;
  const params = GetEventBySlugParams.safeParse({ slug: raw });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [event] = await db
    .select({
      id: eventsTable.id,
      title: eventsTable.title,
      slug: eventsTable.slug,
      description: eventsTable.description,
      previewImage: eventsTable.previewImage,
      location: eventsTable.location,
      startDate: eventsTable.startDate,
      endDate: eventsTable.endDate,
      organizerLink: eventsTable.organizerLink,
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
    .where(and(eq(eventsTable.slug, params.data.slug), eq(eventsTable.status, "published")));

  if (!event) {
    res.status(404).json({ error: "Event not found" });
    return;
  }

  const eventTags = await db
    .select({ id: tagsTable.id, name: tagsTable.name, slug: tagsTable.slug })
    .from(eventTagsTable)
    .innerJoin(tagsTable, eq(eventTagsTable.tagId, tagsTable.id))
    .where(eq(eventTagsTable.eventId, event.id));

  const result = {
    ...event,
    startDate: event.startDate.toISOString(),
    endDate: event.endDate ? event.endDate.toISOString() : null,
    createdAt: event.createdAt.toISOString(),
    updatedAt: event.updatedAt.toISOString(),
    tags: eventTags,
  };

  res.json(GetEventBySlugResponse.parse(result));
});

router.get("/events/:slug/related", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;
  const params = GetRelatedEventsParams.safeParse({ slug: raw });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [event] = await db
    .select({ id: eventsTable.id, countryId: eventsTable.countryId })
    .from(eventsTable)
    .where(eq(eventsTable.slug, params.data.slug));

  if (!event) {
    res.json([]);
    return;
  }

  const related = await getEventsWithTags(
    and(
      eq(eventsTable.status, "published"),
      eq(eventsTable.countryId, event.countryId),
      sql`${eventsTable.id} != ${event.id}`
    )
  );

  res.json(GetRelatedEventsResponse.parse(related.slice(0, 3)));
});

export default router;
