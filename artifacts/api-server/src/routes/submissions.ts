import { Router, type IRouter } from "express";
import { db, eventsTable, eventTagsTable, adminLogsTable } from "@workspace/db";
import { SubmitEventBody } from "@workspace/api-zod";
import { sql } from "drizzle-orm";

const router: IRouter = Router();

const submissionAttempts: Map<string, { count: number; lastAttempt: number }> = new Map();
function isSubmissionRateLimited(ip: string): boolean {
  const now = Date.now();
  const a = submissionAttempts.get(ip);
  if (!a) return false;
  if (now - a.lastAttempt > 60 * 60 * 1000) {
    submissionAttempts.delete(ip);
    return false;
  }
  return a.count >= 5;
}
function recordSubmission(ip: string) {
  const now = Date.now();
  const a = submissionAttempts.get(ip);
  if (!a || now - a.lastAttempt > 60 * 60 * 1000) submissionAttempts.set(ip, { count: 1, lastAttempt: now });
  else submissionAttempts.set(ip, { count: a.count + 1, lastAttempt: now });
}

function slugifyTitle(title: string): string {
  const base = title.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const ts = Date.now().toString(36);
  return (base.length >= 3 ? base : "submission") + "-" + ts;
}

router.post("/submit-event", async (req, res): Promise<void> => {
  const ip = req.ip ?? "unknown";
  if (isSubmissionRateLimited(ip)) {
    res.status(429).json({ error: "Too many submissions. Try again later." });
    return;
  }

  const parsed = SubmitEventBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const data = parsed.data;
  const slug = slugifyTitle(data.title);

  const [created] = await db
    .insert(eventsTable)
    .values({
      title: data.title,
      slug,
      description: data.description,
      previewImage: data.previewImage ?? null,
      location: data.location,
      startDate: new Date(data.startDate),
      endDate: data.endDate ? new Date(data.endDate) : null,
      organizerLink: data.organizerLink ?? null,
      contactEmail: data.contactEmail,
      status: "pending_review",
      eventFormat: data.eventFormat ?? "offline",
      featured: false,
      countryId: data.countryId,
    })
    .returning();

  if (data.tagIds && data.tagIds.length > 0) {
    await db.insert(eventTagsTable).values(
      data.tagIds.map((tagId) => ({ eventId: created.id, tagId }))
    );
  }

  await db.insert(adminLogsTable).values({
    action: "submit_event",
    eventId: created.id,
    eventTitle: created.title,
  });

  recordSubmission(ip);
  res.status(201).json({ success: true });
});

export default router;
