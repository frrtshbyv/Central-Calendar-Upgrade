import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { eventsTable } from "./events";

export const adminLogsTable = pgTable("admin_logs", {
  id: serial("id").primaryKey(),
  action: text("action").notNull(),
  eventId: integer("event_id").references(() => eventsTable.id, { onDelete: "set null" }),
  eventTitle: text("event_title"),
  timestamp: timestamp("timestamp", { withTimezone: true }).notNull().defaultNow(),
});
