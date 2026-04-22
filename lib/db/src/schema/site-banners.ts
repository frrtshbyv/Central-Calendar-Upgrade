import { pgTable, serial, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";

export const siteBannersTable = pgTable("site_banners", {
  id: serial("id").primaryKey(),
  imageUrl: text("image_url").notNull(),
  title: text("title"),
  titleRu: text("title_ru"),
  subtitle: text("subtitle"),
  subtitleRu: text("subtitle_ru"),
  linkUrl: text("link_url"),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export type SiteBanner = typeof siteBannersTable.$inferSelect;
