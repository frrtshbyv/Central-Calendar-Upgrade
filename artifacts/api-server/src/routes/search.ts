import { Router, type IRouter } from "express";
import { db, eventsTable, countriesTable, tagsTable, eventTagsTable } from "@workspace/db";
import { SearchEventsResponse, SearchEventsQueryParams } from "@workspace/api-zod";
import { eq, sql, and } from "drizzle-orm";

const router: IRouter = Router();

router.get("/search", async (req, res): Promise<void> => {
  const parsed = SearchEventsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const rawQuery = parsed.data.q.trim();
  if (rawQuery.length === 0) {
    res.json([]);
    return;
  }

  // Build a forgiving search:
  //   1. Tokenise the query into words (anything non-alphanumeric is a
  //      separator).  Each word becomes its own ILIKE clause OR a trigram
  //      similarity match against title / description / location / country.
  //   2. ALL words must match somewhere — gives "google calendar" higher
  //      precision than a single substring.
  //   3. ILIKE handles case & substring naturally (`AsTaNa` matches `astana`).
  //   4. `pg_trgm` `%` operator handles typos (`almatuy` matches `almaty`).
  //      The default similarity threshold is 0.3 which is forgiving enough
  //      for one or two character mistakes on words >= 4 chars.
  //   5. Results are ordered by trigram similarity to the full query so the
  //      best matches surface first.
  const words = rawQuery
    .split(/[^\p{L}\p{N}]+/u)
    .filter((w) => w.length > 0)
    .slice(0, 8); // cap to avoid pathological queries

  // If splitting produced nothing usable (e.g. user typed only punctuation),
  // fall back to the raw query so we still return *something*.
  const terms = words.length > 0 ? words : [rawQuery];

  // Build a SQL clause that requires every term to match at least one field.
  //
  // For each token we accept either:
  //   * a case-insensitive substring hit (handles partial words & abbreviations),
  //   * OR a high `word_similarity` score against title / location / country
  //     (handles typos like `astanaa` -> `Astana`, threshold 0.4).
  //
  // `word_similarity` is materially better than the regular `similarity` /
  // `%` operator here because it scores the query against the closest
  // substring of length ~|query|, instead of the entire long title.
  const FUZZY_THRESHOLD = 0.4;
  const perTermClauses = terms.map((term) => {
    const ilikeTerm = `%${term}%`;
    return sql`(
      ${eventsTable.title} ILIKE ${ilikeTerm}
      OR ${eventsTable.description} ILIKE ${ilikeTerm}
      OR ${eventsTable.location} ILIKE ${ilikeTerm}
      OR ${countriesTable.name} ILIKE ${ilikeTerm}
      OR word_similarity(${term}, ${eventsTable.title}) >= ${FUZZY_THRESHOLD}
      OR word_similarity(${term}, coalesce(${eventsTable.location}, '')) >= ${FUZZY_THRESHOLD}
      OR word_similarity(${term}, ${countriesTable.name}) >= ${FUZZY_THRESHOLD}
    )`;
  });

  // AND all per-term clauses together.
  const matchClause = perTermClauses.reduce<ReturnType<typeof sql>>((acc, clause, i) => {
    if (i === 0) return clause;
    return sql`${acc} AND ${clause}`;
  }, sql`TRUE`);

  // Score by max word-similarity across the searchable fields against the
  // full query — higher is better. word_similarity is bounded [0,1] and
  // robust to long target strings.
  const similarityExpr = sql<number>`GREATEST(
    word_similarity(${rawQuery}, ${eventsTable.title}),
    word_similarity(${rawQuery}, coalesce(${eventsTable.location}, '')),
    word_similarity(${rawQuery}, ${countriesTable.name})
  )`;

  let events;
  try {
    events = await db
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
        score: similarityExpr,
      })
      .from(eventsTable)
      .innerJoin(countriesTable, eq(eventsTable.countryId, countriesTable.id))
      .where(and(eq(eventsTable.status, "published"), matchClause))
      .orderBy(sql`${similarityExpr} DESC, ${eventsTable.startDate} ASC`)
      .limit(20);
  } catch (err) {
    // pg_trgm not installed (function/operator missing) — gracefully fall back
    // to plain case-insensitive substring search across the same fields so the
    // UI still works.
    req.log.warn({ err }, "Trigram search failed, falling back to ILIKE");
    const fallbackClauses = terms.map((term) => {
      const ilikeTerm = `%${term}%`;
      return sql`(
        ${eventsTable.title} ILIKE ${ilikeTerm}
        OR ${eventsTable.description} ILIKE ${ilikeTerm}
        OR ${eventsTable.location} ILIKE ${ilikeTerm}
        OR ${countriesTable.name} ILIKE ${ilikeTerm}
      )`;
    });
    const fallbackMatch = fallbackClauses.reduce<ReturnType<typeof sql>>((acc, clause, i) => {
      if (i === 0) return clause;
      return sql`${acc} AND ${clause}`;
    }, sql`TRUE`);

    events = await db
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
      .where(and(eq(eventsTable.status, "published"), fallbackMatch))
      .limit(20);
  }

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

  const results = events.map((e) => {
    // Strip our internal `score` field — it isn't part of the API response.
    const { score: _score, ...rest } = e as typeof e & { score?: number };
    return {
      ...rest,
      startDate: rest.startDate.toISOString(),
      endDate: rest.endDate ? rest.endDate.toISOString() : null,
      createdAt: rest.createdAt.toISOString(),
      updatedAt: rest.updatedAt.toISOString(),
      tags: tagsByEvent[rest.id] ?? [],
    };
  });

  res.json(SearchEventsResponse.parse(results));
});

export default router;
