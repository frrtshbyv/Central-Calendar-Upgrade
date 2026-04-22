import { Router, type IRouter } from "express";
import { db, eventsTable, countriesTable, tagsTable, eventTagsTable } from "@workspace/db";
import { SearchEventsResponse, SearchEventsQueryParams } from "@workspace/api-zod";
import { eq, ilike, or, sql, and } from "drizzle-orm";

const router: IRouter = Router();

router.get("/search", async (req, res): Promise<void> => {
  const parsed = SearchEventsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { q } = parsed.data;
  const searchTerm = `%${q}%`;

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
    .where(
      and(
        eq(eventsTable.status, "published"),
        or(
          ilike(eventsTable.title, searchTerm),
          ilike(eventsTable.description, searchTerm),
          ilike(eventsTable.location, searchTerm),
          ilike(countriesTable.name, searchTerm)
        )
      )
    )
    .limit(20);

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

  const results = events.map((e) => ({
    ...e,
    startDate: e.startDate.toISOString(),
    endDate: e.endDate ? e.endDate.toISOString() : null,
    createdAt: e.createdAt.toISOString(),
    updatedAt: e.updatedAt.toISOString(),
    tags: tagsByEvent[e.id] ?? [],
  }));

  res.json(SearchEventsResponse.parse(results));
});

export default router;
