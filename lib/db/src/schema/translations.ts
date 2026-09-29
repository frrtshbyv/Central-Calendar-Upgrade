import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const translationsTable = pgTable("translations", {
  key: text("key").primaryKey(),
  en: text("en").notNull().default(""),
  ru: text("ru").notNull().default(""),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export type Translation = typeof translationsTable.$inferSelect;
