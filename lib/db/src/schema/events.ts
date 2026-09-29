import { pgTable, serial, text, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { countriesTable } from "./countries";

export const eventsTable = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  titleRu: text("title_ru"),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  descriptionRu: text("description_ru"),
  previewImage: text("preview_image"),
  location: text("location").notNull(),
  locationRu: text("location_ru"),
  startDate: timestamp("start_date", { withTimezone: true }).notNull(),
  endDate: timestamp("end_date", { withTimezone: true }),
  organizerLink: text("organizer_link"),
  status: text("status").notNull().default("draft"),
  eventFormat: text("event_format").notNull().default("offline"),
  contactEmail: text("contact_email"),
  featured: boolean("featured").notNull().default(false),
  countryId: integer("country_id").notNull().references(() => countriesTable.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertEventSchema = createInsertSchema(eventsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof eventsTable.$inferSelect;
