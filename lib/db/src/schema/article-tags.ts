import { pgTable, serial, integer, primaryKey } from "drizzle-orm/pg-core";
import { articlesTable } from "./articles";
import { tagsTable } from "./tags";

export const articleTagsTable = pgTable(
  "article_tags",
  {
    id: serial("id").primaryKey(),
    articleId: integer("article_id").notNull().references(() => articlesTable.id, { onDelete: "cascade" }),
    tagId: integer("tag_id").notNull().references(() => tagsTable.id, { onDelete: "cascade" }),
  }
);

export type ArticleTag = typeof articleTagsTable.$inferSelect;
