import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const siteSettingsTable = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  homepageBannerUrl: text("homepage_banner_url"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export type SiteSettings = typeof siteSettingsTable.$inferSelect;
