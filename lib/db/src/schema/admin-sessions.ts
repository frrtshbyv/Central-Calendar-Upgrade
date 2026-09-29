import { pgTable, varchar, json, timestamp, index } from "drizzle-orm/pg-core";

export const adminSessionsTable = pgTable(
  "admin_sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: json("sess").notNull(),
    expire: timestamp("expire", { precision: 6, withTimezone: false }).notNull(),
  },
  (t) => [index("IDX_admin_sessions_expire").on(t.expire)]
);
